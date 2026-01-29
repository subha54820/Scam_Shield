import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Link as LinkIcon, Search, Clock, CheckCircle2, AlertTriangle, XCircle, LogIn } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { validateUrl } from '@/app/lib/validation';
import { checkLink } from '@/app/api/link';
import { getStoredAuth } from '@/app/api/auth';
import { getLinkHistory } from '@/app/api/user';

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
  return d.toLocaleDateString();
}

function riskLevelToStatus(riskLevel: string): string {
  const r = (riskLevel || '').toUpperCase();
  if (r === 'DANGEROUS') return 'dangerous';
  if (r === 'SUSPICIOUS') return 'suspicious';
  return 'safe';
}

export function LinkChecker() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState<{ url: string; status: string; time: string }[]>([]);
  const [recentScansLoading, setRecentScansLoading] = useState(false);
  const navigate = useNavigate();
  const inputCardRef = useRef<HTMLDivElement>(null);

  const exampleUrls: { url: string; tier: 'high' | 'medium' | 'safe' }[] = [
    { tier: 'high', url: 'http://bank-verify.tk/login' },
    { tier: 'medium', url: 'http://secure-site.com' },
    { tier: 'safe', url: 'https://www.google.com' },
  ];

  useEffect(() => {
    if (!getStoredAuth()) {
      setRecentScans([]);
      return;
    }
    setRecentScansLoading(true);
    getLinkHistory(1, 5)
      .then(({ scans }) => {
        setRecentScans(
          scans.map((s) => ({
            url: s.content,
            status: riskLevelToStatus(s.risk_level),
            time: formatRelativeTime(s.created_at),
          }))
        );
      })
      .catch(() => setRecentScans([]))
      .finally(() => setRecentScansLoading(false));
  }, []);

  const handleScan = async () => {
    setError('');
    const err = validateUrl(url);
    if (err) {
      setError(err);
      return;
    }
    setIsScanning(true);
    try {
      const result = await checkLink(url.trim());
      navigate('/link-result', { state: { url: url.trim(), result } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }> = {
      safe: { icon: CheckCircle2, color: 'text-[#00ff41]', bg: 'bg-[#00ff41]/10', border: 'border-[#00ff41]/30', label: 'Safe' },
      suspicious: { icon: AlertTriangle, color: 'text-[#ffd93d]', bg: 'bg-[#ffd93d]/10', border: 'border-[#ffd93d]/30', label: 'Suspicious' },
      dangerous: { icon: XCircle, color: 'text-[#ff3b3b]', bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/30', label: 'High Risk' },
    };
    const config = configs[status] ?? configs.safe;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {!getStoredAuth() && (
            <div className="mb-6 p-4 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/30 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-300">
              <span>Sign in to save results and view history.</span>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-[#00d9ff] hover:underline font-medium">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            </div>
          )}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00d9ff]/20 to-[#00ff41]/20 mb-6">
              <Search className="w-10 h-10 text-[#00d9ff]" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Link Safety <span className="text-[#00d9ff]">Checker</span>
            </h1>
            <p className="text-xl text-gray-400">
              Verify before you visit
            </p>
          </motion.div>

          <motion.div
            ref={inputCardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)] mb-12 scroll-mt-28"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="link-checker-url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleScan())}
                    className={`pl-12 h-14 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] focus:shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all ${error ? 'border-red-500/50' : ''}`}
                  />
                </div>
                {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
              </div>
              <button
                onClick={handleScan}
                disabled={!url.trim() || isScanning}
                className="px-8 h-14 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold whitespace-nowrap"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0a0e27]/30 border-t-[#0a0e27] rounded-full animate-spin"></div>
                    Scanning...
                  </span>
                ) : (
                  'Scan Link'
                )}
              </button>
            </div>
          </motion.div>

          {/* Example URLs */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#ffd93d]" />
              Example URLs
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {exampleUrls.map((item, index) => {
                const badge = item.tier === 'high' ? { label: 'High Risk', cls: 'bg-[#ff3b3b]/20 text-[#ff3b3b] border-[#ff3b3b]/30' } : item.tier === 'medium' ? { label: 'Suspicious', cls: 'bg-[#ffd93d]/20 text-[#ffd93d] border-[#ffd93d]/30' } : { label: 'Safe', cls: 'bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]/30' };
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    role="button"
                    tabIndex={0}
                    className="group p-4 rounded-xl bg-[#1a1f3a]/30 border border-[#00d9ff]/10 hover:border-[#00d9ff]/30 cursor-pointer hover:shadow-[0_0_15px_rgba(0,217,255,0.1)]"
                    onClick={() => {
                      setUrl(item.url);
                      setError('');
                      inputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setTimeout(() => document.getElementById('link-checker-url')?.focus(), 400);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (setUrl(item.url), setError(''), inputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), setTimeout(() => document.getElementById('link-checker-url')?.focus(), 400))}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm text-gray-300 truncate flex-1">{item.url}</span>
                      <span className={`px-2 py-0.5 text-xs rounded border shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Scans */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#00d9ff]" />
              Recent Scans
            </h2>
            {!getStoredAuth() ? (
              <p className="text-gray-500 text-sm">Sign in to see your recent link scans.</p>
            ) : recentScansLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-4 h-4 border-2 border-[#00d9ff]/30 border-t-[#00d9ff] rounded-full animate-spin" />
                Loading...
              </div>
            ) : recentScans.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent scans yet. Scan a link to see it here.</p>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan, index) => (
                  <motion.div
                    key={`${scan.url}-${scan.time}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    role="button"
                    tabIndex={0}
                    className="group p-5 rounded-xl bg-[#1a1f3a]/30 border border-[#00d9ff]/10 hover:border-[#00d9ff]/30 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(0,217,255,0.1)]"
                    onClick={() => {
                      setUrl(scan.url);
                      setError('');
                      inputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setTimeout(() => document.getElementById('link-checker-url')?.focus(), 400);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (setUrl(scan.url), setError(''), inputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), setTimeout(() => document.getElementById('link-checker-url')?.focus(), 400))}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-white truncate font-mono text-sm">{scan.url}</span>
                        </div>
                        <span className="text-xs text-gray-500">{scan.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(scan.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
