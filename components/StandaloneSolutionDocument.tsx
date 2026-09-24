import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Layers, Download, CheckCircle2, Clock, Cpu, X, Menu, Sparkles,
  ChevronDown, Save, ShieldCheck, HardDrive, Terminal, FileCheck, Zap, 
  List, Table, Activity, ClipboardList, History, Eye, Home, ArrowLeft,
  Plus, Trash2, Loader2, Lock, Database, Upload, BrainCircuit,
  Bold, Italic, List as ListIcon, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Type, Image as ImageIcon, Table as TableIcon, FileEdit, Maximize, Minimize,
  Printer, MoreHorizontal, PlusCircle, Trash, RefreshCw
} from 'lucide-react';
import { generateSolutionDocumentPro, saveHistory, getHistory, deleteHistory, pushLearnedContext } from '../services/geminiService';

// --- CLAIRE AI TERMINOLOGY MAPPER ---
const mapInformaticaTerms = (text: string) => {
  let mapped = text;
  const mappings = [
    { from: /\bIICS\b/gi, to: "Informatica IDMC" },
    { from: /\bInformatica Cloud\b/gi, to: "Informatica IDMC Cloud" },
    { from: /\bSecure Agent\b/gi, to: "IDMC Secure Agent (Runtime)" },
    { from: /\bPowerCenter\b/gi, to: "Informatica PowerCenter (On-Prem)" },
    { from: /\bData Quality\b/gi, to: "Informatica Cloud Data Quality (CDQ)" },
    { from: /\bMetadata Manager\b/gi, to: "Informatica EDC (Enterprise Data Catalog)" },
    { from: /\bGlossary\b/gi, to: "Informatica Axon Data Governance" },
    { from: /\bMDM Hub\b/gi, to: "Informatica MDM (Multi-Domain Hub)" }
  ];
  mappings.forEach(m => { mapped = mapped.replace(m.from, m.to); });
  return mapped;
};

/**
 * Word-Style Pro Editor Ribbon
 */
