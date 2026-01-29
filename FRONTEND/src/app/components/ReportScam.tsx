import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, LogIn } from 'lucide-react';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { submitReport, REPORT_SCAM_TYPES, REPORT_PLATFORMS } from '@/app/api/report';
import { validateScamContent, validateEmailOptional } from '@/app/lib/validation';
import { getStoredAuth } from '@/app/api/auth';

export function ReportScam() {
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    const contentErr = validateScamContent(message);
    if (contentErr) {
      setError(contentErr);
      return;
    }
    if (email.trim()) {
      const emailErr = validateEmailOptional(email);
      if (emailErr) {
        setEmailError(emailErr);
        return;
      }
    }
    if (!category || !platform) {
      setError('Scam category and platform are required.');
      return;
    }
    setIsLoading(true);
    try {
      const scamContent = details.trim() ? `${message.trim()}\n\nAdditional details: ${details.trim()}` : message.trim();
      const data = await submitReport({
        scam_content: scamContent,
        scam_type: category,
        platform,
        reporter_name: reporterName.trim() || undefined,
        email: email.trim() || undefined,
      });
      setReportId(data.report_id);
      setSubmitted(true);
      setCategory('');
      setPlatform('');
      setMessage('');
      setDetails('');
      setReporterName('');
      setEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {!getStoredAuth() && (
            <div className="mb-6 p-4 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/30 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-300">
              <span>Sign in to track your reports.</span>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-[#00d9ff] hover:underline font-medium">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            </div>
          )}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#ff3b3b]/20 to-[#ffd93d]/20 mb-6">
              <FileText className="w-10 h-10 text-[#ff3b3b]" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Report a <span className="text-[#ff3b3b]">Scam</span>
            </h1>
            <p className="text-xl text-gray-400">
              Help protect others by reporting suspicious activity
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 rounded-2xl bg-[#00ff41]/10 border-2 border-[#00ff41]/50 text-center"
            >
              <CheckCircle2 className="w-20 h-20 text-[#00ff41] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Report Submitted!</h2>
              {reportId && <p className="text-[#00d9ff] font-mono mb-2">Report ID: {reportId}</p>}
              <p className="text-gray-300 text-lg">
                Thank you for helping keep others safe. We'll review your report shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)]">
              <div className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-white mb-3">Scam Category *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f3a] border border-[#00d9ff]/30 rounded-lg shadow-xl">
                      {REPORT_SCAM_TYPES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white focus:bg-[#00d9ff]/20 focus:text-white data-[highlighted]:bg-[#00d9ff]/20 data-[highlighted]:text-white rounded-md">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-white mb-3">Platform *</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="w-full h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white">
                      <SelectValue placeholder="Where did you encounter this?" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f3a] border border-[#00d9ff]/30 rounded-lg shadow-xl">
                      {REPORT_PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p} className="text-white focus:bg-[#00d9ff]/20 focus:text-white data-[highlighted]:bg-[#00d9ff]/20 data-[highlighted]:text-white rounded-md">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-white mb-3">Message or Link * (min 20 characters)</label>
                  <Textarea
                    placeholder="Paste the scam message, link, or phone number here..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError(''); }}
                    required
                    className="min-h-[150px] bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] focus:shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-white mb-3">Additional Details (Optional)</label>
                  <Textarea
                    placeholder="Provide any additional context..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="min-h-[120px] bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 focus:border-[#00d9ff] transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-white mb-3">Your Name (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-white mb-3">Your Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    onBlur={() => { const err = email.trim() ? validateEmailOptional(email) : null; setEmailError(err ?? ''); }}
                    className={`h-12 bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder:text-gray-500 ${emailError ? 'border-red-500/50' : ''}`}
                  />
                  {emailError && <p className="text-sm text-red-400 mt-1">{emailError}</p>}
                  <p className="text-sm text-gray-500 mt-2">We may contact you if we need more information.</p>
                </div>
                <button
                  type="submit"
                  disabled={!category || !platform || message.trim().length < 20 || isLoading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#00ff41] to-[#00cc34] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/20">
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-[#00d9ff]">Note:</strong> All reports are reviewed manually by our team. 
              We take your privacy seriously and will never share your personal information. 
              By submitting this report, you help protect the entire community from scams.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
