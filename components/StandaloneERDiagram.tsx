
import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, Sparkles, Loader, UploadCloud, History, HelpCircle, X, AlertTriangle, Trash2, FileText, Share2, ImageIcon, FileCode, BrainCircuit, Code, Database, MessageSquare, ArrowLeft, Home, Zap
} from 'lucide-react';
import ArchitectureCanvas from './ArchitectureCanvas';
import { generateERD, analyzeAndLearn, saveHistory, getHistory, deleteHistory, aggregateFileContext } from '../services/geminiService';
import { DesignData, ArchitectureCanvasHandle } from '../types';

const StandaloneERDiagram: React.FC = () => {
  const [viewMode, setViewMode] = useState<'input' | 'canvas'>('input');
  const [prompt, setPrompt] = useState('');
  const [design, setDesign] = useState<DesignData>({ nodes: [], edges: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<ArchitectureCanvasHandle>(null);

  useEffect(() => {
    setHistoryItems(getHistory('ERDiagram'));
  }, [design]);

  const handleGenerate = async (overridePrompt?: string) => {
    const input = overridePrompt || prompt;
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const fileContext = uploadedFiles.length > 0 ? await aggregateFileContext(uploadedFiles) : "";
      const fullPrompt = `${input}\n\n${fileContext}`;
      const result = await generateERD(fullPrompt, "ERD");
      if (result && result.nodes.length > 0) {
        setDesign(result);
        setViewMode('canvas');
        saveHistory('ERDiagram', input.substring(0, 40) + '...', result, uploadedFiles.map(f => f.name));
      } else { setError("Could not extract entity relationships. Please provide more structure or SQL."); }
    } catch (e) { setError("Generation engine error. Please retry."); } finally { setIsGenerating(false); }
  };

  const loadHistoryItem = (item: any) => {
      setDesign(item.data);
      setViewMode('canvas');
  };

  if (viewMode === 'input') {
      return (
        <div className="h-full bg-[#F8FAFC] flex flex-col items-center justify-center p-8 animate-fade-in overflow-y-auto">
            <div className="max-w-3xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Table size={160} className="text-indigo-600"/></div>
                
                <div className="relative z-10 text-center space-y-4 mb-10">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm ring-1 ring-indigo-100">
                        <Table size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">ER Modeler</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">Transform SQL DDL, documents, or logic descriptions into high-fidelity entity diagrams.</p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirement Logic / SQL</label>
                        <textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                            className="w-full h-48 p-6 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-mono text-sm leading-relaxed bg-slate-50/50 transition-all resize-none shadow-inner" 
                            placeholder="e.g. CREATE TABLE Users (id PK, email FK...); OR 'I need a schema for an e-commerce site with orders and products...'"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all bg-white group">
                            <UploadCloud size={32} className="text-slate-300 mb-1 group-hover:text-indigo-500 transition-colors"/>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Attach Spec Documents</span>
                            <input type="file" multiple className="hidden" onChange={e => e.target.files && setUploadedFiles(Array.from(e.target.files))} />
                        </label>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 overflow-y-auto max-h-32">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Queue ({uploadedFiles.length})</h4>
                            {uploadedFiles.length > 0 ? (
                                <div className="space-y-1">
                                    {uploadedFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 truncate">
                                            <FileText size={10} className="text-indigo-400 shrink-0"/> {f.name}
                                        </div>
                                    ))}
                                </div>
                            ) : <div className="text-[10px] text-slate-300 italic">No files attached.</div>}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => handleGenerate()} 
                            disabled={isGenerating || (!prompt.trim() && uploadedFiles.length === 0)}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-30"
                        >
                            {isGenerating ? <Loader size={24} className="animate-spin" /> : <Sparkles size={24} />} 
                            Synthesize Model
                        </button>
                        {error && <p className="text-center text-red-500 text-xs font-bold mt-4 animate-pulse flex items-center justify-center gap-2"><AlertTriangle size={14}/> {error}</p>}
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={14}/> Recent Schemas</h4>
                    <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                        {historyItems.map((h, i) => (
                            <button key={i} onClick={() => loadHistoryItem(h)} className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-600 whitespace-nowrap transition-all">
                                {h.summary}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-white relative animate-fade-in overflow-hidden">
      <div className="bg-white border-b border-slate-200 p-4 px-8 shadow-sm z-20 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('input')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><ArrowLeft size={20}/></button>
            <div className="w-px h-8 bg-slate-100"></div>
            <div><h2 className="text-xl font-black text-slate-900 tracking-tight">Technical Schema</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1"><Zap size={10} className="text-amber-500"/> Neural Extraction Active</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setViewMode('input')} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-lg shadow-slate-200 transition-all"><RefreshCw size={14}/> Re-Synthesize</button>
        </div>
      </div>
      <div className="flex-1 relative">
         <ArchitectureCanvas 
            ref={canvasRef} 
            aiNodes={design.nodes} 
            aiEdges={design.edges} 
            isThinking={isGenerating} 
            thoughts={[]} 
            onDesignChange={setDesign}
        />
      </div>
    </div>
  );
};

const RefreshCw = ({size, className}: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
    </svg>
);

export default StandaloneERDiagram;
