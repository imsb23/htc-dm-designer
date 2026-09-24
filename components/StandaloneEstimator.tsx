
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Sparkles, Loader, Trash2, FileText, UploadCloud, History, DollarSign, Clock, Users, CheckCircle2, AlertTriangle, ArrowLeft, Send, Plus, List, TrendingUp, Lightbulb, X, BarChart3, ShieldCheck, Calendar, GripVertical, ChevronRight, Briefcase, UserPlus, Info, Link as LinkIcon, Search, LayoutDashboard, ArrowUpRight, Filter, PieChart as PieChartIcon, Home, Minus, PlusCircle, TrendingDown, Target, Zap, FileWarning, Settings, MessageSquareText, FileUp, Code2, Beaker, ShieldAlert,
  BrainCircuit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { generateConsolidatedEstimation, saveHistory, getHistory, deleteHistory, aggregateFileContext } from '../services/geminiService';
import { EstimationInputs, Resource, TimelineItem } from '../types';

interface DetailedEstimationRow {
    id: string;
    activity: string;
    simpleCount: number;
    mediumCount: number;
    complexCount: number;
    simpleRate: number;
    mediumRate: number;
    complexRate: number;
    description: string;
}

const PRECISE_SCHEMA: Record<string, { label: string, weight: number, desc: string }[]> = {
    mdm: [
        { label: "Requirement Gathering", weight: 4, desc: "Modeling workshops & golden record definition" },
        { label: "Entities & Data Model", weight: 6, desc: "Domain, BE, and physical model definition" }, 
        { label: "Ingress Jobs", weight: 2.5, desc: "Inbound pipeline config & mapping" },
        { label: "Match & Merge Models", weight: 5, desc: "Exact/Fuzzy rules and model tuning" },
        { label: "Survivorship Models", weight: 2, desc: "Trust scores and field-level logic" },
        { label: "Egress Jobs", weight: 2, desc: "Publication and consumption jobs" },
        { label: "360 Page Configs", weight: 3, desc: "UI layout and interaction configurations" }
    ],
    di: [
        { label: "Requirement Gathering", weight: 1.5, desc: "Source/Target analysis & logic specs" },
        { label: "Connections", weight: 0.75, desc: "Source, Intermediate, and Consuming conns" },
        { label: "Mapping Tasks", weight: 3, desc: "Mapping logic, parameters, and tasks" },
        { label: "Taskflows", weight: 1.5, desc: "Orchestration, loops, and error handling" }
    ],
    dq: [
        { label: "Requirement Gathering", weight: 2, desc: "Business rule discovery & profiling strategy" },
        { label: "Profile Analysis", weight: 2, desc: "Initial Profile and DQ metric Analysis" },
        { label: "Rule & Dict Creation", weight: 2, desc: "Reusable rules and lookup dictionaries" },
        { label: "Cleansing Rules", weight: 3, desc: "Complex fix logic & data cleansing" },
        { label: "Rule Integration", weight: 1, desc: "Syncing rules with Profiles & Mappings" },
        { label: "Business Scorecards", weight: 1.5, desc: "Scorecards for business visibility" }
    ],
    dg: [
        { label: "Requirement Gathering", weight: 3, desc: "Glossary setup & ownership workshops" },
        { label: "Catalog Config", weight: 3, desc: "Source creation & Metadata extraction" },
        { label: "Glossary & Classification", weight: 1, desc: "Auto-classification & link config" },
        { label: "Governance Assets", weight: 0.5, desc: "Systems, Policies, Processes, Regs" },
        { label: "Technical Lineage", weight: 4, desc: "Technical lineage extraction & building" },
        { label: "Business Lineage", weight: 2, desc: "Glossary-to-technical asset mapping" },
        { label: "Gov Dashboards", weight: 3, desc: "Curation and compliance dashboards" }
    ]
};

const MODULE_CONFIGS = [
    { id: 'mdm', title: 'Master Data Driving', color: 'bg-indigo-500', textColor: 'text-indigo-600', accent: 'indigo' },
    { id: 'di', title: 'Data Integration', color: 'bg-blue-500', textColor: 'text-blue-600', accent: 'blue' },
    { id: 'dq', title: 'Data Quality', color: 'bg-emerald-500', textColor: 'text-emerald-600', accent: 'emerald' },
    { id: 'dg', title: 'Data Governance', color: 'bg-orange-500', textColor: 'text-orange-600', accent: 'orange' }
];

