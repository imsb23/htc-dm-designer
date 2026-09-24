import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Download, List, Network, Target, Map, Calculator, ClipboardList, Paperclip, 
  ArrowLeft, Sparkles, BrainCircuit, Rocket, AlertTriangle, CheckCircle, 
  Clock, Loader, FileUp, Zap, Boxes, DatabaseZap, X, Info
} from 'lucide-react';
import { 
    RequestData, DesignData, Question, Requirement, DesignCache, 
    CachedRequestData, InitiationItem, EstimationInputs, ProjectStats, RoadmapPhase 
} from '../types';
import ArchitectureCanvas from './ArchitectureCanvas';
import AiAssistant from './AiAssistant';
import StandaloneEstimator from './StandaloneEstimator';
import { 
  generateArchitectureDesign, 
  generateIntelligentQuestionnaire, 
  generateProjectRequirements, 
  generateProjectStatistics, 
  generateFutureRoadmap, 
  generateEstimation,
  analyzeAndLearn,
  aggregateFileContext
} from '../services/geminiService';

const BLUEPRINT_PATTERNS = [
    { id: 'LANDSCAPE', label: 'Landscape', desc: 'System context' },
    { id: 'FLOW', label: 'Data Flow', desc: 'Pipeline logic' },
    { id: 'ERD', label: 'ER Modeler', desc: 'Database schema' }
];

