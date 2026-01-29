import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen pt-28 sm:pt-32 px-4 sm:px-6 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-10 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)] pointer-events-none select-none"
        >
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-[#00d9ff]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-5">
            <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold text-white mt-6">1. Introduction</h2>
            <p>ScamShield respects your privacy. This policy describes how we collect, use, and protect your information when you use our scam detection and awareness services.</p>

            <h2 className="text-xl font-semibold text-white mt-6">2. Information We Collect</h2>
            <p>We collect only what is needed to provide the service: account details (username, email), scan history linked to your account (messages and links you choose to analyze), and quiz attempts. We do not collect payment or sensitive identity documents unless you voluntarily report a scam and include such details.</p>

            <h2 className="text-xl font-semibold text-white mt-6">3. How We Use Your Data</h2>
            <p>Scanned messages and URLs are processed for analysis to provide risk scores and safety recommendations. Results are stored in your account history so you can review past scans. We do not sell or share your data with third parties for marketing. We may use anonymized, aggregated data to improve our detection models.</p>

            <h2 className="text-xl font-semibold text-white mt-6">4. Data Retention</h2>
            <p>We retain your account data and scan history for as long as your account is active. You may request deletion of your account and associated data at any time from your profile. Deleted data is removed from our systems within a reasonable period.</p>

            <h2 className="text-xl font-semibold text-white mt-6">5. Security</h2>
            <p>We use industry-standard measures to protect your data in transit and at rest. Access to personal data is restricted to authorized personnel and systems necessary to operate the service.</p>

            <h2 className="text-xl font-semibold text-white mt-6">6. Your Rights</h2>
            <p>You may access, correct, or delete your account and data through the app. For support, data export, or privacy requests, contact us at the email provided in the footer.</p>

            <p className="mt-8 text-gray-400">For questions about this policy, email us at the address in the footer.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
