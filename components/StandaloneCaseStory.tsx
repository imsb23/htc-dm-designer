import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MonitorPlay,
  Menu,
  X,
  Presentation,
  Clock,
  Plus,
  UploadCloud,
  CheckCircle2,
  Loader2,
  FileText,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Search,
  Trash2,
  Download,
  Edit3,
  Wand2,
  Code,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  PlusCircle,
  Home
} from 'lucide-react';

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------

const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(null);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const svgToPng = (svgStr: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
    img.src = svgData;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; 
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
    };
    img.onerror = (e) => reject(e);
  });
};

const simpleRenderToStaticMarkup = (node: any): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(simpleRenderToStaticMarkup).join('');
  
  if (React.isValidElement(node)) {
    const { type, props }: any = node;
    const children = simpleRenderToStaticMarkup(props.children);
    if (typeof type === 'string') return `<${type}>${children}</${type}>`;
    if (type === React.Fragment) return children;
    return children;
  }
  return '';
};

const useAutoFit = (content: any, enable: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!enable || !ref.current) return;
    const element = ref.current;
    let size = 100;
    element.style.fontSize = '100%';
    while (element.scrollHeight > element.clientHeight && size > 50) {
      size -= 5;
      element.style.fontSize = `${size}%`;
    }
  }, [content, enable]);
  return ref;
};

// -----------------------------------------------------------------------------
// DATA
// -----------------------------------------------------------------------------

const INITIAL_SLIDES: any[] = [
  { 
    id: 1, 
    title: "HTC Global Services | Enterprise Transformation", 
    type: "title",
    aiPrompt: "Generate a title slide for a digital transformation project.",
    notes: "Welcome everyone. Today we'll cover the digital transformation journey.",
    content: (
      <div className="text-center space-y-4">
        <p className="text-2xl text-gray-600 italic">Solution Blueprint Case Study</p>
        <div className="mt-12 p-6 bg-blue-50 rounded-lg inline-block text-blue-800 border border-blue-100">
          <p className="font-bold uppercase tracking-widest text-xs">Internal & Confidential</p>
          <p className="text-sm opacity-75 mt-1">{new Date().toLocaleDateString()}</p>
        </div>
      </div>
    )
  },
  { 
    id: 2, 
    title: "Executive Summary", 
    type: "content",
    aiPrompt: "Write 4 executive summary bullets for a cloud migration project.",
    notes: "Key objectives: Agility, Infrastructure alignment, and Partnership overview.",
    content: (
      <ul className="list-disc pl-6 space-y-4 text-xl text-gray-700">
        <li><strong>Synthesis:</strong> Unified siloed data into a governed cloud landscape.</li>
        <li><strong>Metrics:</strong> Improved data accuracy by 99% and reduced latency by 40%.</li>
        <li><strong>Governance:</strong> Implemented end-to-end lineage and cataloging.</li>
        <li><strong>Scale:</strong> Enabled real-time processing for global operations.</li>
      </ul>
    )
  },
  { 
    id: 3, 
    title: "Solution Components", 
    type: "content",
    aiPrompt: "Identify 4 pillars of a modern data platform.",
    notes: "These are the 4 pillars of our solution.",
    content: (
      <div className="grid grid-cols-2 gap-6 h-full">
        {[
          { t: 'Cloud Architecture', d: 'Scalable infrastructure with serverless compute.' },
          { t: 'Unified Metadata', d: 'Enterprise-wide glossary and data cataloging.' },
          { t: 'Quality Automation', d: 'AI-driven cleansing and validation rules.' },
          { t: 'Self-Service BI', d: 'Democratized access to visual intelligence.' }
        ].map(item => (
          <div key={item.t} className="p-6 bg-white shadow-sm rounded-xl border border-gray-200 flex flex-col">
            <h4 className="font-bold text-indigo-800 text-lg mb-2 uppercase italic">{item.t}</h4>
            <p className="text-gray-600 text-sm">{item.d}</p>
          </div>
        ))}
      </div>
    )
  },
  { 
    id: 4, 
    title: "Architecture Topology", 
    type: "mermaid", 
    aiPrompt: "Draft a simple data flow diagram in Mermaid.",
    notes: "Walk through the high-level data flow from source to analytics.",
    mermaid: `graph LR
  S[Sources] --> P[Processing]
  P --> L[Data Lake]
  L --> A[Analytics]
  A --> D[Dashboard]`,
    content: null
  },
  { 
    id: 5, 
    title: "Business Impact", 
    type: "kpi",
    aiPrompt: "Generate typical ROI metrics for a data project.",
    notes: "Focus on these three critical success factors.",
    content: null 
  }
];

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

