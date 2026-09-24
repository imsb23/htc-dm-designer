
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Layers, 
  Calculator, 
  Network, 
  PenTool, 
  BrainCircuit, 
  Sparkles,
  Search,
  Zap,
  CheckCircle,
  RefreshCw,
  BookOpen,
  Cpu,
  Info,
  ShieldAlert
} from 'lucide-react';
import { generateDynamicUserGuide } from '../services/geminiService';
import { GuideSection } from '../types';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENT_APP_FEATURES = `
1. Cross-Module AI Learning (Global Context Sync): The platform's central intelligence hub tracks all architectural decisions, design patterns, and technical preferences. Decisions made in the Solution Designer are automatically referenced when generating documents or estimates in other modules.

2. Solution Designer (Design Hub): This core module automates High-Level Design (HLD) synthesis. It accepts multi-modal inputs (RFPs, images, notes) and leverages Gemini 3 Pro Thinking to research external best practices and whitepapers, producing high-precision blueprints, detailed requirements, and scoping logic tailored to specific target audiences.

3. Project Describer (RFP Intelligence): A deep analysis tool that parses massive RFP/technical specification documents. It identifies executive objectives, technical constraints, implied requirements, and automatically suggests an optimized technology stack based on extracted logic.

4. Smart Estimator (Effort Modeling): A precision calculator for data implementation projects. It derives workload complexity weights across Master Data Management (MDM), Data Integration (DI), Data Quality (DQ), and Data Governance (DG). It automatically generates market-standard staffing plans and phased delivery roadmaps.

5. Blueprint Studio (Architectural Canvas): An advanced diagramming workspace. Users can freehand system flows or use AI Block Synthesis to transform technical descriptions into visual architecture. It supports Mermaid.js for logic-first representation and style-aware visual generation.

6. Metadata Dictionary (Model Browser): Automates the extraction of logical and physical data models from SQL DDL or Excel specifications. It provides an interactive browser for technical attributes, datatypes, and source lineage.

7. Data Quality (Audit Engine): A neural auditing tool that applies the 6-dimension DQ schema (Accuracy, Completeness, etc.) to data structures. It generates automated remediation logic and fix-scripts while identifying sensitive data exposures (PII/SPDI).

8. Solution Doc Pro (Spec Generator): An expert technical specification writer. It normalizes legacy terminology (e.g., mapping IICS to IDMC) and synthesizes comprehensive project documentation including logical models, governance strategies, and artifact registries.

9. Case Story Deck (Presentation Builder): Transforms technical project journeys into high-impact executive slide decks. It synthesizes challenges, solutions, and ROI metrics into a visual narrative for presentations.
`;

const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [learningStep, setLearningStep] = useState(0); 
  const [guideData, setGuideData] = useState<GuideSection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
        const cached = localStorage.getItem('ai_user_guide_beta_v1');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setGuideData(parsed);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Corrupted cache for user guide", e);
            }
        }
        refreshGuide();
    }
  }, [isOpen]);

  const refreshGuide = async () => {
      setLoading(true);
      setLearningStep(1);
      setTimeout(() => setLearningStep(2), 1500); 
      setTimeout(() => setLearningStep(3), 3000); 

      try {
          const sections = await generateDynamicUserGuide(CURRENT_APP_FEATURES);
          const validatedSections = Array.isArray(sections) ? sections : [];
          setGuideData(validatedSections);
          localStorage.setItem('ai_user_guide_beta_v1', JSON.stringify(validatedSections));
      } catch (e) {
          console.error("Failed to generate guide", e);
          setGuideData([]);
      } finally {
          setLoading(false);
          setLearningStep(0);
      }
  };

  const filteredGuide = useMemo(() => {
      const data = Array.isArray(guideData) ? guideData : [];
      return data.filter(section => {
          const title = section?.title || '';
          const desc = section?.description || '';
          const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                desc.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = activeCategory === 'All' || section.category === activeCategory;
          return matchesSearch && matchesCategory;
      });
  }, [guideData, searchTerm, activeCategory]);

  if (!isOpen) return null;

  const categories = ['All', 'Strategy', 'Technical', 'Intelligence'];

  const getIconForSection = (title: string) => {
      const t = (title || '').toLowerCase();
      if (t.includes('design')) return PenTool;
      if (t.includes('describer')) return BookOpen;
      if (t.includes('estimat')) return Calculator;
      if (t.includes('arch') || t.includes('flow')) return Network;
      if (t.includes('learn') || t.includes('intelligence')) return Cpu;
      if (t.includes('quality') || t.includes('audit')) return ShieldAlert;
      return Layers;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative border border-slate-700/50">
        
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={200} /></div>
           <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 flex justify-between items-start">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase backdrop-blur-md">
                        <Sparkles size={12} /> Global Intelligence Active
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        Beta Version v0.9.1
                    </div>
                 </div>
                 <h2 className="text-3xl font-black mb-2 tracking-tighter italic uppercase">Platform Capability Registry</h2>
                 <p className="text-indigo-200 text-sm max-w-lg font-medium italic">Detailed breakdown of how DataArch AI synchronizes technical logic across the architecture lifecycle.</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={refreshGuide} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-indigo-200 hover:text-white" title="Sync Knowledge Base">
                     <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white">
                     <X size={20} />
                  </button>
              </div>
           </div>

           <div className="mt-8 flex flex-col md:flex-row gap-4 relative z-10">
               <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Search capabilities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold" />
               </div>
               <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                   {categories.map(cat => (
                       <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}>
                           {cat}
                       </button>
                   ))}
               </div>
           </div>
        </div>

        {/* Beta Notice Banner */}
        <div className="bg-indigo-50 px-8 py-3 flex items-center gap-3 border-b border-indigo-100">
            <Info size={16} className="text-indigo-600 shrink-0" />
            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                Development Preview: Features labeled with <Sparkles size={10} className="inline mx-0.5" /> utilize Gemini 3 Pro Research capabilities which are currently in early access.
            </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center"><BrainCircuit size={32} className="text-indigo-600 animate-pulse"/></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800">Synchronizing Global Learning...</h3>
                        <p className="text-slate-400 text-sm mt-2 font-medium italic">Building quick-reference documentation from active modules.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {filteredGuide.map((section, idx) => {
                        const Icon = getIconForSection(section.title);
                        return (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-2xl hover:border-indigo-400 transition-all group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Icon size={120} /></div>
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm"><Icon size={28} /></div>
                                        <span className="text-[10px] uppercase font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 tracking-widest">{section.category}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight uppercase italic">{section.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium italic">{section.description}</p>
                                    
                                    <div className="space-y-4 mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Core Capabilities</p>
                                        {Array.isArray(section.features) && section.features.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-3 text-xs text-slate-700 font-bold group-hover:text-slate-900">
                                                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" /> 
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-auto bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex gap-4 items-start ring-1 ring-indigo-50">
                                        <Zap size={20} className="text-amber-500 mt-1 shrink-0" />
                                        <div>
                                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Architecture Habit</div>
                                            <p className="text-xs text-indigo-900 font-black italic leading-relaxed">"{section.bestPractice}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