const WordRibbon: React.FC<{ onCommand: (cmd: string, val?: string) => void }> = ({ onCommand }) => (
  <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1 flex-wrap shrink-0">
    <div className="flex items-center gap-1 px-2 border-r border-slate-200 mr-2">
      <button onClick={() => onCommand('bold')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Bold"><Bold size={16} /></button>
      <button onClick={() => onCommand('italic')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Italic"><Italic size={16} /></button>
    </div>
    
    <div className="flex items-center gap-1 px-2 border-r border-slate-200 mr-2">
      <button onClick={() => onCommand('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Bullet List"><ListIcon size={16} /></button>
      <button onClick={() => onCommand('insertOrderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Numbered List"><ListOrdered size={16} /></button>
    </div>

    <div className="flex items-center gap-1 px-2 border-r border-slate-200 mr-2">
      <button onClick={() => onCommand('justifyLeft')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Align Left"><AlignLeft size={16} /></button>
      <button onClick={() => onCommand('justifyCenter')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Align Center"><AlignCenter size={16} /></button>
      <button onClick={() => onCommand('justifyRight')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Align Right"><AlignRight size={16} /></button>
    </div>

    <div className="flex items-center gap-1 px-2">
      <button onClick={() => {
        const url = prompt('Enter Image URL:');
        if (url) onCommand('insertImage', url);
      }} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Insert Image"><ImageIcon size={16} /></button>
      <button onClick={() => onCommand('formatBlock', 'h2')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Heading"><Type size={16} /></button>
      <button onClick={() => {
        const rows = prompt('Rows:', '3');
        const cols = prompt('Cols:', '3');
        if (rows && cols) {
          let table = `<table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px;">`;
          for(let r=0; r<parseInt(rows); r++) {
            table += '<tr>';
            for(let c=0; c<parseInt(cols); c++) table += '<td style="padding: 8px; border: 1px solid #ddd;">Data</td>';
            table += '</tr>';
          }
          table += '</table><p><br/></p>';
          onCommand('insertHTML', table);
        }
      }} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Insert Table"><TableIcon size={16} /></button>
    </div>
  </div>
);

/**
 * Mermaid Studio Component
 */
const MermaidStudio: React.FC<{ type: string, limit?: number, diagrams: any[], onUpdate: (d: any[]) => void }> = ({ type, limit = 2, diagrams = [], onUpdate }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  const activeDiagram = diagrams[activeIdx] || { title: 'Default', code: '', description: '' };

  useEffect(() => {
    let isMounted = true;
    const render = async () => {
      if (!window.mermaid) return;
      
      try {
        const cleanCode = (activeDiagram.code || '').replace(/```mermaid/g, '').replace(/```/g, '').trim();
        if (!cleanCode || cleanCode === 'erDiagram' || cleanCode === 'graph TD' || cleanCode === 'sequenceDiagram') { 
          if (isMounted) setSvg(''); 
          return; 
        }
        
        window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose', fontFamily: 'Inter, sans-serif' });
        const uniqueId = `mermaid-svg-${type}-${activeIdx}-${Date.now()}`;
        const { svg: generatedSvg } = await window.mermaid.render(uniqueId, cleanCode);
        if (isMounted) { setSvg(generatedSvg); setError(false); }
      } catch (err) { 
        if (isMounted) { setError(true); setSvg(''); }
      }
    };
    render();
    return () => { isMounted = false; };
  }, [activeDiagram.code, activeIdx, type]);

  const addModel = () => {
    if (diagrams.length >= limit) return;
    const newList = [...diagrams, { 
      title: `Model ${diagrams.length + 1}`, 
      code: type === 'er' ? 'erDiagram\n  ENTITY1 ||--o{ ENTITY2 : rel' : 'graph TD\n  A --> B', 
      description: 'System-generated step description.' 
    }];
    onUpdate(newList);
    setActiveIdx(newList.length - 1);
  };

  const updateCurrent = (field: string, value: string) => {
    const newList = [...diagrams];
    newList[activeIdx] = { ...newList[activeIdx], [field]: value };
    onUpdate(newList);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-hide">
        {diagrams.map((d, i) => (
          <button key={i} onClick={() => setActiveIdx(i)} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border-2 ${activeIdx === i ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
            {String(d.title || `MODEL ${i+1}`).toUpperCase()}
          </button>
        ))}
        {diagrams.length < limit && (
          <button onClick={addModel} className="p-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 hover:text-indigo-600 transition-all"><Plus size={14} /></button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[0]">
        <textarea value={String(activeDiagram.code || '')} onChange={(e) => updateCurrent('code', e.target.value)} className="flex-1 bg-slate-900 text-indigo-400 font-mono text-xs p-6 rounded-[2.5rem] outline-none border-4 border-transparent focus:border-indigo-500/20 transition-all shadow-inner resize-none custom-scrollbar" placeholder="Enter Mermaid Code..." />
        <div className="flex flex-col space-y-4 h-full overflow-hidden">
           <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 overflow-auto flex flex-col items-center justify-center shadow-inner relative group">
             {error ? <div className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Syntax Rendering Error</div> : <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full" />}
           </div>
           <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shrink-0">
             <div className="flex items-center gap-2 mb-2 text-indigo-600 font-black text-[9px] uppercase tracking-widest"><Sparkles size={14} /> Functional Context Description</div>
             <textarea value={String(activeDiagram.description || '')} onChange={(e) => updateCurrent('description', e.target.value)} className="w-full text-xs text-slate-500 italic font-medium leading-relaxed bg-transparent border-none outline-none resize-none" placeholder="Describe architectural steps..." rows={2} />
           </div>
        </div>
      </div>
    </div>
  );
};

const StandaloneSolutionDocument: React.FC<{ initialView?: string, initialData?: any }> = ({ initialView = 'requests', initialData }) => {
  const [appState, setAppState] = useState(initialView); // 'requests', 'landing', 'parsing', 'dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTabId, setActiveTabId] = useState('intro');
  const [subTab, setSubTab] = useState('er'); 
  const [statusMsg, setStatusMsg] = useState('');
  
  // Editor States
  const [isEditMode, setIsEditMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // History & Management States
  const [taskName, setTaskName] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Current Active Doc states
  const [docData, setDocData] = useState<any>({ title: '', sections: { vhistory: [], abbreviations: [], tech: [] } });
  const [erModels, setErModels] = useState<any[]>([]);
  const [archFlows, setArchFlows] = useState<any[]>([]);
  const [processFlows, setProcessFlows] = useState<any[]>([]);
  const [physicalModel, setPhysicalModel] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRequests(getHistory('SolutionDocumentPro'));
    if (initialData) {
        setDocData(initialData.data.docData);
        setErModels(initialData.data.erModels);
        setArchFlows(initialData.data.archFlows);
        setProcessFlows(initialData.data.processFlows);
        setPhysicalModel(initialData.data.physicalModel || []);
        setArtifacts(initialData.data.artifacts || []);
        setAppState('dashboard');
    }
  }, [initialData]);

  const handleStartParsing = async (file: File) => {
    if (!taskName || !file || !window.mammoth) return;
    setAppState('parsing');
    setStatusMsg("Learning context from document 1:1...");
    
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await window.mammoth.convertToHtml({ arrayBuffer });
        const normalizedContext = mapInformaticaTerms(result.value).substring(0, 15000); 

        setStatusMsg("Consulting CLAIRE Engine: Synthesizing technical modules...");
        
        const aiResponse = await generateSolutionDocumentPro(taskName, normalizedContext);
        
        const initialEr = [{ title: 'Master ERD', code: aiResponse.initialEr || 'erDiagram', description: 'Logical entities identified in specification.' }];
        const initialArch = [{ title: 'Architecture Map', code: aiResponse.initialArch || 'graph TD', description: 'Integration flow from Source to Target.' }];
        const initialProcess = [{ title: 'Business Process', code: aiResponse.initialProcess || 'sequenceDiagram', description: 'Step-by-step process orchestration.' }];
        const initialArtifacts = [{ id: Date.now(), name: 'IDMC_Taskflow_Sync', desc: 'Main orchestration process', location: '/idmc/prod/common/' }];

        setDocData({ title: taskName, sections: aiResponse });
        setErModels(initialEr);
        setArchFlows(initialArch);
        setProcessFlows(initialProcess);
        setArtifacts(initialArtifacts);

        pushLearnedContext(
            'SolutionDocumentPro', 
            `Synthesized technical spec for "${taskName}". Identified ${initialEr.length} ER models and ${initialArch.length} Architecture flows.`,
            ['SpecPro', taskName, file.name]
        );

        saveHistory('SolutionDocumentPro', taskName, {
            docData: { title: taskName, sections: aiResponse },
            erModels: initialEr,
            archFlows: initialArch,
            processFlows: initialProcess,
            physicalModel: [],
            artifacts: initialArtifacts
        }, [file.name]);

        setRequests(getHistory('SolutionDocumentPro'));
        setAppState('dashboard');
        setActiveTabId('intro');
      } catch (err) {
        console.error(err);
        setAppState('landing');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleEditorCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      updateSectionContent(activeTabId, editorRef.current.innerHTML);
    }
  };

  const updateSectionContent = (tabId: string, content: any) => {
    setDocData((prev: any) => {
      const newSections = { ...prev.sections };
      newSections[tabId] = content;
      return { ...prev, sections: newSections };
    });
  };

  const updateStructuredSection = (tabId: string, index: number, field: string, value: any) => {
    setDocData((prev: any) => {
      const newSections = { ...prev.sections };
      const newList = [...(newSections[tabId] || [])];
      newList[index] = { ...newList[index], [field]: value };
      newSections[tabId] = newList;
      return { ...prev, sections: newSections };
    });
  };

  const addRowToSection = (tabId: string, emptyObj: any) => {
    setDocData((prev: any) => {
      const newSections = { ...prev.sections };
      newSections[tabId] = [...(newSections[tabId] || []), emptyObj];
      return { ...prev, sections: newSections };
    });
  };

  const removeRowFromSection = (tabId: string, index: number) => {
    setDocData((prev: any) => {
      const newSections = { ...prev.sections };
      newSections[tabId] = (newSections[tabId] || []).filter((_: any, i: number) => i !== index);
      return { ...prev, sections: newSections };
    });
  };

  const renderTabContent = () => {
    const s = docData.sections || {};
    const editableRichTabs = ['intro', 'governance', 'security', 'deployment', 'objectives'];
    const isRichEdit = isEditMode && editableRichTabs.includes(activeTabId);

    if (isRichEdit) {
      let initialContent = "";
      if (activeTabId === 'objectives') initialContent = String(s.objectives?.content || '');
      else initialContent = String(s[activeTabId] || '');

      return (
        <div className="bg-white border border-slate-200 rounded-[3rem] shadow-xl flex flex-col animate-fade-in h-[700px] overflow-hidden">
          <WordRibbon onCommand={handleEditorCommand} />
          <div 
            ref={editorRef}
            contentEditable 
            className="flex-1 p-12 outline-none overflow-y-auto prose prose-slate max-w-none custom-scrollbar"
            dangerouslySetInnerHTML={{ __html: initialContent }}
            onBlur={(e) => {
                if (activeTabId === 'objectives') {
                    updateSectionContent(activeTabId, { ...s.objectives, content: e.currentTarget.innerHTML });
                } else {
                    updateSectionContent(activeTabId, e.currentTarget.innerHTML);
                }
            }}
          />
        </div>
      );
    }

    switch(activeTabId) {
      case 'vhistory':
        return (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm animate-fade-in">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Version Control Registry</h3>
                <button onClick={() => addRowToSection('vhistory', { version: '1.x', date: new Date().toLocaleDateString(), by: 'Architect', reason: 'New Revision' })} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md">
                    <Plus size={14} /> Add Log Entry
                </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Version', 'Date', 'By', 'Reason for Change', ''].map(h => <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(s.vhistory || []).map((v: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 group">
                    <td className="px-8 py-4"><input value={String(v.version)} onChange={(e) => updateStructuredSection('vhistory', i, 'version', e.target.value)} className="w-full bg-transparent font-bold text-slate-700 text-sm outline-none focus:text-indigo-600" /></td>
                    <td className="px-8 py-4"><input value={String(v.date)} onChange={(e) => updateStructuredSection('vhistory', i, 'date', e.target.value)} className="w-full bg-transparent text-slate-500 text-xs outline-none focus:text-indigo-600" /></td>
                    <td className="px-8 py-4"><input value={String(v.by)} onChange={(e) => updateStructuredSection('vhistory', i, 'by', e.target.value)} className="w-full bg-transparent font-black text-[10px] uppercase text-slate-400 outline-none focus:text-indigo-600" /></td>
                    <td className="px-8 py-4"><input value={String(v.reason)} onChange={(e) => updateStructuredSection('vhistory', i, 'reason', e.target.value)} className="w-full bg-transparent text-slate-400 text-xs italic outline-none focus:text-indigo-600" /></td>
                    <td className="px-8 py-4 text-right">
                        <button onClick={() => removeRowFromSection('vhistory', i)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                            <Trash size={16} />
                        </button>
                    </td>
                  </tr>
                ))}
                {(!s.vhistory || s.vhistory.length === 0) && (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-300 italic text-xs uppercase tracking-widest">No history recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'intro': return <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm prose prose-slate max-w-none prose-p:text-lg animate-fade-in" dangerouslySetInnerHTML={{ __html: String(s.intro || '') }} />;
      case 'abbreviations': return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Terminology Key</h3>
              <button onClick={() => addRowToSection('abbreviations', { term: 'NEW_TERM', desc: 'Description of the acronym or technical phrase.' })} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                <Plus size={16}/> Add Abbreviation
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(s.abbreviations || []).map((a: any, i: number) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col relative group hover:border-indigo-200 transition-all">
                    <button onClick={() => removeRowFromSection('abbreviations', i)} className="absolute top-4 right-4 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash size={14}/>
                    </button>
                    <input value={String(a.term)} onChange={(e) => updateStructuredSection('abbreviations', i, 'term', e.target.value)} className="text-indigo-600 font-black text-xl mb-1 tracking-tighter bg-transparent outline-none focus:ring-1 focus:ring-indigo-100 rounded px-1" />
                    <textarea value={String(a.desc)} onChange={(e) => updateStructuredSection('abbreviations', i, 'desc', e.target.value)} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight bg-transparent outline-none resize-none px-1" rows={2} />
                </div>
            ))}
            {(!s.abbreviations || s.abbreviations.length === 0) && (
                <div className="col-span-full py-32 text-center text-slate-300 italic text-xs uppercase tracking-widest">No entries defined.</div>
            )}
           </div>
        </div>
      );
      case 'objectives': return (
        <div className="space-y-12 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: String(s.objectives?.content || '') }} />
          <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap size={200} /></div>
             <div className="relative z-10 flex items-center gap-3 mb-6 font-black text-lg uppercase tracking-widest"><FileCheck size={24}/> Solution In-Scope Items</div>
             <div className="relative z-10 text-indigo-50 font-medium leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: String(s.objectives?.scope || '') }} />
          </div>
        </div>
      );
      case 'datamodel': return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
              <button onClick={()=>setSubTab('er')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${subTab === 'er' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>ER DIAGRAM (15 MAX)</button>
              <button onClick={()=>setSubTab('physical')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${subTab === 'physical' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>PHYSICAL DATA MODEL</button>
           </div>
           {subTab === 'er' ? <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm min-h-[600px]"><MermaidStudio type="er" limit={15} diagrams={erModels} onUpdate={setErModels} /></div> : 
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl min-h-[600px]"><PhysicalExplorer objects={physicalModel} onAddSql={(newT) => setPhysicalModel(prev => [...prev, ...newT])} /></div>}
        </div>
      );
      case 'governance': return <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm prose prose-slate max-w-none prose-strong:text-indigo-600 animate-fade-in"><div className="flex items-center gap-3 mb-8 text-indigo-600 font-black uppercase text-xl"><ShieldCheck size={28}/> Data Governance (CLAIRE Powered)</div><div dangerouslySetInnerHTML={{ __html: String(s.governance || '') }} /></div>;
      case 'architecture': return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
              <button onClick={()=>setSubTab('arch')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${subTab === 'arch' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>ARCHITECTURE FLOW (2 MAX)</button>
              <button onClick={()=>setSubTab('process')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${subTab === 'process' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>PROCESS FLOW (2 MAX)</button>
           </div>
           <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm min-h-[600px]">
              <MermaidStudio type={subTab} limit={2} diagrams={subTab === 'arch' ? archFlows : processFlows} onUpdate={subTab === 'arch' ? setArchFlows : setProcessFlows} />
           </div>
        </div>
      );
      case 'tech': return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm animate-fade-in">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Platform Component Stack</h3>
                <button onClick={() => addRowToSection('tech', { layer: 'New Layer', component: 'Component Name' })} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md">
                    <Plus size={14} /> Add Platform Element
                </button>
            </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecture Layer</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Component</th><th className="px-8 py-5"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(s.tech || []).map((t: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 group">
                  <td className="px-8 py-5 w-1/3">
                    <input value={String(t.layer)} onChange={(e) => updateStructuredSection('tech', i, 'layer', e.target.value)} className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase w-full outline-none focus:ring-1 focus:ring-indigo-200" />
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-800 text-sm">
                    <div className="flex items-center gap-2">
                        <input value={String(t.component)} onChange={(e) => updateStructuredSection('tech', i, 'component', e.target.value)} className="bg-transparent w-full outline-none focus:text-indigo-600" />
                        {String(t.component).toLowerCase().includes('informatica') && <Zap size={14} className="text-orange-500 fill-orange-500 shrink-0" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => removeRowFromSection('tech', i)} className="p-2 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!s.tech || s.tech.length === 0) && (
                  <tr><td colSpan={3} className="py-20 text-center text-slate-300 italic text-xs uppercase tracking-widest">No stack elements defined.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      );
      case 'security': return <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm prose prose-slate max-w-none animate-fade-in"><div className="flex items-center gap-3 mb-8 text-slate-900 font-black uppercase text-xl">
        <Lock size={24}/> Security & Privacy deployment</div><div dangerouslySetInnerHTML={{ __html: String(s.security || '') }} /></div>;
      case 'architect': return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Terminal size={20}/> Artifact Repository</h3>
              <button onClick={()=>setArtifacts([...artifacts, {id: Date.now(), name:'', desc:'', location:''}])} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 flex items-center gap-2 transition-all"><Plus size={14}/> Add Artifact</button>
           </div>
           <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="px-8 py-5">Artifact Name</th><th className="px-8 py-5">Description</th><th className="px-8 py-5">Folder Location</th><th className="px-8 py-5"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {artifacts.map((art) => (
                    <tr key={art.id} className="group hover:bg-slate-50">
                      <td className="px-8 py-4 font-bold"><input value={String(art.name)} onChange={(e)=>setArtifacts(artifacts.map(a=>a.id === art.id ? {...a, name: e.target.value} : a))} className="w-full bg-transparent outline-none focus:text-indigo-600 text-sm" placeholder="e.g. sp_MASTER_SYNC"/></td>
                      <td className="px-8 py-4"><input value={String(art.desc)} onChange={(e)=>setArtifacts(artifacts.map(a=>a.id === art.id ? {...a, desc: e.target.value} : a))} className="w-full bg-transparent outline-none text-slate-500 text-xs" placeholder="Description..."/></td>
                      <td className="px-8 py-4 font-mono text-[10px]"><input value={String(art.location)} onChange={(e)=>setArtifacts(artifacts.map(a=>a.id === art.id ? {...a, location: e.target.value} : a))} className="w-full bg-transparent outline-none text-slate-400" placeholder="/idmc/uat/repo/"/></td>
                      <td className="px-8 py-4 text-right"><button onClick={()=>setArtifacts(artifacts.filter(a=>a.id !== art.id))} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash size={16}/></button></td>
                    </tr>
                  ))}
                  {artifacts.length === 0 && (
                      <tr><td colSpan={4} className="py-20 text-center text-slate-300 italic text-xs uppercase tracking-widest">No technical artifacts logged.</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      );
      case 'deployment': return <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm prose prose-slate max-w-none animate-fade-in"><div className="flex items-center gap-3 mb-8 text-slate-900 font-black uppercase text-xl"><HardDrive size={24}/> Production Deployment & Cutover</div><div dangerouslySetInnerHTML={{ __html: String(s.deployment || '') }} /></div>;
      default: return null;
    }
  };

  const tabsList = [
    { id: 'vhistory', title: 'Version History', icon: Clock },
    { id: 'intro', title: 'Introduction', icon: FileText },
    { id: 'abbreviations', title: 'Abbreviations', icon: List },
    { id: 'objectives', title: 'Business Objectives', icon: ClipboardList },
    { id: 'datamodel', title: 'Data Model', icon: Database },
    { id: 'governance', title: 'Data Governance', icon: ShieldCheck },
    { id: 'architecture', title: 'Architecture', icon: Activity },
    { id: 'tech', title: 'Technology', icon: Cpu },
    { id: 'security', title: 'Security & Privacy', icon: Lock },
    { id: 'architect', title: 'Project Architect', icon: Terminal },
    { id: 'deployment', title: 'Production Deployment', icon: HardDrive }
  ];

  if (appState === 'requests') {
    return (
      <div className="h-full bg-slate-50 font-sans flex flex-col overflow-hidden animate-fade-in">
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 shadow-sm z-10">
           <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl"><FileCheck size={24} /></div>
              <div><h1 className="font-black text-xl tracking-tighter uppercase m-0 leading-none">Solution Document Pro</h1><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Spec Synthesis</span></div>
           </div>
           <button onClick={()=>setAppState('landing')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-indigo-700 flex items-center gap-3 transition-all">
              <Plus size={18}/> Create New Solution Task
           </button>
        </header>
        <main className="flex-1 p-10 max-w-7xl mx-auto w-full space-y-10 overflow-y-auto custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Tasks', val: requests.length, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Validated', val: requests.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Synthesized', val: '99%', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'CLAIRE Sync', val: 'Active', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((s,i)=>(
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                   <div className={`${s.bg} ${s.color} p-4 rounded-3xl`}><s.icon size={28}/></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p><h3 className="text-2xl font-black text-slate-800">{s.val}</h3></div>
                </div>
              ))}
           </div>
           <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <h2 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Solution Architecture Queue</h2>
                 <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm"><History size={14} className="text-slate-400"/><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">History Logs Active</span></div>
              </div>
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{['ID', 'Task Title', 'Date', 'Type', 'Status', 'Actions'].map(h=><th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>)}</tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {requests.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No tasks found. Click "Create New Solution Task" to begin.</td></tr>
                    ) : requests.map(r=>(
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={()=>{ 
                          setDocData(r.data.docData);
                          setErModels(r.data.erModels);
                          setArchFlows(r.data.archFlows);
                          setProcessFlows(r.data.processFlows);
                          setPhysicalModel(r.data.physicalModel || []);
                          setArtifacts(r.data.artifacts || []);
                          setAppState('dashboard'); 
                          setActiveTabId('intro'); 
                        }}>
                        <td className="px-8 py-5 font-black text-xs text-indigo-600">{r.id.slice(-4)}</td>
                        <td className="px-8 py-5 font-bold text-slate-700 text-sm">{r.summary}</td>
                        <td className="px-8 py-5 text-slate-400 text-xs font-medium">{r.date}</td>
                        <td className="px-8 py-5 text-slate-400 text-xs font-black uppercase">Solution Spec</td>
                        <td className="px-8 py-5"><div className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-tighter"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div>Completed</div></td>
                        <td className="px-8 py-5 flex items-center gap-2">
                            <button className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Eye size={16}/></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteHistory(r.id); setRequests(getHistory('SolutionDocumentPro')); }} className="p-2 rounded-xl text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </main>
      </div>
    );
  }

  if (appState === 'landing') {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center p-12 font-sans animate-fade-in overflow-y-auto custom-scrollbar">
        <div className="max-w-xl w-full text-center relative py-12">
          
          <div className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mx-auto mb-10 ring-8 ring-slate-800">
            <FileCheck size={48} />
          </div>
          
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Initiate Spec Sync</h1>
          
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl space-y-8 text-left border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 opacity-40"></div>
            
            <div className="flex items-center justify-between mb-2 relative z-10">
               <button 
                onClick={() => setAppState('requests')}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all group"
               >
                 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                 <span className="font-black text-[9px] uppercase tracking-widest">Back to Queue</span>
               </button>
               <div className="bg-indigo-50 px-3 py-1 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest">Synthesis Engine</div>
            </div>

            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Session Identifier</label>
              <input 
                type="text" 
                value={taskName} 
                onChange={(e)=>setTaskName(e.target.value)} 
                placeholder="Project Name (e.g. Finance Hub)..." 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner" 
              />
            </div>
            
            <div 
              onClick={()=>fileInputRef.current?.click()} 
              className={`border-4 border-dashed rounded-[3rem] p-12 text-center transition-all group shadow-sm relative z-10 ${pendingFile ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 cursor-pointer'}`}
            >
              {pendingFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 size={48} className="text-emerald-500 mb-4 animate-bounce" />
                    <p className="font-black text-slate-800 text-lg uppercase italic tracking-tighter">{pendingFile.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setPendingFile(null); }} className="mt-4 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">Change Specification</button>
                  </div>
              ) : (
                  <>
                    <Upload size={32} className="mx-auto text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-black text-slate-800 text-lg">Upload technical spec (.docx)</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest leading-relaxed text-center">AI will map 1:1 to Informatica IDMC modules</p>
                  </>
              )}
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" accept=".docx" onChange={(e)=> e.target.files && setPendingFile(e.target.files[0])} />
            
            <button 
                onClick={() => pendingFile && handleStartParsing(pendingFile)}
                disabled={!pendingFile || !taskName.trim()}
                className={`w-full py-5 rounded-[2rem] text-white font-black text-base uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${!pendingFile || !taskName.trim() ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95'}`}
            >
                <Sparkles size={20} /> Generate Solution Blueprint
            </button>

            <div className="flex items-center gap-4 bg-indigo-50 p-5 rounded-[2rem] border border-indigo-100 relative z-10">
               <Zap size={20} className="text-indigo-600 shrink-0"/>
               <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-tight">CLAIRE Intelligence Active. Auto-normalizing legacy terms during technical synthesis.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'parsing') {
    return (
      <div className="h-full bg-slate-900 flex flex-col items-center justify-center text-center p-6 font-sans animate-fade-in">
        <Loader2 className="text-indigo-600 animate-spin mb-8" size={64} />
        <h2 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase italic">Synthesis in Progress...</h2>
        <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse max-w-sm leading-relaxed">{statusMsg}</p>
        <div className="mt-16 w-48 h-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
           <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    );
  }

  const editableRichTabs = ['intro', 'governance', 'security', 'deployment', 'objectives'];
  const isCurrentTabRichEditable = editableRichTabs.includes(activeTabId);

  return (
    <div className="flex h-full bg-[#F8F9FE] text-slate-900 font-sans overflow-hidden animate-fade-in">
      <aside className={`${sidebarOpen ? 'w-80' : 'w-24'} bg-white border-r border-slate-200 flex flex-col transition-all duration-500 shadow-xl z-50 shrink-0 relative`}>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className={`flex items-center gap-4 ${!sidebarOpen && 'hidden'}`}>
             <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl"><FileCheck size={22} /></div>
             <div><h1 className="font-black text-xl tracking-tighter leading-none uppercase m-0">Spec Pro</h1><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Solution Designer</span></div>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-300 transition-all">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-1.5 scrollbar-hide">
          <p className={`text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 mb-4 ${!sidebarOpen && 'hidden'}`}>Logical Modules</p>
          {tabsList.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTabId(tab.id); setIsEditMode(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all group ${activeTabId === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}>
              <div className="shrink-0 group-hover:scale-110 transition-transform"><tab.icon size={18} /></div>
              {sidebarOpen && <span className="text-[11px] font-black truncate tracking-tight uppercase">{tab.title}</span>}
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-50">
           <button onClick={()=>setAppState('requests')} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
             <Home size={14}/> {sidebarOpen && "Return Queue"}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 px-12 flex items-center justify-between shrink-0 z-40 bg-white/50 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse ring-4 ring-blue-50"></div>
                <h2 className="font-black text-[11px] text-slate-800 uppercase tracking-widest truncate max-w-[300px]">{String(docData.title)}</h2>
             </div>
             <div className="bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                </div>
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest leading-none">Cross-Module Sync Active</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {isCurrentTabRichEditable && (
                <button 
                    onClick={() => setIsEditMode(!isEditMode)} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${isEditMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    {isEditMode ? <><Save size={14}/> Save Progress</> : <><FileEdit size={14}/> Pro Editor Mode</>}
                </button>
             )}
             <div className="h-10 w-px bg-slate-200 mx-2"></div>
             <button onClick={() => { if(confirm("This will overwrite current edits. Continue?")) setAppState('landing'); }} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden md:inline">Re-Synthesize</span>
             </button>
             <button className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest ring-4 ring-slate-100"><Download size={14} className="mr-2 inline"/> Export Context</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 pt-4 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12 pb-24">
            <div className="flex items-end justify-between border-b-2 border-slate-200 pb-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-3"><div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20"><Sparkles size={16} /></div><span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em]">Module Identification</span></div>
                  <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] m-0">{tabsList.find(t=>t.id === activeTabId)?.title}</h1>
               </div>
               <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm"><CheckCircle2 size={14}/> 1:1 Synchronized</div>
                  {isEditMode && isCurrentTabRichEditable && <div className="text-[10px] font-black text-indigo-600 animate-pulse uppercase tracking-widest">Editing via MS Word Plugin Engine...</div>}
                  {!isCurrentTabRichEditable && <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inline Table Editing Active</div>}
               </div>
            </div>
            <div className="min-h-[600px]">{renderTabContent()}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Physical Data Catalog Component
const PhysicalExplorer: React.FC<{ objects: any[], onAddSql: (d: any[]) => void }> = ({ objects, onAddSql }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  
  const parseSql = (sql: string) => {
    const tables: any[] = [];
    const tableRegex = /CREATE\s+TABLE\s+(?:(?:(\w+)\.)?(\w+)|"(\w+)"\."(\w+)")\s*\(([\s\S]*?)\);/gi;
    let m;
    while ((m = tableRegex.exec(sql)) !== null) {
      const sch = m[1] || m[3] || 'dbo';
      const nm = m[2] || m[4];
      const cols = m[5].split(',').map(l => {
        const p = l.trim().split(/\s+/);
        if (p.length < 2) return null;
        return { name: p[0].replace(/"/g, ''), type: p[1], extra: p.slice(2).join(' ') };
      }).filter(Boolean);
      tables.push({ id: `${sch}.${nm}-${Date.now()}`, schema: sch, name: nm, columns: cols });
    }
    return tables;
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic m-0">Physical Catalog explorer</h3>
          <button onClick={()=>fileRef.current?.click()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-xl hover:bg-indigo-700 flex items-center gap-2 uppercase tracking-widest transition-all"><Upload size={14}/> Import SQL Specification</button>
          <input type="file" ref={fileRef} className="hidden" accept=".sql" onChange={(e)=> {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => onAddSql(parseSql(ev.target?.result as string));
            r.readAsText(f);
          }}/>
       </div>
       <div className="bg-slate-800 rounded-[3rem] overflow-hidden divide-y divide-slate-700 shadow-2xl border border-white/5">
          {objects.length === 0 ? <div className="p-32 text-center text-slate-500 italic font-medium uppercase tracking-[0.2em]">No physical database metadata found.</div> : objects.map(o => (
            <div key={o.id} className="p-2">
               <button onClick={()=>setExpanded({...expanded, [o.id]: !expanded[o.id]})} className="w-full flex items-center justify-between px-8 py-6 hover:bg-slate-700/50 rounded-3xl transition-all group text-left">
                  <div className="flex items-center gap-4">
                     <div className="bg-slate-700 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors"><TableIcon size={18} className="text-white"/></div>
                     <div><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">SCHEMA: {String(o.schema)}</span><span className="font-mono text-sm text-slate-100 font-bold">{String(o.name)}</span></div>
                  </div>
                  <div className="flex items-center gap-6"><span className="text-[9px] font-black text-slate-400 uppercase bg-slate-700 px-3 py-1 rounded-full">{o.columns.length} FIELDS</span><ChevronDown size={20} className={`text-slate-500 transition-transform duration-500 ${expanded[o.id] ? 'rotate-180 text-indigo-400' : ''}`}/></div>
               </button>
               {expanded[o.id] && (
                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-900/30 animate-fade-in">
                    {o.columns.map((c: any, i: number)=>(
                      <div key={i} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 flex flex-col hover:border-indigo-500/50 transition-all">
                        <span className="text-indigo-400 font-mono text-[11px] mb-2 font-bold">{String(c.name)}</span>
                        <div className="flex items-center justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{String(c.type)}</span><span className="text-[8px] text-slate-600 truncate max-w-[80px] italic">{String(c.extra)}</span></div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          ))}
       </div>
    </div>
  );
};

export default StandaloneSolutionDocument;