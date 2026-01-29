import { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, User, Lock, Mail, Eye, EyeOff, Check } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { register as registerApi, setStoredAuth } from '@/app/api/auth';
import { validateUsername, validateEmailOptional, validatePasswordSignUp } from '@/app/lib/validation';

export function SignUpForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [secureEnclave, setSecureEnclave] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = calculatePasswordStrength(password);
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-yellow-400', 'bg-green-500', 'bg-[#00ff41]'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const uErr = validateUsername(username);
    const eErr = validateEmailOptional(email);
    const pErr = validatePasswordSignUp(password);
    const cErr = confirmPassword !== password ? 'Passwords do not match' : null;
    setFieldErrors({
      username: uErr || '',
      email: eErr || '',
      password: pErr || '',
      confirmPassword: cErr || '',
    });
    if (uErr || eErr || pErr || cErr) return;
    setIsLoading(true);
    try {
      const data = await registerApi(username.trim(), email.trim(), password);
      setStoredAuth(data);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#0a0e27]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-xl border text-card-foreground bg-card/50 backdrop-blur-xl border-primary/20 shadow-2xl shadow-black/40 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-75"></div>
          
          <div className="flex flex-col space-y-1.5 p-6 text-center pb-2 pt-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_15px_rgba(100,255,218,0.15)]">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">Create Identity</div>
            <div className="text-sm text-slate-400">Establish new secure credentials</div>
          </div>

          <div className="p-6 space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[#00d9ff] text-sm font-medium mb-2 uppercase tracking-wider">New Identity</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Username (3–30 chars)"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => ({ ...p, username: '' })); }}
                  required
                  className={`pl-10 h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] ${fieldErrors.username ? 'border-red-500/50' : ''}`}
                />
              </div>
              {fieldErrors.username && <p className="text-xs text-red-400 mt-1">{fieldErrors.username}</p>}
            </div>

            <div>
              <label className="block text-[#00d9ff] text-sm font-medium mb-2 uppercase tracking-wider">Email (optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                  onBlur={() => { if (email.trim()) { const err = validateEmailOptional(email); setFieldErrors((p) => ({ ...p, email: err || '' })); } }}
                  className={`pl-10 h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] ${fieldErrors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-[#00d9ff] text-sm font-medium mb-2 uppercase tracking-wider">New Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '', confirmPassword: '' })); }}
                  required
                  className={`pl-10 pr-10 h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] ${fieldErrors.password ? 'border-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00d9ff] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 flex-1 rounded ${
                        bar <= passwordStrength
                          ? strengthColors[passwordStrength] || 'bg-gray-700'
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password Strength: {password ? strengthLabels[passwordStrength] || 'Very Weak' : 'Not set'}
                </p>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-[#00d9ff] text-sm font-medium mb-2 uppercase tracking-wider">Confirm Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  required
                  className={`pl-10 h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] ${fieldErrors.confirmPassword ? 'border-red-500/50' : ''}`}
                />
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="twoFactor"
                  checked={twoFactor}
                  onCheckedChange={(checked) => setTwoFactor(checked === true)}
                />
                <label htmlFor="twoFactor" className="text-sm text-gray-300 cursor-pointer">
                  Two-factor authentication enabled by default
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="secureEnclave"
                  checked={secureEnclave}
                  onCheckedChange={(checked) => setSecureEnclave(checked === true)}
                />
                <label htmlFor="secureEnclave" className="text-sm text-gray-300 cursor-pointer">
                  Secure enclave storage
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !password || confirmPassword !== password || isLoading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-primary-border min-h-9 px-4 py-2 w-full h-12 bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-[0_0_20px_rgba(100,255,218,0.2)] mt-6 text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Initialize Identity
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
            </form>
          </div>

          <div className="p-6 pb-6 pt-2 flex flex-col items-center gap-4 text-center">
            <p className="text-xs text-slate-500">
              Already authenticated?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                Access system
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
