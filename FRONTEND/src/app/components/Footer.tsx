import { Link } from 'react-router-dom';
import { Mail, FileText, Shield, BookOpen } from 'lucide-react';

const SUPPORT_EMAIL = 'scamshield9178@gmail.com';

export function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 border-t border-[#00d9ff]/20 bg-[#0a0e27]/80">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-[#00d9ff] transition-colors flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Email
            </a>
            <Link to="/terms" className="hover:text-[#00d9ff] transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Terms
            </Link>
            <Link to="/privacy" className="hover:text-[#00d9ff] transition-colors flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Privacy Policy
            </Link>
            <Link to="/quiz" className="hover:text-[#00d9ff] transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Awareness Quiz
            </Link>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ScamShield. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
