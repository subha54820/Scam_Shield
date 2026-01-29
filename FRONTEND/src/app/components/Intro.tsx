import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles } from 'lucide-react';
import { getStoredAuth } from '@/app/api/auth';

const INTRO_DURATION_MS = 4200;
const TERMINAL_LINES = [
  '> ScamShield v2.0 --init',
  '[OK] Loading AI detection engine...',
  '[OK] Access granted.',
];

function BlinkingCursor() {
  return (
    <span className="inline-block w-2 h-4 ml-0.5 bg-[#00ff41] animate-pulse" style={{ animationDuration: '0.8s' }} />
  );
}

export function Intro() {
  const navigate = useNavigate();
  const auth = getStoredAuth();
  const [phase, setPhase] = useState<'logo' | 'terminal' | 'welcome' | 'redirect'>('logo');
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    if (!auth) {
      navigate('/login', { replace: true });
      return;
    }
    const tRedirect = setTimeout(() => navigate('/', { replace: true }), INTRO_DURATION_MS);
    return () => clearTimeout(tRedirect);
  }, [auth, navigate]);

  useEffect(() => {
    if (phase !== 'logo') return;
    const t = setTimeout(() => setPhase('terminal'), 800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'terminal') return;
    const lineCount = TERMINAL_LINES.length;
    const lineDelay = 180;
    const charDelay = 14;
    const line = TERMINAL_LINES[visibleLines] ?? '';
    const maxChar = line.length;

    if (visibleLines >= lineCount) {
      const t = setTimeout(() => setPhase('welcome'), 350);
      return () => clearTimeout(t);
    }
    if (typingIndex < maxChar) {
      const t = setTimeout(() => setTypingIndex((i) => i + 1), charDelay);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setVisibleLines((v) => v + 1);
      setTypingIndex(0);
    }, lineDelay);
    return () => clearTimeout(t);
  }, [phase, visibleLines, typingIndex]);

  useEffect(() => {
    if (phase !== 'welcome') return;
    const t = setTimeout(() => setPhase('redirect'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  if (!auth) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0a0e27]">
      <div className="absolute inset-0 opacity-15">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,217,255,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,217,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="rounded-2xl bg-gradient-to-br from-[#00d9ff]/25 to-[#00ff41]/10 border border-[#00d9ff]/40 p-6 shadow-[0_0_50px_rgba(0,217,255,0.35)]"
            >
              <Shield className="w-20 h-20 sm:w-24 sm:h-24 text-[#00d9ff]" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-4 text-lg font-semibold text-[#00d9ff]"
            >
              ScamShield
            </motion.p>
          </motion.div>
        )}

        {phase === 'terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            <div className="rounded-lg border border-[#00d9ff]/40 bg-[#0a0e27]/95 shadow-[0_0_40px_rgba(0,217,255,0.15)] overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg opacity-[0.06]" aria-hidden="true">
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-[#00ff41]"
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#00d9ff]/20 bg-[#0a0e27]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b3b]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd93d]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff41]/80" />
                <span className="text-xs text-[#00d9ff]/80 ml-2 font-mono">scamshield --secure</span>
              </div>
              <div className="p-4 font-mono text-sm min-h-[180px]">
                {TERMINAL_LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.05 }}
                    className="flex items-center gap-0 text-[#00ff41]"
                  >
                    {i < visibleLines ? (
                      <span className="text-[#00ff41]/90">{line}</span>
                    ) : i === visibleLines ? (
                      <>
                        <span className="text-[#00ff41]/90">{line.slice(0, typingIndex)}</span>
                        <BlinkingCursor />
                      </>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center justify-center text-center w-full min-h-[80vh] px-6 sm:px-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="flex items-center gap-2 text-[#00d9ff] mb-6 sm:mb-8"
            >
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-base sm:text-lg font-medium uppercase tracking-widest">AI-Powered Protection</span>
            </motion.div>
            <h1
              className="font-bold text-white flex flex-col items-center justify-center gap-0 leading-tight w-full max-w-5xl"
              style={{
                fontSize: 'clamp(2.75rem, 10vw, 6rem)',
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="block"
              >
                Welcome,
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#00ff41] min-w-0 max-w-full break-words text-center"
                style={{ overflowWrap: 'break-word', fontSize: 'clamp(2.75rem, 10vw, 6rem)' }}
              >
                {auth.user?.username ?? 'User'}
              </motion.span>
            </h1>
          </motion.div>
        )}

        {phase === 'redirect' && (
          <motion.div
            key="redirect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            <div className="flex items-center gap-0.5 text-[#00d9ff] font-mono text-sm">
              <span>Loading</span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ....
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute bottom-6 left-0 right-0 h-1 bg-[#1a1f3a] rounded-full overflow-hidden mx-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#00d9ff] to-[#00ff41]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: INTRO_DURATION_MS / 1000, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
}