const PRODUCT_CATALOG: Record<string, any> = {
  "Informatica": {
    "Cloud": ["Integrated MDM Solution (DI + DQ + MDM)", "Integrated Governance Solution (DI + DQ + MDM + Gov)", "Cloud Data Integration (CDI)", "Cloud Data Quality (CDQ)", "MDM SaaS", "Cloud Mass Ingestion", "Cloud Data Governance (CDGC)"],
    "On-Premise": ["Integrated IDQ + MDM Bundle", "PowerCenter", "Informatica Data Quality (IDQ)", "MDM Multidomain", "Enterprise Data Catalog (EDC)"]
  },
  "Talend": {
    "Cloud": ["Talend Cloud Data Integration", "Talend Pipeline Designer", "Stitch Data Loader"],
    "On-Premise": ["Talend Open Studio", "Talend Data Fabric", "Talend ESB"]
  },
  "Azure Data Factory": {
    "Cloud": ["Data Factory V2", "Synapse Analytics Pipelines", "Azure Purview"],
    "On-Premise": ["SSIS (via IR)", "SQL Server Data Tools"]
  },
  "Databricks": {
    "Cloud": ["Delta Live Tables", "Unity Catalog", "Databricks SQL", "Workflows"],
    "On-Premise": []
  }
};