const SolutionDesignView: React.FC<{ 
    request: RequestData | null, 
    designCache: DesignCache, 
    onUpdateDesignCache: any, 
    onUpdateRequestStatus?: any, 
    onDeleteRequest?: any, 
    onBack?: () => void 
}> = ({ request, designCache, onUpdateDesignCache, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'architect_flow' | 'requirements' | 'roadmap' | 'estimator' | 'scoping' | 'attachments'>('overview');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'review' | 'accepted'>('idle');
  const [activePattern, setActivePattern] = useState('LANDSCAPE');
  const [currentDesign, setCurrentDesign] = useState<DesignData>({ nodes: [], edges: [] });
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [estimationInputs, setEstimationInputs] = useState<EstimationInputs>({});
  const [prompt, setPrompt] = useState('');
  
  // Precision Synthesis State
  const [supplementalFiles, setSupplementalFiles] = useState<File[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (request && !designCache[request.id]) handleGenerate();
    else if (request) {
        const c = designCache[request.id];
        setCurrentDesign(c.design || { nodes: [], edges: [] }); 
        setProjectStats(c.projectStats || null); 
        setRoadmap(Array.isArray(c.roadmap) ? c.roadmap : []); 
        setStatus(c.status);
    }
  }, [request?.id]);

  const handleGenerate = async (pOverride: string | null = null, refText: string | null = null, extraFiles: File[] = []) => {
    if (!request) return; 
    setStatus('thinking');
    if (extraFiles.length > 0) setIsSynthesizing(true);
    
    const pat = pOverride || activePattern; 
    if (pOverride) setActivePattern(pOverride);
    
    try {
      let fileContext = "";
      if (extraFiles.length > 0) {
          fileContext = await aggregateFileContext(extraFiles);
      }
      
      const ctx = `${request.requirementsPrompt || ''} ${refText || ''} ${fileContext}`;
      
      const res = await generateArchitectureDesign(ctx, pat); 
      const design: DesignData = (res as any)?.design || res || { nodes: [], edges: [] };
      setCurrentDesign(design);
      
      const stats = await generateProjectStatistics(ctx); 
      setProjectStats(stats);
      
      generateFutureRoadmap(ctx).then(resRoadmap => {
        setRoadmap(Array.isArray(resRoadmap) ? resRoadmap : []);
      });
      generateEstimation(ctx, request.type).then(setEstimationInputs);
      
      // Update local cache
      onUpdateDesignCache(request.id, {
          design,
          projectStats: stats,
          roadmap,
          status: 'review'
      });
      
      setStatus('review');
    } catch (e) { 
      console.error("Generation error:", e);
      setStatus('idle'); 
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          setSupplementalFiles(prev => [...prev, ...files]);
      }
  };

  const removeSupplementalFile = (index: number) => {
      setSupplementalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nav = [
      { id: 'overview', label: 'Strategy', icon: Target },
      { id: 'architect_flow', label: 'Architect Flow', icon: Network },
      { id: 'estimator', label: 'Estimator', icon: Calculator },
      { id: 'roadmap', label: 'Roadmap', icon: Map },
      { id: 'requirements', label: 'Details', icon: List }
  ];

  return (
    <div className="flex flex-col h-full bg-white relative animate-fade-in">
      <AiAssistant context={request?.requirementsPrompt || ''} />
      
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
                onClick={onBack} 
                className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
            >
                <ArrowLeft size={22} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight leading-none">{request?.clientName}</h2>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2">{request?.type} • ARCHITECTURE SESSION</p>
          </div>
        </div>
        <button 
            onClick={() => handleGenerate()} 
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-900/10 active:scale-95 transition-all flex items-center gap-2"
        >
            <Sparkles size={14}/> Re-Synthesize
        </button>
      </div>

      {/* Sub Tab Navigation */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 shrink-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {nav.map(t => (
            <button 
                key={t.id} 
                onClick={() => setActiveSubTab(t.id as any)} 
                className={`flex items-center gap-2 px-6 py-4 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === t.id ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeSubTab === 'architect_flow' && (
          <div className="h-full flex overflow-hidden bg-[#FAFAFA]">
            
            {/* Left Sidebar for Precision Synthesis (If RFP detected) */}
            {(request?.rfpFiles && request.rfpFiles.length > 0) && (
              <div className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col shrink-0 animate-fade-in overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <DatabaseZap size={18} />
                        <h3 className="text-sm font-black uppercase tracking-tight">Precision Synthesis</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                        I've analyzed the baseline RFP. Upload technical specs or low-level requirements to refine the flow logic.
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all bg-white group shadow-sm">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-2 text-slate-300 group-hover:text-indigo-500" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Supplement Logic</p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                        />
                    </label>

                    {supplementalFiles.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Context Queue</h4>
                            {supplementalFiles.map((file, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 group">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Paperclip size={10} className="text-indigo-400 shrink-0"/>
                                        <span className="text-[10px] font-bold text-slate-600 truncate">{file.name}</span>
                                    </div>
                                    <button onClick={() => removeSupplementalFile(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <X size={12}/>
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleGenerate(null, null, supplementalFiles)}
                                disabled={isSynthesizing}
                                className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                {isSynthesizing ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                                Synthesize Precision
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-10 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex gap-2 items-center mb-2">
                        <Info size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wide">Pro Tip</span>
                    </div>
                    <p className="text-[10px] text-indigo-600/80 leading-relaxed font-medium italic">
                        Upload Data Dictionary (Excel) or Source/Target DDL to auto-generate field-level mapping flows in the diagram.
                    </p>
                </div>
              </div>
            )}

            <div className="flex-1 relative h-full">
              <div className="absolute top-6 right-6 z-20 bg-white border border-slate-200 p-1.5 rounded-xl shadow-lg flex flex-col gap-1">
                  {BLUEPRINT_PATTERNS.map(p => (
                      <button 
                          key={p.id} 
                          onClick={() => handleGenerate(p.id)} 
                          className={`px-4 py-2 rounded-lg text-left transition-all ${activePattern === p.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-500'}`}
                      >
                          <div className="text-[10px] font-black uppercase italic leading-none">{p.label}</div>
                          <div className={`text-[8px] font-bold mt-1 ${activePattern === p.id ? 'text-indigo-200' : 'text-slate-400'}`}>{p.desc}</div>
                      </button>
                  ))}
              </div>
              <div className="flex-1 h-full">
                <ArchitectureCanvas 
                    aiNodes={currentDesign.nodes} 
                    aiEdges={currentDesign.edges} 
                    isThinking={status === 'thinking'} 
                    thoughts={[]} 
                    onDesignChange={setCurrentDesign} 
                />
              </div>
              
              {/* Bottom Refinement Prompt */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-30">
                  <div className="bg-white shadow-2xl rounded-2xl border border-slate-200 p-2 flex items-center gap-3 ring-1 ring-black/5">
                      <div className="p-4 bg-indigo-600 text-white rounded-xl shadow-lg">
                        {status === 'thinking' ? <Loader size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Refine flow via neural prompt..." 
                        className="flex-1 bg-transparent outline-none text-sm py-2 px-2 text-slate-800 font-bold placeholder:text-slate-300" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate(null, prompt)} 
                      />
                      <button 
                        onClick={() => handleGenerate(null, prompt)} 
                        disabled={!prompt.trim() || status === 'thinking'} 
                        className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Execute
                      </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'overview' && (
          <div className="h-full overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">
               {projectStats ? (
                  <>
                     <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 relative group overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic flex items-center gap-3">
                                <Rocket className="text-indigo-600" size={24}/> Strategic Logic
                            </h3>
                            <p className="text-slate-600 text-base leading-relaxed font-medium">{projectStats.executiveSummary}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">Confidence Engine</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-700">Success Factor</span>
                                <span className="text-2xl font-black text-emerald-600 italic">{projectStats.successProbability}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-emerald-500" style={{ width: `${projectStats.successProbability}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">Primary Risks</h4>
                            <div className="space-y-3">
                                {projectStats.keyRisks.map((risk, i) => (
                                    <div key={i} className="flex gap-3 items-start text-sm font-medium text-slate-600 italic">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"/>
                                        {risk}
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                  </>
               ) : (
                  <div className="flex flex-col items-center justify-center py-40 opacity-30 italic">
                    <Loader size={48} className="animate-spin mb-4 text-indigo-500" />
                    <p className="font-black uppercase tracking-widest text-xs">Computing Intelligence...</p>
                  </div>
               )}
            </div>
          </div>
        )}

        {activeSubTab === 'estimator' && (
            <StandaloneEstimator 
                embedded={true} 
                initialContext={request?.requirementsPrompt} 
                initialInputs={estimationInputs} 
            />
        )}

        {activeSubTab === 'roadmap' && (
            <div className="h-full overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12 pb-20">
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Delivery Roadmap</h3>
                    <div className="space-y-6">
                        {roadmap.map((phase, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group overflow-hidden">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                                    <div>
                                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest italic">Phase 0{idx + 1}</span>
                                        <h4 className="text-xl font-black text-slate-800 uppercase italic mt-2">{phase.phase}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Clock size={14}/> {phase.duration}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {phase.deliverables.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-700 uppercase italic">
                                            <CheckCircle size={14} className="text-emerald-500"/> {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        
        {!['overview', 'architect_flow', 'estimator', 'roadmap'].includes(activeSubTab) && (
            <div className="h-full flex items-center justify-center text-slate-300 italic">
                <p className="text-sm font-black uppercase tracking-widest opacity-20">Module Refining...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SolutionDesignView;
