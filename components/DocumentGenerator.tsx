
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Loader, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Trash2, 
  Network, 
  ArrowRightCircle, 
  Table, 
  Pencil, 
  ChevronRight, 
  History, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Home, 
  Database, 
  BrainCircuit, 
  Lightbulb, 
  FileCheck, 
  Layout, 
  Download, 
  PlusCircle
} from 'lucide-react';
import { DocumentSection, DesignData, DocumentStrategy } from '../types';
import { 
  determineDocumentStrategy, 
  generateDocumentContent, 
  generateArchitectureDesign,
  generateERD,
  generateProcessArchitecture,
  saveHistory,
  getHistory,
  deleteHistory
} from '../services/geminiService';
import ArchitectureCanvas from './ArchitectureCanvas';

// Global types for external libraries
declare global {
  interface Window {
    mammoth: any;
    pdfjsLib: any;
  }
}

interface DocumentGeneratorProps {
  setHasUnsavedChanges?: (val: boolean) => void;
  onNavigateToDashboard?: () => void;
  initialData?: any; // The full history data object if loaded from search
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ setHasUnsavedChanges, onNavigateToDashboard, initialData }) => {
    // Phases: 'start' (Input) -> 'plan' (Review Strategy) -> 'workspace' (View/Edit)
    const [phase, setPhase] = useState<'start' | 'plan' | 'workspace'>('start');
    
    // Input State
    const [userPrompt, setUserPrompt] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    
    // AI Strategy State
    const [strategy, setStrategy] = useState<DocumentStrategy | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Workspace State
    const [activeTab, setActiveTab] = useState<'content' | 'diagrams'>('content');
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    
    // Diagram State
    const [diagramType, setDiagramType] = useState<'arch' | 'flow' | 'erd'>('arch');
    const [archDesign, setArchDesign] = useState<DesignData>({ nodes: [], edges: [] });
    const [flowDesign, setFlowDesign] = useState<DesignData>({ nodes: [], edges: [] });
    const [erdDesign, setErdDesign] = useState<DesignData>({ nodes: [], edges: [] });
    const [isDiagramGenerating, setIsDiagramGenerating] = useState(false);

    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [historyItems, setHistoryItems] = useState<any[]>([]);

    useEffect(() => {
        setHistoryItems(getHistory('DocumentGenerator'));
    }, []);

    // Handle deep linking from search
    useEffect(() => {
        if (initialData) {
            setStrategy(initialData.strategy);
            setSections(initialData.sections);
            if (initialData.context) {
                // We don't restore full context text to userPrompt as it might be huge, but logic is there
            }
            setPhase('workspace');
        }
    }, [initialData]);

    // --- UTILS ---
    const extractTextFromDocx = async (file: File): Promise<string> => {
        if (!window.mammoth) return "[Error: Mammoth.js library not found]";
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            return result.value || "[Empty DOCX]";
        } catch (e) {
            console.error(e);
            return `[Error parsing DOCX: ${file.name}]`;
        }
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        if (!window.pdfjsLib) return "[Error: PDF.js library not found]";
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += `[Page ${i}]\n${pageText}\n\n`;
            }
            return fullText || "[Empty PDF]";
        } catch (e) {
            console.error(e);
            return `[Error parsing PDF: ${file.name}]`;
        }
    };

    const readFileContent = async (file: File): Promise<string> => {
        // Return cached content if available
        if (fileContents[file.name]) return fileContents[file.name];

        let content = "";
        const name = file.name.toLowerCase();

        if (name.endsWith('.docx')) {
            content = await extractTextFromDocx(file);
        } else if (name.endsWith('.pdf')) {
            content = await extractTextFromPdf(file);
        } else if (name.match(/\.(txt|md|json|csv|xml|yml|yaml|html|js|ts|java|py|sql)$/i)) {
            content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve((e.target?.result as string) || "");
                reader.readAsText(file);
            });
        } else {
            content = `[Binary File: ${file.name} attached. Content not readable.]`;
        }

        // Cache the content
        setFileContents(prev => ({ ...prev, [file.name]: content }));
        return content;
    };

    const getFullContext = async () => {
        let ctx = userPrompt ? `User Instruction: ${userPrompt}\n\n` : "";
        for (const file of uploadedFiles) {
            const content = await readFileContent(file);
            ctx += `--- File: ${file.name} ---\n${content.substring(0, 15000)}\n\n`;
        }
        return ctx;
    };

    // --- HANDLERS: RESET ---
    const handleReset = () => {
        if(window.confirm("Start a new document? Current progress will be lost if not exported.")) {
            setPhase('start');
            setUserPrompt('');
            setUploadedFiles([]);
            setFileContents({});
            setStrategy(null);
            setSections([]);
        }
    };

    // --- HANDLERS: STEP 1 (ANALYZE) ---
    const handleAnalyze = async () => {
        if (!userPrompt && uploadedFiles.length === 0) return;
        setIsAnalyzing(true);
        try {
            const context = await getFullContext();
            const result = await determineDocumentStrategy(userPrompt, context);
            setStrategy(result);
            setPhase('plan');
        } catch (e) {
            console.error(e);
            alert("Failed to analyze. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- HANDLERS: STEP 2 (GENERATE) ---
    const handleGenerate = async () => {
        if (!strategy) return;
        
        setPhase('workspace');
        // Initialize sections
        const initialSections = strategy.sections.map((title, idx) => ({
            id: `sec-${idx}`,
            title,
            content: '',
            status: 'pending' as const
        }));
        setSections(initialSections);
        
        const context = await getFullContext();

        // 1. Generate Content (Parallel)
        setIsGeneratingContent(true);
        const contentTasks = initialSections.map(async (sec) => {
            const text = await generateDocumentContent(sec.title, context, strategy.type);
            setSections(prev => prev.map(s => s.id === sec.id ? { ...s, content: text, status: 'generated' } : s));
        });

        // 2. Generate Diagrams (Based on Strategy)
        if (strategy.diagramMode !== 'none') {
            setIsDiagramGenerating(true);
            
            // Architecture Flow (Always for 'architecture_only' and 'full')
            generateArchitectureDesign(context, "System Architecture").then(d => setArchDesign(d));

            // Full Mode Extras
            if (strategy.diagramMode === 'full') {
                generateProcessArchitecture(context, "Data Flow").then(d => setFlowDesign(d));
                generateERD(context, "Database Schema").then(d => setErdDesign(d));
            }
            
            setIsDiagramGenerating(false);
        }

        await Promise.all(contentTasks);
        setIsGeneratingContent(false);
        
        // Save History
        saveHistory('DocumentGenerator', strategy.title, { strategy, sections: initialSections, context }, uploadedFiles.map(f => f.name));
        setHistoryItems(getHistory('DocumentGenerator'));
    };

    const handleExportWord = () => {
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${strategy?.title}</title></head><body>`;
        const footer = "</body></html>";
        let bodyHTML = `<h1>${strategy?.title}</h1><p>Generated by HTC Copilot</p><hr/>`;
        
        sections.forEach(sec => {
            bodyHTML += `<h2>${sec.title}</h2><div>${sec.content.replace(/\n/g, '<br/>')}</div><br/>`;
        });
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + bodyHTML + footer);
        const link = document.createElement("a");
        link.href = source;
        link.download = `${strategy?.title.replace(/\s+/g, '_') || 'document'}.doc`;
        link.click();
    };

    // --- RENDER HELPERS ---
    const getStrategyBadge = (type: string) => {
        switch(type) {
            case 'replica': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">Replica Mode</span>;
            case 'hld': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">HLD Generation</span>;
            case 'migration': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase">Migration Strategy</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase">Custom</span>;
        }
    };

    const getCurrentDiagram = () => {
        if (diagramType === 'arch') return archDesign;
        if (diagramType === 'flow') return flowDesign;
        if (diagramType === 'erd') return erdDesign;
        return { nodes: [], edges: [] };
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in overflow-hidden">
            
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onNavigateToDashboard} 
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Back to Dashboard"
                    >
                        <Home size={20}/>
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            Doc Generator
                            {phase === 'plan' && <span className="text-slate-400 font-normal text-sm">/ Strategy</span>}
                            {phase === 'workspace' && <span className="text-slate-400 font-normal text-sm">/ {strategy?.title}</span>}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Functional Module Home Button (Reset) */}
                    {phase !== 'start' && (
                        <button 
                            onClick={handleReset} 
                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                            <PlusCircle size={18} /> New Document
                        </button>
                    )}
                    
                    <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                        <History size={18}/> History
                    </button>
                    {phase === 'workspace' && (
                        <button onClick={handleExportWord} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-md">
                            <Download size={14} /> Export
                        </button>
                    )}
                </div>
            </div>

            {/* History Panel */}
            {showHistory && (
                <div className="absolute top-20 right-6 z-30 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-fade-in-up">
                    <h3 className="font-bold text-sm mb-3 text-slate-800">Recent Docs</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                    {historyItems.map((h, i) => (
                        <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100 text-xs cursor-pointer" onClick={() => {
                            setStrategy(h.data.strategy);
                            setSections(h.data.sections);
                            setPhase('workspace');
                            setShowHistory(false);
                        }}>
                            <div>
                                <div className="font-bold text-slate-700">{h.summary}</div>
                                <div className="text-slate-400">{h.date}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteHistory(h.id); setHistoryItems(prev => prev.filter(x => x.id !== h.id)); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {/* PHASE 1: START (Input) */}
            {phase === 'start' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <FileCheck size={32} />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">What document are we building?</h1>
                            <p className="text-slate-500">I use <span className="font-bold text-indigo-600">Gemini Thinking</span> to learn strategies from your input and replicate existing docs.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">1. Instructions</label>
                                <textarea 
                                    className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                                    placeholder="e.g., 'Scan this file and replicate it as an LLD' OR 'Create a Migration Strategy for moving Oracle to Snowflake'..."
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">2. Context Files</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                                        <UploadCloud size={20} className="text-slate-400 mb-1"/>
                                        <span className="text-xs font-bold text-slate-600">Upload Documents</span>
                                        <input type="file" className="hidden" multiple onChange={(e) => {
                                            if (e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
                                        }} accept=".docx,.pdf,.txt,.md,.json,.csv" />
                                    </label>
                                    <div className="flex-1 space-y-2">
                                        {uploadedFiles.length === 0 && <div className="text-xs text-slate-400 italic py-8 text-center">No files selected.</div>}
                                        {uploadedFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-100 px-3 py-2 rounded-lg text-xs">
                                                <span className="truncate max-w-[150px]">{f.name}</span>
                                                <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><XCircle size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || (!userPrompt && uploadedFiles.length === 0)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? <Loader size={20} className="animate-spin"/> : <Sparkles size={20} />}
                                Analyze & Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PHASE 2: PLAN (Review Strategy) */}
            {phase === 'plan' && strategy && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <div className="max-w-3xl w-full animate-fade-in-up">
                        <button onClick={() => setPhase('start')} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium">
                            <ArrowLeft size={16}/> Back to Input
                        </button>

                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{strategy.title}</h2>
                                    <p className="text-slate-500 text-sm">{strategy.reasoning}</p>
                                </div>
                                {getStrategyBadge(strategy.type)}
                            </div>
                            
                            <div className="p-8 grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Layout size={16}/> Proposed Structure</h3>
                                    <div className="space-y-2">
                                        {strategy.sections.map((sec, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">{i + 1}</span>
                                                {sec}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Network size={16}/> Diagram Strategy</h3>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BrainCircuit size={20} className="text-indigo-600"/>
                                            <span className="font-bold text-indigo-900 text-sm capitalize">{strategy.diagramMode.replace('_', ' ')}</span>
                                        </div>
                                        <p className="text-xs text-indigo-700 leading-relaxed">
                                            {strategy.diagramMode === 'none' && "No diagrams will be generated for Migration Strategy documents, strictly text-based planning."}
                                            {strategy.diagramMode === 'architecture_only' && "Will generate a high-level architectural flow diagram."}
                                            {strategy.diagramMode === 'full' && "Will replicate all technical diagrams (Architecture, Data Flow, ERD) found in the source."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
                                <button 
                                    onClick={handleGenerate}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    <FileCheck size={18}/> Generate Document
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PHASE 3: WORKSPACE */}
            {phase === 'workspace' && (
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs (if diagrams exist) */}
                    {strategy?.diagramMode !== 'none' && (
                        <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 shrink-0 z-10">
                            <button 
                                onClick={() => setActiveTab('content')} 
                                className={`p-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
                                title="Content"
                            >
                                <FileText size={20} />
                            </button>
                            <button 
                                onClick={() => setActiveTab('diagrams')} 
                                className={`p-3 rounded-xl transition-all ${activeTab === 'diagrams' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
                                title="Diagrams"
                            >
                                <Network size={20} />
                            </button>
                        </div>
                    )}

                    {/* Content View */}
                    {activeTab === 'content' && (
                        <div className="flex-1 flex overflow-hidden">
                            {/* TOC Sidebar */}
                            <div className="w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto p-4 custom-scrollbar hidden md:block">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Table of Contents</h3>
                                <div className="space-y-1">
                                    {sections.map((sec, i) => (
                                        <button 
                                            key={sec.id}
                                            onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] shrink-0">{i+1}</span>
                                            <span className="truncate">{sec.title}</span>
                                            {sec.status === 'generated' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Document */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                                    {sections.map((sec) => (
                                        <div key={sec.id} id={sec.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[200px]">
                                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                                <h2 className="text-xl font-bold text-slate-800">{sec.title}</h2>
                                                {sec.status === 'pending' && <Loader size={16} className="animate-spin text-slate-400"/>}
                                            </div>
                                            {sec.status === 'pending' ? (
                                                <div className="space-y-3 animate-pulse">
                                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                                                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {sec.content}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Diagram View */}
                    {activeTab === 'diagrams' && (
                        <div className="flex-1 flex flex-col h-full bg-white relative">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-sm flex gap-1">
                                <button onClick={() => setDiagramType('arch')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${diagramType === 'arch' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>Architecture</button>
                                {strategy?.diagramMode === 'full' && (
                                    <>
                                        <button onClick={() => setDiagramType('flow')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${diagramType === 'flow' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>Data Flow</button>
                                        <button onClick={() => setDiagramType('erd')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${diagramType === 'erd' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>ER Diagram</button>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex-1 relative">
                                {isDiagramGenerating ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader size={32} className="animate-spin text-indigo-500"/>
                                    </div>
                                ) : (
                                    /* FIX: Removed invalid props onRefine and refinementPlaceholder */
                                    <ArchitectureCanvas 
                                        aiNodes={getCurrentDiagram().nodes} 
                                        aiEdges={getCurrentDiagram().edges} 
                                        isThinking={false} 
                                        thoughts={[]} 
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentGenerator;
