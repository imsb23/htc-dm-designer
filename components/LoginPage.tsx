
import React, { useState } from 'react';
import { BrainCircuit, ArrowRight, Mail, Lock, CheckCircle, Chrome, Command, Info } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center font-sans text-slate-100 p-4">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        
        {/* Brand Header (Centered) */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-900/50 mb-6 ring-1 ring-white/10 relative">
                <BrainCircuit size={32} className="text-white" />
                <div className="absolute -top-2 -right-6 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-400 uppercase tracking-widest shadow-lg">BETA</div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase italic">DataArch<span className="text-indigo-400">AI</span></h1>
            <p className="text-slate-400 text-sm font-medium italic">The intelligent workspace for solution architects.</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 space-y-6">
            
            {/* Primary Actions */}
            {!isEmailMode ? (
                <div className="space-y-4">
                    <button 
                        onClick={() => handleLogin()}
                        className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group"
                    >
                        <Chrome size={20} className="text-slate-900"/>
                        <span>Continue with Google</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 text-slate-400"/>
                    </button>

                    <button 
                        onClick={() => handleLogin()}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                    >
                        <Command size={20} className="text-slate-300"/>
                        <span>Continue with SSO</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-medium uppercase tracking-wider">Or</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button 
                        onClick={() => setIsEmailMode(true)}
                        className="w-full bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium py-3.5 px-4 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Mail size={18} /> Continue with Email
                    </button>
                </div>
            ) : (
                <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                                    placeholder="architect@company.com"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                <input 
                                    type="password" 
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        Sign In <ArrowRight size={18} />
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => setIsEmailMode(false)}
                        className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        &larr; Back to all options
                    </button>
                </form>
            )}

            {/* Beta Disclaimer */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-3">
                <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-300 font-medium leading-relaxed italic uppercase tracking-wider">
                    Beta Access: You are accessing a preview version. AI generation features and cross-module sync are in active development.
                </p>
            </div>
        </div>

        {/* Footer Trust Indicators */}
        <div className="mt-8 flex justify-center gap-6 text-slate-500">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={14} className="text-emerald-500"/> Enterprise Ready
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={14} className="text-emerald-500"/> SOC2 Compliant
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
