import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export function Terms() {
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
            <FileText className="w-10 h-10 text-[#00d9ff]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-5">
            <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold text-white mt-6">1. Acceptance</h2>
            <p>Welcome to ScamShield. By using this service you agree to these terms. Use the service responsibly and only for checking messages and links for potential scams.</p>

            <h2 className="text-xl font-semibold text-white mt-6">2. Service Description</h2>
            <p>ScamShield provides automated analysis of messages and URLs to help identify potential scams. Analysis is based on rules and patterns and does not guarantee accuracy. Do not rely solely on this tool for security or financial decisions. Always verify through official channels when in doubt.</p>

            <h2 className="text-xl font-semibold text-white mt-6">3. Acceptable Use</h2>
            <p>You may not use the service for illegal purposes, to harass others, or to circumvent security. Do not submit content you do not have the right to share. We may suspend or terminate access for misuse.</p>

            <h2 className="text-xl font-semibold text-white mt-6">4. Data and Storage</h2>
            <p>We store your messages and links only as necessary for analysis and your account history. Scanned content is processed to generate risk scores and recommendations. See our Privacy Policy for how we handle your data.</p>

            <h2 className="text-xl font-semibold text-white mt-6">5. Disclaimer</h2>
            <p>The service is provided &quot;as is.&quot; We do not warrant that results are complete or error-free. We are not liable for any loss resulting from reliance on the service. Report abuse or questions to our support email in the footer.</p>

            <h2 className="text-xl font-semibold text-white mt-6">6. Changes</h2>
            <p>We may update these terms from time to time. Continued use after changes constitutes acceptance. The &quot;Last updated&quot; date at the top reflects the latest revision.</p>

            <p className="mt-8 text-gray-400">For support, contact us at the email in the footer.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
