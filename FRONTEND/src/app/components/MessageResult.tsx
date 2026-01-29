import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AnalyzeResult } from '@/app/api/analyze';

const LABELS = {
  readIn: { en: 'Read in', hi: 'इसमें पढ़ें', or: 'ଏହାରେ ପଢ଼ନ୍ତୁ' },
  analyzedMessage: { en: 'Analyzed Message:', hi: 'विश्लेषित संदेश:', or: 'ବିଶ୍ଳେଷିତ ବାର୍ତ୍ତା:' },
  view: { en: 'view', hi: 'दृश्य', or: 'ଦୃଶ୍ୟ' },
  riskScore: { en: 'Risk Score', hi: 'जोखिम स्कोर', or: 'ବିପଦ ସ୍କୋର' },
  whySafe: { en: 'Why This Message Looks Safe', hi: 'यह संदेश सुरक्षित क्यों लगता है', or: 'ଏହି ବାର୍ତ୍ତା ସୁରକ୍ଷିତ କାହିଁକି ଦେଖାଯାଏ' },
  whyRisky: { en: 'Why This Message is Risky', hi: 'यह संदेश जोखिम भरा क्यों है', or: 'ଏହି ବାର୍ତ୍ତା ବିପଦଜନକ କାହିଁକି' },
  safetyRec: { en: 'Safety Recommendations', hi: 'सुरक्षा सिफारिशें', or: 'ସୁରକ୍ଷା ପରାମର୍ଶ' },
  safeReasons: [
    { en: { t: 'No urgent or threatening language', d: 'Message does not pressure you to act immediately' }, hi: { t: 'कोई जल्दबाजी या धमकी भरी भाषा नहीं', d: 'संदेश आप पर तुरंत कार्रवाई का दबाव नहीं डालता' }, or: { t: 'କୌଣସି ଜରୁରି କିମ୍ବା ଭୟଦର୍ଶକ ଭାଷା ନାହିଁ', d: 'ବାର୍ତ୍ତା ଆପଣଙ୍କୁ ତୁରନ୍ତ କାର୍ଯ୍ୟ କରିବାକୁ ଚାପ ଦେଇନାହିଁ' } },
    { en: { t: 'No suspicious links', d: 'No URLs that could lead to phishing or malware' }, hi: { t: 'कोई संदिग्ध लिंक नहीं', d: 'कोई ऐसा URL नहीं जो फ़िशिंग या मैलवेयर की ओर ले जाए' }, or: { t: 'କୌଣସି ସନ୍ଦେହଜନକ ଲିଙ୍କ୍ ନାହିଁ', d: 'ଫିଶିଂ କିମ୍ବା ମାଲୱେୟାର୍ କୁ ନେଉଥିବା କୌଣସି URL ନାହିଁ' } },
    { en: { t: 'No request for payment or personal details', d: 'Does not ask for money, OTP, or sensitive data' }, hi: { t: 'भुगतान या व्यक्तिगत जानकारी की कोई मांग नहीं', d: 'पैसे, OTP या संवेदनशील डेटा नहीं मांगता' }, or: { t: 'ପେମେଣ୍ଟ କିମ୍ବା ବ୍ୟକ୍ତିଗତ ସୂଚନା ମାଗୁନାହିଁ', d: 'ଟଙ୍କା, ଓଟିପି କିମ୍ବା ସଂବେଦନଶୀଳ ତଥ୍ୟ ମାଗେ ନାହିଁ' } },
  ] as const,
  fallbackRisky: [
    { en: { t: 'Urgent language detected', d: 'Creates artificial time pressure' }, hi: { t: 'जल्दबाजी वाली भाषा मिली', d: 'कृत्रिम समय का दबाव बनाता है' }, or: { t: 'ଜରୁରି ଭାଷା ଚିହ୍ନଟ ହୋଇଛି', d: 'କୃତ୍ରିମ ସମୟ ଚାପ ସୃଷ୍ଟି କରେ' } },
    { en: { t: 'Suspicious link found', d: 'URL leads to unverified domain' }, hi: { t: 'संदिग्ध लिंक मिला', d: 'URL अज्ञात डोमेन की ओर ले जाता है' }, or: { t: 'ସନ୍ଦେହଜନକ ଲିଙ୍କ୍ ମିଳିଛି', d: 'URL ଅଯାଞ୍ଚିତ ଡୋମେନ୍ କୁ ନେଇଥାଏ' } },
    { en: { t: 'Payment request', d: 'Asks for financial information' }, hi: { t: 'भुगतान की मांग', d: 'वित्तीय जानकारी मांगता है' }, or: { t: 'ପେମେଣ୍ଟ ଅନୁରୋଧ', d: 'ଆର୍ଥିକ ସୂଚନା ମାଗେ' } },
  ] as const,
  riskLevel: { high: { en: 'High Risk', hi: 'उच्च जोखिम', or: 'ଉଚ୍ଚ ବିପଦ' }, suspicious: { en: 'Suspicious', hi: 'संदिग्ध', or: 'ସନ୍ଦେହଜନକ' }, safe: { en: 'Safe', hi: 'सुरक्षित', or: 'ସୁରକ୍ଷିତ' } },
  safetyRecommendations: [
    { en: 'Never share Aadhaar, UPI or password with anyone', hi: 'आधार, यूपीआई या पासवर्ड कभी साझा न करें', or: 'ଆଧାର ଓ ୟୁପିଆଇ ବିବରଣୀ କଦାପି କାହାକୁ ଦିଅ ନାହିଁ' },
    { en: 'Do not click on unknown links', hi: 'अज्ञात लिंक पर क्लिक न करें', or: 'ଅଜ୍ଞାତ ଲିଙ୍କରେ କ୍ଲିକ କରିବେ ନାହିଁ' },
    { en: 'Banks never ask for personal info via messages', hi: 'बैंक संदेश से व्यक्तिगत जानकारी नहीं मांगते', or: 'ବ୍ୟାଙ୍କ କେବେବି ମେସେଜ୍ ଦେଇ ବ୍ୟକ୍ତିଗତ ସୂଚନା ମାଗେ ନାହିଁ' },
  ] as const,
  analyzeAnother: { en: 'Analyze Another Message', hi: 'दूसरा संदेश विश्लेषण करें', or: 'ଅନ୍ୟ ବାର୍ତ୍ତା ବିଶ୍ଳେଷଣ କରନ୍ତୁ' },
  reportScam: { en: 'Report This Scam', hi: 'इस घोटाले की रिपोर्ट करें', or: 'ଏହି ଘୋଟାଳା ରିପୋର୍ଟ କରନ୍ତୁ' },
} as const;

