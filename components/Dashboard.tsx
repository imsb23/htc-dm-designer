
import React from 'react';
import { 
  Layers, 
  ArrowUpRight, 
  Calculator, 
  Network, 
  Cpu, 
  Zap, 
  BookOpen, 
  PenTool, 
  Database, 
  ShieldCheck,
  FileCheck,
  Sparkles,
  Presentation,
  Braces
} from 'lucide-react';
import { RequestData } from '../types';

interface DashboardViewProps {
  requests: RequestData[];
  onSelectRequest: (req: RequestData) => void;
  onDeleteRequest: (id: string) => void;
  setActiveTab: (tab: string) => void;
  handleSwitchTab: (tab: string, mode?: string, data?: any) => void; 
}

const DashboardView: React.FC<DashboardViewProps> = ({ requests, handleSwitchTab }) => {
  const stats = {
      total: requests.length,
      completed: requests.filter(r => r.status === 'Completed').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
  };

  const ToolCard = ({ title, desc, icon: Icon, color, onClick }: any) => (
      <button 
        onClick={onClick}
        className="flat-card p-6 rounded-2xl text-left flex flex-col gap-4 h-full w-full"
      >
          <div className={`p-3 rounded-xl w-fit ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
              <Icon size={24} />
          </div>
          <div>
              <h4 className="font-bold text-slate-900 text-base mb-1.5 tracking-tight">{title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
          </div>
          <div className="mt-auto pt-4 flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Launch Agent <ArrowUpRight size={12} className="ml-1" />
          </div>
      </button>
  );

  return (
    <div className="h-full overflow-y-auto p-8 space-y-12 bg-[#f8fafc] custom-scrollbar">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">AI <span className="text-indigo-600">ACCELERATOR</span> Hub</h1>
              <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-indigo-200">BETA v0.9</span>
            </div>
            <p className="text-slate-500 font-medium text-sm">Enterprise Data Management Oversight & Intelligence.</p>
          </div>
          <div className="flex gap-8">
              <div className="text-center px-4">
                  <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Projects</div>
              </div>
              <div className="text-center px-4 border-x border-slate-200">
                  <div className="text-2xl font-black text-indigo-600">{stats.inProgress}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active</div>
              </div>
              <div className="text-center px-4">
                  <div className="text-2xl font-black text-emerald-600">{stats.completed}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Deployed</div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-12 bg-slate-900 rounded-[3rem] p-16 flex flex-col md:flex-row justify-between items-center gap-12 border border-slate-800 shadow-2xl relative overflow-hidden group">
              {/* Animated Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
              
              <div className="relative z-10 space-y-8 flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 shadow-inner">
                      <Sparkles size={12} className="text-indigo-400 animate-pulse" /> Unified Synthesis Engine
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                      The Architecture <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Core</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed font-medium italic">
                      A singular neural interface for end-to-end data lifecycle design. 
                      From HLD synthesis and technical specification to precision effort modeling 
                      and automated quality auditing—accelerated by expert intelligence.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-6 items-center">
                    {[
                      { label: 'Strategic Blueprinting', icon: PenTool },
                      { label: 'Precision Estimation', icon: Calculator },
                      { label: 'Quality Automation', icon: ShieldCheck },
                      { label: '1:1 Technical Spec', icon: FileCheck }
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{feat.label}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <div className="relative z-10 w-full md:w-1/3 flex justify-center opacity-40 transform group-hover:scale-110 transition-transform duration-700">
                  <div className="p-16 bg-gradient-to-tr from-indigo-600/20 to-transparent rounded-full border border-indigo-500/20 shadow-2xl">
                    <Cpu size={180} className="text-indigo-500" />
                  </div>
              </div>
          </div>
      </div>

      <div className="space-y-12 pb-20">
          {[
              { id: 'strategy', title: 'Strategic Planning', icon: Layers, items: [
                  { title: "Project Describer", desc: "Neural summarization of complex RFP logic and constraint identification.", icon: BookOpen, color: "text-teal-600", tab: "project-describer" },
                  { title: "Smart Estimator", desc: "Precision effort and cost modeling for complex data workstreams.", icon: Calculator, color: "text-blue-600", tab: "adhoc-estimator" },
                  { title: "Solution Designer", desc: "End-to-end HLD synthesis with industry best-practice research.", icon: PenTool, color: "text-indigo-600", tab: "design-module" }
              ]},
              { id: 'technical', title: 'Technical Execution', icon: Cpu, items: [
                  { title: "Blueprint Studio", desc: "Interactive canvas for system architecture and visual block synthesis.", icon: Network, color: "text-indigo-600", tab: "adhoc-architecture" },
                  { title: "Data Modeler", desc: "Synthesize target golden record schemas with global compliance scope.", icon: Braces, color: "text-violet-600", tab: "data-modeler" },
                  { title: "Case Story Deck", desc: "Synthesize project journeys into expert architectural presentations.", icon: Presentation, color: "text-rose-600", tab: "case-story" },
                  { title: "Data Quality", desc: "Neural dimension auditing and automated fix logic generation.", icon: ShieldCheck, color: "text-emerald-600", tab: "dq-module" },
                  { title: "Metadata Dictionary", desc: "Technical model browsing and lineage extraction from artifacts.", icon: Database, color: "text-blue-600", tab: "data-dictionary" },
                  { title: "Solution Doc Pro", desc: "High-precision spec synthesis with automatic legacy terminology mapping.", icon: FileCheck, color: "text-orange-600", tab: "solution-doc-pro" }
              ]}
          ].map((section) => (
              <section key={section.id} className="space-y-6">
                  <div className="flex items-center gap-3 px-2 border-l-4 border-indigo-500">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic">{section.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.items.map((item, idx) => (
                          <ToolCard 
                              key={idx}
                              title={item.title}
                              desc={item.desc}
                              icon={item.icon}
                              color={item.color}
                              onClick={() => handleSwitchTab(item.tab as any)}
                          />
                      ))}
                  </div>
              </section>
          ))}
      </div>
    </div>
  );
};

export default DashboardView;
