import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import HtcnxtLogo from './HtcnxtLogo';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('htccopilotusr');
  const [password, setPassword] = useState('htccopilotusr');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // Strict validation requirement: username: htccopilotusr, password: htccopilotusr
    if (trimmedUser === 'htccopilotusr' && trimmedPass === 'htccopilotusr') {
      setIsSubmitting(true);
      setTimeout(() => {
        onLogin();
      }, 300);
    } else {
      setErrorMessage('Access denied. Please enter the authorized username: htccopilotusr and password: htccopilotusr');
    }
  };

  const fillDefaultCredentials = () => {
    setUsername('htccopilotusr');
    setPassword('htccopilotusr');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/60 relative overflow-hidden flex items-center justify-center font-sans text-slate-800 p-4 sm:p-6">
      
      {/* Decorative Ambient Background Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[650px] h-[650px] bg-gradient-to-bl from-indigo-200/40 via-red-100/20 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[650px] h-[650px] bg-gradient-to-tr from-teal-100/40 via-indigo-100/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center space-y-3">
          <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-lg transition-all">
            <HtcnxtLogo theme="light" size="md" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                HTC <span className="text-[#EA251B]">COPILOT</span>
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-50 text-[#EA251B] border border-red-200">
                Enterprise AI
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-sm mx-auto leading-relaxed">
              Governance Consulting starter kit, strategic and design kit, and developer's technical readymade studio.
            </p>
          </div>
        </div>

        {/* Clean, Luminous Login Card */}
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your authorized enterprise credentials to continue.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Simple Username & Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-xs font-semibold"
                  placeholder="Enter username (htccopilotusr)"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-xs font-semibold"
                  placeholder="Enter password (htccopilotusr)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Access Info & Auto-Fill Pill */}
            <div className="pt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles size={13} className="text-indigo-600 shrink-0" />
                <span className="truncate">Login: <strong className="text-slate-700">htccopilotusr</strong></span>
              </div>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Login to HTC Copilot'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Security & Compliance Badges */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-indigo-600" />
              Role-Based Access
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Enterprise Security
            </span>
          </div>

        </div>

        {/* Global Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
          HTC Global Services • HTCNXT Enterprise AI Platform
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
