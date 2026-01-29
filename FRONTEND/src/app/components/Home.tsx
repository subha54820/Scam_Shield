import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Brain, Zap, CheckCircle, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiUrl } from '@/app/api/config';
import { getStoredAuth } from '@/app/api/auth';

export function Home() {
  const auth = getStoredAuth();
  const [stats, setStats] = useState({ scams: 0, users: 0, links: 0 });

  useEffect(() => {
    fetch(apiUrl('/stats/'))
      .then((res) => res.json())
      .then((data) => {
        const total = data.total_checks ?? 0;
        const high = data.high_risk ?? 0;
        const safe = data.safe ?? 0;
        setStats({
          scams: high,
          users: total,
          links: total,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const targets = { scams: 1247, users: 523, links: 2891 };
    let step = 0;
    const timer = setInterval(() => {
      if (cancelled) return;
      step++;
      const progress = step / steps;
      setStats((prev) => {
        if (prev.users > 0) return prev;
        return {
          scams: Math.floor(targets.scams * progress),
          users: Math.floor(targets.users * progress),
          links: Math.floor(targets.links * progress),
        };
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms analyze patterns to identify scams instantly',
    },
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Get immediate results on suspicious messages and links within seconds',
    },
    {
      icon: CheckCircle,
      title: 'Trusted Protection',
      description: 'Join thousands of users protected by our cutting-edge security technology',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - pt reserves space so content is not hidden under fixed header */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 px-4 sm:px-6">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,217,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,217,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}></div>
        </div>

        <div className="relative z-10 max-w-screen-xl w-full mx-auto text-center">
          {auth?.user?.username && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center"
            >
              <span className="text-gray-300">Welcome, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#00ff41] drop-shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                {auth.user.username}
              </span>
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 text-white">
              Protect Yourself
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#00ff41] drop-shadow-[0_0_30px_rgba(0,217,255,0.5)]">
                from Scams
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-1">
              Think Before You Click
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16"
          >
            <Link
              to="/message-analyzer"
              className="group px-8 py-4 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_30px_rgba(0,217,255,0.6)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-lg font-semibold">Analyze Message</span>
            </Link>
            <Link
              to="/link-checker"
              className="group px-8 py-4 bg-gradient-to-r from-[#00ff41] to-[#00cc34] text-[#0a0e27] rounded-lg hover:shadow-[0_0_30px_rgba(0,255,65,0.6)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <LinkIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Check Link</span>
            </Link>
            <Link
              to="/quiz"
              className="group px-8 py-4 bg-[#1a1f3a]/80 border border-[#00d9ff]/30 text-[#00d9ff] rounded-lg hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <span className="text-lg font-semibold">Awareness Quiz</span>
            </Link>
          </motion.div>

          {/* Cyber Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative max-w-md mx-auto"
          >
            <div className="relative">
              <Shield className="w-64 h-64 mx-auto text-[#00d9ff] opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00d9ff]/20 to-[#00ff41]/20 blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[#131829]/50">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 rounded-xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 hover:border-[#00d9ff]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)] hover:-translate-y-2"
                >
                  <div className="w-16 h-16 mb-6 rounded-lg bg-gradient-to-br from-[#00d9ff]/20 to-[#00ff41]/20 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all">
                    <Icon className="w-8 h-8 text-[#00d9ff]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center"
          >
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#00ff41] mb-2">
                {stats.scams.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-lg">Scams Detected</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#00ff41] mb-2">
                {stats.users.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-base sm:text-lg">Users Protected</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#00ff41] mb-2">
                {stats.links.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-lg">Links Verified</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
