
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Cell, LineChart, Line, AreaChart, Area, ComposedChart, PieChart, Pie
} from 'recharts';
import { 
  ShieldCheck, Database, Fingerprint, 
  ShieldAlert, UserCheck, Scale, Code, 
  X, RefreshCw, Sparkles, Loader2, Gauge, Cpu, 
  FileUp, Send, BrainCircuit, Siren, Layers, ChevronRight,
  CheckCircle, Lock, DatabaseZap, Hammer, CheckSquare, LayoutDashboard,
  Target, Rocket, Wand2, TrendingUp, AlertTriangle, List, FolderKanban, PlusCircle,
  ArrowLeft, Zap, Home, Clock, PieChart as PieChartIcon, Search, ArrowUpRight,
  History as HistoryIcon, Trash2, ChevronDown, ChevronUp, Beaker, ClipboardCheck,
  Terminal, FileCode, FileSpreadsheet, Upload, Check,
  Table
} from 'lucide-react';
import { 
    saveHistory, 
    getHistory,
    deleteHistory,
    getGlobalIntelligence,
    pushLearnedContext
} from '../services/geminiService';

const COLORS = {
  PII: '#6366f1', 
  SPDI: '#f43f5e', 
  VALID: '#10b981',
  INVALID: '#f43f5e',
  SYSTEM: '#94a3b8',
  WARNING: '#f59e0b',
  ACCENT: '#818cf8',
  OPTIMIZED: '#8b5cf6',
  DIMENSIONS: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899']
};

const DQ_DIMENSION_DEFS = [
    { id: 'Accuracy', label: 'Accuracy', desc: 'Data correctly represents the real-world object.', icon: Target, color: 'text-indigo-600' },
    { id: 'Completeness', label: 'Completeness', desc: 'Mandatory fields are populated; no null values.', icon: CheckSquare, color: 'text-emerald-600' },
    { id: 'Validity', label: 'Validity', desc: 'Data conforms to the required format/syntax.', icon: ShieldCheck, color: 'text-blue-600' },
    { id: 'Uniqueness', label: 'Uniqueness', desc: 'No functional or technical duplicate records.', icon: Fingerprint, color: 'text-rose-600' },
    { id: 'Consistency', label: 'Consistency', desc: 'Data is equivalent across all integrated systems.', icon: Scale, color: 'text-amber-600' },
    { id: 'Timeliness', label: 'Timeliness', desc: 'Data is available within the required SLA/Window.', icon: Clock, color: 'text-purple-600' }
];

interface ColumnRule {
    dimension: string;
    logic: string;
    remediation: string;
    assetName: string;
    criticality: 'High' | 'Medium' | 'Low';
    impact?: string;
}

interface ColumnGroup {
    id: string;
    columnName: string;
    type: 'Sensitive' | 'Personal' | 'Business';
    pii_type: 'SPDI' | 'PII';
    nulls: number;
    rules: ColumnRule[];
    ruleRef?: string;
}

interface DQRequest {
    id: string;
    name: string;
    time: string;
    health: number;
    targetHealth: number;
    rowCount: number;
    rawColumns: any[];
    cdeGroups: {
        SPDI: ColumnGroup[];
        PII: ColumnGroup[];
    };
    ruleProfiles: any[];
}