const StandaloneEstimator: React.FC<{ initialView?: string, initialData?: any, embedded?: boolean, initialContext?: string, initialInputs?: EstimationInputs, onSave?: (v: any) => void }> = ({ 
    initialView = 'hub', initialData, embedded = false, initialContext = '', initialInputs = {}, onSave
}) => {
    const [viewMode, setViewMode] = useState(initialView);
    const [activeTab, setActiveTab] = useState<'summary' | 'effort' | 'resources' | 'timeline'>('summary');
    
    const [projectName, setProjectName] = useState('');
    const [context, setContext] = useState(initialContext);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [inputType, setInputType] = useState<'upload' | 'prompt'>('prompt');
    const [product, setProduct] = useState('');
    const [deploymentModel, setDeploymentModel] = useState<'Cloud' | 'On-Premise'>('Cloud');
    const [solutionType, setSolutionType] = useState('');
    const [targetAudience, setTargetAudience] = useState(['Developer']);
    
    const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [refinementInput, setRefinementInput] = useState('');
    const [contingency, setContingency] = useState(15);
    const [error, setError] = useState<string | null>(null);

    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const overheadPM = 20; 
    const overheadQA = 30;

    const [estimationRows, setEstimationRows] = useState<Record<string, DetailedEstimationRow[]>>({ mdm: [], di: [], dq: [], dg: [] });
    const [resources, setResources] = useState<Resource[]>([]);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);

    const availableServices = useMemo(() => {
        if (product && PRODUCT_CATALOG[product]) {
            return PRODUCT_CATALOG[product][deploymentModel] || [];
        }
        return [];
    }, [product, deploymentModel]);

    useEffect(() => {
        const initialRows: Record<string, DetailedEstimationRow[]> = {};
        Object.keys(PRECISE_SCHEMA).forEach((modId) => {
            const schemaItems = PRECISE_SCHEMA[modId];
            initialRows[modId] = schemaItems.map((item, idx) => ({
                id: `${modId}_${idx}`, 
                activity: item.label, 
                description: item.desc,
                simpleCount: 0, 
                mediumCount: 0, 
                complexCount: 0,
                simpleRate: Math.max(1, (item.weight * 8) / 2), 
                mediumRate: (item.weight * 8), 
                complexRate: (item.weight * 8) * 2
            }));
        });
        
        if (initialData?.estimationRows) {
            // Ensure we merge with defaults to avoid missing keys
            setEstimationRows({ ...initialRows, ...initialData.estimationRows });
        } else {
            setEstimationRows(initialRows);
        }
        
        if (initialData?.resources) setResources(initialData.resources);
        if (initialData?.timeline) setTimeline(initialData.timeline);
        setHistoryItems(getHistory('Estimator'));
    }, [initialData]);

    const dashboardStats = useMemo(() => {
        if (!Array.isArray(historyItems) || historyItems.length === 0) return { totalEstimates: 0, avgBudget: 0, totalHours: 0, complexityMix: [] };
        let totalH = 0; let totalB = 0; const workstreamTotals: Record<string, number> = {};
        historyItems.forEach(item => {
            const data = item.data;
            if (data?.estimationRows) {
                Object.keys(data.estimationRows).forEach(mod => {
                    const rows = data.estimationRows[mod];
                    if (Array.isArray(rows)) {
                        rows.forEach((r: any) => {
                            totalH += (Number(r.simpleCount || 0) * Number(r.simpleRate || 0)) + 
                                     (Number(r.mediumCount || 0) * Number(r.mediumRate || 0)) + 
                                     (Number(r.complexCount || 0) * Number(r.complexRate || 0));
                            workstreamTotals[mod] = (workstreamTotals[mod] || 0) + (Number(r.mediumCount || 0) * Number(r.mediumRate || 0));
                        });
                    }
                });
            }
            if (Array.isArray(data?.resources)) {
                data.resources.forEach((res: any) => totalB += (Number(res.count || 0) * Number(res.rate || 0) * Number(res.hours || 0)));
            }
        });
        const mixData = Object.entries(workstreamTotals).map(([name, value]) => ({ 
            name: name.toUpperCase(), value, color: MODULE_CONFIGS.find(m => m.id === name)?.textColor.replace('text-', '#') || '#6366F1'
        }));
        return { totalEstimates: historyItems.length, avgBudget: Math.round(totalB / historyItems.length), totalHours: Math.round(totalH), complexityMix: mixData };
    }, [historyItems]);

    const totals = useMemo(() => {
        let devHours = 0;
        Object.keys(estimationRows).forEach(key => {
            const rows = estimationRows[key];
            if (Array.isArray(rows)) {
                rows.forEach(r => devHours += (r.simpleCount * r.simpleRate) + (r.mediumCount * r.mediumRate) + (r.complexCount * r.complexRate));
            }
        });
        const pmHours = (devHours * overheadPM) / 100;
        const qaHours = (devHours * overheadQA) / 100;
        const grandTotalHours = devHours + pmHours + qaHours;
        const resourceTotalCost = resources.reduce((acc, res) => acc + (res.count * res.rate * res.hours), 0);
        const contingencyAmount = (resourceTotalCost * contingency) / 100;
        const finalBudget = resourceTotalCost + contingencyAmount;
        return { devHours, pmHours, qaHours, grandTotalHours, resourceTotalCost, contingencyAmount, finalBudget };
    }, [estimationRows, resources, contingency]);

    const handleUpdateRow = (modId: string, rowId: string, field: keyof DetailedEstimationRow, value: any) => {
        setEstimationRows(prev => {
            if (!prev[modId]) return prev;
            const next = { ...prev };
            const currentRows = [...next[modId]];
            const updatedRows = currentRows.map(r => r.id === rowId ? { ...r, [field]: value } : r);
            if (modId === 'mdm' && rowId === 'mdm_1' && field === 'mediumCount') {
                const entityCount = parseInt(value) || 0;
                const dependentIds = ['mdm_2', 'mdm_3', 'mdm_4', 'mdm_5', 'mdm_6']; 
                next[modId] = updatedRows.map(r => dependentIds.includes(r.id) ? { ...r, mediumCount: entityCount } : r);
            } else { next[modId] = updatedRows; }
            return next;
        });
    };

    const handleGenerate = async (refinementText?: string) => {
        const isRefinement = !!refinementText;
        const activeContext = refinementText || context;
        if (!activeContext && uploadedFiles.length === 0) { setError("Please provide context or documents."); return; }
        
        setIsGenerating(true);
        setError(null);
        try {
            let activeId = currentRequestId;
            if (!isRefinement) {
                activeId = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
                setCurrentRequestId(activeId);
            }
            const fileContext = uploadedFiles.length > 0 ? await aggregateFileContext(uploadedFiles) : "";
            let structuralHint = "TARGET IDs:\n" + Object.entries(PRECISE_SCHEMA).map(([m, items]) => items.map((it, i) => `- ${it.label} ("${m}_${i}")`).join("\n")).join("\n");
            
            const techStack = product ? `Platform: ${product}, Deployment: ${deploymentModel}, Service: ${solutionType || 'Not Specified'}` : "AI Auto-Detect Stack";
            const audience = targetAudience.join(', ');
            
            const prompt = `Task: Professional Solution Estimation. 
            User Context: ${activeContext}
            Stack Selections: ${techStack}
            Target Audience: ${audience}
            Files: ${fileContext}
            
            ${structuralHint} 
            ${isRefinement ? `Refinement: ${refinementText}` : ''}
            
            STRICT RULES: 
            1. mdm_1 (Entities) is MASTER for MDM. Synchronize mdm_2-6 counts. 
            2. For DI/DQ/DG, estimate counts based on the described complexity.
            3. STAFFING: Provide market standard roles for a team of this scale. 
            4. TIMELINE: Logic: Discovery -> Build -> SIT -> UAT -> Hypercare.`;

            const result = await generateConsolidatedEstimation(prompt);
            
            // Robust guard for result and result.drivers
            const drivers = result?.drivers || {};
            
            setEstimationRows(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(mid => {
                    if (Array.isArray(next[mid])) {
                        next[mid] = next[mid].map(row => {
                            const matchedCount = drivers[row.id];
                            return matchedCount !== undefined ? { ...row, mediumCount: matchedCount } : row;
                        });
                    }
                });
                return next;
            });
            
            setResources(Array.isArray(result?.resources) ? result.resources : []);
            setTimeline(Array.isArray(result?.timeline) ? result.timeline : []);
            setViewMode('results');
            
            saveHistory('Estimator', projectName || activeId || 'AI Professional Estimate', {
                estimationRows: { ...estimationRows }, // Snapshot the rows with new counts
                resources: Array.isArray(result?.resources) ? result.resources : [],
                timeline: Array.isArray(result?.timeline) ? result.timeline : [],
                project: projectName, 
                requestId: activeId,
                product,
                deploymentModel,
                solutionType
            }, uploadedFiles.map(f => f.name));
            setHistoryItems(getHistory('Estimator'));
        } catch (e) { 
            console.error("AI Estimation Synthesis Error:", e);
            setError("AI failed to synthesize. Please retry."); 
        } finally { 
            setIsGenerating(false); 
        }
    };

    const loadHistoryItem = (item: any) => {
        if (!item?.data) return;
        setEstimationRows(item.data.estimationRows || {});
        setResources(item.data.resources || []);
        setTimeline(item.data.timeline || []);
        setProjectName(item.summary || '');
        setCurrentRequestId(item.data.requestId || null);
        setViewMode('results');
    };

    const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(confirm("Delete estimate?")) { deleteHistory(id); setHistoryItems(getHistory('Estimator')); }
    };

    const updateResource = (id: string, field: keyof Resource, value: any) => {
        setResources(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleUpdateTimelineItem = (id: string, field: keyof TimelineItem, value: any) => {
        setTimeline(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const toggleAudience = (role: string) => {
        setTargetAudience(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    if (viewMode === 'hub') {
        const filteredHistory = historyItems.filter(h => h.summary.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
            <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto w-full space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Estimator Hub</h2>
                            <p className="text-slate-500 font-medium mt-1">Manage project implementation plans and cost insights.</p>
                        </div>
                        <button onClick={() => setViewMode('input')} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"><Plus size={20} /> Create New Estimate</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><Calculator size={20}/></div><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Estimates</div><div className="text-3xl font-black text-slate-800 mt-1">{dashboardStats.totalEstimates}</div></div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={20}/></div><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg. Project Budget</div><div className="text-3xl font-black text-emerald-600 mt-1">${dashboardStats.avgBudget.toLocaleString()}</div></div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Clock size={20}/></div><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cumul. Dev Hours</div><div className="text-3xl font-black text-blue-600 mt-1">{dashboardStats.totalHours} <span className="text-sm font-medium opacity-40">Hrs</span></div></div>
                        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={80} className="text-indigo-400"/></div><div className="relative z-10"><div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Architecture ROI</div><div className="text-3xl font-black text-white">92%</div><div className="text-[10px] text-slate-500 font-bold mt-2">EFFICIENCY GAIN WITH AI</div></div></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col"><div className="flex justify-between items-center mb-8"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PieChartIcon size={22} className="text-indigo-500"/> Workload Insights</h3></div><div className="flex-1 min-h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={dashboardStats.complexityMix}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontBold: 'bold', fill: '#94A3B8'}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontBold: 'bold', fill: '#94A3B8'}} /><RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} /><Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>{dashboardStats.complexityMix.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar></BarChart></ResponsiveContainer></div></div>
                        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col"><h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><History size={22} className="text-slate-400"/> Request Management</h3><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Filter by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div><div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">{filteredHistory.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs italic">No estimates found.</div>) : filteredHistory.map((item) => (<div key={item.id} onClick={() => loadHistoryItem(item)} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between"><div className="min-w-0 flex-1"><div className="font-bold text-slate-700 text-sm truncate">{item.summary}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{item.date} {item.data?.requestId && `• ${item.data.requestId}`}</div></div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => handleDeleteHistory(item.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={14} /></button><ArrowUpRight size={14} className="text-indigo-400" /></div></div>))}</div></div>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'input') {
        return (
            <div className="h-full bg-slate-50 flex flex-col lg:flex-row overflow-hidden animate-fade-in">
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto space-y-10 relative">
                        <button onClick={() => setViewMode('hub')} className="absolute top-0 right-0 p-2 text-slate-400 hover:text-indigo-600 transition-colors"><X size={24}/></button>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Project Estimation</h2>
                            <p className="text-slate-500 font-medium">Provide technical context to generate a detailed implementation blueprint.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">1. Project Identity</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                    placeholder="Project Name / Reference Code"
                                    className="w-full text-lg px-4 py-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 font-bold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">2. Requirements Source</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setInputType('upload')} className={`p-4 rounded-xl border-2 text-left transition-all ${inputType === 'upload' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                        <div className="flex items-center gap-3 mb-2"><div className={`p-2 rounded-lg ${inputType === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><FileUp size={20}/></div><span className="font-bold">Upload RFP</span></div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Docs & Questionnaires</p>
                                    </button>
                                    <button onClick={() => setInputType('prompt')} className={`p-4 rounded-xl border-2 text-left transition-all ${inputType === 'prompt' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                        <div className="flex items-center gap-3 mb-2"><div className={`p-2 rounded-lg ${inputType === 'prompt' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><MessageSquareText size={20}/></div><span className="font-bold">Describe Scope</span></div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Type logic directly</p>
                                    </button>
                                </div>

                                {inputType === 'upload' ? (
                                    <label className="mt-4 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center block cursor-pointer hover:bg-white hover:border-indigo-400 transition-all bg-slate-50/50">
                                        <UploadCloud size={32} className="mx-auto mb-3 text-slate-300" />
                                        <p className="text-sm font-bold text-slate-600">Attach Technical Specs</p>
                                        <input type="file" multiple className="hidden" onChange={e => e.target.files && setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])} />
                                    </label>
                                ) : (
                                    <textarea 
                                        value={context} 
                                        onChange={e => setContext(e.target.value)}
                                        className="w-full h-32 p-4 mt-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-100 outline-none text-sm leading-relaxed font-medium"
                                        placeholder="Describe workstreams (e.g., 5 sources to Snowflake, master Customer domain...)"
                                    />
                                )}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {uploadedFiles.map((f, i) => <span key={i} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-2 shadow-sm">{f.name} <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}><X size={10}/></button></span>)}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><Settings size={80}/></div>
                                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
                                    <Settings size={14}/> Technical Configuration
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Product</label>
                                        <select value={product} onChange={e => setProduct(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="">Auto-Detect Stack</option>
                                            {Object.keys(PRODUCT_CATALOG).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Deployment Model</label>
                                        <div className="flex gap-2">
                                            {['Cloud', 'On-Premise'].map(mode => (
                                                <button key={mode} onClick={() => setDeploymentModel(mode as any)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all border ${deploymentModel === mode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{mode}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {product && (
                                    <div className="animate-fade-in space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specific Module</label>
                                        <select value={solutionType} onChange={e => setSolutionType(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="">Full Stack Solution</option>
                                            {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">4. Validation Roles</label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'Developer', icon: Code2 },
                                        { id: 'Tester', icon: Beaker },
                                        { id: 'Admin', icon: ShieldAlert }
                                    ].map(role => (
                                        <button key={role.id} onClick={() => toggleAudience(role.id)} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${targetAudience.includes(role.id) ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                            <role.icon size={20} />
                                            <span className="text-[10px] font-black uppercase">{role.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => handleGenerate()} 
                                disabled={isGenerating || (!projectName || (!context && uploadedFiles.length === 0))} 
                                className={`w-full py-5 rounded-[2rem] text-white font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-200 ${isGenerating || !projectName || (!context && uploadedFiles.length === 0) ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
                            >
                                {isGenerating ? <Loader size={24} className="animate-spin" /> : <Sparkles size={24} />} 
                                {isGenerating ? 'Synthesizing Plan...' : 'Generate AI Estimate'}
                            </button>
                            {error && <div className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</div>}
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-[35%] xl:w-[450px] bg-slate-950 text-slate-200 flex-col border-l border-slate-800 relative shrink-0">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-[80px]"></div>
                    </div>
                    <div className="p-10 flex-1 flex flex-col relative z-10">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg"><BrainCircuit size={28} className="text-white" /></div>
                            <div><h3 className="font-black text-white uppercase italic tracking-tight">AI Estimator</h3><p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Logic Extraction Live</p></div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 opacity-60 italic">
                            <Target size={64} className="text-slate-700" />
                            <p className="text-sm leading-relaxed max-w-[280px]">
                                "My neural engine will analyze your RFP files and manual context to derive complexity weights based on the selected product stack."
                            </p>
                            <div className="pt-4 flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const maxWeeks = timeline.length > 0 ? Math.max(...timeline.map(t => t.endWeek)) : 12;
    const weekHeaders = Array.from({ length: Math.max(12, maxWeeks + 2) }, (_, i) => i + 1);

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden relative">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('hub')} className="flex items-center gap-2 p-2 px-3 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200 group" title="Return to Estimator Dashboard"><Home size={20} className="group-hover:text-indigo-600" /><span className="text-xs font-bold uppercase tracking-tight hidden sm:inline group-hover:text-slate-700">Estimator Hub</span></button>
                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg line-clamp-1">{projectName || 'Project Blueprint'}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                           {currentRequestId && <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mr-1 text-slate-600 font-mono tracking-normal">{currentRequestId}</span>}
                           <ShieldCheck size={10} className="text-emerald-500"/> Effort Validation Active
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shadow-inner">
                    {[
                        { id: 'summary', icon: BarChart3, label: 'Overview' },
                        { id: 'effort', icon: Calculator, label: 'Effort' },
                        { id: 'resources', icon: Users, label: 'Staffing' },
                        { id: 'timeline', icon: Calendar, label: 'Timeline' }
                    ].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 pb-32 custom-scrollbar">
                {activeTab === 'summary' && (
                    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={60}/></div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Effort</div>
                                <div className="text-3xl font-black text-slate-800">{totals.grandTotalHours.toFixed(0)} <span className="text-sm font-bold opacity-40">Hrs</span></div>
                                <div className="mt-2 text-[10px] text-slate-400 font-bold">Inclusive of PM & QA buffers</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative group overflow-hidden border-b-emerald-500 border-b-4">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={60}/></div>
                                <div className="text-xs font-bold text-emerald-500 uppercase mb-1">Total Budget</div>
                                <div className="text-3xl font-black text-emerald-600">${totals.finalBudget.toLocaleString()}</div>
                                <div className="mt-2 text-[10px] text-emerald-400 font-bold">Inc. {contingency}% Contingency</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar size={60}/></div>
                                <div className="text-xs font-bold text-blue-400 uppercase mb-1">Project Duration</div>
                                <div className="text-3xl font-black text-blue-600">{maxWeeks} <span className="text-sm font-bold opacity-40">Weeks</span></div>
                                <div className="mt-2 text-[10px] text-blue-400 font-bold">Targeted Implementation</div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-800 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={60} className="text-indigo-400"/></div>
                                <div className="text-xs font-bold text-indigo-300 uppercase mb-1">Team Size</div>
                                <div className="text-3xl font-black text-white">{resources.reduce((acc, r) => acc + r.count, 0)} <span className="text-sm font-bold opacity-40">FTEs</span></div>
                                <div className="mt-2 text-[10px] text-indigo-400 font-bold">Across {resources.length} Roles</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-indigo-500"/> Workstream Distribution</h3>
                                <div className="space-y-6">
                                    {MODULE_CONFIGS.map(m => {
                                        const modTotal = Array.isArray(estimationRows[m.id]) ? estimationRows[m.id].reduce((acc, r) => acc + (r.simpleCount*r.simpleRate + r.mediumCount*r.mediumRate + r.complexCount*r.complexRate), 0) : 0;
                                        const pct = totals.devHours > 0 ? (modTotal / totals.devHours) * 100 : 0;
                                        return (
                                            <div key={m.id} className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-400">{m.title}</span>
                                                    <span className="text-slate-800">{modTotal.toFixed(0)}h ({pct.toFixed(0)}%)</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${m.color} rounded-full transition-all duration-1000 shadow-inner`} style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Briefcase size={20} className="text-emerald-500"/> Resource Allocation</h3>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-400">CONTINGENCY</label>
                                        <input type="number" value={contingency} onChange={e => setContingency(parseInt(e.target.value) || 0)} className="w-12 p-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded text-center"/>
                                        <span className="text-xs font-bold text-slate-400">%</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={resources} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="role" type="category" width={120} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748B'}} axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{fill: 'rgba(99,102,241,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}} />
                                            <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={16}>
                                                {resources.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#64748B'][index % 5]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'effort' && (
                    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
                        {MODULE_CONFIGS.map(m => (
                            <div key={m.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className={`p-5 ${m.color} bg-opacity-10 flex items-center justify-between border-b border-slate-100`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-white rounded-xl shadow-sm font-black text-xs ${m.textColor}`}>{m.id.toUpperCase()}</div>
                                        <span className={`font-black text-sm uppercase tracking-widest ${m.textColor}`}>{m.title}</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                                            <tr>
                                                <th className="p-4 text-left w-[25%]">Activity List</th>
                                                <th className="p-4 text-center bg-indigo-50/30">Simple (Qty)</th>
                                                <th className="p-4 text-center bg-blue-50/30">Medium (Qty)</th>
                                                <th className="p-4 text-center bg-purple-50/30">Complex (Qty)</th>
                                                <th className="p-4 text-center text-slate-500">M-Hr/S</th>
                                                <th className="p-4 text-center text-slate-500">M-Hr/M</th>
                                                <th className="p-4 text-center text-slate-500">M-Hr/C</th>
                                                <th className="p-4 text-right bg-slate-100">Total M-Hrs</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(estimationRows[m.id] || []).map(r => (
                                                <tr key={r.id} className={`hover:bg-slate-50/50 transition-colors group ${m.id === 'mdm' && r.id === 'mdm_1' ? 'bg-indigo-50/20' : ''}`}>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-800">{r.activity}</span>{m.id === 'mdm' && r.id === 'mdm_1' && <span className="flex items-center gap-1 text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter"><LinkIcon size={8} /> Master Driver</span>}</div>
                                                        <div className="text-[10px] text-slate-400 line-clamp-1">{r.description}</div>
                                                    </td>
                                                    <td className="p-4 text-center bg-indigo-50/10">
                                                        <input type="number" className="w-14 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-indigo-600 bg-white shadow-sm" value={r.simpleCount} onChange={(e) => handleUpdateRow(m.id, r.id, 'simpleCount', parseInt(e.target.value) || 0)} />
                                                    </td>
                                                    <td className="p-4 text-center bg-blue-50/10">
                                                        <input type="number" className="w-14 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-blue-600 bg-white shadow-sm" value={r.mediumCount} onChange={(e) => handleUpdateRow(m.id, r.id, 'mediumCount', parseInt(e.target.value) || 0)} />
                                                    </td>
                                                    <td className="p-4 text-center bg-purple-50/10">
                                                        <input type="number" className="w-14 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-purple-600 bg-white shadow-sm" value={r.complexCount} onChange={(e) => handleUpdateRow(m.id, r.id, 'complexCount', parseInt(e.target.value) || 0)} />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input type="number" className="w-12 p-1 text-center bg-transparent border-b border-transparent focus:border-slate-300 text-slate-400 text-xs transition-all" value={r.simpleRate} onChange={(e) => handleUpdateRow(m.id, r.id, 'simpleRate', parseFloat(e.target.value) || 0)} />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input type="number" className="w-12 p-1 text-center bg-transparent border-b border-transparent focus:border-slate-300 text-slate-500 font-bold text-xs transition-all" value={r.mediumRate} onChange={(e) => handleUpdateRow(m.id, r.id, 'mediumRate', parseFloat(e.target.value) || 0)} />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input type="number" className="w-12 p-1 text-center bg-transparent border-b border-transparent focus:border-slate-300 text-slate-400 text-xs transition-all" value={r.complexRate} onChange={(e) => handleUpdateRow(m.id, r.id, 'complexRate', parseFloat(e.target.value) || 0)} />
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-slate-900 bg-slate-100/50">
                                                        {((r.simpleCount * r.simpleRate) + (r.mediumCount * r.mediumRate) + (r.complexCount * r.complexRate)).toFixed(1)}h
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50/80 font-black text-slate-900">
                                                <td className="p-4 uppercase text-[10px] tracking-widest text-slate-400">Workstream Summation</td>
                                                <td colSpan={6}></td>
                                                <td className="p-4 text-right font-mono bg-slate-200/50">
                                                    {(estimationRows[m.id] || []).reduce((acc, r) => acc + (r.simpleCount * r.simpleRate + r.mediumCount * r.mediumRate + r.complexCount * r.complexRate), 0).toFixed(1)}h
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Integrated Staffing Plan</h3>
                                <p className="text-sm text-slate-500">Scale roles instantly. Budget updates in real-time based on market averages.</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-[1.5rem] text-right shadow-sm">
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Live Professional Budget</div>
                                <div className="text-3xl font-black text-emerald-700">${totals.resourceTotalCost.toLocaleString()}</div>
                                <div className="text-[9px] text-emerald-500 font-bold mt-1">Excl. {contingency}% Contingency</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {resources.map((res) => (
                                <div key={res.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 hover:border-indigo-200 hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className={`p-4 rounded-2xl transition-all transform group-hover:scale-105 shrink-0 ${res.count > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}><Users size={24}/></div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 w-full items-center">
                                        <div className="md:col-span-2 space-y-0.5"><label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Enterprise Role</label><input className="w-full font-bold text-base text-slate-800 bg-transparent outline-none focus:text-indigo-600 transition-colors" value={res.role} onChange={e => updateResource(res.id, 'role', e.target.value)} /><p className="text-[10px] text-slate-400 line-clamp-1 italic">{res.description || 'Standard project allocation'}</p></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block text-center">Headcount (FTE)</label><div className="flex items-center justify-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200"><button onClick={() => updateResource(res.id, 'count', Math.max(0, res.count - 1))} className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-red-500 transition-colors"><Minus size={14} /></button><input type="number" className="w-8 bg-transparent text-center font-black text-slate-800 outline-none" value={res.count} onChange={e => updateResource(res.id, 'count', parseInt(e.target.value) || 0)} /><button onClick={() => updateResource(res.id, 'count', res.count + 1)} className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-indigo-600 transition-colors"><Plus size={14} /></button></div></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Bill Rate ($/hr)</label><div className="flex items-center gap-1.5 bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200"><span className="text-emerald-500 font-bold">$</span><input type="number" className="w-full bg-transparent font-bold text-slate-700 outline-none" value={res.rate} onChange={e => updateResource(res.id, 'rate', parseFloat(e.target.value) || 0)} /></div></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Total Hours</label><div className="flex items-center gap-1.5 bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200"><input type="number" className="w-full bg-transparent font-bold text-indigo-600 outline-none" value={res.hours} onChange={e => updateResource(res.id, 'hours', parseFloat(e.target.value) || 0)} /><span className="text-slate-400 font-bold text-[10px]">HRS</span></div></div>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 px-4 min-w-[120px]"><div className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Allocated Value</div><div className="text-lg font-black text-slate-800">${(res.count * res.rate * res.hours).toLocaleString()}</div></div>
                                    <button onClick={() => setResources(prev => prev.filter(r => r.id !== res.id))} className="p-1.5 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button onClick={() => setResources([...resources, { id: `r-${Date.now()}`, role: 'New Role', count: 1, rate: 85, hours: 160 }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition-all"><UserPlus size={16}/> Add Custom Role</button>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
                        <div className="flex justify-between items-center px-4">
                            <div><h3 className="text-xl font-bold text-slate-800">Master Delivery Schedule</h3><p className="text-sm text-slate-500">Phased roadmap generated based on complexity drivers.</p></div>
                            <div className="flex items-center gap-3"><span className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">{maxWeeks} Weeks Total</span></div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                            <div className="overflow-x-auto custom-scrollbar">
                                <div className="min-w-[1000px]">
                                    <div className="flex border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur z-20"><div className="w-64 p-5 border-r border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/20">Workstream / Phase</div><div className="flex-1 flex">{weekHeaders.map(w => (<div key={w} className="flex-1 border-r border-slate-50/50 p-4 text-center text-[10px] font-black text-slate-400 hover:bg-slate-50/50 transition-colors">W{w}</div>))}</div></div>
                                    <div className="divide-y divide-slate-50">
                                        {(timeline || []).sort((a,b) => a.startWeek - b.startWeek).map((item) => (
                                            <div key={item.id} className="flex group hover:bg-slate-50/30 transition-all"><div className="w-64 p-4 border-r border-slate-100 flex flex-col justify-center"><input className="w-full text-[11px] font-bold text-slate-800 bg-transparent outline-none focus:text-indigo-600" value={item.activity} onChange={e => handleUpdateTimelineItem(item.id, 'activity', e.target.value)} /><div className="flex gap-2 mt-1"><span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${item.type === 'Phase' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{item.type}</span><span className="text-[8px] font-bold text-slate-300">W{item.startWeek} - W{item.endWeek}</span></div></div><div className="flex-1 flex relative h-16"><div className="p-2 w-full flex items-center relative z-10"><div className={`h-8 rounded-full flex items-center justify-center shadow-md px-3 relative overflow-hidden transition-all duration-700 hover:scale-[1.02] cursor-pointer ${item.type === 'Phase' ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white text-indigo-600 border border-indigo-100'}`} style={{ marginLeft: `${((item.startWeek - 1) / weekHeaders.length) * 100}%`, width: `${((item.endWeek - item.startWeek + 1) / weekHeaders.length) * 100}%` }}><span className="text-[9px] font-black truncate">{item.activity}</span></div></div></div></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-30">
                <div className="bg-white/90 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] rounded-[2.5rem] border border-indigo-100 p-2.5 flex items-center gap-3 ring-1 ring-indigo-500/10 group">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl group-focus-within:bg-indigo-600 group-focus-within:text-white transition-all duration-300">{isGenerating ? <Loader size={20} className="animate-spin" /> : <Sparkles size={20} />}</div>
                    <input type="text" placeholder="Refine resources or timeline (e.g. 'Add a QA Lead starting W4')..." className="flex-1 bg-transparent outline-none text-sm py-2 px-2 text-slate-700 placeholder:text-slate-400 font-bold tracking-tight" value={refinementInput} onChange={(e) => setRefinementInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerate(refinementInput)} disabled={isGenerating}/>
                    <button onClick={() => handleGenerate(refinementInput)} disabled={!refinementInput.trim() || isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-[1.8rem] transition-all shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2 disabled:opacity-50 active:scale-95 font-black text-xs uppercase tracking-widest"><Send size={14} /> Update Blueprint</button>
                </div>
            </div>
        </div>
    );
};

export default StandaloneEstimator;