const MermaidChart = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScript('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js')
      .then(() => {
        (window as any).mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose', fontFamily: 'Inter' });
        setIsLoaded(true);
      })
      .catch(e => setError("Failed to load engine"));
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && chart) {
      setError(null);
      containerRef.current.innerHTML = '';
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      try {
        (window as any).mermaid.render(id, chart)
          .then(({ svg }: any) => {
            if (containerRef.current) containerRef.current.innerHTML = svg;
          })
          .catch(() => setError("Syntax Error"));
      } catch (e) {
        setError("Invalid Syntax");
      }
    }
  }, [isLoaded, chart]);

  if (!isLoaded) return <div className="text-slate-400 animate-pulse text-xs font-black uppercase tracking-widest">Warming engine...</div>;
  if (error) return <div className="text-red-500 text-[10px] font-black uppercase italic p-4 bg-red-50 rounded-xl border border-red-100">{error}</div>;

  return <div ref={containerRef} className="mermaid-chart flex justify-center w-full h-full items-center scale-110" />;
};

const KPIStat = ({ end, suffix, label }: any) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-100">
      <h3 className="text-6xl font-black text-indigo-600 mb-2 italic tracking-tighter">{Math.floor(count)}{suffix}</h3>
      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">{label}</p>
    </div>
  );
};

const EditorToolbar = () => {
  const exec = (command: string, value: string | null = null) => document.execCommand(command, false, value || undefined);
  const Btn = ({ icon: Icon, cmd, title }: any) => (
    <button onMouseDown={(e) => { e.preventDefault(); exec(cmd); }} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors" title={title}><Icon size={16} /></button>
  );

  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xl animate-fade-in-up shrink-0">
      <div className="flex gap-0.5 border-r border-slate-100 pr-1 mr-1">
        <Btn icon={Undo} cmd="undo" title="Undo" /><Btn icon={Redo} cmd="redo" title="Redo" />
      </div>
      <div className="flex gap-0.5 border-r border-slate-100 pr-1 mr-1">
        <Btn icon={Bold} cmd="bold" title="Bold" /><Btn icon={Italic} cmd="italic" title="Italic" /><Btn icon={Underline} cmd="underline" title="Underline" />
      </div>
      <div className="flex gap-0.5">
        <Btn icon={AlignLeft} cmd="justifyLeft" /><Btn icon={AlignCenter} cmd="justifyCenter" /><Btn icon={AlignRight} cmd="justifyRight" />
      </div>
    </div>
  );
};

const EditableSlideElement = ({ children, isEditable, className, onSave }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleBlur = () => {
    if (isEditable && onSave && containerRef.current) onSave(containerRef.current.innerHTML);
  };
  return (
    <div 
      ref={containerRef} contentEditable={isEditable} suppressContentEditableWarning={true}
      onBlur={handleBlur} className={`${className} ${isEditable ? 'outline-dashed outline-2 outline-indigo-200 hover:outline-indigo-500 rounded p-2 transition-all' : ''}`}
    >
      {children}
    </div>
  );
};

