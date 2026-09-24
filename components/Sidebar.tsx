
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  BrainCircuit, 
  User, 
  X,
  LogOut,
  Calculator,
  Network,
  ArrowRightCircle,
  History,
  ShieldCheck,
  Settings,
  Table,
  FileText,
  Presentation,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Cpu,
  Printer,
  BookOpen,
  Command,
  Zap,
  Braces
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  userProfile?: UserProfile;
  onOpenProfile: () => void;
  handleSwitchTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  isMobileOpen, 
  setIsMobileOpen, 
  onLogout, 
  userProfile, 
  onOpenProfile,
  handleSwitchTab 
}) => {
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'strategy': true,
    'studio': true,
    'deliverables': true
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({...prev, [group]: !prev[group]}));
  };

  const navGroups = [
    {
      id: 'strategy',
      title: 'Strategy & Design',
      items: [
        { id: 'design-module', label: 'Solution Designer', icon: PenTool },
        { id: 'project-describer', label: 'Project Describer', icon: BookOpen },
        { id: 'adhoc-estimator', label: 'Smart Estimator', icon: Calculator },
      ]
    },
    {
      id: 'studio',
      title: 'Technical Studio',
      items: [
        { id: 'adhoc-architecture', label: 'Blueprint Studio', icon: Network },
        { id: 'data-modeler', label: 'Data Modeler', icon: Braces },
        { id: 'dq-module', label: 'Data Quality', icon: ShieldCheck },
        { id: 'adhoc-dataflow', label: 'Data Flow', icon: ArrowRightCircle },
      ]
    },
    {
      id: 'deliverables',
      title: 'Output Generation',
      items: [
        { id: 'doc-generator', label: 'Doc Generator', icon: FileText },
        { id: 'case-story', label: 'Case Story Deck', icon: Presentation },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-out border-r border-slate-800 flex flex-col shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 ring-1 ring-white/10">
               <BrainCircuit size={18} className="text-white" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-base text-white tracking-tight leading-none">HTC <span className="text-indigo-400">Copilot</span></span>
                 <span className="bg-indigo-500/20 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded border border-indigo-500/30 font-black uppercase tracking-tighter">BETA</span>
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Enterprise</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Scroll Area */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
          
          {/* Main Dashboard Link */}
          <div>
            <button
              onClick={() => { handleSwitchTab('dashboard'); setIsMobileOpen(false); }}
              className={`
                group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1
                ${activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
              `}
            >
              <LayoutDashboard size={18} className={`transition-transform group-hover:scale-110 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="text-sm">Command Center</span>
            </button>
          </div>

          {/* Groups */}
          {navGroups.map((group) => (
            <div key={group.id}>
              <button 
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors group mb-2"
              >
                <span>{group.title}</span>
                {expandedGroups[group.id] 
                  ? <ChevronDown size={12} className="text-slate-600 group-hover:text-slate-400 transition-transform" /> 
                  : <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-transform" />}
              </button>
              
              <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedGroups[group.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {group.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { handleSwitchTab(item.id); setIsMobileOpen(false); }}
                      className={`
                        group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium relative overflow-hidden
                        ${isActive 
                          ? 'bg-slate-800/80 text-white shadow-inner ring-1 ring-white/5' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                      `}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r-full"></div>}
                      <item.icon 
                        size={18} 
                        className={`transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer group mb-3" onClick={onOpenProfile}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 relative shrink-0">
                <User size={16} className="text-slate-300" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{userProfile?.name || 'Architect'}</div>
                <div className="text-[10px] text-slate-400 truncate">{userProfile?.role || 'Viewer'}</div>
              </div>
            </div>
            <Settings size={14} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
          </div>
          
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-50/10 rounded-lg transition-all"
          >
             <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
