import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Textarea } from '@/app/components/ui/textarea';
import { AlertCircle, LogIn } from 'lucide-react';
import { validateMessage } from '@/app/lib/validation';
import { analyzeMessage as analyzeMessageApi } from '@/app/api/analyze';
import { getStoredAuth } from '@/app/api/auth';

const exampleMessages: { title: string; text: string; tier: 'high' | 'medium' | 'safe'; lang?: 'hindi' | 'odia' }[] = [
  { tier: 'high', title: 'High Risk', text: 'URGENT: Your account will be suspended in 24 hours! Click here immediately to verify your payment details: http://scam-link.xyz/verify' },
  { tier: 'medium', title: 'Suspicious', text: 'Dear Customer, Your order has been delayed. Please update your payment information by clicking the link below.' },
  { tier: 'safe', title: 'Safe', text: 'Thank you for your order. Your package will arrive on Monday. Order #12345' },
  { tier: 'high', title: 'High Risk (Hindi)', text: 'जल्दी! आपका बैंक खाता 24 घंटे में बंद हो जाएगा। ओटीपी और पासवर्ड वेरिफाई करने के लिए यह लिंक क्लिक करें: http://scam-bank.xyz/verify', lang: 'hindi' },
  { tier: 'medium', title: 'Suspicious (Hindi)', text: 'प्रिय ग्राहक, आपका ऑर्डर देर से आएगा। भुगतान जानकारी अपडेट करने के लिए नीचे दिए लिंक पर क्लिक करें।', lang: 'hindi' },
  { tier: 'safe', title: 'Safe (Hindi)', text: 'आपके ऑर्डर के लिए धन्यवाद। आपका पैकेज सोमवार को आएगा। ऑर्डर नंबर 12345।', lang: 'hindi' },
  { tier: 'high', title: 'High Risk (Odia)', text: 'ଜରୁରି: ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତା ୨୪ ଘଣ୍ଟାରେ ବନ୍ଦ ହେବ। ଓଟିପି ଓ ପେମେଣ୍ଟ ଯାଞ୍ଚ କରିବାକୁ ଏହି ଲିଙ୍କରେ କ୍ଲିକ କରନ୍ତୁ: http://scam-link.xyz/verify', lang: 'odia' },
  { tier: 'medium', title: 'Suspicious (Odia)', text: 'ମାନ୍ୟ ଗ୍ରାହକ, ଆପଣଙ୍କ ଅର୍ଡର ବିଳମ୍ବ ହୋଇଛି। ବ୍ୟାଙ୍କ ପେମେଣ୍ଟ ସୂଚନା ଶୀଘ୍ର ଅପଡେଟ୍ କରିବାକୁ link below ଦେଖନ୍ତୁ।', lang: 'odia' },
  { tier: 'safe', title: 'Safe (Odia)', text: 'ଆପଣଙ୍କ ଅର୍ଡର ପାଇଁ ଧନ୍ୟବାଦ। ଆପଣଙ୍କ ପ୍ୟାକେଜ୍ ସୋମବାର ଆସିବ। ଅର୍ଡର ନମ୍ବର ୧୨୩୪୫।', lang: 'odia' },
];

const MIN_MESSAGE_LEN = 10;

export function MessageAnalyzer() {
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputCardRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    setError('');
    const err = validateMessage(message, MIN_MESSAGE_LEN);
    if (err) {
      setError(err);
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeMessageApi(message.trim());
      navigate('/message-result', { state: { message: message.trim(), result } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useExample = (text: string) => {
    setMessage(text);
    setError('');
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
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Message <span className="text-[#00d9ff]">Analyzer</span>
            </h1>
            <p className="text-xl text-gray-400">
              Paste any suspicious message to analyze
            </p>
            <p className="text-sm text-gray-500 mt-1">English, Odia & Hindi supported</p>
          </motion.div>

          <motion.div
            ref={inputCardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)] mb-8 scroll-mt-28"
          >
            <Textarea
              id="message-analyzer-input"
              placeholder="Paste your message here (at least 10 characters)..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(''); }}
              className={`min-h-[300px] bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] focus:shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all resize-none ${error ? 'border-red-500/50' : ''}`}
            />
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {message.length} characters {message.length > 0 && message.length < MIN_MESSAGE_LEN && `(min ${MIN_MESSAGE_LEN})`}
              </div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleAnalyze}
                disabled={message.trim().length < MIN_MESSAGE_LEN || isAnalyzing}
                className="px-8 py-3 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0a0e27]/30 border-t-[#0a0e27] rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Scam Risk'
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Example Messages */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#ffd93d]" />
              Example Messages
            </h2>
            <div className="grid gap-4">
              {exampleMessages.map((example, index) => {
                const tierStyle = example.tier === 'high' ? 'border-[#ff3b3b]/30 hover:border-[#ff3b3b]/50 hover:shadow-[0_0_20px_rgba(255,59,59,0.2)]' : example.tier === 'medium' ? 'border-[#ffd93d]/25 hover:border-[#ffd93d]/45 hover:shadow-[0_0_20px_rgba(255,217,61,0.15)]' : 'border-[#00ff41]/20 hover:border-[#00ff41]/40 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]';
                const badge = example.tier === 'high' ? { label: 'High Risk', cls: 'bg-[#ff3b3b]/20 text-[#ff3b3b]' } : example.tier === 'medium' ? { label: 'Suspicious', cls: 'bg-[#ffd93d]/20 text-[#ffd93d]' } : { label: 'Safe', cls: 'bg-[#00ff41]/20 text-[#00ff41]' };
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    role="button"
                    tabIndex={0}
                    className={`group p-6 rounded-xl bg-[#1a1f3a]/30 border transition-all cursor-pointer ${tierStyle}`}
                    onClick={() => {
                      useExample(example.text);
                      inputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setTimeout(() => document.getElementById('message-analyzer-input')?.focus(), 400);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        useExample(example.text);
                        inputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setTimeout(() => document.getElementById('message-analyzer-input')?.focus(), 400);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-white">{example.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded ${badge.cls}`}>{badge.label}</span>
                          {example.lang && (
                            <span className="px-2 py-0.5 text-xs rounded bg-[#00d9ff]/20 text-[#00d9ff]">
                              {example.lang === 'hindi' ? 'Hindi' : 'Odia'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{example.text}</p>
                      </div>
                      <span className="px-4 py-2 text-sm bg-[#00d9ff]/20 text-[#00d9ff] rounded-lg group-hover:bg-[#00d9ff]/30 transition-all shrink-0">
                        Try
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