function label(key: keyof Omit<typeof LABELS, 'safeReasons' | 'fallbackRisky' | 'riskLevel' | 'safetyRecommendations'>, lang: 'en' | 'hi' | 'or') {
  return LABELS[key][lang];
}

export function MessageResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { message?: string; result?: AnalyzeResult } | null;
  const message = state?.message || '';
  const apiResult = state?.result;

  const targetScore = apiResult ? (typeof apiResult.scam_score === 'number' ? apiResult.scam_score : Number(apiResult.scam_score) || 0) : 0;
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    let step = 0;
    const steps = 60;
    const duration = 1500;
    const interval = duration / steps;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setRiskScore(Math.floor(targetScore * progress));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [targetScore]);

  useEffect(() => {
    if (!message) navigate('/message-analyzer');
  }, [message, navigate]);

  const detectedLang = apiResult?.language_detected?.toLowerCase();
  const defaultTab: 'english' | 'hindi' | 'odia' =
    detectedLang === 'odia' ? 'odia' : detectedLang === 'hindi' ? 'hindi' : 'english';
  const [activeTab, setActiveTab] = useState<'english' | 'hindi' | 'odia'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!message) return null;

  const getRiskLevelFromScore = (score: number) => {
    if (score >= 50) return { level: 'High Risk', color: '#ff3b3b', bgColor: 'bg-[#ff3b3b]/20' };
    if (score >= 25) return { level: 'Suspicious', color: '#ffd93d', bgColor: 'bg-[#ffd93d]/20' };
    return { level: 'Safe', color: '#00ff41', bgColor: 'bg-[#00ff41]/20' };
  };

  const riskLevelFromApi = apiResult?.risk_level?.toUpperCase();
  const risk = riskLevelFromApi === 'LIKELY_SCAM' || riskLevelFromApi === 'DANGEROUS'
    ? { level: 'High Risk', color: '#ff3b3b', bgColor: 'bg-[#ff3b3b]/20' }
    : riskLevelFromApi === 'SUSPICIOUS'
      ? { level: 'Suspicious', color: '#ffd93d', bgColor: 'bg-[#ffd93d]/20' }
      : riskLevelFromApi === 'SAFE'
        ? { level: 'Safe', color: '#00ff41', bgColor: 'bg-[#00ff41]/20' }
        : getRiskLevelFromScore(riskScore);

  const isSafe = risk.level === 'Safe';
  const lang = activeTab === 'english' ? 'en' : activeTab === 'hindi' ? 'hi' : 'or';

  const reasonsByLang =
    activeTab === 'english'
      ? (apiResult?.english_reasons?.length ? apiResult.english_reasons : apiResult?.detailed_reasons)
      : activeTab === 'hindi'
        ? (apiResult?.hindi_reasons?.length ? apiResult.hindi_reasons : apiResult?.detailed_reasons)
        : (apiResult?.odia_reasons?.length ? apiResult.odia_reasons : apiResult?.detailed_reasons);

  const tabMatchesDetected =
    (activeTab === 'english' && detectedLang === 'english') ||
    (activeTab === 'hindi' && detectedLang === 'hindi') ||
    (activeTab === 'odia' && detectedLang === 'odia');
  const useApiReasons = tabMatchesDetected && reasonsByLang?.length;

  const redFlags = !isSafe && useApiReasons && reasonsByLang
    ? reasonsByLang.map((text) => ({ title: text.slice(0, 50), description: text, severity: 'high' as const }))
    : !isSafe
      ? LABELS.fallbackRisky.map((r, i) => ({
          title: r[lang].t,
          description: r[lang].d,
          severity: (i === 2 ? 'critical' : 'high') as const,
        }))
      : [];

  const safeReasonsList = LABELS.safeReasons.map((r) => ({ title: r[lang].t, description: r[lang].d }));
  const riskLevelLabel =
    risk.level === 'High Risk' ? LABELS.riskLevel.high[lang] : risk.level === 'Suspicious' ? LABELS.riskLevel.suspicious[lang] : LABELS.riskLevel.safe[lang];

  const recommendations = LABELS.safetyRecommendations.map((r) => r[lang]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="sticky top-20 sm:top-24 p-6 sm:p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)]">
                {/* Risk Gauge */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative w-64 h-64 mx-auto mb-6"
                  >
                    <svg className="w-full h-full -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="128"
                        cy="128"
                        r="110"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="20"
                      />
                      {/* Progress circle */}
                      <motion.circle
                        cx="128"
                        cy="128"
                        r="110"
                        fill="none"
                        stroke={risk.color}
                        strokeWidth="20"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0, ${2 * Math.PI * 110}` }}
                        animate={{ strokeDasharray: `${(riskScore / 100) * 2 * Math.PI * 110}, ${2 * Math.PI * 110}` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{
                          filter: `drop-shadow(0 0 10px ${risk.color})`,
                        }}
                      />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Shield className="w-20 h-20 text-white mb-2 opacity-20" />
                      <div className="text-6xl font-bold text-white">{riskScore}</div>
                      <div className="text-gray-400">{label('riskScore', lang)}</div>
                    </div>
                  </motion.div>

                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${risk.bgColor} border-2`}
                    style={{ borderColor: risk.color }}
                  >
                    {risk.level !== 'Safe' ? <AlertTriangle className="w-5 h-5" style={{ color: risk.color }} /> : <CheckCircle2 className="w-5 h-5" style={{ color: risk.color }} />}
                    <span className="font-bold" style={{ color: risk.color }}>{riskLevelLabel}</span>
                  </div>
                </div>

                {/* Language tabs for reading */}
                <div className="mt-8">
                  <p className="text-xs text-gray-500 mb-2">{label('readIn', lang)}</p>
                  <div className="flex gap-1 p-1 rounded-lg bg-[#0a0e27]/50 border border-[#00d9ff]/20">
                    {(['english', 'hindi', 'odia'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-[#00d9ff]/30 text-[#00d9ff] border border-[#00d9ff]/40'
                            : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {tab === 'english' ? 'English' : tab === 'hindi' ? 'Hindi' : 'Odia'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Preview */}
                <div className="mt-4 p-4 rounded-lg bg-[#0a0e27]/50 border border-[#00d9ff]/10">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-500">{label('analyzedMessage', lang)}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#00d9ff]/20 text-[#00d9ff]">
                      {activeTab === 'english' ? 'English' : activeTab === 'hindi' ? 'Hindi' : 'Odia'} {label('view', lang)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 line-clamp-4">{message}</div>
                </div>
              </div>
            </div>

            {/* Right Panel - Details */}
            <div className="lg:col-span-3 space-y-8">
              {isSafe ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-6">{label('whySafe', lang)}</h2>
                  <div className="space-y-4">
                    {safeReasonsList.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        className="p-6 rounded-xl bg-[#00ff41]/10 border border-[#00ff41]/30 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/30">
                            <CheckCircle2 className="w-6 h-6 text-[#00ff41]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold mb-1 text-[#00ff41]">{item.title}</h3>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-6">{label('whyRisky', lang)}</h2>
                  <div className="space-y-4">
                    {redFlags.map((flag, index) => {
                      const severityColors = {
                        critical: { bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/30', text: 'text-[#ff3b3b]' },
                        high: { bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/30', text: 'text-[#ff3b3b]' },
                        medium: { bg: 'bg-[#ffd93d]/10', border: 'border-[#ffd93d]/30', text: 'text-[#ffd93d]' },
                      };
                      const colors = severityColors[flag.severity];
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                          className={`p-6 rounded-xl ${colors.bg} border ${colors.border} hover:shadow-[0_0_20px_rgba(255,59,59,0.2)] transition-all`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                              <AlertCircle className={`w-6 h-6 ${colors.text}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-bold mb-1 ${colors.text}`}>{flag.title}</h3>
                              <p className="text-sm text-gray-400">{flag.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-6">{label('safetyRec', lang)}</h2>
                <div className="p-8 rounded-xl bg-[#1a1f3a]/50 border border-[#00ff41]/20">
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#00ff41] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => navigate('/message-analyzer')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                >
                  {LABELS.analyzeAnother[lang]}
                </button>
                <button
                  onClick={() => navigate('/report')}
                  className="px-6 py-3 bg-[#ff3b3b]/20 text-[#ff3b3b] border border-[#ff3b3b]/30 rounded-lg hover:bg-[#ff3b3b]/30 hover:shadow-[0_0_20px_rgba(255,59,59,0.3)] transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                >
                  {LABELS.reportScam[lang]}
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
