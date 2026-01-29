import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Globe, Lock, Server, Check } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { useState, useEffect } from 'react';
import type { LinkCheckResult } from '@/app/api/link';

export function LinkResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { url?: string; result?: LinkCheckResult } | null;
  const url = state?.url || '';
  const apiResult = state?.result;

  const targetScore = apiResult ? apiResult.risk_score : 28;
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    let step = 0;
    const steps = 60;
    const duration = 1500;
    const interval = duration / steps;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setDisplayScore(Math.floor(targetScore * progress));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [targetScore]);

  useEffect(() => {
    if (!url) navigate('/link-checker');
  }, [url, navigate]);

  if (!url) return null;

  const trustScore = 100 - displayScore;
  const redFlags = apiResult?.red_flags?.length
    ? apiResult.red_flags.map((label) => ({ label, detected: true }))
    : [
        { label: 'Phishing attempt', detected: true },
        { label: 'Malware detected', detected: false },
        { label: 'Blacklisted domain', detected: true },
        { label: 'Suspicious redirects', detected: true },
      ];

  const domainInfo = {
    domain: apiResult?.domain || null,
    ssl: apiResult?.ssl_valid ?? false,
    isSafe: apiResult?.is_safe ?? false,
  };

  const getStatus = (score: number) => {
    const risk = apiResult?.risk_level ?? (score < 40 ? 'SAFE' : score < 70 ? 'SUSPICIOUS' : 'DANGEROUS');
    if (risk === 'SAFE')
      return { label: 'Safe', color: '#00ff41', icon: CheckCircle2, bg: 'bg-[#00ff41]/10', border: 'border-[#00ff41]/50' };
    if (risk === 'SUSPICIOUS')
      return { label: 'Suspicious', color: '#ffd93d', icon: AlertTriangle, bg: 'bg-[#ffd93d]/10', border: 'border-[#ffd93d]/50' };
    return { label: 'High Risk', color: '#ff3b3b', icon: XCircle, bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/50' };
  };

  const status = getStatus(displayScore);
  const StatusIcon = status.icon;
  const analysisText = apiResult?.analysis || (displayScore >= 70 ? 'This link has multiple red flags.' : 'No major red flags detected.');

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20">
            <div className="flex items-center gap-4">
              <Globe className="w-8 h-8 text-[#00d9ff]" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-400 mb-1">Scanned URL</div>
                <div className="text-white font-mono text-lg truncate">{url}</div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 bg-[#00d9ff]/10 text-[#00d9ff] rounded-lg hover:bg-[#00d9ff]/20 transition-all text-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : null}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Trust Score */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-8 rounded-xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)]"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Risk Score</h2>
                <div className="mb-6">
                  <div className="flex items-end gap-2 mb-2">
                    <div className="text-5xl font-bold text-white">{displayScore}</div>
                    <div className="text-gray-400 mb-2">/100</div>
                  </div>
                  <Progress
                    value={displayScore}
                    className="h-3"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-8 rounded-xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Risk Analysis</h2>
                <div className="space-y-4">
                  {domainInfo.domain && (
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-[#00d9ff]" />
                        <span className="text-gray-300">Domain</span>
                      </div>
                      <span className="text-white font-mono text-sm truncate max-w-[200px]">{domainInfo.domain}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-[#00d9ff]" />
                      <span className="text-gray-300">SSL certificate</span>
                    </div>
                    {domainInfo.ssl ? (
                      <span className="flex items-center gap-1.5 text-[#00ff41]">
                        <CheckCircle2 className="w-4 h-4" />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#ff3b3b]">
                        <XCircle className="w-4 h-4" />
                        Missing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#00d9ff]" />
                      <span className="text-gray-300">Safety</span>
                    </div>
                    {domainInfo.isSafe ? (
                      <span className="flex items-center gap-1.5 text-[#00ff41]">
                        <CheckCircle2 className="w-4 h-4" />
                        Safe
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#ff3b3b]">
                        <XCircle className="w-4 h-4" />
                        Risky
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-8 rounded-xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Red Flags</h2>
                <div className="grid grid-cols-2 gap-4">
                  {redFlags.map((threat, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-lg border ${
                        threat.detected
                          ? 'bg-[#ff3b3b]/10 border-[#ff3b3b]/30'
                          : 'bg-[#00ff41]/10 border-[#00ff41]/30'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        {threat.detected ? (
                          <XCircle className="w-8 h-8 text-[#ff3b3b]" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-[#00ff41]" />
                        )}
                        <span className={`text-sm font-semibold ${
                          threat.detected ? 'text-[#ff3b3b]' : 'text-[#00ff41]'
                        }`}>
                          {threat.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {threat.detected ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className={`p-8 rounded-xl border-2 ${status.bg} ${status.border}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-full ${status.bg}`}>
                    <StatusIcon className="w-8 h-8" style={{ color: status.color }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: status.color }}>
                    {status.label}
                  </h2>
                </div>
                <div className="space-y-2 text-gray-300">
                  <p>{analysisText}</p>
                  {displayScore >= 40 && (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Do not enter any personal information</li>
                      <li>Do not download any files</li>
                      <li>Close this page immediately</li>
                      <li>Report this link to authorities</li>
                    </ul>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/link-checker')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                >
                  Check Another Link
                </button>
                <button
                  onClick={() => navigate('/report')}
                  className="w-full px-6 py-3 bg-[#ff3b3b]/20 text-[#ff3b3b] border border-[#ff3b3b]/30 rounded-lg hover:bg-[#ff3b3b]/30 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                >
                  Report False Positive
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
