import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Shield, MessageSquare, Link as LinkIcon, FileText, Settings, BookOpen, Phone, Trash2, Eye, EyeOff } from 'lucide-react';
import { clearStoredAuth, getStoredAuth, changePassword } from '@/app/api/auth';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { getProfile, getStats, getMessageHistory, getLinkHistory, updateProfile, deleteAccount } from '@/app/api/user';
import { getQuizHistory, type QuizAttemptItem } from '@/app/api/quiz';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Input } from '@/app/components/ui/input';
import { validateEmail, restrictPhone, validatePassword } from '@/app/lib/validation';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';

export function Profile() {
  const navigate = useNavigate();
  const stored = getStoredAuth();
  const [profile, setProfile] = useState<{ name: string; email: string; created_at: string | null } | null>(null);
  const [stats, setStats] = useState<{ total_scans: number; scams_detected: number; safe_detected: number; quiz_score: number; join_date: string | null } | null>(null);
  const [messageActivity, setMessageActivity] = useState<{ content: string; risk_level: string; created_at: string }[]>([]);
  const [linkActivity, setLinkActivity] = useState<{ content: string; risk_level: string; created_at: string }[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  const PHONE_STORAGE_KEY = 'scamshield_profile_phone';
  const NOTIFICATIONS_KEY = 'scamshield_notifications';
  const getNotificationsPrefs = () => {
    if (!stored?.user?.id) return { emailHighRisk: true, quizReminders: false };
    try {
      const raw = localStorage.getItem(`${NOTIFICATIONS_KEY}_${stored.user.id}`);
      if (!raw) return { emailHighRisk: true, quizReminders: false };
      const p = JSON.parse(raw);
      return { emailHighRisk: p.emailHighRisk !== false, quizReminders: p.quizReminders === true };
    } catch { return { emailHighRisk: true, quizReminders: false }; }
  };
  const setNotificationsPrefs = (prefs: { emailHighRisk?: boolean; quizReminders?: boolean }) => {
    if (!stored?.user?.id) return;
    const current = getNotificationsPrefs();
    const next = { ...current, ...prefs };
    localStorage.setItem(`${NOTIFICATIONS_KEY}_${stored.user.id}`, JSON.stringify(next));
  };
  const [notifEmailHighRisk, setNotifEmailHighRisk] = useState(true);
  const [notifQuizReminders, setNotifQuizReminders] = useState(false);

  useEffect(() => {
    const p = getNotificationsPrefs();
    setNotifEmailHighRisk(p.emailHighRisk);
    setNotifQuizReminders(p.quizReminders);
  }, [stored?.user?.id, notificationsOpen]);
  const getStoredPhone = () => (stored?.user?.id ? localStorage.getItem(`${PHONE_STORAGE_KEY}_${stored.user.id}`) : null) ?? '';
  const setStoredPhone = (value: string) => { if (stored?.user?.id) localStorage.setItem(`${PHONE_STORAGE_KEY}_${stored.user.id}`, value); };

  const authId = stored?.user?.id;
  const authToken = stored?.token;
  useEffect(() => {
    if (!authToken) {
      navigate('/login', { replace: true });
      return;
    }
    Promise.all([getProfile(), getStats(), getMessageHistory(1, 10), getLinkHistory(1, 10), getQuizHistory(1, 10)])
      .then(([p, s, msgH, linkH, q]) => {
        setProfile(p);
        setStats(s);
        setMessageActivity(msgH?.scans ?? []);
        setLinkActivity(linkH?.scans ?? []);
        setQuizAttempts(q?.attempts ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authId, authToken, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    const email = editEmail.trim();
    const phone = editPhone.trim();
    if (email) {
      const err = validateEmail(email);
      if (err) {
        setEditError(err);
        return;
      }
    }
    setEditSaving(true);
    try {
      const updated = await updateProfile({ email });
      setProfile(updated);
      setStoredPhone(phone);
      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    const currErr = validatePassword(currentPassword);
    const newErr = validatePassword(newPassword);
    if (currErr) { setSecurityError(currErr); return; }
    if (newErr) { setSecurityError(newErr); return; }
    if (newPassword !== confirmPassword) { setSecurityError('New passwords do not match'); return; }
    if (newPassword.length > 128) { setSecurityError('Password is too long'); return; }
    setSecurityLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSecuritySuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setSecuritySuccess(false); setSecurityOpen(false); }, 1500);
    } catch (err) {
      setSecurityError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      if (stored?.user?.id) {
        try {
          const keys = Object.keys(localStorage);
          keys.forEach((k) => {
            if (k.startsWith('scamshield_') || k === 'userCredentials') localStorage.removeItem(k);
          });
        } catch (_) {}
      }
      clearStoredAuth();
      setDeleteOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!stored) return null;

  const displayPhone = getStoredPhone() || editPhone || 'Not set';
  const user = {
    name: profile?.name ?? stored.user.username,
    email: profile?.email ?? stored.user.email ?? 'Not set',
    phone: displayPhone,
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Member',
    avatar: (profile?.name ?? stored.user.username).slice(0, 2).toUpperCase(),
  };

  const totalQuizCorrect = quizAttempts.reduce((sum, a) => sum + a.score, 0);
  const statCards = [
    { label: 'Total Scans', value: String(stats?.total_scans ?? 0), icon: MessageSquare, color: '#00d9ff' },
    { label: 'Scams Detected', value: String(stats?.scams_detected ?? 0), icon: FileText, color: '#ff3b3b' },
    { label: 'Safe Detected', value: String(stats?.safe_detected ?? 0), icon: LinkIcon, color: '#00ff41' },
    { label: 'Quiz Correct', value: String(totalQuizCorrect), icon: Shield, color: '#ffd93d' },
  ];

  const messageItems = messageActivity.map((s) => ({
    type: 'message' as const,
    title: s.content.slice(0, 50) + (s.content.length > 50 ? '...' : ''),
    result: s.risk_level,
    time: new Date(s.created_at).toLocaleDateString(),
    riskLevel: s.risk_level === 'LIKELY_SCAM' || s.risk_level === 'DANGEROUS' ? 'high' : s.risk_level === 'SUSPICIOUS' ? 'medium' : 'safe',
    sortAt: s.created_at,
  }));
  const linkItems = linkActivity.map((s) => ({
    type: 'link' as const,
    title: s.content.slice(0, 50) + (s.content.length > 50 ? '...' : ''),
    result: s.risk_level,
    time: new Date(s.created_at).toLocaleDateString(),
    riskLevel: s.risk_level === 'DANGEROUS' ? 'high' : s.risk_level === 'SUSPICIOUS' ? 'medium' : 'safe',
    sortAt: s.created_at,
  }));
  const quizItems = quizAttempts.map((a) => ({
    type: 'quiz' as const,
    title: `Quiz: ${a.score}/${a.total_questions} (${a.percentage}%)`,
    result: `${a.percentage}%`,
    time: new Date(a.completed_at).toLocaleDateString(),
    riskLevel: 'safe' as const,
    sortAt: a.completed_at,
  }));
  const allActivity = [...messageItems, ...linkItems, ...quizItems].sort(
    (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime()
  );
  const recentActivityDisplay = allActivity.length
    ? allActivity
    : [{ type: 'message' as const, title: 'No activity yet', result: '-', time: '-', riskLevel: 'safe' as const }];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return { text: 'text-[#ff3b3b]', bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/30' };
      case 'medium': return { text: 'text-[#ffd93d]', bg: 'bg-[#ffd93d]/10', border: 'border-[#ffd93d]/30' };
      case 'safe': return { text: 'text-[#00ff41]', bg: 'bg-[#00ff41]/10', border: 'border-[#00ff41]/30' };
      default: return { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 pb-12 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-8 sm:pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
              Your <span className="text-[#00d9ff]">Profile</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-400">Manage your account and view your activity</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)]">
                <div className="text-center">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 border-2 border-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                    <AvatarFallback className="bg-gradient-to-br from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] text-2xl font-bold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Member since {user.memberSince}</span>
                  </div>
                </div>
                <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (open) { setEditEmail(profile?.email ?? ''); setEditPhone(getStoredPhone()); setEditError(''); } }}>
                  <DialogTrigger asChild>
                    <button type="button" className="w-full mt-6 px-6 py-3 bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/30 rounded-lg hover:bg-[#00d9ff]/20 transition-all duration-300 hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2">
                      <Settings className="w-5 h-5" />
                      Edit Profile
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1a1f3a] border-[#00d9ff]/20 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Edit Profile</DialogTitle>
                      <DialogDescription className="sr-only">Update your email and phone.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                      {editError && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
                          {editError}
                        </div>
                      )}
                      <div>
                        <label className="block text-[#00d9ff] text-sm font-medium mb-1">Name</label>
                        <Input
                          value={profile?.name ?? stored?.user?.username ?? ''}
                          readOnly
                          disabled
                          className="bg-[#0a0e27]/50 border-[#00d9ff]/20 text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[#00d9ff] text-sm font-medium mb-1">Email</label>
                        <Input
                          type="email"
                          autoComplete="email"
                          value={editEmail}
                          onChange={(e) => { setEditEmail(e.target.value); setEditError(''); }}
                          onBlur={() => { const err = editEmail.trim() ? validateEmail(editEmail) : null; if (err) setEditError(err); }}
                          readOnly={false}
                          disabled={false}
                          className="bg-[#0a0e27] border-[#00d9ff]/30 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[#00d9ff] text-sm font-medium mb-1">Phone</label>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          value={editPhone}
                          onChange={(e) => setEditPhone(restrictPhone(e.target.value))}
                          placeholder="Digits only"
                          className="bg-[#0a0e27] border-[#00d9ff]/30 text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={editSaving}
                        className="w-full py-2 bg-[#00d9ff] text-[#0a0e27] rounded-lg font-semibold hover:bg-[#00d9ff]/90 disabled:opacity-50"
                      >
                        {editSaving ? 'Saving…' : 'Save'}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
                <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteError(''); }}>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="w-full mt-4 px-6 py-3 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/10 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                  <AlertDialogContent className="bg-[#1a1f3a] border-[#00d9ff]/20 text-white max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete account?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This will permanently delete your account and all your data (scans, quiz history, reports). This cannot be undone.
                      </AlertDialogDescription>
                      {deleteError && (
                        <p className="text-sm text-red-400 mt-2">{deleteError}</p>
                      )}
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 mt-6">
                      <AlertDialogCancel className="bg-[#1a1f3a] border border-[#00d9ff]/50 text-[#00d9ff] hover:bg-[#00d9ff]/10 hover:text-white m-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
                        className="bg-red-600 hover:bg-red-700 text-white m-0"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? 'Deleting…' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="space-y-4">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-6 rounded-xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 hover:border-[#00d9ff]/50 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">{stat.value}</div>
                          <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20 shadow-[0_0_30px_rgba(0,217,255,0.1)]">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#00d9ff]" />
                  Recent Activity
                </h2>
                <div className="space-y-3 max-h-[16rem] overflow-y-auto pr-1 scrollbar-theme">
                  {recentActivityDisplay.map((activity, index) => {
                    const colors = getRiskColor(activity.riskLevel);
                    const getIcon = () => {
                      switch (activity.type) {
                        case 'message': return MessageSquare;
                        case 'link': return LinkIcon;
                        case 'quiz': return BookOpen;
                        case 'report': return FileText;
                        default: return Shield;
                      }
                    };
                    const Icon = getIcon();

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="p-5 rounded-xl bg-[#0a0e27]/50 border border-[#00d9ff]/10 hover:border-[#00d9ff]/30 transition-all pointer-events-none hover:shadow-[0_0_15px_rgba(0,217,255,0.1)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-[#00d9ff]/10 border border-[#00d9ff]/20">
                            <Icon className="w-5 h-5 text-[#00d9ff]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 rounded bg-[#00d9ff]/20 text-[#00d9ff]">
                                {activity.type === 'message' ? 'Message' : activity.type === 'link' ? 'Link' : 'Quiz'}
                              </span>
                              <h3 className="text-white font-semibold truncate">{activity.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full ${colors.bg} border ${colors.border}`}>
                            <span className={`text-sm font-semibold ${colors.text}`}>{activity.result}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-[#00d9ff]" />
                  Quiz History
                </h2>
                <div className="space-y-3 max-h-[20rem] overflow-y-auto pr-1 scrollbar-theme">
                  {quizAttempts.length > 0
                    ? quizAttempts.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-xl bg-[#0a0e27]/50 border border-[#00d9ff]/10 flex flex-wrap items-center justify-between gap-2"
                        >
                          <span className="text-white font-medium">
                            {a.score}/{a.total_questions} ({a.percentage}%)
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(a.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    : <p className="text-gray-400">No attempts yet</p>}
                </div>
              </div>

              <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#1a1f3a]/50 border border-[#00d9ff]/20">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-[#0a0e27]/50 border border-[#00d9ff]/10 hover:border-[#00d9ff]/30 transition-all text-left cursor-pointer"
                  >
                    <span className="text-white">Notifications</span>
                    <span className="text-gray-400 text-sm">Configure alerts</span>
                  </button>
                  <Link
                    to="/privacy"
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-[#0a0e27]/50 border border-[#00d9ff]/10 hover:border-[#00d9ff]/30 transition-all text-left cursor-pointer no-underline"
                  >
                    <span className="text-white">Privacy Settings</span>
                    <span className="text-gray-400 text-sm">Manage your data</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setSecurityOpen(true); setSecurityError(''); setSecuritySuccess(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-[#0a0e27]/50 border border-[#00d9ff]/10 hover:border-[#00d9ff]/30 transition-all text-left cursor-pointer"
                  >
                    <span className="text-white">Security</span>
                    <span className="text-gray-400 text-sm">Password & 2FA</span>
                  </button>
                </div>

                <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DialogContent className="bg-[#1a1f3a] border-[#00d9ff]/20 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Notifications</DialogTitle>
                      <DialogDescription className="sr-only">Configure email and quiz alerts.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="notif-high-risk" className="text-white cursor-pointer flex-1">
                          Email alerts for high-risk scans
                        </Label>
                        <Switch
                          id="notif-high-risk"
                          checked={notifEmailHighRisk}
                          onCheckedChange={(v) => { setNotifEmailHighRisk(v); setNotificationsPrefs({ emailHighRisk: v }); }}
                          className="data-[state=checked]:bg-[#00d9ff]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="notif-quiz" className="text-white cursor-pointer flex-1">
                          Quiz reminders
                        </Label>
                        <Switch
                          id="notif-quiz"
                          checked={notifQuizReminders}
                          onCheckedChange={(v) => { setNotifQuizReminders(v); setNotificationsPrefs({ quizReminders: v }); }}
                          className="data-[state=checked]:bg-[#00d9ff]"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={securityOpen} onOpenChange={(open) => { setSecurityOpen(open); if (!open) setSecurityError(''); }}>
                  <DialogContent className="bg-[#1a1f3a] border-[#00d9ff]/20 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">Security</DialogTitle>
                      <DialogDescription className="sr-only">Change your password.</DialogDescription>
                    </DialogHeader>
                    {securitySuccess ? (
                      <p className="text-[#00ff41] py-4">Password updated successfully.</p>
                    ) : (
                      <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                        {securityError && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
                            {securityError}
                          </div>
                        )}
                        <div>
                          <Label className="text-[#00d9ff] text-sm font-medium mb-1 block">Current password</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPw ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="bg-[#0a0e27] border-[#00d9ff]/30 text-white pr-10"
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw((v) => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-[#00d9ff]"
                              aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                            >
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[#00d9ff] text-sm font-medium mb-1 block">New password</Label>
                          <div className="relative">
                            <Input
                              type={showNewPw ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="At least 8 characters"
                              className="bg-[#0a0e27] border-[#00d9ff]/30 text-white pr-10"
                              autoComplete="new-password"
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw((v) => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-[#00d9ff]"
                              aria-label={showNewPw ? 'Hide password' : 'Show password'}
                            >
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[#00d9ff] text-sm font-medium mb-1 block">Confirm new password</Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPw ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat new password"
                              className="bg-[#0a0e27] border-[#00d9ff]/30 text-white pr-10"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPw((v) => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-[#00d9ff]"
                              aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={securityLoading}
                          className="w-full py-2 bg-[#00d9ff] text-[#0a0e27] rounded-lg font-semibold hover:bg-[#00d9ff]/90 disabled:opacity-50"
                        >
                          {securityLoading ? 'Updating…' : 'Change password'}
                        </button>
                        <p className="text-gray-400 text-xs">Two-factor authentication (2FA) coming soon.</p>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
