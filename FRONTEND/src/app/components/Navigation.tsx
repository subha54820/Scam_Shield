import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, MessageSquare, Link as LinkIcon, FileText, User, LogIn, LogOut, Menu } from 'lucide-react';
import { getStoredAuth, clearStoredAuth } from '@/app/api/auth';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!getStoredAuth();

  const authPages = ['/login', '/signup', '/recovery'];
  const isAuthPage = authPages.includes(location.pathname);

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/login', { replace: true });
  };

  if (isAuthPage) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/message-analyzer', label: 'Message Analyzer', icon: MessageSquare },
    { path: '/link-checker', label: 'Link Checker', icon: LinkIcon },
    { path: '/report', label: 'Report Scam', icon: FileText },
  ];

  const navLinkBase =
    'flex items-center gap-2 shrink-0 whitespace-nowrap px-3 py-2 rounded-lg transition-all text-sm font-medium';
  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${navLinkBase} ${
              isActive
                ? 'text-white bg-[#00d9ff]/15 border border-[#00d9ff]/30 shadow-[0_0_12px_rgba(0,217,255,0.25)]'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00d9ff]' : ''}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  const rainDrops = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i * 4.2) % 100}%`,
    duration: 1.2 + (i % 5) * 0.3,
    delay: (i * 0.15) % 2.5,
  }));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 flex items-center backdrop-blur-md bg-[#0a0e27]/95 border-b border-[#00d9ff]/20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {rainDrops.map((drop, i) => (
          <span
            key={i}
            className="rain-drop"
            style={{
              left: drop.left,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 w-full h-full flex items-center relative z-10">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 shrink-0 group -ml-1">
            <Shield className="w-8 h-8 sm:w-9 sm:h-9 text-[#00d9ff] drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
            <span className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
              Scam<span className="text-[#00d9ff]">Shield</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center flex-nowrap gap-3 xl:gap-4">
            <NavLinks />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <div className="hidden lg:flex items-center gap-2 -mr-2">
                  <Link
                    to="/profile"
                    className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all flex items-center gap-2 text-sm font-semibold"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="whitespace-nowrap px-3 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-white/5 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <button type="button" className="p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white" aria-label="Open menu">
                      <Menu className="w-6 h-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] bg-[#0a0e27] border-[#00d9ff]/20">
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <div className="flex flex-col gap-1 pt-8">
                      <NavLinks />
                      <Link
                        to="/profile"
                        className={`${navLinkBase} px-4 py-3 ${
                          location.pathname === '/profile'
                            ? 'text-white bg-[#00d9ff]/15 border border-[#00d9ff]/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <User className={`w-5 h-5 shrink-0 ${location.pathname === '/profile' ? 'text-[#00d9ff]' : ''}`} />
                        <span>Profile</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => { handleLogout(); document.body.click(); }}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white text-left w-full text-sm font-medium"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                <div className="hidden lg:flex items-center gap-2 -mr-2">
                  <Link to="/signup" className="whitespace-nowrap px-4 py-2 text-[#00d9ff] border border-[#00d9ff]/30 rounded-lg hover:bg-[#00d9ff]/10 transition-all text-sm font-medium">
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-[#00d9ff] to-[#00a3cc] text-[#0a0e27] rounded-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all flex items-center gap-2 text-sm font-semibold"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span>Login</span>
                  </Link>
                </div>
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <button type="button" className="p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white" aria-label="Open menu">
                      <Menu className="w-6 h-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] bg-[#0a0e27] border-[#00d9ff]/20">
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <div className="flex flex-col gap-1 pt-8">
                      <NavLinks />
                      <Link
                        to="/signup"
                        className={`${navLinkBase} px-4 py-3 ${
                          location.pathname === '/signup'
                            ? 'text-white bg-[#00d9ff]/15 border border-[#00d9ff]/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span>Sign Up</span>
                      </Link>
                      <Link
                        to="/login"
                        className={`${navLinkBase} px-4 py-3 ${
                          location.pathname === '/login'
                            ? 'text-white bg-[#00d9ff]/15 border border-[#00d9ff]/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <LogIn className={`w-5 h-5 shrink-0 ${location.pathname === '/login' ? 'text-[#00d9ff]' : ''}`} />
                        <span>Login</span>
                      </Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
