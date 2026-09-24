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
  Braces,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WorkspaceTab, UserProfile } from '../types';
import HtcnxtLogo from './HtcnxtLogo';

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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const getIconForType = (type: string) => {
    switch(type) {
        case 'design-module': return PenTool;
        case 'project-describer': return BookOpen;
        case 'adhoc-estimator': return Calculator;
        case 'policy-generator': return ShieldCheck;
        case 'glossary-generator': return BookOpen;
        case 'raci-generator': return Users;
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
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse
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
          title: "Governance Kit",
          items: [
            { id: 'policy-generator', title: 'Policy Generator', description: 'Enterprise compliance & governance policies.', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { id: 'glossary-generator', title: 'Business Glossary', description: 'Domain terms, definitions & regulations.', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
            { id: 'raci-generator', title: 'RACI Matrix', description: 'Governance & delivery accountability.', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' }
          ]
      },
      {
          title: "Strategy and Studio",
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

        <aside 
          className={`fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-slate-800 flex flex-col h-full transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative ${
            isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}`}
        >
            
            {/* Header: Logo & Collapse / Mobile Close Button */}
            <div className={`h-16 flex items-center shrink-0 border-b border-slate-900 transition-all ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
            }`}>
                {!isCollapsed ? (
                  <>
                    <div 
                        onClick={() => { onNavigateHome(); onCloseMobile(); }}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                        title="Return to Command Center"
                    >
                        <HtcnxtLogo variant="full" theme="dark" size="sm" />
                    </div>
                    <div className="flex items-center gap-1">
                      {onToggleCollapse && (
                        <button
                          onClick={onToggleCollapse}
                          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Collapse sidebar to maximize workspace view"
                        >
                          <PanelLeftClose size={17} />
                        </button>
                      )}
                      <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white p-1">
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={onToggleCollapse}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Expand sidebar (View full navigation)"
                    >
                      <PanelLeftOpen size={18} className="text-indigo-400" />
                    </button>
                  </div>
                )}
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 custom-scrollbar">
                
                {/* Command Center Button */}
                <div>
                    <button 
                        onClick={() => { onNavigateHome(); onCloseMobile(); }}
                        className={`w-full flex items-center rounded-xl transition-all font-bold ${
                          isCollapsed 
                            ? 'justify-center p-3' 
                            : 'gap-3 px-3 py-2.5 text-sm'
                        } ${activeTabId === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                        title={isCollapsed ? "Command Center (Dashboard)" : undefined}
                    >
                        <Home size={18} className="shrink-0" />
                        {!isCollapsed && <span className="truncate">Command Center</span>}
                    </button>
                </div>

                {/* New Workspace Button */}
                <div>
                    <button 
                        onClick={() => setIsNewProjectModalOpen(true)}
                        className={`w-full flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 transition-all font-black uppercase tracking-widest ${
                          isCollapsed ? 'p-3' : 'gap-2 px-3 py-2.5 text-xs'
                        }`}
                        title={isCollapsed ? "Initialize New Workspace" : undefined}
                    >
                        <Plus size={18} className="shrink-0 text-indigo-400" />
                        {!isCollapsed && <span>New Workspace</span>}
                    </button>
                </div>

                {/* Open Sessions List */}
                {openTabs.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                        {!isCollapsed ? (
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 flex items-center justify-between">
                            <span>Active Sessions</span>
                            <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {openTabs.length}
                            </span>
                          </div>
                        ) : (
                          <div className="w-6 h-px bg-slate-800 mx-auto my-2" />
                        )}

                        {openTabs.map((tab) => {
                            const Icon = getIconForType(tab.type);
                            const isActive = activeTabId === tab.id;

                            if (isCollapsed) {
                              return (
                                <div key={tab.id} className="relative group flex justify-center">
                                  <button
                                    onClick={() => { onActivateTab(tab.id); onCloseMobile(); }}
                                    className={`p-3 rounded-xl transition-all relative flex items-center justify-center ${
                                      isActive 
                                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40' 
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                    }`}
                                    title={tab.label}
                                  >
                                    <Icon size={17} />
                                    {isActive && (
                                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
                                    )}
                                  </button>
                                </div>
                              );
                            }

                            return (
                                <div 
                                    key={tab.id}
                                    onClick={() => { onActivateTab(tab.id); onCloseMobile(); }}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-bold ${
                                      isActive 
                                        ? 'bg-slate-900 text-white border-l-4 border-indigo-500 shadow-sm' 
                                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                                    }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-indigo-400 shrink-0' : 'text-slate-500 shrink-0'} />
                                    <span className="flex-1 truncate tracking-tight">{tab.label}</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }} 
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                                      title="Close tab"
                                    >
                                      <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Footer: User Profile & Sign Out */}
            <div className={`border-t border-slate-900 bg-slate-950 transition-all ${
              isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-2'
            }`}>
                <div 
                  className={`flex items-center rounded-xl hover:bg-white/5 cursor-pointer group transition-all ${
                    isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
                  }`} 
                  onClick={() => { onOpenProfile(); onCloseMobile(); }}
                  title={isCollapsed ? `Profile: ${userProfile?.name || 'Architect'}` : undefined}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 relative shrink-0">
                            <User size={15} className="text-slate-400" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                        </div>
                        {!isCollapsed && (
                          <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate tracking-tight">{userProfile?.name || 'Architect'}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Senior Associate</div>
                          </div>
                        )}
                    </div>
                    {!isCollapsed && (
                      <Settings size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    )}
                </div>

                {isCollapsed ? (
                  <button 
                    onClick={onLogout} 
                    className="w-full p-2.5 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer"
                    title="Sign Out of HTC Copilot"
                  >
                    <LogOut size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={onLogout} 
                    className="w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors uppercase tracking-[0.2em] rounded-xl cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                )}
            </div>
        </aside>

        {/* Modal: Initialize New Workspace */}
        {isNewProjectModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 animate-fade-in backdrop-blur-md">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-2.5">
                          <HtcnxtLogo theme="light" size="sm" />
                          <div className="h-4 w-px bg-slate-200"></div>
                          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Initialize Workspace</h2>
                        </div>
                        <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100">
                          <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar">
                        {moduleGroups.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-3">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {group.items.map((module) => (
                                        <div 
                                            key={module.id}
                                            onClick={() => setSelectedModule(module.id)}
                                            className={`flex items-start gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                                              selectedModule === module.id 
                                                ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20' 
                                                : 'border-slate-100 hover:border-slate-300 bg-white hover:shadow-xs'
                                            }`}
                                        >
                                            <div className={`p-2.5 rounded-xl shrink-0 ${module.bg} ${module.color}`}>
                                              <module.icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-xs text-slate-900 truncate">{module.title}</h4>
                                                <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{module.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                          Select an accelerator module to launch a session.
                        </span>
                        <button
                            onClick={handleContinue}
                            disabled={!selectedModule}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                              selectedModule 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 cursor-pointer' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            Open Session <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default TaskSidebar;
