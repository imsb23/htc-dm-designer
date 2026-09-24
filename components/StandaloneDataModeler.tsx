
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Send, Table as TableIcon, ChevronRight, Layout, 
  Cpu, Layers, Terminal, Activity, Package, Truck, Users, 
  Grid, FileText, Download, Search, Filter, Building2, 
  Car, ShieldCheck, Stethoscope, Briefcase, Globe, MapPin,
  ArrowRight, RotateCcw, Zap, Link, ShieldAlert, FileSpreadsheet,
  CheckCircle2, Info, Braces, Binary, Boxes, Copy, Check, Plus, History, ArrowUpRight, Trash2, Home, Loader, MonitorPlay,
  ArrowDown, Sparkles
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { saveHistory, getHistory, deleteHistory, getGlobalIntelligence } from '../services/geminiService';

// --- INFORMATICA ALIGNED GEOGRAPHY ---
const GEOGRAPHY = {
  continents: ['AMER', 'EMEA', 'APAC', 'LATAM'],
  countries: {
    'AMER': ['USA', 'Canada', 'Mexico', 'Brazil'],
    'EMEA': ['Germany', 'UK', 'France', 'UAE', 'South Africa', 'Qatar'],
    'APAC': ['China', 'India', 'Japan', 'Australia', 'Singapore'],
    'LATAM': ['Argentina', 'Chile', 'Colombia', 'Peru']
  }
};

const VERTICALS: Record<string, any> = {
  manufacturing: { id: 'manufacturing', name: 'Manufacturing', icon: <Building2 className="w-5 h-5" /> },
  automobile: { id: 'automobile', name: 'Automobile', icon: <Car className="w-5 h-5" /> },
  banking: { id: 'banking', name: 'Financial Services', icon: <Briefcase className="w-5 h-5" /> },
  healthcare: { id: 'healthcare', name: 'Healthcare', icon: <Stethoscope className="w-5 h-5" /> },
  insurance: { id: 'insurance', name: 'Insurance', icon: <ShieldCheck className="w-5 h-5" /> }
};

const CORE_DOMAINS: Record<string, any> = {
  customer: { id: 'customer', name: 'Customer Master', icon: <Users className="w-5 h-5" />, description: 'Golden Records (C360), Salesforce Account Integration, and Global X-Refs.' },
  product: { id: 'product', name: 'Product Master', icon: <Package className="w-5 h-5" />, description: 'PIM integration, Vehicle definitions, and BoM hierarchies.' },
  supplier: { id: 'supplier', name: 'Supplier Master', icon: <Truck className="w-5 h-5" />, description: 'Sourcing, ESG profiling, and Work Order performance tracking.' }
};

