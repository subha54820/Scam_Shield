import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, Lock, Eye } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, setStoredAuth } from '@/app/api/auth';
import { validateUsername, validatePassword } from '@/app/lib/validation';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    setFieldErrors({ username: uErr || undefined, password: pErr || undefined });
    if (uErr || pErr) return;
    setIsLoading(true);
    try {
      const data = await loginApi(username.trim(), password);
      setStoredAuth(data);
      if (rememberDevice) localStorage.setItem('rememberedDevice', 'true');
      else localStorage.removeItem('rememberedDevice');
      navigate('/intro');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">System Access</div>
            <div className="text-sm text-slate-400">Enter credentials to authenticate</div>
          </div>

          <div className="p-6 space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs font-medium uppercase tracking-wider text-primary/80 ml-1" htmlFor="username">
                  Identity
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setFieldErrors((prev) => ({ ...prev, username: undefined })); }}
                    required
                    className={`flex w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 bg-black/20 border-white/10 focus:border-primary/50 transition-all duration-300 input-glow h-11 ${fieldErrors.username ? 'border-red-500/50' : ''}`}
                  />
                  {fieldErrors.username && <p className="text-xs text-red-400 mt-1 ml-1">{fieldErrors.username}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs font-medium uppercase tracking-wider text-primary/80 ml-1" htmlFor="password">
                    Passcode
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                    required
                    className={`flex w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-10 bg-black/20 border-white/10 focus:border-primary/50 transition-all duration-300 input-glow h-11 ${fieldErrors.password ? 'border-red-500/50' : ''}`}
                  />
                  {fieldErrors.password && <p className="text-xs text-red-400 mt-1 ml-1">{fieldErrors.password}</p>}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberDevice}
                    onCheckedChange={(checked) => setRememberDevice(checked === true)}
                    className="h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="remember" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-400 cursor-pointer">
                    Remember device
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/recovery')}
                  className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Recovery options?
                </button>
              </div>

              <button
                type="submit"
                disabled={!username.trim() || !password || isLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-primary-border min-h-9 px-4 py-2 w-full h-12 bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-[0_0_20px_rgba(100,255,218,0.2)] mt-6 text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Secure Login
                    <ShieldCheck className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 pb-6 pt-2 flex flex-col items-center gap-4 text-center">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
              <Lock className="w-3 h-3 text-primary" />
              <span>End-to-end encrypted connection</span>
            </div>
            <p className="text-xs text-slate-500">
              Don't have credentials?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-primary hover:underline font-medium"
              >
                Request access
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