const StandaloneDataQuality: React.FC<{ initialView?: string, initialData?: any }> = ({ initialView = 'hub', initialData }) => {
  const [viewMode, setViewMode] = useState<'hub' | 'setup' | 'workspace'>(initialView as any || 'hub');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metadata' | 'dev_insights' | 'rules'>('dashboard');
  const [requests, setRequests] = useState<DQRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedCdes, setExpandedCdes] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const history = getHistory('DataQuality');
    setRequests(history.map((h: any) => ({ ...h.data, id: h.id, name: h.summary } as DQRequest)));
    
    if (initialData) {
        setActiveRequestId(initialData.id);
        setViewMode('workspace');
    }
  }, [initialData]);

  const activeRequest = useMemo<DQRequest | null>(() => {
    return (requests as DQRequest[]).find((r: DQRequest) => r.id === activeRequestId) || null;
  }, [requests, activeRequestId]);

  // Fix: Explicitly typed the reduction and mapping logic to ensure 'name' is accessible on DQRequest type
  const dashboardStats = useMemo(() => {
    // Cast requests as any[] then to DQRequest[] to resolve potential inference issues where elements might be seen as unknown
    const reqs = (Array.isArray(requests) ? (requests as any[]) : []) as DQRequest[];
    
    const totalHealthAvg = reqs.length > 0 
      ? reqs.reduce((acc: number, r: DQRequest) => acc + (r.health || 0), 0) / reqs.length 
      : 0;
      
    const totalAttrs = reqs.reduce((acc: number, r: DQRequest) => acc + (r.rawColumns?.length || 0), 0);
    
    // Explicitly typed the callback argument 'r' to DQRequest to ensure 'name' and 'health' are resolved from the interface
    const chartData = reqs.map((r: DQRequest) => ({ 
      name: (r.name || "").substring(0, 10), 
      value: r.health || 0 
    }));
    
    return { 
      total: reqs.length, 
      avgHealth: totalHealthAvg.toFixed(1), 
      totalAttrs, 
      data: chartData 
    };
  }, [requests]);

  const allIDMCRules: ColumnRule[] = [
    { dimension: 'Validity', logic: 'LEN==11 AND NUMERIC AND PREFIX IN (2,3)', remediation: 'Standardize prefix to 2/3 and pad to 11 digits.', assetName: 'rs_QatarID_Validity', impact: '+12.4%', criticality: 'High' },
    { dimension: 'Accuracy', logic: 'SUBSTR(1,3) MATCH DOB', remediation: 'Auto-correct year digits based on Birth_Dt.', assetName: 'rs_QatarID_Accuracy', impact: '+5.2%', criticality: 'Medium' },
    { dimension: 'Uniqueness', logic: 'COUNT(*) OVER(PARTITION BY Qatar_ID) == 1', remediation: 'Identify functional duplicates and flag for manual de-duplication.', assetName: 'rs_QatarID_Uniqueness', impact: '+18.1%', criticality: 'High' },
    { dimension: 'Timeliness', logic: 'SYSDATE - Row_Update_Dt < 24H', remediation: 'Trigger refresh for stale records older than 24 hours.', assetName: 'rs_QatarID_Staleness', impact: '+4.0%', criticality: 'Medium' },
    { dimension: 'Accuracy', logic: 'REGEX RFC-5322', remediation: 'Filter junk domains and correct top-level syntax.', assetName: 'rs_Email_Accuracy', impact: '+8.1%', criticality: 'High' },
    { dimension: 'Completeness', logic: 'Qatar_ID IS NOT NULL', remediation: 'Reject records with missing mandatory Qatar IDs.', assetName: 'rs_ID_Completeness', impact: '+10.5%', criticality: 'High' }
  ];

  const toggleCdeExpansion = (id: string) => {
    setExpandedCdes(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const validFiles = files.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['sql', 'xlsx', 'csv'].includes(ext || '');
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExecuteTask = () => {
    if (!taskName.trim()) {
        setSetupError("Task Reference Name is required.");
        return;
    }
    if (selectedFiles.length === 0) {
        setSetupError("Please upload at least one technical profile or SQL specification.");
        return;
    }

    setSetupError(null);
    setIsProcessing(true);
    
    const globalContext = getGlobalIntelligence();
    
    setTimeout(() => {
        const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const timestamp = new Date().toLocaleString();
        
        const newRequest: DQRequest = {
          id,
          name: String(taskName),
          time: timestamp,
          health: 74.2, 
          targetHealth: 95.0, 
          rowCount: 321805,
          rawColumns: [
            { name: 'Qatar_ID', type: 'decimal(11,0)', nulls: 8.2, compliance: 'Low' },
            { name: 'Full_Name', type: 'nvarchar(120)', nulls: 0, compliance: 'High' },
            { name: 'Birth_Dt', type: 'datetime', nulls: 1.2, compliance: 'High' },
            { name: 'Passport_Number', type: 'nvarchar(15)', nulls: 9.5, compliance: 'Low' },
            { name: 'IBAN_Value', type: 'nvarchar(34)', nulls: 9.4, compliance: 'Low' }
          ],
          cdeGroups: {
            SPDI: [
                { id: 'qid', columnName: 'Qatar ID', type: 'Sensitive', nulls: 15.2, ruleRef: 'rs_QatarID_Validity', pii_type: 'SPDI', rules: [allIDMCRules[0], allIDMCRules[1], allIDMCRules[2]] },
                { id: 'bank', columnName: 'Bank Account', type: 'Sensitive', nulls: 12.4, ruleRef: 'rs_Account_Accuracy', pii_type: 'SPDI', rules: [allIDMCRules[5]] }
            ],
            PII: [
                { id: 'fname', columnName: 'Full Name', type: 'Personal', nulls: 0, ruleRef: 'rs_FirstName_Accuracy', pii_type: 'PII', rules: [] },
                { id: 'email', columnName: 'Email Address', type: 'Personal', nulls: 22.1, ruleRef: 'rs_Email_Accuracy', pii_type: 'PII', rules: [allIDMCRules[4]] }
            ]
          },
          ruleProfiles: []
        };

        saveHistory('DataQuality', taskName, newRequest, selectedFiles.map(f => f.name));
        pushLearnedContext('DataQuality', `User initiated DQ scan for "${taskName}". Applied 6-dimension schema to ${newRequest.rawColumns.length} attributes. Files: ${selectedFiles.map(f => f.name).join(', ')}`);
        
        setRequests(prev => [newRequest, ...prev]);
        setActiveRequestId(id);
        setIsProcessing(false);
        setViewMode('workspace');
        setActiveTab('dashboard');
        setTaskName("");
        setSelectedFiles([]);
        setPrompt("");
    }, 1500);
  };

  const renderRequestHub = () => {
    // Fix: Explicitly typing 'h' as DQRequest and casting requests to any[] to fix 'unknown' type errors during filtering of task names
    const filteredRequests = (requests as any[]).filter((h: DQRequest) => (h.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Data Quality Hub</h2>
                        <p className="text-slate-500 font-medium mt-1">Manage and execute neural data quality audits on technical specifications.</p>
                    </div>
                    <button onClick={() => setViewMode('setup')} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"><PlusCircle size={20} /> Initiate New Task</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><ShieldCheck size={20}/></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Scans</div>
                        <div className="text-3xl font-black text-slate-800 mt-1">{dashboardStats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Target size={20}/></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Quality Index</div>
                        <div className="text-3xl font-black text-emerald-600 mt-1">{dashboardStats.avgHealth}%</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Layers size={20}/></div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Attributes Scanned</div>
                        <div className="text-3xl font-black text-blue-600 mt-1">{dashboardStats.totalAttrs}</div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DatabaseZap size={80} className="text-indigo-400"/></div>
                         <div className="relative z-10">
                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Logic Efficiency</div>
                            <div className="text-3xl font-black text-white">98%</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-2">REMEDIATION YIELD</div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                         <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PieChartIcon size={22} className="text-indigo-500"/> Quality Trends</h3></div>
                         <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardStats.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} />
                                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>{dashboardStats.data.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS.DIMENSIONS[index % COLORS.DIMENSIONS.length]} />))}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><HistoryIcon size={22} className="text-slate-400"/> Quality Repository</h3>
                        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Filter task name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            {filteredRequests.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs italic">No scan records found.</div>) : filteredRequests.map((item: DQRequest) => (
                                <div key={item.id} onClick={() => { setActiveRequestId(item.id); setViewMode('workspace'); setActiveTab('dashboard'); }} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between">
                                    <div className="min-w-0 flex-1"><div className="font-bold text-slate-700 text-sm truncate">{item.name}</div><div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{item.time} • {item.health}% Health</div></div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); deleteHistory(item.id); setRequests(getHistory('DataQuality').map((h: any) => ({ ...h.data, id: h.id, name: h.summary } as DQRequest))); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors">
                                        <Trash2 size={14} />
                                    </button><ArrowUpRight size={14} className="text-indigo-400" /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderDashboard = () => (
    <div className="p-10 space-y-8 animate-fade-in custom-scrollbar overflow-y-auto h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Gauge size={80} className="text-indigo-600"/></div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Quality Health</div>
                <div className="text-4xl font-black text-indigo-600 italic relative z-10">{activeRequest?.health}%</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Target size={80} className="text-emerald-600"/></div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Target Score</div>
                <div className="text-4xl font-black text-emerald-600 italic relative z-10">{activeRequest?.targetHealth}%</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Database size={80} className="text-slate-600"/></div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Row Count</div>
                <div className="text-4xl font-black text-slate-800 italic relative z-10">{activeRequest?.rowCount?.toLocaleString() || 0}</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChartIcon size={20} className="text-indigo-500"/> Dimension Health Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={DQ_DIMENSION_DEFS.map(d => ({ name: d.id, val: Math.floor(60 + Math.random() * 35) }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <RechartsTooltip />
                            <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={32}>
                                {DQ_DIMENSION_DEFS.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS.DIMENSIONS[index % COLORS.DIMENSIONS.length]} />))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Fingerprint size={20} className="text-rose-500"/> Privacy Exposure (SPDI/PII)</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert size={14}/> Sensitive Personal (SPDI)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {(activeRequest?.cdeGroups?.SPDI || []).map(c => (
                                <div key={c.id} className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex justify-between items-center group hover:bg-rose-100 transition-colors">
                                    <span className="text-xs font-bold text-rose-700">{c.columnName}</span>
                                    <span className="text-[10px] font-black text-rose-500">{c.nulls}% Null</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2"><UserCheck size={14}/> Personal Info (PII)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {(activeRequest?.cdeGroups?.PII || []).map(c => (
                                <div key={c.id} className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex justify-between items-center group hover:bg-indigo-100 transition-colors">
                                    <span className="text-xs font-bold text-indigo-700">{c.columnName}</span>
                                    <span className="text-[10px] font-black text-indigo-600">{c.nulls}% Null</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderMetadataMap = () => (
    <div className="p-10 space-y-8 animate-fade-in custom-scrollbar overflow-y-auto h-full">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Source Attribute Map</h3>
                <div className="bg-white px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Ingested</div>
            </div>
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                        <th className="px-8 py-5">Attribute Name</th>
                        <th className="px-8 py-5">System Datatype</th>
                        <th className="px-8 py-5">Nullability %</th>
                        <th className="px-8 py-5">Compliance Grade</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {(activeRequest?.rawColumns || []).map((col, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-4 font-bold text-slate-700 text-sm">{col.name}</td>
                            <td className="px-8 py-4 font-mono text-[10px] text-indigo-500 font-bold uppercase">{col.type}</td>
                            <td className="px-8 py-4 text-xs font-medium text-slate-500">{col.nulls}%</td>
                            <td className="px-8 py-4">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${col.compliance === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {col.compliance}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderDeveloperInsights = () => (
    <div className="p-10 space-y-8 animate-fade-in custom-scrollbar overflow-y-auto h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Terminal size={160} /></div>
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 italic uppercase tracking-tight"><Terminal className="text-indigo-400" /> Technical Execution Node</h3>
                <div className="space-y-6 relative z-10 font-mono text-xs">
                    <div className="flex gap-4 items-start border-l-2 border-indigo-500 pol-4 py-1">
                        <span className="text-indigo-400 font-bold">10:42:15</span>
                        <span className="text-slate-400">[SYSTEM] Connection established to GOVERN-IQ-MAC-NODE</span>
                    </div>
                    <div className="flex gap-4 items-start border-l-2 border-emerald-500 pol-4 py-1">
                        <span className="text-emerald-400 font-bold">10:42:18</span>
                        <span className="text-slate-400">[CORE] Dimension Logic Injected: Validity, Accuracy, Completeness</span>
                    </div>
                    <div className="flex gap-4 items-start border-l-2 border-indigo-500 pol-4 py-1">
                        <span className="text-indigo-400 font-bold">10:43:02</span>
                        <span className="text-slate-400">[SCAN] Completed analysis of {activeRequest?.rowCount?.toLocaleString() || 0} records</span>
                    </div>
                    <div className="flex gap-4 items-start border-l-2 border-purple-500 pol-4 py-1">
                        <span className="text-purple-400 font-bold">10:43:05</span>
                        <span className="text-slate-400">[SYNT] Remediation scripts generated with 98% confidence score</span>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm ring-1 ring-indigo-100">
                    <RefreshCw size={32} className="animate-spin-slow" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight mb-2">Continuum Node</h3>
                <p className="text-slate-500 text-sm font-medium italic max-w-xs leading-relaxed mb-6">Execution is handled by the edge node. No heavy lifting performed on client-side browser.</p>
                <div className="flex gap-2">
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">v10.6.4 Stable</div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderRulesEngine = () => {
    const piiCdes = activeRequest?.cdeGroups?.PII || [];
    const spdiCdes = activeRequest?.cdeGroups?.SPDI || [];
    const allGroups = [...piiCdes, ...spdiCdes];

    return (
        <div className="p-10 space-y-8 animate-fade-in max-w-7xl mx-auto custom-scrollbar overflow-y-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {DQ_DIMENSION_DEFS.map((dim) => (
                    <div key={dim.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-indigo-400 transition-all flex items-start gap-4">
                        <div className={`p-3 rounded-2xl bg-slate-50 ${dim.color} group-hover:scale-110 transition-transform`}>
                            <dim.icon size={22} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase italic tracking-tight text-sm mb-1">{dim.label}</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{dim.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Attribute Guardrails</h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Applied technical rules mapped to the 6-dimension schema.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 text-right">
                        <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 leading-none">Elements Processed</div>
                        <div className="text-2xl font-black text-slate-800 leading-none">{allGroups.length}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {allGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 opacity-20 italic">
                        <Fingerprint size={64} className="mb-4" />
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No attribute groups ingested.</p>
                    </div>
                ) : allGroups.map((cde) => {
                    const isExpanded = expandedCdes.has(cde.id);
                    const rules = Array.isArray(cde.rules) ? cde.rules : [];
                    const shortRuleView = rules.length > 0 ? `${rules[0].dimension}: ${rules[0].assetName}` : 'No logic defined';

                    return (
                        <div key={cde.id} className={`bg-white rounded-[2rem] border transition-all duration-300 shadow-sm overflow-hidden ${isExpanded ? 'border-indigo-400 shadow-xl ring-1 ring-indigo-50/10' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div 
                                onClick={() => toggleCdeExpansion(cde.id)}
                                className="p-6 cursor-pointer flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-6 min-w-0 flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-all ${isExpanded ? 'bg-indigo-600 text-white scale-110 rotate-3' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                        <DatabaseZap size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-slate-800 uppercase italic tracking-tight truncate">{cde.columnName}</h4>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${cde.pii_type === 'SPDI' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                {cde.pii_type}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-400">
                                            <Beaker size={12} className="text-slate-300" />
                                            <span className="italic truncate">{shortRuleView}</span>
                                            {rules.length > 1 && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px] font-black text-slate-500">+{rules.length - 1} MORE</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Impact Yield</div>
                                        <div className="text-lg font-black text-emerald-600 leading-none">+{rules.reduce((acc, r) => acc + (parseFloat(r.impact?.replace('+', '') || '0')), 0).toFixed(1)}%</div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-8 pb-8 pt-2 animate-fade-in">
                                    <div className="h-px bg-slate-100 mb-8" />
                                    {rules.length === 0 ? (
                                        <div className="bg-slate-50 rounded-2xl p-10 text-center border border-dashed border-slate-200">
                                            <AlertTriangle size={32} className="text-slate-300 mx-auto mb-3" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No dimension logic defined for this attribute.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {rules.map((r, i) => {
                                                const DimIcon = DQ_DIMENSION_DEFS.find(d => d.id === r.dimension)?.icon || Code;
                                                return (
                                                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group/rule hover:border-indigo-200 transition-colors relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/rule:scale-110 transition-transform"><Scale size={100} className="text-indigo-900" /></div>
                                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100">
                                                                    <Code size={18} />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-black text-slate-800 uppercase italic text-xs leading-none">{r.assetName}</h5>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block flex items-center gap-1">
                                                                        <DimIcon size={10}/> {r.dimension} Dimension
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${r.criticality === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                                {r.criticality}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-4 relative z-10">
                                                            <div className="bg-white p-3 rounded-xl font-mono text-[10px] text-slate-600 border border-slate-100 shadow-inner">
                                                                {r.logic}
                                                            </div>
                                                            <div className="flex items-start gap-2 text-xs font-medium text-slate-500 italic leading-relaxed">
                                                                <Hammer size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                                                {r.remediation}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderSetup = () => (
    <div className="h-full flex items-center justify-center p-8 bg-slate-50 animate-fade-in overflow-y-auto custom-scrollbar">
        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-200 max-w-2xl w-full relative overflow-hidden my-8">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={160} className="text-indigo-600"/></div>
            <div className="relative z-10">
                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-indigo-200"><ShieldCheck size={32} /></div>
                <div className="text-center mb-10"><h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Initiate Quality Scan</h1><p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 italic">Neural Profiling Orchestrator</p></div>
                
                <div className="space-y-8">
                    {/* Task Identity */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1 mb-2 block">Task Reference Identity</label>
                        <input 
                            type="text" 
                            value={taskName} 
                            onChange={(e) => setTaskName(e.target.value)} 
                            placeholder="e.g., Salesforce Core Schema Audit" 
                            className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none text-lg font-bold shadow-inner transition-all placeholder:text-slate-300" 
                        />
                    </div>
                    
                    {/* Input Mode Choice */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1 block">Technical Data Source</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${selectedFiles.some(f => f.name.endsWith('.sql')) ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white'}`}
                            >
                                <FileCode className={`mb-2 ${selectedFiles.some(f => f.name.endsWith('.sql')) ? 'text-indigo-600' : 'text-slate-400'}`} size={32} />
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-600">SQL DDL / Specs</span>
                                <p className="text-[9px] text-slate-400 mt-1">Structure Analysis</p>
                            </div>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${selectedFiles.some(f => f.name.match(/\.(xlsx|csv)$/i)) ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-white'}`}
                            >
                                <FileSpreadsheet className={`mb-2 ${selectedFiles.some(f => f.name.match(/\.(xlsx|csv)$/i)) ? 'text-emerald-600' : 'text-slate-400'}`} size={32} />
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-600">Profiling Data</span>
                                <p className="text-[9px] text-slate-400 mt-1">Excel or CSV</p>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            multiple
                            accept=".sql,.xlsx,.csv"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fade-in">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Ingestion Queue ({selectedFiles.length})</h4>
                            <div className="space-y-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between group shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {file.name.endsWith('.sql') ? <Code size={14} className="text-indigo-500" /> : <Table size={14} className="text-emerald-500" />}
                                            <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <button onClick={() => removeFile(idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Neural Intent */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pl-1 block">Neural Logic Instructions (Optional)</label>
                        <textarea 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            placeholder="e.g. 'Audit Qatar ID validity, ensure no duplicates in Customer_Email, and check for staleness in Row_Update_Dt'..." 
                            className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none text-sm font-medium h-24 resize-none transition-all shadow-inner placeholder:text-slate-300"
                        />
                    </div>

                    {setupError && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-3 animate-pulse">
                            <AlertTriangle size={18} />
                            <p className="text-[10px] font-black uppercase tracking-tight">{setupError}</p>
                        </div>
                    )}

                    <div className="flex space-x-4 pt-4">
                        <button onClick={() => { setViewMode('hub'); setSelectedFiles([]); setTaskName(""); setPrompt(""); }} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                        <button 
                            onClick={handleExecuteTask} 
                            disabled={isProcessing || !taskName.trim() || selectedFiles.length === 0}
                            className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 ${isProcessing || !taskName.trim() || selectedFiles.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 grayscale' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Analyzing Source...</> : <><Check size={16}/> Execute Analysis</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-slate-50 text-slate-900 overflow-hidden relative font-sans">
      {viewMode === 'workspace' && (
        <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col p-8 shrink-0 z-20 shadow-xl shadow-slate-100 animate-fade-in">
            <div className="text-center mb-12 bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm"><div className="bg-indigo-600 p-4 rounded-2xl shadow-lg mb-6 text-white w-fit mx-auto transform hover:rotate-12 transition-transform shadow-indigo-200"><ShieldCheck size={32} /></div><h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-slate-800">GOVERN<span className="text-indigo-600">IQ</span></h1><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block italic">Engine v10.6</span></div>
            <nav className="space-y-4 flex-1">{[{ id: 'dashboard', label: 'DQ Dashboard', icon: LayoutDashboard },{ id: 'metadata', label: 'Attribute Map', icon: List },{ id: 'dev_insights', label: 'Execution', icon: Cpu },{ id: 'rules', label: 'Logic Schema', icon: ClipboardCheck }].map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all text-[11px] font-black tracking-widest uppercase italic ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl scale-[1.05]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}><item.icon size={20} /><span>{item.label}</span></button>))}</nav>
            <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden"><div className="flex justify-between items-center mb-4 relative z-10"><p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest italic leading-none">Node Live</p><div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse"></div></div><p className="text-[8px] text-slate-500 font-black font-mono uppercase tracking-[0.3em] italic border-t border-white/10 pt-4 text-center">DQ_MAC_NODE_V10.6</p><div className="absolute top-0 right-0 p-4 opacity-5"><RefreshCw size={60} className="animate-spin-slow" /></div></div>
        </aside>
      )}
      <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-30 shadow-sm">
              <div className="flex items-center gap-6">{viewMode === 'workspace' && <button onClick={() => setViewMode('hub')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors" title="Back to Hub"><Home size={20}/></button>}<h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em] italic border-l-8 border-indigo-600 pl-6 leading-none">{viewMode === 'hub' ? 'HUB_DASHBOARD' : viewMode === 'setup' ? 'TASK_INITIALIZATION' : activeTab.toUpperCase()}</h2></div>
              {viewMode === 'workspace' && (<div className="flex items-center gap-4"><div className="text-right hidden sm:block"><p className="text-xs font-black text-slate-800 uppercase italic leading-none tracking-tight">{(activeRequest as DQRequest)?.name}</p><p className="text-[9px] text-indigo-600 font-black uppercase mt-1 tracking-widest leading-none">Cross-Module Sync: Active</p></div><div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg transform hover:rotate-6 transition-transform cursor-pointer italic">IQ</div></div>)}
          </header>
          <div className="flex-1 min-h-0 overflow-hidden relative">
              {viewMode === 'hub' && renderRequestHub()}
              {viewMode === 'setup' && renderSetup()}
              {viewMode === 'workspace' && (
                <>
                  {activeTab === 'dashboard' && renderDashboard()}
                  {activeTab === 'metadata' && renderMetadataMap()}
                  {activeTab === 'dev_insights' && renderDeveloperInsights()}
                  {activeTab === 'rules' && renderRulesEngine()}
                </>
              )}
          </div>
      </main>
    </div>
  );
};

export default StandaloneDataQuality;