const SlideRenderer = ({ slide, isEditable, onOpenAIPrompt, onUpdate }: any) => {
  const isTitleSlide = slide.type === 'title';
  const saveField = (field: string, value: string) => onUpdate(slide.id, { [field]: value });

  if (slide.type === 'mermaid' && isEditable) {
    return (
      <div className="w-full h-full flex flex-col p-8 bg-slate-50">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Code size={14} /> Neural Diagram Logic</h3>
            <button onClick={() => onOpenAIPrompt(slide.aiPrompt)} className="text-[9px] font-black uppercase bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 flex items-center gap-1"><Wand2 size={12} /> AI Refine</button>
         </div>
         <div className="flex-1 flex gap-6 min-h-0">
            <textarea 
              className="w-1/3 p-6 font-mono text-xs bg-slate-900 text-indigo-300 rounded-2xl shadow-inner resize-none outline-none"
              value={slide.mermaid} onChange={(e) => onUpdate(slide.id, { mermaid: e.target.value })} spellCheck={false}
            />
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 flex items-center justify-center p-8 overflow-hidden"><MermaidChart chart={slide.mermaid} /></div>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-white relative">
      {isEditable && slide.aiPrompt && slide.type !== 'mermaid' && (
        <button onClick={() => onOpenAIPrompt(slide.aiPrompt)} className="absolute top-6 right-6 z-10 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"><Wand2 size={16} /> AI Spec Assist</button>
      )}
      {!isTitleSlide && (
        <div className="px-12 md:px-20 pt-16 pb-8">
          <EditableSlideElement isEditable={isEditable} className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic" onSave={(v: any) => saveField('title', v)}>{slide.title}</EditableSlideElement>
          <div className="w-32 h-2 mt-6 rounded-full bg-indigo-600" />
        </div>
      )}
      <div className={`flex-1 flex flex-col px-12 md:px-20 overflow-hidden pb-12 ${isTitleSlide ? 'justify-center items-center text-center bg-slate-50' : 'pt-4'}`}>
        {isTitleSlide && <EditableSlideElement isEditable={isEditable} className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9] max-w-4xl" onSave={(v: any) => saveField('title', v)}>{slide.title}</EditableSlideElement>}
        <div className="w-full h-full max-w-5xl">
          {slide.type === 'mermaid' ? <MermaidChart chart={slide.mermaid} /> : slide.type === 'kpi' ? (
            <div className="flex justify-around text-center mt-20 gap-8 items-center h-full">
              <KPIStat end={30} suffix="%" label="Operational Yield" /><KPIStat end={2} suffix="x" label="Synthesis Speed" /><KPIStat end={99.9} suffix="%" label="Logic Accuracy" />
            </div>
          ) : (
            <EditableSlideElement isEditable={isEditable} className="h-full" onSave={(v: any) => saveField('customContent', v)}>
              {slide.customContent ? <div dangerouslySetInnerHTML={{ __html: slide.customContent }} /> : slide.content}
            </EditableSlideElement>
          )}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN WORKSPACE
// -----------------------------------------------------------------------------

const StandaloneCaseStory = () => {
  const [view, setView] = useState<'dashboard' | 'wizard' | 'loading' | 'presentation'>('dashboard');
  const [tasks, setTasks] = useState([
    { id: 101, name: "Financial Data Hub", client: "FinCorp", status: "completed", date: "2 mins ago" },
    { id: 102, name: "Customer 360", client: "RetailInc", status: "draft", date: "1 hour ago" }
  ]);
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeAIPrompt, setActiveAIPrompt] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const next = () => setCurrentIdx(i => Math.min(i + 1, slides.length - 1));
  const prev = () => setCurrentIdx(i => Math.max(i - 1, 0));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await loadScript('https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
      const pres = new (window as any).PptxGenJS();
      pres.layout = 'LAYOUT_16x9';

      for (const slide of slides) {
        const s = pres.addSlide();
        const plainTitle = slide.title.replace(/<[^>]*>/g, '');
        if (slide.type === 'title') {
          s.addText(plainTitle, { x: 1, y: 2.5, w: '80%', fontSize: 44, bold: true, align: 'center', color: '1e293b', italic: true });
        } else {
          s.addText(plainTitle, { x: 0.5, y: 0.4, w: '90%', fontSize: 24, bold: true, color: '1e293b', italic: true });
          s.addShape(pres.ShapeType.rect, { x: 0.5, y: 0.9, w: 1.5, h: 0.05, fill: '4F46E5' });
          if (slide.type === 'mermaid') {
            const { svg }: any = await (window as any).mermaid.render(`export-${slide.id}`, slide.mermaid);
            const imgData = await svgToPng(svg);
            s.addImage({ data: imgData, x: 1, y: 1.5, w: 8, h: 4, sizing: { type: 'contain' } });
          } else if (slide.type === 'content') {
            const html = slide.customContent || simpleRenderToStaticMarkup(slide.content);
            s.addText(html.replace(/<[^>]+>/g, ' '), { x: 0.8, y: 1.5, w: '85%', h: 4, fontSize: 16, color: '334155', valign: 'top' });
          }
        }
      }
      pres.writeFile({ fileName: `Case_Story_${activeTask?.client || 'Gen'}.pptx` });
    } catch (e: any) { alert("Export failed: " + e.message); } finally { setIsExporting(false); }
  };

  if (view === 'dashboard') return (
    <div className="h-full bg-slate-50 p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div><h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Case Deck <span className="text-indigo-600">Hub</span></h1><p className="text-slate-500 font-medium mt-1">Manage and synthesize architectural case studies into expert presentations.</p></div>
          <button onClick={() => setView('wizard')} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95"><Plus size={18} /> New Presentation</button>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-left">
             <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
               <tr><th className="px-8 py-5">Task Name</th><th className="px-8 py-5">Client Identity</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Last Synced</th></tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {tasks.map(t => (
                 <tr key={t.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => { setActiveTask(t); setView('presentation'); }}>
                   <td className="px-8 py-5 font-bold text-slate-800 text-sm uppercase italic tracking-tight">{t.name}</td>
                   <td className="px-8 py-5 text-slate-500 text-xs font-medium">{t.client}</td>
                   <td className="px-8 py-5"><span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase italic">Completed</span></td>
                   <td className="px-8 py-5 text-slate-400 text-[10px] font-bold uppercase">{t.date}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );

  if (view === 'wizard') return (
    <div className="h-full bg-slate-900 flex items-center justify-center p-8 animate-fade-in overflow-y-auto">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Presentation size={160} className="text-indigo-600"/></div>
        <div className="relative z-10">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-indigo-100"><Presentation size={32} /></div>
          <div className="text-center mb-10"><h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Initialize Story</h2><p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 italic">Neural Deck Synthesis</p></div>
          <div className="space-y-8">
            <div className="space-y-2"><label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pl-1 mb-2 block">Reference Identity</label><input type="text" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none text-lg font-bold shadow-inner" placeholder="Project Name..." onChange={e=>setActiveTask({...activeTask, name: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pl-1 block">Context Specification</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:bg-indigo-50/50 transition-all cursor-pointer group">
                <UploadCloud size={48} className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-4" /><p className="text-sm font-black text-slate-400 uppercase">Attach Solution Architecture Docs</p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={()=>setView('dashboard')} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 bg-slate-100">Cancel</button>
              <button onClick={()=>{ setView('loading'); setTimeout(()=>setView('presentation'), 2500); }} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Generate Strategy Deck</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (view === 'loading') return (
    <div className="h-full bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="text-indigo-600 animate-spin mb-10" size={80} />
      <h2 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase italic">Synthesizing Narrative...</h2>
      <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">Learning context from ingested artifacts</p>
    </div>
  );

  return (
    <div className="flex h-full bg-white overflow-hidden animate-fade-in">
      {activeAIPrompt && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-100 w-full max-w-lg p-10 relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-5"><Wand2 size={120} /></div><div className="relative z-10"><h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2">Neural Optimization</h3><p className="text-slate-500 text-xs font-medium mb-8">Refined intent generated from global intelligence context.</p><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 leading-relaxed font-mono shadow-inner mb-8">{activeAIPrompt}</div><div className="flex justify-end gap-3"><button onClick={()=>setActiveAIPrompt(null)} className="px-6 py-2 text-[10px] font-black uppercase text-slate-400">Dismiss</button><button onClick={()=>{navigator.clipboard.writeText(activeAIPrompt || ''); setActiveAIPrompt(null);}} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Apply Guidance</button></div></div></div></div>}
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="h-16 flex items-center px-8 border-b border-slate-200 justify-between bg-white shrink-0"><div onClick={() => setView('dashboard')} className="flex items-center gap-3 cursor-pointer group"><Home size={18} className="text-slate-400 group-hover:text-indigo-600" /><span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Repository</span></div></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {slides.map((s, i) => (
            <div key={s.id} onClick={() => setCurrentIdx(i)} className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex gap-4 ${i === currentIdx ? "bg-white border-indigo-600 shadow-xl translate-x-2" : "bg-transparent border-transparent hover:border-slate-200"}`}>
               <span className="text-slate-300 font-black text-[10px] mt-1 shrink-0">0{i+1}</span>
               <span className={`font-black text-[11px] uppercase italic tracking-tight line-clamp-2 ${i === currentIdx ? 'text-indigo-600' : 'text-slate-400'}`}>{String(s.title).replace(/<[^>]*>/g, '')}</span>
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-20 shadow-sm">
          <h2 className="font-black text-slate-800 text-[11px] uppercase italic tracking-widest truncate">{activeTask?.client || "PROJECT_ALPHA"} // {activeTask?.name || "STRATEGY_DECK"}</h2>
          <div className="flex items-center gap-4">
             <div className="bg-slate-100 p-1 rounded-xl flex gap-1 ring-1 ring-slate-200/50">
                <button onClick={() => setIsEditMode(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isEditMode ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><MonitorPlay size={14} className="inline mr-1.5" /> View</button>
                <button onClick={() => setIsEditMode(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isEditMode ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><Edit3 size={14} className="inline mr-1.5" /> Edit</button>
             </div>
             {isEditMode && <EditorToolbar />}
             <button onClick={handleExport} disabled={isExporting} className="bg-slate-950 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-lg shadow-indigo-900/10 active:scale-95 transition-all">{isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export Spec</button>
          </div>
        </header>
        <div className="flex-1 p-12 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-[1280px] aspect-video bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden relative">
            <SlideRenderer slide={slides[currentIdx]} isEditable={isEditMode} onOpenAIPrompt={setActiveAIPrompt} onUpdate={(id: any, upd: any) => setSlides(slides.map(s => s.id === id ? {...s, ...upd} : s))} />
          </div>
        </div>
        <div className="h-16 bg-white border-t border-slate-100 flex items-center justify-center gap-10 shrink-0">
           <button onClick={prev} disabled={currentIdx===0} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-10"><ChevronLeft size={24} /></button>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{currentIdx + 1} / {slides.length}</div>
           <button onClick={next} disabled={currentIdx===slides.length-1} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-10"><ChevronRight size={24} /></button>
        </div>
      </main>
    </div>
  );
};

export default StandaloneCaseStory;