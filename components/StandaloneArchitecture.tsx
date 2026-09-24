
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Network, Sparkles, X, Trash2, ArrowLeft, Loader, MousePointer2, Copy, Check, Download,
    Maximize2, FileCode, Save, Database, Workflow, TableProperties, Cpu, ImageIcon, ZoomIn, ZoomOut,
    RotateCcw, Wand2, RefreshCw, Server, Globe, Boxes, Link, ArrowRight, Info, Layers, Key, Plus,
    Cloud, Search, History, Calendar, ArrowUpRight, Filter, BrainCircuit, Zap, GitBranch, Terminal, Shield, Box, Send, Paperclip, FileJson, Code2,
    PlusCircle, Table, PieChart as PieChartIcon, Home, Clock, ExternalLink, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import ArchitectureCanvas from './ArchitectureCanvas';
import { generateMermaidCode, synthesizeIntelligentArchitecture, saveHistory, getHistory, deleteHistory } from '../services/geminiService';
import { DesignData, ArchitectureCanvasHandle, Node } from '../types';

const StandaloneArchitecture: React.FC<{ initialData?: DesignData, initialView?: 'dashboard' | 'selection' | 'studio' | 'ai' | 'canvas_ai' | 'workspace' | 'create', fullHistoryItem?: any }> = ({ initialData, initialView, fullHistoryItem }) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'selection' | 'studio' | 'ai' | 'canvas_ai'>('dashboard');
  const [taskName, setTaskName] = useState('');
  const [design, setDesign] = useState<DesignData>({ nodes: [], edges: [], classification: 'SYSTEM_ARCHITECTURE' });
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const canvasRef = useRef<ArchitectureCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedNode = useMemo(() => design.nodes.find(n => n.id === selectedNodeId), [design.nodes, selectedNodeId]);

  const [mermaidCode, setMermaidCode] = useState('graph TD\n  A[App] --> B[Database]');
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [mermaidError, setMermaidError] = useState<string | null>(null);
  const [mermaidZoom, setMermaidZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Advanced synthesis state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [canvasPrompt, setCanvasPrompt] = useState('');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  const updateSelectedNode = (updates: Partial<Node>) => {
    if (!selectedNodeId) return;
    setDesign(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n)
    }));
  };

  useEffect(() => {
    if (initialView === 'create') setViewMode('selection');
    else if (initialView === 'workspace') {
        if (initialData?.mermaidCode || fullHistoryItem?.data?.mermaidCode) {
            setMermaidCode(initialData?.mermaidCode || fullHistoryItem?.data?.mermaidCode); setViewMode('ai');
        } else {
            setDesign(initialData || fullHistoryItem?.data || { nodes: [], edges: [] }); setViewMode('studio');
        }
    } else if (initialView) setViewMode(initialView as any);
  }, [initialView, initialData, fullHistoryItem]);

  useEffect(() => { setHistoryItems(getHistory('Architecture')); }, [design, mermaidCode, viewMode]);

  const loadHistoryItem = (item: any) => {
     if (item.data.mermaidCode) { setMermaidCode(item.data.mermaidCode); setViewMode('ai'); }
     else { setDesign(item.data); setViewMode('studio'); }
     setTaskName(item.summary);
  };

  const handleSaveToHistory = () => {
      setIsSaving(true);
      setTimeout(() => {
        saveHistory('Architecture', taskName || 'Architectural Blueprint', viewMode === 'ai' ? { mermaidCode } : design);
        setHistoryItems(getHistory('Architecture')); setIsSaving(false); setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 600);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); if (confirm("Delete session?")) { deleteHistory(id); setHistoryItems(getHistory('Architecture')); }
  };

  useEffect(() => { if (viewMode === 'ai') renderMermaid(); }, [mermaidCode, viewMode]);

  const renderMermaid = async () => {
    if (typeof window.mermaid === 'undefined') return;
    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
      const { svg } = await window.mermaid.render(id, mermaidCode);
      setMermaidSvg(svg); setMermaidError(null);
    } catch (err: any) { setMermaidError(err.message); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handleExecuteRefinement = async () => {
      if (!aiPrompt.trim() && attachedFiles.length === 0) return;
      
      setIsAiGenerating(true);
      try {
          const { design: result, groundingSources: sources } = await synthesizeIntelligentArchitecture(aiPrompt, attachedFiles, design);
          setDesign(result);
          setGroundingSources(sources);
          setAiPrompt('');
          setAttachedFiles([]);
      } catch (e) {
          console.error(e);
          alert("Intelligent synthesis failed. Check your API key or network connection.");
      } finally {
          setIsAiGenerating(false);
      }
  };

  const handleAiSynthesizeCanvas = async () => {
    if (!canvasPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
        const { design: result, groundingSources: sources } = await synthesizeIntelligentArchitecture(canvasPrompt, attachedFiles);
        setDesign(result);
        setGroundingSources(sources);
        setViewMode('studio');
    } catch (e) {
        console.error(e);
        alert("Failed to synthesize design blocks.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  const handleAiSynthesizeMermaid = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
        const code = await generateMermaidCode(aiPrompt, mermaidCode);
        setMermaidCode(code);
        setAiPrompt('');
    } catch (e) {
        console.error(e);
        alert("Failed to synthesize Mermaid code.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  const handleAddManualNode = (type: Node['type'], label: string, x?: number, y?: number) => {
      const isTable = type === 'simple_table' || type === 'table';
      const newNode: Node = { 
          id: `node-${Date.now()}`, 
          label, 
          type, 
          x: x || 200, 
          y: y || 200, 
          width: isTable ? 280 : (type === 'container' ? 400 : 180), 
          height: isTable ? 150 : (type === 'container' ? 300 : 80), 
          columns: isTable ? [{ name: 'id', type: 'INT', isPk: true }] : [] 
      };
      setDesign(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
  };

  const PaletteItem = ({ type, icon: Icon, label, color }: any) => (
      <button 
        draggable 
        onDragStart={(e) => { e.dataTransfer.setData('nodeType', type); }} 
        onClick={() => handleAddManualNode(type, label)} 
        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group"
      >
          <div className={`p-2 rounded-lg bg-white shadow-sm text-${color}-600 group-hover:scale-110 transition-transform`}>
              <Icon size={16}/>
          </div>
          <span className="text-[11px] font-bold text-slate-700 tracking-tight">{label}</span>
      </button>
  );

  const dashboardStats = useMemo(() => {
    const aiCount = historyItems.filter(h => h.data.mermaidCode).length;
    const manualCount = historyItems.length - aiCount;
    const totalEntities = historyItems.reduce((acc, h) => acc + (h.data.nodes?.length || 0), 0);
    const complexData = [
        { name: 'AI SESSIONS', value: aiCount, color: '#10B981' },
        { name: 'CANVAS SKETCHES', value: manualCount, color: '#6366F1' }
    ];
    return { total: historyItems.length, aiCount, manualCount, totalEntities, complexData };
  }, [historyItems]);

  if (viewMode === 'dashboard') {
    const filteredHistory = historyItems.filter(h => h.summary.toLowerCase().includes(historySearch.toLowerCase()));
    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Blueprint Studio</h2>
                        <p className="text-slate-500 font-medium mt-1">Freehand sketching and research-backed neural synthesis.</p>
                    </div>
                    <button onClick={() => setViewMode('selection')} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"><Plus size={20} /> Create New Blueprint</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><Layers size={20}/></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Sessions</div>
                        <div className="text-3xl font-black text-slate-800 mt-1">{dashboardStats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Zap size={20}/></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Neural Specs</div>
                        <div className="text-3xl font-black text-emerald-600 mt-1">{dashboardStats.aiCount}</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><MousePointer2 size={20}/></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Canvas Sketches</div>
                        <div className="text-3xl font-black text-blue-600 mt-1">{dashboardStats.manualCount}</div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Network size={80} className="text-indigo-400"/></div>
                         <div className="relative z-10">
                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Entity Density</div>
                            <div className="text-3xl font-black text-white">{dashboardStats.totalEntities}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-2">ACTIVE COMPONENTS</div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                         <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PieChartIcon size={22} className="text-indigo-500"/> Methodology Mix</h3></div>
                         <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardStats.complexData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} />
                                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>{dashboardStats.complexData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><History size={22} className="text-slate-400"/> Session Management</h3>
                        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Filter session name..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)}/></div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            {filteredHistory.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs italic">No sessions found.</div>) : filteredHistory.map((item) => (
                                <div key={item.id} onClick={() => loadHistoryItem(item)} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between">
                                    <div className="min-w-0 flex-1"><div className="font-bold text-slate-700 text-sm truncate">{item.summary}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{item.date} {item.data.mermaidCode ? '• Neural' : '• Canvas'}</div></div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => handleDeleteHistory(item.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={14} /></button><ArrowUpRight size={14} className="text-indigo-400" /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (viewMode === 'selection') {
      return (
          <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className="max-w-6xl w-full text-center space-y-12">
                  <div className="space-y-4">
                      <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Blueprint <span className="text-indigo-600">Engine</span></h1>
                      <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Select the appropriate mode for your architectural requirements.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button onClick={() => { setDesign({ nodes: [], edges: [], classification: 'SYSTEM_ARCHITECTURE' }); setViewMode('studio'); }} className="group bg-white p-8 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 transition-all text-left flex flex-col h-full relative shadow-sm active:scale-[0.98]">
                          <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all"><MousePointer2 size={24} /></div>
                          <h2 className="text-xl font-black text-slate-900 mb-2 uppercase italic">Visual Studio</h2>
                          <p className="text-slate-500 text-xs font-medium leading-relaxed flex-1">Standard whiteboard experience. Drag system components and link technical entities manually.</p>
                          <div className="mt-6 flex items-center gap-2 font-black text-indigo-600 uppercase text-[10px] tracking-widest group-hover:translate-x-1 transition-transform">Initialize Canvas <ArrowRight size={12} /></div>
                      </button>
                      <button onClick={() => setViewMode('canvas_ai')} className="group bg-white p-8 rounded-2xl border-2 border-slate-200 hover:border-orange-500 transition-all text-left flex flex-col h-full relative shadow-sm active:scale-[0.98]">
                          <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all"><Zap size={24} /></div>
                          <h2 className="text-xl font-black text-slate-900 mb-2 uppercase italic">AI Canvas</h2>
                          <p className="text-slate-500 text-xs font-medium leading-relaxed flex-1">Intelligent synthesis using Gemini Pro. Architects your vision directly into visual blocks with grounding research.</p>
                          <div className="mt-6 flex items-center gap-2 font-black text-orange-600 uppercase text-[10px] tracking-widest group-hover:translate-x-1 transition-transform">Synthesize Blocks <ArrowRight size={12} /></div>
                      </button>
                      <button onClick={() => setViewMode('ai')} className="group bg-slate-900 p-8 rounded-2xl border-2 border-slate-800 hover:border-emerald-500 transition-all text-left flex flex-col h-full relative shadow-2xl active:scale-[0.98]">
                          <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Sparkles size={24} /></div>
                          <h2 className="text-xl font-black text-white mb-2 uppercase italic">Neural Mermaid</h2>
                          <p className="text-slate-400 text-xs font-medium leading-relaxed flex-1">Logic-first approach. Generate complex Mermaid schemas from architectural intent prompts.</p>
                          <div className="mt-6 flex items-center gap-2 font-black text-emerald-400 uppercase text-[10px] tracking-widest group-hover:translate-x-1 transition-transform">Launch Engine <ArrowRight size={12} /></div>
                      </button>
                  </div>
                  <button onClick={() => setViewMode('dashboard')} className="text-slate-400 hover:text-slate-800 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mx-auto transition-colors"><ArrowLeft size={16}/> Back to Hub</button>
              </div>
          </div>
      );
  }

  if (viewMode === 'canvas_ai') {
      return (
          <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-8 animate-fade-in overflow-y-auto">
              <div className="max-w-2xl w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={160} className="text-orange-600"/></div>
                  <button onClick={() => setViewMode('selection')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24}/></button>
                  <div className="relative z-10 space-y-4 mb-10">
                      <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm ring-1 ring-orange-100"><BrainCircuit size={32} /></div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Neural Architecture Lab</h2>
                      <p className="text-slate-500 text-sm font-medium max-w-md mx-auto italic">Synthesize blueprints using Gemini 3 Pro with deep research capabilities. Upload images to teach the model your preferred visual style.</p>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <textarea value={canvasPrompt} onChange={e => setCanvasPrompt(e.target.value)} className="w-full h-40 p-6 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none text-sm font-bold leading-relaxed bg-slate-50/50 transition-all resize-none shadow-inner" placeholder="e.g. 'A cloud architecture with an AWS S3 source, research financial DQ whitepapers...'" />
                    
                    <div className="space-y-3">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-all bg-slate-50/30">
                            <ImageIcon className="text-slate-400 mb-2" size={32} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attach Style Samples (.png)</span>
                            <input type="file" multiple className="hidden" accept="image/*,.js,.ts" onChange={handleFileUpload} />
                        </label>
                        {attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {attachedFiles.map((f, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-[10px] rounded-full flex items-center gap-1.5 shadow-sm text-slate-600 font-bold uppercase italic tracking-tighter">
                                        {f.type.startsWith('image/') ? <ImageIcon size={10} className="text-orange-500"/> : <FileCode size={10} className="text-indigo-500"/>} 
                                        {f.name} <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500"><X size={10}/></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={handleAiSynthesizeCanvas} disabled={isAiGenerating || !canvasPrompt.trim()} className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-xl">{isAiGenerating ? <Loader size={20} className="animate-spin" /> : <Sparkles size={20} />} Synthesize Research Blueprint</button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden relative text-slate-800 font-sans">
      <aside className="w-16 bg-slate-950 flex flex-col items-center py-6 gap-6 shrink-0 shadow-xl">
          <button onClick={() => setViewMode('dashboard')} className="p-3 text-slate-600 hover:text-white transition-colors" title="Hub Home"><Home size={24} /></button>
          <div className="w-8 h-px bg-slate-800"></div>
          
          <div className="flex flex-col items-center gap-4">
              <button onClick={() => setViewMode(v => v === 'ai' ? 'studio' : 'ai')} className={`p-3 rounded-xl transition-all ${viewMode === 'ai' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`} title="Toggle Code/Visual">
                  {viewMode === 'ai' ? <Network size={24}/> : <FileCode size={24}/>}
              </button>
          </div>

          {!viewMode.includes('ai') && (
              <button onClick={() => setIsLinkingMode(!isLinkingMode)} className={`p-3 rounded-xl transition-all ${isLinkingMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`} title="Link Mode"><Link size={24}/></button>
          )}
          
          <div className="mt-auto flex flex-col items-center gap-4">
              <button onClick={handleSaveToHistory} disabled={isSaving} className={`p-3 rounded-xl transition-all ${saveSuccess ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-white'}`} title="Save Session">{isSaving ? <Loader size={24} className="animate-spin" /> : (saveSuccess ? <Check size={24} /> : <Save size={24} />)}</button>
              <button className="p-3 text-slate-600 hover:text-white transition-colors"><Download size={24}/></button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
          <header className="h-14 bg-white border-b border-slate-100 px-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                  <input className="font-black text-slate-900 text-sm tracking-tight outline-none border-b border-transparent focus:border-indigo-600 bg-transparent px-1 min-w-[250px] uppercase italic" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="PROJECT_SESSION_ID" />
                  <div className="h-4 w-px bg-slate-200"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{viewMode === 'ai' ? 'Neural Engine' : 'Intelligent Studio'}</span>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(viewMode === 'ai' ? mermaidCode : JSON.stringify(design)); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md transition-all">{isCopied ? 'Copied' : 'Copy Payload'}</button>
                  <button onClick={() => setIsFullscreen(true)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><Maximize2 size={16}/></button>
              </div>
          </header>

          {(viewMode === 'ai' || viewMode === 'studio') && (
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
                  <div className="max-w-5xl mx-auto space-y-2">
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm ring-1 ring-slate-100">
                          <div className={`p-2 rounded-lg shrink-0 ${isAiGenerating ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                              {isAiGenerating ? <Loader size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                              <input 
                                type="text" 
                                placeholder={viewMode === 'ai' ? "Refine via NLP or paste Mermaid code..." : "Research & Synthesize blocks via Gemini 3 Pro..."} 
                                className="flex-1 bg-transparent outline-none text-xs font-bold text-slate-800 placeholder:text-slate-300 px-1" 
                                value={aiPrompt} 
                                onChange={(e) => setAiPrompt(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && (viewMode === 'ai' ? handleAiSynthesizeMermaid() : handleExecuteRefinement())} 
                              />
                              {attachedFiles.length > 0 && (
                                  <div className="flex gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in shrink-0">
                                      {attachedFiles.map((f, i) => (
                                          <div key={i} className="flex items-center gap-1 text-[8px] font-black text-indigo-600 uppercase italic">
                                            {f.type.startsWith('image/') ? <ImageIcon size={10} /> : <FileJson size={10} />} 
                                            {f.name}
                                            <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-rose-500"><X size={10}/></button>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 px-1">
                              <input type="file" ref={fileInputRef} className="hidden" multiple accept=".js,.ts,.json,.txt,image/*" onChange={handleFileUpload} />
                              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all" title="Attach context (Scripts or Style PNGs)"><Paperclip size={18} /></button>
                              <button onClick={() => viewMode === 'ai' ? handleAiSynthesizeMermaid() : handleExecuteRefinement()} disabled={(!aiPrompt.trim() && attachedFiles.length === 0) || isAiGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-10 shadow-lg flex items-center gap-2"><Zap size={12} /> Synthesize</button>
                          </div>
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 italic flex items-center gap-2"><Globe size={10} className="text-indigo-500" /> Research Grounding: Active • Style Analysis: Enabled • Gemini 3 Pro Thinking</p>
                  </div>
              </div>
          )}

          <div className="flex-1 flex overflow-hidden">
              {viewMode === 'ai' ? (
                  <>
                      <div className="w-full h-full">
                          <ArchitectureCanvas 
                              aiNodes={design.nodes} 
                              aiEdges={design.edges} 
                              isThinking={false} 
                              thoughts={[]} 
                              mermaidCode={mermaidCode}
                              onMermaidChange={setMermaidCode}
                              onDesignChange={setDesign}
                              onSelectNode={setSelectedNodeId} 
                              onAddNode={(t, x, y) => handleAddManualNode(t, 'New Entity', x, y)} 
                              selectedNodeId={selectedNodeId}
                          />
                      </div>
                  </>
              ) : (
                  <>
                      <div className="w-[300px] bg-white border-r border-slate-200 flex flex-col shrink-0">
                          <div className="p-6 border-b border-slate-50 flex-1 overflow-y-auto custom-scrollbar">
                              {!selectedNode ? (
                                  <div className="space-y-8">
                                      {groundingSources.length > 0 && (
                                          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 space-y-3">
                                              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                                  <Globe size={14} />
                                                  <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Research Grounding</h4>
                                              </div>
                                              <div className="space-y-2">
                                                  {groundingSources.map((source, idx) => (
                                                      <a 
                                                        key={idx} 
                                                        href={source.web?.uri} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="block p-2 bg-white rounded-xl border border-indigo-100 hover:border-indigo-400 transition-all group"
                                                      >
                                                          <div className="flex justify-between items-start gap-2">
                                                              <span className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{source.web?.title}</span>
                                                              <ExternalLink size={10} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
                                                          </div>
                                                      </a>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                      <div>
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Infrastructure</h4>
                                          <div className="grid grid-cols-1 gap-2.5">
                                              <PaletteItem type="cloud" icon={Cloud} label="Cloud Service" color="sky" />
                                              <PaletteItem type="api" icon={Activity} label="API Gateway" color="indigo" />
                                              <PaletteItem type="server" icon={Server} label="Application" color="rose" />
                                              <PaletteItem type="container" icon={Box} label="Resource Group" color="slate" />
                                          </div>
                                      </div>
                                      <div>
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Data Layer</h4>
                                          <div className="grid grid-cols-1 gap-2.5">
                                              <PaletteItem type="database" icon={Database} label="Database" color="indigo" />
                                              <PaletteItem type="storage" icon={Layers} label="Data Storage" color="blue" />
                                              <PaletteItem type="simple_table" icon={TableProperties} label="Entity Model" color="emerald" />
                                              <PaletteItem type="table" icon={Table} label="Detailed Table" color="indigo" />
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="space-y-8 animate-fade-in">
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">Property Inspector</h4><button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><X size={14}/></button></div>
                                      <div className="space-y-3"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Resource Label</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 uppercase italic outline-none focus:ring-1 focus:ring-indigo-600" value={selectedNode.label} onChange={(e) => updateSelectedNode({ label: e.target.value })} /></div>
                                      <div className="space-y-3">
                                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Node Dimensions</label>
                                          <div className="grid grid-cols-2 gap-3">
                                              <div><label className="text-[8px] text-slate-400 uppercase">Width</label><input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" value={selectedNode.width || 180} onChange={(e) => updateSelectedNode({ width: parseInt(e.target.value) })} /></div>
                                              <div><label className="text-[8px] text-slate-400 uppercase">Height</label><input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" value={selectedNode.height || 80} onChange={(e) => updateSelectedNode({ height: parseInt(e.target.value) })} /></div>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                          <div className="p-6 bg-slate-50"><button onClick={() => { if(confirm("Purge canvas?")) setDesign({ nodes: [], edges: [], classification: 'SYSTEM_ARCHITECTURE' }); }} className="w-full py-3.5 rounded-xl border border-slate-200 text-[9px] font-black uppercase text-slate-400 hover:text-rose-600 transition-all">Clear Session</button></div>
                      </div>
                      <div className="flex-1 bg-slate-50 relative"><ArchitectureCanvas ref={canvasRef} aiNodes={design.nodes} aiEdges={design.edges} isThinking={false} thoughts={[]} isLinkingMode={isLinkingMode} onDesignChange={setDesign} onSelectNode={setSelectedNodeId} onAddNode={(t, x, y) => handleAddManualNode(t, 'New Entity', x, y)} selectedNodeId={selectedNodeId} mermaidCode={mermaidCode} onMermaidChange={setMermaidCode} /></div>
                  </>
              )}
          </div>
      </div>
    </div>
  );
};

export default StandaloneArchitecture;
