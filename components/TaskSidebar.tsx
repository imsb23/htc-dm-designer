
import React, { useState } from 'react';
import { 
  X, 
  Home, 
  PenTool, 
  BookOpen, 
  Calculator, 
  Network, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  User, 
  Plus, 
  ArrowRight,
  Database,
  ShieldCheck,
  FileCheck,
  Presentation,
  Braces
} from 'lucide-react';
import { WorkspaceTab, UserProfile } from '../types';

interface TaskSidebarProps {
  activeTabId: string;
  openTabs: WorkspaceTab[];
  onActivateTab: (tabId: string) => void;
  onCreateTab: (moduleType: string, mode?: string) => void;
  onCloseTab: (tabId: string) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  userProfile?: UserProfile;
  onOpenProfile: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const getIconForType = (type: string) => {
    switch(type) {
        case 'design-module': return PenTool;
        case 'project-describer': return BookOpen;
        case 'adhoc-estimator': return Calculator;
        case 'adhoc-architecture': return Network;
        case 'data-modeler': return Braces;
        case 'data-dictionary': return Database;
        case 'dq-module': return ShieldCheck;
        case 'solution-doc-pro': return FileCheck;
        case 'case-story': return Presentation;
        default: return BrainCircuit;
    }
};

const TaskSidebar: React.FC<TaskSidebarProps> = ({ 
  activeTabId, 
  openTabs, 
  onActivateTab,
  onCreateTab,
  onCloseTab, 
  onNavigateHome,
  onLogout,
  userProfile,
  onOpenProfile,
  isMobileOpen,
  onCloseMobile
}) => {
  
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleContinue = () => {
      if (selectedModule) {
          onCreateTab(selectedModule, 'create');
          setIsNewProjectModalOpen(false);
          setSelectedModule(null);
          onCloseMobile();
      }
  };

  const moduleGroups = [
      {
          title: "Strategy & Design",
          items: [
            { id: 'project-describer', title: 'Project Describer', description: 'Summarize RFP documents.', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
            { id: 'adhoc-estimator', title: 'Smart Estimator', description: 'Effort and cost calculation.', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'design-module', title: 'Solution Designer', description: 'Blueprint architecture with AI.', icon: PenTool, color: 'text-indigo-600', bg: 'bg-indigo-50' }
          ]
      },
      {
          title: "Technical Studio",
          items: [
            { id: 'adhoc-architecture', title: 'Blueprint Studio', description: 'Freehand system mapping.', icon: Network, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { id: 'data-modeler', title: 'Data Modeler', description: 'Domain specific schema synthesis.', icon: Braces, color: 'text-violet-600', bg: 'bg-violet-50' },
            { id: 'case-story', title: 'Case Story Deck', description: 'Synthesize case studies into presentations.', icon: Presentation, color: 'text-rose-600', bg: 'bg-rose-50' },
            { id: 'dq-module', title: 'Data Quality', description: 'Neural dimension rules and debugging.', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: 'data-dictionary', title: 'Metadata Dictionary', description: 'Extract and browse data models.', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'solution-doc-pro', title: 'Solution Document Pro', description: 'Expert technical spec synthesis.', icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-50' }
          ]
      }
  ];
  
  return (
    <>
        {isMobileOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={onCloseMobile} />}

        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full transition-transform duration-200 lg:translate-x-0 lg:relative ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            <div className="h-16 flex items-center px-6 shrink-0 justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
                        <BrainCircuit size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">DataArch<span className="text-indigo-400">AI</span></span>
                </div>
                <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                <div className="px-2">
                    <button 
                        onClick={() => { onNavigateHome(); onCloseMobile(); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold ${activeTabId === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                    >
                        <Home size={18} /> Command Center
                    </button>
                </div>

                <div className="px-2">
                    <button 
                        onClick={() => setIsNewProjectModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <Plus size={16} /> New Workspace
                    </button>
                </div>

                {openTabs.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-5 mb-2">Sessions</div>
                        {openTabs.map((tab) => {
                            const Icon = getIconForType(tab.type);
                            const isActive = activeTabId === tab.id;
                            return (
                                <div 
                                    key={tab.id}
                                    onClick={() => { onActivateTab(tab.id); onCloseMobile(); }}
                                    className={`group flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-bold ${isActive ? 'bg-slate-900 text-white border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}`}
                                >
                                    <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                                    <span className="flex-1 truncate tracking-tight">{tab.label}</span>
                                    <button onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400"><X size={12} /></button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-900">
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group mb-2" onClick={() => { onOpenProfile(); onCloseMobile(); }}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 relative shrink-0">
                            <User size={16} className="text-slate-400" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate tracking-tight">{userProfile?.name || 'Architect'}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Senior Associate</div>
                        </div>
                    </div>
                    <Settings size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <button onClick={onLogout} className="w-full py-2.5 text-[9px] font-black text-slate-600 hover:text-rose-500 transition-colors uppercase tracking-[0.2em] border border-transparent hover:border-rose-900/20 rounded-xl">Sign Out</button>
            </div>
        </div>

        {isNewProjectModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Initialize Workspace</h2>
                        <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
                    </div>

                    <div className="p-8 overflow-y-auto space-y-8">
                        {moduleGroups.map((group, gIdx) => (
                            <div key={gIdx}>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{group.title}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {group.items.map((module) => (
                                        <div 
                                            key={module.id}
                                            onClick={() => setSelectedModule(module.id)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedModule === module.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                        >
                                            <div className={`p-2.5 rounded-lg shrink-0 ${module.bg} ${module.color}`}><module.icon size={20} /></div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-slate-900">{module.title}</h4>
                                                <p className="text-[11px] text-slate-500 leading-tight mt-1">{module.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button
                            onClick={handleContinue}
                            disabled={!selectedModule}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedModule ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            Open Session <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default TaskSidebar;
