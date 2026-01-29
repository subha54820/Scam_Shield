import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from '@/app/components/Navigation';
import { Home } from '@/app/components/Home';
import { MessageAnalyzer } from '@/app/components/MessageAnalyzer';
import { MessageResult } from '@/app/components/MessageResult';
import { LinkChecker } from '@/app/components/LinkChecker';
import { LinkResult } from '@/app/components/LinkResult';
import { ReportScam } from '@/app/components/ReportScam';
import { Profile } from '@/app/components/Profile';
import { AwarenessQuiz } from '@/app/components/AwarenessQuiz';
import { LoginForm } from '@/app/components/LoginForm';
import { SignUpForm } from '@/app/components/SignUpForm';
import { RecoveryForm } from '@/app/components/RecoveryForm';
import { Terms } from '@/app/components/Terms';
import { Privacy } from '@/app/components/Privacy';
import { Intro } from '@/app/components/Intro';
import { Footer } from '@/app/components/Footer';
import { getStoredAuth } from '@/app/api/auth';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = getStoredAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/recovery'].includes(location.pathname);
  const isIntroPage = location.pathname === '/intro';
  return (
    <>
      <ScrollToTop />
      {!isIntroPage && <Navigation />}
      <main className="flex-1">
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/recovery" element={<RecoveryForm />} />
            <Route path="/intro" element={<RequireAuth><Intro /></RequireAuth>} />
            <Route path="/" element={getStoredAuth() ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/message-analyzer" element={<RequireAuth><MessageAnalyzer /></RequireAuth>} />
            <Route path="/message-result" element={<RequireAuth><MessageResult /></RequireAuth>} />
            <Route path="/link-checker" element={<RequireAuth><LinkChecker /></RequireAuth>} />
            <Route path="/link-result" element={<RequireAuth><LinkResult /></RequireAuth>} />
            <Route path="/report" element={<RequireAuth><ReportScam /></RequireAuth>} />
            <Route path="/quiz" element={<RequireAuth><AwarenessQuiz /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      {!isAuthPage && !isIntroPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0e27] flex flex-col">
        <AppContent />
      </div>
    </Router>
  );
}
