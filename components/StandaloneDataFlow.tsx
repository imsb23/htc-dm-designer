
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightCircle, Sparkles, Loader, Send, UploadCloud, History, HelpCircle, X, AlertTriangle, FileText, Trash2, Share2, ImageIcon, FileCode, BrainCircuit, Code } from 'lucide-react';
import ArchitectureCanvas from './ArchitectureCanvas';
import { generateProcessArchitecture, analyzeAndLearn, saveHistory, getHistory, deleteHistory } from '../services/geminiService';
import { DesignData, ArchitectureCanvasHandle } from '../types';

const StandaloneDataFlow: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [design, setDesign] = useState<DesignData>({ nodes: [], edges: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [eta, setEta] = useState(0);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLearning, setIsLearning] = useState(false);

  const canvasRef = useRef<ArchitectureCanvasHandle>(null);

  useEffect(() => {
     setHistoryItems(getHistory('DataFlow'));
  }, [design]);

  useEffect(() => {
    let interval: any;
    if (isGenerating && eta > 0) {
      interval = setInterval(() => {
        setEta((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, eta]);

  const handleGenerate = async (overridePrompt?: string) => {
    let input = overridePrompt || prompt;
    if (!input.trim()) return;
    
    setIsGenerating(true);
    setEta(10); 
    setError(null);
    setThoughts(['Parsing logic...', 'Defining process steps...', 'Connecting flow...']);
    
    try {
      const result = await generateProcessArchitecture(input, input);
      if (result && result.nodes.length > 0) {
        setDesign(result);
        setIsLearning(true);
        const interactionType = overridePrompt ? 'refinement' : 'initial';
        analyzeAndLearn(input, overridePrompt || null, result, ['Developer'], interactionType).finally(() => setIsLearning(false));
        saveHistory('DataFlow', input.substring(0, 40) + '...', result, uploadedFiles);
      } else {
        setError("AI could not generate a valid flow structure. Please add more details to your prompt.");
      }
    } catch (e) {
      console.error(e);
      setError("System error during generation. Please try again.");
    } finally {
      setIsGenerating(false);
      setEta(0);
    }
  };

  const handleRefinement = (newDesign: DesignData) => {
      setDesign(newDesign);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => [...prev, file.name]);
      setPrompt(prev => prev + ` [Context from file: ${file.name}]\n(Note: Extract data flow logic from this file) `);
    }
  };

  const loadHistory = (item: any) => {
     setPrompt(item.summary);
     setDesign(item.data);
     setUploadedFiles(item.files || []);
     setShowHistory(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistory(id);
    setHistoryItems(prev => prev.filter(h => h.id !== id));
  };

  const triggerExport = (format: 'png' | 'svg') => {
      if (canvasRef.current) {
          canvasRef.current.exportImage(format);
          setShowExportMenu(false);
          setIsLearning(true);
          analyzeAndLearn(prompt, "User Exported Data Flow", design, ['Developer'], 'acceptance').finally(() => setIsLearning(false));
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <ArrowRightCircle className="text-orange-600"/> Data Flow Designer
               {isLearning && <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse"><BrainCircuit size={10} /> Learning</span>}
           </h2>
           <p className="text-xs text-slate-500">Visualize complex data processing logic and ETL flows.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                disabled={design.nodes.length === 0}
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm ${design.nodes.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
             >
                <Share2 size={16} /> Export Solution
             </button>
             {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in-up">
                   <button onClick={() => triggerExport('png')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"><ImageIcon size={16} /> Export as PNG</button>
                   <button onClick={() => triggerExport('svg')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"><FileCode size={16} /> Export as SVG</button>
                </div>
             )}
           </div>
           <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">
              <HelpCircle size={18} /> Help
           </button>
           <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${showHistory ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <History size={18} /> History
           </button>
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
           <AlertTriangle size={16} />
           <span className="text-sm">{error}</span>
           <button onClick={() => setError(null)}><X size={14}/></button>
        </div>
      )}

      {showHistory && (
         <div className="absolute top-20 right-4 z-50 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-fade-in-up">
            <h3 className="font-bold text-sm mb-3">Recent Flows</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
               {historyItems.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">No history available</p> :
               historyItems.map((h, i) => (
                  <button key={i} onClick={() => loadHistory(h)} className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-slate-100 text-xs group relative transition-all">
                     <div className="truncate font-medium text-slate-700 mb-1">{h.summary}</div>
                     {h.files && h.files.length > 0 && (
                        <div className="flex gap-1">
                            {h.files.map((f: string, idx: number) => (
                                <span key={idx} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 truncate max-w-[80px]">
                                    <FileText size={8}/> {f}
                                </span>
                            ))}
                        </div>
                     )}
                     <div 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded p-1 hover:text-red-500 cursor-pointer"
                        onClick={(e) => handleDeleteHistory(h.id, e)}
                     >
                        <Trash2 size={14} />
                     </div>
                  </button>
               ))}
            </div>
         </div>
      )}

      {/* Help Modal */}
      {showHelp && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                 <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                 <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><HelpCircle className="text-orange-500" /> Data Flow Help</h3>
                 <div className="space-y-4 text-sm text-slate-600">
                    <p><strong>Universal Input:</strong> Use the single text area to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                       <li><strong>Describe Logic:</strong> "Ingest JSON, validate schema, filter nulls, flatten array, load to BigQuery."</li>
                       <li><strong>Paste Code:</strong> Paste existing Mermaid JS code. The tool will render it automatically.</li>
                    </ul>
                 </div>
              </div>
           </div>
      )}

      <div className="flex-1 relative">
         {design.nodes.length === 0 && !isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
               <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ArrowRightCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Start Flow Design</h3>
                  <p className="text-slate-500 mb-6 text-sm">Describe your data logic or paste Mermaid code directly.</p>
                  
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-4 mb-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none h-32 bg-white text-slate-900"
                    placeholder="e.g. 'Ingest JSON API -> Validate -> Load to Snowflake' OR 'graph LR; A-->B;'"
                  />
                  <div className="flex justify-between gap-2">
                     <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 hover:text-orange-600 border border-slate-200 px-3 py-2 rounded-lg hover:border-orange-300 transition-all bg-white">
                        <UploadCloud size={16} /> Upload Spec
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                     </label>
                     <button 
                        onClick={() => handleGenerate()}
                        disabled={!prompt.trim()}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        <Sparkles size={18} /> Generate Flow
                     </button>
                  </div>
               </div>
            </div>
         ) : (
            <div className="h-full relative">
               {/* FIX: Removed invalid props context, onApplyRefinement, onRefine, and refinementPlaceholder. Added onDesignChange. */}
               <ArchitectureCanvas 
                 ref={canvasRef}
                 aiNodes={design.nodes} 
                 aiEdges={design.edges} 
                 isThinking={isGenerating} 
                 thoughts={thoughts}
                 onDesignChange={handleRefinement}
               />
               {/* FIX: Added AI refinement UI which was previously passed via props to ArchitectureCanvas */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-30">
                  <div className="bg-white shadow-2xl rounded-2xl border border-slate-200 p-2 flex items-center gap-3">
                      <div className="p-4 bg-orange-600 text-white rounded-xl shadow-lg">{isGenerating ? <Loader size={20} className="animate-spin" /> : <BrainCircuit size={20} />}</div>
                      <input 
                        type="text" 
                        placeholder="Refine flow (e.g. 'Add error handling step')..." 
                        className="flex-1 bg-transparent outline-none text-sm py-2 px-2 text-slate-800 font-bold placeholder:text-slate-300" 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate(prompt)} 
                      />
                      <button onClick={() => handleGenerate(prompt)} disabled={!prompt.trim() || isGenerating} className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">Execute</button>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default StandaloneDataFlow;