const StandaloneDataModeler: React.FC<{ initialView?: string, initialData?: any }> = ({ initialView = 'hub', initialData }) => {
  const [viewMode, setViewMode] = useState<'hub' | 'setup' | 'workspace'>(initialView as any);
  const [setupStep, setSetupStep] = useState(0);
  
  // Setup Wizard State
  const [prompt, setPrompt] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Workspace State
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'datamodel' | 'logic'>('datamodel'); 
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [generatedModel, setGeneratedModel] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

  useEffect(() => {
    setHistoryItems(getHistory('DataModeler'));
    if (initialData) {
        setGeneratedModel(Array.isArray(initialData.data_model) ? initialData.data_model : []);
        setAnalysisResult(initialData.analysisResult || '');
        setSelectedVertical(initialData.selectedVertical);
        setSelectedDomain(initialData.selectedDomain);
        setSelectedCountry(initialData.selectedCountry);
        setIsDemoMode(initialData.isDemoMode || false);
        setViewMode('workspace');
    }
  }, [initialData]);

  const handleExportXlsx = () => {
    if (!window.XLSX || !Array.isArray(generatedModel) || generatedModel.length === 0) return;
    
    // Sheet 1: Logical Schema
    const schemaRows: any[] = [];
    generatedModel.forEach(entity => {
      const attributes = Array.isArray(entity.attributes) ? entity.attributes : [];
      attributes.forEach((attr: any) => {
        schemaRows.push({
          Entity: entity.entity,
          Type: entity.type,
          Attribute: attr.name,
          DataType: attr.type,
          Description: attr.description
        });
      });
    });

    // Sheet 2: Logic
    const logicRows = [{ Content: analysisResult || 'No logic generated' }];

    const wb = window.XLSX.utils.book_new();
    const wsSchema = window.XLSX.utils.json_to_sheet(schemaRows);
    const wsLogic = window.XLSX.utils.json_to_sheet(logicRows);
    
    window.XLSX.utils.book_append_sheet(wb, wsSchema, "Logical Schema");
    window.XLSX.utils.book_append_sheet(wb, wsLogic, "Matching & Survivorship");
    
    window.XLSX.writeFile(wb, `Nexus_MDM_${isDemoMode ? 'Demo' : 'Model'}_${selectedVertical}_${selectedDomain}.xlsx`);
  };

  const handleRunAnalysis = async () => {
    if (!selectedVertical || !selectedDomain) return;
    setIsLoading(true);
    setAnalysisResult(null);
    setViewMode('workspace');

    const context = {
      industry: VERTICALS[selectedVertical].name,
      domain: CORE_DOMAINS[selectedDomain].name,
      geography: `${selectedCountry}, ${selectedContinent}`,
      userPrompt: prompt,
      mode: isDemoMode ? 'POC/DEMO MINIMALIST' : 'ENTERPRISE PRODUCTION'
    };

    const demoSpecificInstruction = isDemoMode ? `
      DEMO MODE: MINIMALIST INFORMATICA BUSINESS 360 (BE) STRUCTURE.
      Target: Manufacturing Demo.
      Structure:
      1. Root Level (Brand Identity): Fuzzy match anchor (Name, Type, Industry).
      2. Legal Entity (Child 1:1): Exact matching keys (Legal Name, Reg Number, Tax ID).
      3. Address (Child 1:M): HQ/Sold-To verification (Line 1, City, ISO Country, Postal Code).
      Focus on "Golden Record" derivation. Keep attributes clean.
    ` : "Full Enterprise technical specification with advanced cross-domain logic.";

    const systemInstruction = `
      You are an MDM Expert. Synthesize a Data Model and matching strategy.
      Global Intelligence: ${getGlobalIntelligence()}
      ${demoSpecificInstruction}
      
      OUTPUT FORMAT:
      1. Markdown text detailing "Matching Strategy" (Fuzzy/Exact) and "Survivorship Rules" (Trust, Source Priority, LUD).
      2. JSON: { "data_model": [ { "entity": "Entity Name", "type": "Level", "attributes": [...] } ] }
    `;

    try {
      const response = await getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { systemInstruction, tools: [{ googleSearch: {} }] }
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*"data_model"[\s\S]*\}/);
      let modelData = [];
      if (jsonMatch) {
        try { 
            const parsed = JSON.parse(jsonMatch[0]);
            modelData = Array.isArray(parsed.data_model) ? parsed.data_model : []; 
            setGeneratedModel(modelData); 
        } catch (e) {
            console.error("Failed to parse model JSON", e);
        }
      }
      const analysisText = text.split('{')[0];
      setAnalysisResult(analysisText);
      saveHistory('DataModeler', `${isDemoMode ? '[DEMO] ' : ''}${VERTICALS[selectedVertical].name} ${CORE_DOMAINS[selectedDomain].name}`, {
          data_model: modelData, analysisResult: analysisText, selectedVertical, selectedDomain, selectedCountry, isDemoMode
      });
      setHistoryItems(getHistory('DataModeler'));
    } catch (error) { setAnalysisResult("Engine Error: Synthesis failed."); } finally { setIsLoading(false); }
  };

  const resetModeller = () => {
    setViewMode('hub'); setSetupStep(0); setPrompt(''); setSelectedVertical(null); setSelectedDomain(null);
    setSelectedContinent(''); setSelectedCountry(''); setAnalysisResult(null); setGeneratedModel([]); setIsDemoMode(false);
  };

  const renderHub = () => (
    <div className="h-full bg-[#f4f7f9] p-8 overflow-y-auto animate-fade-in">
        <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Data Modeler</h2>
                    <p className="text-slate-500 font-medium mt-1">Apple-glass design system for MDM logic and architecture.</p>
                </div>
                <button onClick={() => setViewMode('setup')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl flex items-center gap-2 active:scale-95"><Plus size={18} /> New Model Session</button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Platform Velocity</div>
                    <div className="text-4xl font-black text-slate-900 italic">{historyItems.length} Sessions</div>
                    <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-xs"><Activity size={12}/> System Live</div>
                </div>
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Database size={120} className="text-indigo-400"/></div>
                    <div className="relative z-10">
                        <div className="text-xs font-black text-indigo-300 uppercase tracking-[0.3em] mb-1">CLAIRE AI Integration</div>
                        <div className="text-3xl font-black text-white italic uppercase tracking-tighter">Business 360 Logic Synthesis</div>
                        <p className="text-slate-400 text-xs mt-3 max-w-md font-medium">Automatic terminology normalization (IICS -&gt; IDMC) and domain standard enforcement active.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[3rem] p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6 text-slate-400"><History size={18}/><h3 className="font-black text-[10px] uppercase tracking-widest">Recent Activity Repository</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historyItems.map(h => (
                        <div key={h.id} onClick={() => { setGeneratedModel(Array.isArray(h.data.data_model) ? h.data.data_model : []); setAnalysisResult(h.data.analysisResult); setSelectedVertical(h.data.selectedVertical); setSelectedDomain(h.data.selectedDomain); setSelectedCountry(h.data.selectedCountry); setIsDemoMode(h.data.isDemoMode || false); setViewMode('workspace'); }} className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-900 transition-all cursor-pointer flex flex-col justify-between">
                            <div>
                                <div className="text-xs font-black text-slate-900 uppercase italic truncate mb-1">{h.summary}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{h.date} • {(Array.isArray(h.data.data_model) ? h.data.data_model.length : 0)} Entities</div>
                            </div>
                            <div className="flex justify-end mt-4"><ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors"/></div>
                        </div>
                    ))}
                    {historyItems.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic text-xs uppercase tracking-widest">No history found.</div>}
                </div>
            </div>
        </div>
    </div>
  );

  const renderSetup = () => (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
        {/* Portrait Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-xl w-full space-y-12 relative z-10">
            {/* Step 0: NLP */}
            {setupStep === 0 && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] shadow-3xl text-center space-y-8 animate-fade-in">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white"><Terminal size={24} /></div>
                        <button onClick={() => setIsDemoMode(!isDemoMode)} className={`px-5 py-2 rounded-full border-2 transition-all font-black text-[10px] uppercase tracking-widest ${isDemoMode ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/20'}`}><MonitorPlay size={14} className="inline mr-2"/> {isDemoMode ? 'Demo Mode: Active' : 'Enterprise mode'}</button>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Model Neural Intent</h2>
                    <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && prompt.trim() && setSetupStep(1)} className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-white/20 transition-all font-bold placeholder:text-white/20" placeholder="e.g. Model Manufacturing Golden Records for APAC..."/>
                    <button disabled={!prompt.trim()} onClick={() => setSetupStep(1)} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-200 transition-all active:scale-95 shadow-xl">Select Strategy Strategy</button>
                </div>
            )}

            {/* Step 1: Vertical */}
            {setupStep === 1 && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center"><h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Industry Pillar</h3></div>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(VERTICALS).map((v: any) => (
                            <button key={v.id} onClick={() => { setSelectedVertical(v.id); setSetupStep(2); }} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center hover:bg-white/10 hover:border-white/30 transition-all group">
                                <div className="text-white mb-4 flex justify-center group-hover:scale-110 transition-transform">{v.icon}</div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{v.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Domain */}
            {setupStep === 2 && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center"><h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Core MDM Domain</h3></div>
                    <div className="grid grid-cols-1 gap-4">
                        {Object.values(CORE_DOMAINS).map((d: any) => (
                            <button key={d.id} onClick={() => { setSelectedDomain(d.id); setSetupStep(3); }} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-left hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-6">
                                <div className="text-white bg-white/10 p-4 rounded-2xl">{d.icon}</div>
                                <div><h4 className="text-lg font-black text-white uppercase italic">{d.name}</h4><p className="text-[10px] text-white/40 font-medium leading-relaxed">{d.description}</p></div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Location */}
            {setupStep === 3 && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] shadow-3xl space-y-10 animate-fade-in">
                    <div className="text-center"><h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Local Compliance Scope</h3></div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-2">
                            {GEOGRAPHY.continents.map(c => <button key={c} onClick={() => { setSelectedContinent(c); setSelectedCountry(''); }} className={`py-4 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${selectedContinent === c ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}>{c}</button>)}
                        </div>
                        <div className={`grid grid-cols-2 gap-2 transition-all ${!selectedContinent && 'opacity-10 pointer-events-none'}`}>
                            {(GEOGRAPHY.countries[selectedContinent as keyof typeof GEOGRAPHY.countries] || []).map(country => <button key={country} onClick={() => setSelectedCountry(country)} className={`py-4 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${selectedCountry === country ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}>{country}</button>)}
                        </div>
                    </div>
                    <button disabled={!selectedCountry} onClick={handleRunAnalysis} className="w-full py-6 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.4em] shadow-3xl hover:bg-slate-200 transition-all active:scale-95">Synthesize Data Model</button>
                </div>
            )}
        </div>
    </div>
  );

  const renderWorkspace = () => (
    <div className="h-full bg-white flex flex-col animate-fade-in font-sans overflow-hidden">
        <header className="h-16 px-10 border-b border-black/5 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xl z-20">
            <div className="flex items-center gap-6">
                <button onClick={resetModeller} className="p-2 hover:bg-black/5 rounded-xl text-slate-400 hover:text-black transition-colors"><Home size={20}/></button>
                <div className="h-6 w-px bg-black/10" />
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-black italic">Nexus_C360_Model_Definition</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter italic">VERTICAL: {selectedVertical?.toUpperCase()}</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter italic">SCOPE: {selectedCountry?.toUpperCase()}</span>
                        {isDemoMode && <span className="bg-black text-white text-[7px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Demo Mode</span>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleExportXlsx} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"><Download size={14}/> Export Pro (.xlsx)</button>
            </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 bg-[#f9fafb]">
            <div className="flex border-b border-black/5 bg-white/40 px-10 shrink-0">
                {[
                  { id: 'datamodel', label: 'Golden Record Schema', icon: <Binary size={14} /> },
                  { id: 'logic', label: 'Matching & Survivorship Techniques', icon: <Boxes size={14} /> }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-black' : 'text-slate-400 hover:text-slate-600'}`}>
                    {tab.icon} {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                  </button>
                ))}
            </div>

            <div className="flex-1 p-12 overflow-auto custom-scrollbar relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 z-30 bg-white/80 backdrop-blur-md">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-black/5 border-t-black animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-black font-black text-xs italic animate-pulse">IQ</div>
                        </div>
                        <div className="text-center"><h3 className="text-xl font-black text-black uppercase italic tracking-tighter">Consulting MDM Intelligence</h3><p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] animate-pulse mt-1">Researching global standards & survivorship best practices...</p></div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto h-full space-y-12 pb-32">
                        {activeTab === 'datamodel' && (
                            <div className="space-y-12 animate-fade-in">
                                <header className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><Braces size={24}/></div>
                                    <div><h3 className="text-2xl font-black uppercase italic tracking-tight text-black">Logical Entity Registry</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Business 360 Object Specification</p></div>
                                </header>
                                <div className="grid grid-cols-1 gap-8">
                                    {(Array.isArray(generatedModel) ? generatedModel : []).map((entity, eIdx) => (
                                        <div key={eIdx} className="bg-white border border-black/10 rounded-[3rem] overflow-hidden shadow-2xl">
                                            <div className="bg-slate-50/50 px-10 py-6 border-b border-black/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black"><TableIcon size={16} /></div>
                                                    <h5 className="font-black text-lg uppercase tracking-tight text-black italic">{entity.entity}</h5>
                                                    <span className="text-[9px] border border-black/10 px-3 py-1 rounded-full font-black uppercase tracking-widest text-slate-400">{entity.type}</span>
                                                </div>
                                            </div>
                                            <div className="p-0">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-white text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-black/5">
                                                            <th className="px-10 py-5">Attribute Name</th>
                                                            <th className="px-10 py-5 text-center">Informatica Logic</th>
                                                            <th className="px-10 py-5">Context / Purpose</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-black/5">
                                                        {(Array.isArray(entity.attributes) ? entity.attributes : []).map((attr: any, aIdx: number) => (
                                                            <tr key={aIdx} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-10 py-5 text-sm font-black text-black italic tracking-tighter">{attr.name}</td>
                                                                <td className="px-10 py-5 text-[10px] font-black uppercase text-indigo-600 text-center tracking-widest">{attr.type}</td>
                                                                <td className="px-10 py-5 text-xs text-slate-500 font-medium italic leading-relaxed">{attr.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'logic' && (
                            <div className="animate-fade-in space-y-12">
                                {/* Golden Record Visualizer */}
                                <div className="bg-white border border-black/10 rounded-[4rem] p-12 shadow-3xl text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-black/5" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Golden Record Consolidation Logic</h4>
                                    <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto relative">
                                        <div className="space-y-4 w-full md:w-auto">
                                            {['ERP System', 'CRM / Marketing', 'Web Portals'].map(s => <div key={s} className="bg-slate-50 border border-black/5 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400">{s}</div>)}
                                        </div>
                                        <div className="h-12 w-px bg-black/5 md:h-px md:w-12 my-4 md:my-0" />
                                        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
                                            <div className="flex gap-2 mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{animationDelay: '0.2s'}} />
                                            </div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest">Matching & Trust Engine</h5>
                                            <div className="text-[8px] text-indigo-300 font-bold mt-2 italic tracking-tighter">SURVIVORSHIP: ENABLED</div>
                                        </div>
                                        <div className="h-12 w-px bg-black/5 md:h-px md:w-12 my-4 md:my-0" />
                                        <div className="bg-white border-4 border-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center">
                                            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Golden Record</h5>
                                            <span className="text-[7px] font-black text-slate-400 uppercase mt-1">Single Source of Truth</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-4xl mx-auto bg-white border border-black/10 rounded-[3rem] p-16 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-5"><Zap size={200} className="text-black" /></div>
                                    <div className="prose prose-slate max-w-none prose-h2:text-black prose-h2:italic prose-h2:font-black prose-h3:text-slate-400 prose-h3:uppercase prose-h3:text-[10px] prose-h3:tracking-widest">
                                        <div className="whitespace-pre-wrap text-slate-900 font-medium leading-loose text-lg">
                                            {analysisResult}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer className="h-12 px-10 bg-white border-t border-black/5 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] shrink-0 z-30">
                <div className="flex items-center gap-10">
                  <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-900" /> ENGINE: CLAIRE_V10.8</span>
                  <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-400" /> STATUS: SYNC_READY</span>
                </div>
                <div className="flex items-center gap-3"><Activity size={14} className="text-black animate-pulse" /><span>NEURAL_FABRIC_CONNECTED</span></div>
            </footer>
        </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-white text-slate-900 overflow-hidden relative">
        {viewMode === 'hub' && renderHub()}
        {viewMode === 'setup' && renderSetup()}
        {viewMode === 'workspace' && renderWorkspace()}
    </div>
  );
};

export default StandaloneDataModeler;
