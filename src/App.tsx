import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import PromptBox from './components/PromptBox';
import SavedResponses from './components/SavedResponses';
import { Terminal, LogIn, UserPlus, Eye, EyeOff, ShieldAlert, Zap, Compass, Cpu } from 'lucide-react';

// Dedicated Admin Components & Layout
import AdminLayout from './admin/layouts/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminWorkspaces from './admin/pages/AdminWorkspaces';
import AdminAnalytics from './admin/pages/AdminAnalytics';
import AdminAiMonitoring from './admin/pages/AdminAiMonitoring';
import AdminAuditLogs from './admin/pages/AdminAuditLogs';
import AdminSettings from './admin/pages/AdminSettings';

// Brand System
import { BrandLogoFull, BrandLoader, usePageTitle, BRAND } from './brand';

export default function App() {
  const { 
    user, 
    isAuthenticating, 
    authError, 
    login, 
    register, 
    init, 
    clearAuthError,
    currentPath,
    navigateTo,
    setCurrentPath,
    isSidebarOpen,
    setSidebarOpen,
    isSavedResponsesOpen,
    setSavedResponsesOpen
  } = useStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Local validation states
  const [validationError, setValidationError] = useState<string | null>(null);

  // Dynamic page title based on current route
  usePageTitle(
    !user ? (isRegister ? '/register' : '/login') : currentPath
  );

  // Trigger initial auth session checks on mount
  useEffect(() => {
    init();
  }, [init]);

  // Handle mobile screens sidebar close behavior initially
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
      setSavedResponsesOpen(false);
    }
  }, [setSidebarOpen, setSavedResponsesOpen]);

  // Handle Popstate/Back browser sync
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPath]);

  // Automated Role Redirection: Redirect admins to /admin/dashboard,
  // and direct standard collaborators securely to standard user workspace
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        if (!window.location.pathname.startsWith('/admin')) {
          navigateTo('/admin/dashboard');
        }
      } else {
        if (window.location.pathname.startsWith('/admin')) {
          navigateTo('/');
        }
      }
    }
  }, [user, navigateTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearAuthError();

    if (!email || !password) {
      setValidationError('Please populate all login input fields.');
      return;
    }

    if (isRegister && !name) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must contain at least 6 characters.');
      return;
    }

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Verification routing failed. Try again.');
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setValidationError(null);
    clearAuthError();
  };

  // ─── Branded Loading Experience ──────────────────────────────────────
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
        {/* Atmospheric gradient background */}
        <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-650/15 blur-[120px] animate-synapse-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-600/10 blur-[120px] animate-synapse-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 flex flex-col items-center gap-6 animate-fadeIn">
          <BrandLoader />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 font-semibold animate-pulse">
              Initializing {BRAND.name}
            </p>
            <div className="w-32 h-0.5 rounded-full overflow-hidden bg-slate-800">
              <div className="h-full rounded-full animate-shimmer" style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee, #6366f1)', backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Login & Registration Portal ─────────────────────────────────────
  if (!user) {
    return (
      <main className="min-h-screen bg-[#020617] font-sans text-slate-300 flex flex-col md:flex-row relative overflow-hidden selection:bg-cyan-500/30 selection:text-white">
        
        {/* Abstract Cosmic Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/15 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[130px]" />

        {/* Left Side: Product Branding Pitch & Showcase */}
        <section className="flex-1 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 bg-slate-950/20 backdrop-blur-md relative z-10 select-none">
          <BrandLogoFull subtitle="Multi-Agent Sandbox" />

          <div className="space-y-6 my-12 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-sans tracking-tight leading-tight text-white font-medium">
              The Real-Time Cooperative <br />
              <span className="brand-gradient-text">AI Intelligence Portal</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Unlock multi-model simultaneous evaluations. Connect your workspace, stream side-by-side comparative diagnostics, edit prompt drafts collaboratively with teammates, and bookmark key insights instantly.
            </p>

            {/* Feature lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                <Cpu size={14} className="text-cyan-400" />
                <span>Simulated side-by-side matrices</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                <Zap size={14} className="text-amber-500 animate-pulse" />
                <span>Realtime Gemini streaming</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                <Compass size={14} className="text-emerald-400" />
                <span>Collaborative cursor tracking</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
                <Terminal size={14} className="text-purple-400" />
                <span>Persistent chat history logs</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500/70 border-t border-white/5 pt-4 flex justify-between">
            <span>PLATFORM: BUILD {BRAND.version}-STABLE</span>
            <span>SECURED SSL VIA JWT & BCRYPT</span>
          </div>
        </section>

        {/* Right Side: Authentication card form */}
        <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative animate-fadeIn">
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                {isRegister ? 'Create your platform account' : 'Sign in to SynapseAI'}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                {isRegister 
                  ? 'Join other system collaborators and access parallel streams.' 
                  : 'Welcome back! Enter credentials to launch the dashboard.'
                }
              </p>
            </div>

            {/* Verification & registration error box */}
            {(validationError || authError) && (
              <div className="bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-lg px-3 py-2.5 text-xs flex items-start gap-2 mb-5 animate-pulse">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <p>{validationError || authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label htmlFor="name-input" className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block font-mono">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block font-mono">Email Address</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password-input" className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block font-mono">Secret Password</label>
                </div>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-505 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs rounded-xl transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isRegister ? <UserPlus size={14} /> : <LogIn size={14} />}
                <span>{isRegister ? 'Register Account' : 'Authenticate Session'}</span>
              </button>
            </form>

            <div className="mt-6 border-t border-white/5 pt-5 text-center text-xs">
              <span className="text-slate-500">
                {isRegister ? 'Already registered on platform?' : 'First time running the system?'}
              </span>
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-cyan-400 hover:text-cyan-300 ml-1.5 font-semibold cursor-pointer underline underline-offset-2 transition-all"
              >
                {isRegister ? 'Verify Account instead' : 'Build a system profile'}
              </button>
            </div>

          </div>
        </section>

      </main>
    );
  }

  // Segment routes for Admin Dashboard specifically
  if (currentPath.startsWith('/admin')) {
    // Resolve nested subpages
    let AdminView = <AdminDashboard />;
    if (currentPath === '/admin/users') {
      AdminView = <AdminUsers />;
    } else if (currentPath === '/admin/workspaces') {
      AdminView = <AdminWorkspaces />;
    } else if (currentPath === '/admin/analytics') {
      AdminView = <AdminAnalytics />;
    } else if (currentPath === '/admin/ai-monitoring') {
      AdminView = <AdminAiMonitoring />;
    } else if (currentPath === '/admin/audit-logs') {
      AdminView = <AdminAuditLogs />;
    } else if (currentPath === '/admin/settings') {
      AdminView = <AdminSettings />;
    }

    return (
      <AdminLayout>
        {AdminView}
      </AdminLayout>
    );
  }

  // Render normal user workspace layout
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-300 flex select-none overflow-hidden h-screen relative">
      
      {/* Dynamic Mesh Background elements playing underneath */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[450px] h-[450px] bg-cyan-600/15 rounded-full blur-[100px]" />
      </div>

      {/* 1. Left Sidebar Navigation (Desktop: inline / Mobile: slide Drawer) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 lg:static z-[100] h-full transition-transform duration-300 transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 shrink-0
        `}
      >
        <Sidebar />
      </aside>

      {/* Sidebar mobile overlay backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[90] lg:hidden animate-fadeIn"
        />
      )}

      {/* 2. Middle Content chat matrices Feed container */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative border-r border-white/5 z-10 h-full">
        <Header />
        
        {/* Core parallel AI message rendering space */}
        <ChatArea />
        
        {/* Prompt Input bar at absolute footprint bottom */}
        <PromptBox />
      </main>

      {/* 3. Right Slide out Saved list dashboard (Desktop: inline / Mobile: slide Drawer) */}
      {isSavedResponsesOpen && (
        <>
          <aside 
            className={`
              fixed inset-y-0 right-0 lg:static z-[100] h-full transition-transform duration-300 transform
              ${isSavedResponsesOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              w-80 shrink-0
            `}
          >
            <SavedResponses />
          </aside>
          
          <div 
            onClick={() => setSavedResponsesOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[90] lg:hidden animate-fadeIn"
          />
        </>
      )}

    </div>
  );
}
