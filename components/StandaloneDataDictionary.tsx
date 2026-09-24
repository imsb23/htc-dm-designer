
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Database, 
  Table as TableIcon, 
  Upload, 
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Layers,
  Loader2,
  Trash2, 
  Download,
  Eye,
  Plus,
  ArrowRight,
  Clock,
  Zap,
  X,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Home,
  History as HistoryIcon,
  BrainCircuit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

/* Utility to load XLSX library dynamically */
const loadXlsxLib = (): Promise<any> => {
  return new Promise((resolve) => {
    if ((window as any).XLSX) return resolve((window as any).XLSX);
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve((window as any).XLSX);
    document.head.appendChild(script);
  });
};

/* Helper for title casing strings */
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(/[_\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

interface StandaloneDataDictionaryProps {
  initialView?: string;
  initialData?: any;
}

const StandaloneDataDictionary: React.FC<StandaloneDataDictionaryProps> = ({ initialView, initialData }) => {
  const [data, setData] = useState<any>({});
  const [requests, setRequests] = useState<any[]>([]); 
  const [activeDb, setActiveDb] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'management' | 'browser'>(initialView === 'browser' ? 'browser' : 'management'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedObjects, setExpandedObjects] = useState<Record<string, boolean>>({});
  const [showCreateForm, setShowCreateForm] = useState(initialView === 'create');
  const [taskName, setTaskName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadXlsxLib();
    const savedData = localStorage.getItem('standalone_dict_data');
    const savedReqs = localStorage.getItem('standalone_dict_reqs');
    if (savedData) try { setData(JSON.parse(savedData)); } catch(e) {}
    if (savedReqs) try { setRequests(JSON.parse(savedReqs)); } catch(e) {}
    if (initialData?.taskName) { setActiveDb(initialData.taskName); setActiveView('browser'); }
  }, [initialData]);

  useEffect(() => {
    if (Object.keys(data).length > 0) localStorage.setItem('standalone_dict_data', JSON.stringify(data));
    if (requests.length > 0) localStorage.setItem('standalone_dict_reqs', JSON.stringify(requests));
  }, [data, requests]);

  const stats = useMemo(() => {
    let totalObjects = 0; let totalColumns = 0;
    Object.values(data).forEach((db: any) => { 
      if (!db || typeof db !== 'object') return;
      Object.values(db).forEach((schema: any) => { 
        if (!schema || typeof schema !== 'object') return;
        const objects = Object.values(schema); 
        totalObjects += objects.length; 
        objects.forEach((obj: any) => { 
          totalColumns += (Array.isArray(obj.columns) ? obj.columns.length : 0); 
        }); 
      }); 
    });
    const trendData = (Array.isArray(requests) ? requests : []).slice(0, 5).reverse().map(r => ({ name: (r.taskName || "").substring(0, 8), value: r.tableCount || 0 }));
    return { totalTasks: (Array.isArray(requests) ? requests.length : 0), totalObjects, totalColumns, latestTask: requests[0]?.timestamp || 'No activity', trendData };
  }, [data, requests]);

  const toggleObject = (objId: string) => { setExpandedObjects(prev => ({ ...prev, [objId]: !prev[objId] })); };
  const clearAllData = () => { if (window.confirm("Wipe repository?")) { setData({}); setRequests([]); setActiveDb(null); setActiveView('management'); setShowCreateForm(false); localStorage.removeItem('standalone_dict_data'); localStorage.removeItem('standalone_dict_reqs'); } };

  const logRequest = (name: string, fileName: string, fileSize: number, tableCount: number) => {
    const newRequest = { id: Date.now(), taskName: name, fileName, fileSize: (fileSize / 1024).toFixed(1) + ' KB', timestamp: new Date().toLocaleString(), status: 'Completed', tableCount };
    setRequests(prev => [newRequest, ...prev]);
  };

  const parseSqlContent = (sql: string, dbKey: string, fileMetadata: { name: string, size: number }) => {
    let match; let tableCount = 0; const workingData: any = {};
    const createTableRegex = /CREATE\s+TABLE\s+((?:(?:\[?[\w\s$#]+\]?\.)?\[?[\w\s$#]+\]?\.)?\[?[\w\s$#]+\]?)\s*\(/gi;
    while ((match = createTableRegex.exec(sql)) !== null) {
      const fullTableName = match[1]; const startPos = createTableRegex.lastIndex; let depth = 1, endPos = startPos;
      while (depth > 0 && endPos < sql.length) { if (sql[endPos] === '(') depth++; else if (sql[endPos] === ')') depth--; endPos++; }
      if (depth === 0) {
        const columnBlock = sql.substring(startPos, endPos - 1);
        const nameParts = fullTableName.replace(/[\[\]]/g, '').split('.');
        const schemaName = nameParts.length > 1 ? nameParts[0].trim() : "dbo";
        const tableName = nameParts.length > 1 ? nameParts[1].trim() : nameParts[0].trim();
        const columnLines = columnBlock.split(/,(?![^(]*\))/);
        const columns = columnLines.map(line => {
          const trimmed = line.trim(); if (!trimmed || /^(CONSTRAINT|PRIMARY|FOREIGN|INDEX|KEY|CHECK|UNIQUE|GO|SET|EXEC|ALTER)/i.test(trimmed)) return null;
          const parts = trimmed.replace(/[\[\]]/g, '').split(/\s+/).filter(p => p.length > 0);
          return parts.length >= 2 ? { Column_Name: parts[0], Datatype: parts[1].toUpperCase(), Source_Type: "Task Upload" } : null;
        }).filter(Boolean);
        if (!workingData[schemaName]) workingData[schemaName] = {};
        workingData[schemaName][tableName] = { type: 'TABLE', columns };
        tableCount++;
      }
    }
    setData((prev: any) => ({ ...prev, [dbKey]: workingData }));
    logRequest(dbKey, fileMetadata.name, fileMetadata.size, tableCount);
    setActiveDb(dbKey);
  };

  const parseCsvContent = (csvText: string, dbKey: string, fileMetadata: { name: string, size: number }) => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return;

    const splitCsvLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = splitCsvLine(lines[0]);
    const workingDb: any = {};
    const seenTables = new Set();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = splitCsvLine(lines[i]);
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const schema = row['Schema'] || 'dbo';
      const objectName = row['Object Name'] || row['Object_Name'] || 'Unknown';
      const columnName = row['Column Name'] || row['Column_Name'] || 'Unknown';
      const dataType = row['DataType'] || row['Data_Type'] || row['Datatype'] || 'N/A';
      const sourceType = row['Source Type'] || row['Source_Type'] || fileMetadata.name;

      const tableKey = `${schema}.${objectName}`;
      seenTables.add(tableKey);

      if (!workingDb[schema]) workingDb[schema] = {};
      if (!workingDb[schema][objectName]) workingDb[schema][objectName] = { type: 'TABLE', columns: [] };
      
      workingDb[schema][objectName].columns.push({
        Column_Name: columnName,
        Datatype: dataType,
        Source_Type: sourceType
      });
    }

    setData((prev: any) => ({ ...prev, [dbKey]: workingDb }));
    logRequest(dbKey, fileMetadata.name, fileMetadata.size, seenTables.size);
    setActiveDb(dbKey);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!taskName || !selectedFile) return;
    setIsLoading(true);
    const fileMetadata = { name: selectedFile.name, size: selectedFile.size };
    
    if (fileMetadata.name.toLowerCase().endsWith('.sql')) {
        const reader = new FileReader(); 
        reader.onload = (e: any) => { 
          parseSqlContent(e.target.result, taskName, fileMetadata); 
          setIsLoading(false); 
          setActiveView('browser'); 
          setShowCreateForm(false); 
          setTaskName(''); 
          setSelectedFile(null); 
        }; 
        reader.readAsText(selectedFile);
    } else {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
            const XLSX = await loadXlsxLib();
            if (fileMetadata.name.toLowerCase().endsWith('.csv')) {
                parseCsvContent(e.target.result, taskName, fileMetadata);
            } else {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                parseCsvContent(csv, taskName, fileMetadata);
            }
            setIsLoading(false);
            setActiveView('browser');
            setShowCreateForm(false);
            setTaskName('');
            setSelectedFile(null);
        };
        if (fileMetadata.name.toLowerCase().endsWith('.csv')) {
            reader.readAsText(selectedFile);
        } else {
            reader.readAsBinaryString(selectedFile);
        }
    }
  };

  if (showCreateForm) {
      return (
          <div className="h-full bg-slate-50 flex items-center justify-center p-8 animate-fade-in">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 max-w-xl w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={160} className="text-indigo-600"/></div>
                  <div className="relative z-10">
                      <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg"><Database size={32} /></div>
                      <div className="text-center mb-10"><h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Dictionary Task</h1><p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 italic">Metadata Extraction Engine</p></div>
                      <form onSubmit={handleFormSubmit} className="space-y-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pl-1">Task Identifier</label>
                              <input 
                                  type="text" 
                                  value={taskName} 
                                  onChange={(e) => setTaskName(e.target.value)} 
                                  placeholder="e.g., Salesforce Core Schema" 
                                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none text-lg font-bold shadow-sm transition-all" 
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pl-1">Technical Specification</label>
                              <label className={`group cursor-pointer p-8 border-2 border-dashed rounded-2xl transition-all block text-center ${isLoading ? 'bg-indigo-50 border-indigo-300' : 'hover:border-indigo-400 hover:bg-slate-50 border-slate-200'}`}>
                                  {isLoading ? (
                                      <div className="flex flex-col items-center py-4">
                                          <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
                                          <h2 className="text-sm font-black text-indigo-600 animate-pulse uppercase italic">Extracting Models...</h2>
                                      </div>
                                  ) : (
                                      <>
                                          <Upload size={48} className="text-slate-300 group-hover:text-indigo-600 mx-auto mb-2 transition-transform" />
                                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedFile ? selectedFile.name : 'Drop SQL/Excel/CSV spec'}</p>
                                          <input type="file" className="hidden" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
                                      </>
                                  )}
                              </label>
                          </div>
                          <div className="flex space-x-3 pt-4">
                              <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                              <button type="submit" disabled={isLoading || !taskName || !selectedFile} className={`flex-[2] py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${(!taskName || !selectedFile) ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 grayscale' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                  {isLoading ? 'Processing...' : 'Execute Extraction'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      );
  }

  if (activeView === 'management') {
      const filteredRequests = (Array.isArray(requests) ? requests : []).filter(h => (h.taskName || "").toLowerCase().includes(searchTerm.toLowerCase()));
      return (
          <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-7xl mx-auto w-full space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                      <div>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Metadata Repository</h2>
                          <p className="text-slate-500 font-medium mt-1">Unified access to extracted data models and technical schemas.</p>
                      </div>
                      <button onClick={() => setShowCreateForm(true)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"><Plus size={20} /> New Extraction</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><Layers size={20}/></div><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Extractions</div><div className="text-3xl font-black text-slate-800 mt-1">{stats.totalTasks}</div></div>
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><TableIcon size={20}/></div><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Identified Tables</div><div className="text-3xl font-black text-emerald-600 mt-1">{stats.totalObjects}</div></div>
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Clock size={20}/></div><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Latest Sync</div><div className="text-sm font-black text-blue-600 mt-1 truncate">{stats.latestTask}</div></div>
                      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><BrainCircuit size={80} className="text-indigo-400"/></div><div className="relative z-10"><div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Logic Density</div><div className="text-3xl font-black text-white">{stats.totalColumns}</div><div className="text-[10px] text-slate-500 font-bold mt-2">TECHNICAL ATTRIBUTES</div></div></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col"><div className="flex justify-between items-center mb-8"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PieChartIcon size={22} className="text-indigo-500"/> Capacity Mapping</h3></div><div className="flex-1 min-h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.trendData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} /><RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} /><Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>{stats.trendData.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#64748B'][index % 5]} />))}</Bar></BarChart></ResponsiveContainer></div></div>
                      <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col"><h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><HistoryIcon size={22} className="text-slate-400"/> Technical Registry</h3><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Filter project..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div><div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">{filteredRequests.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs italic">No extraction records found.</div>) : filteredRequests.map((item) => (<div key={item.id} onClick={() => { setActiveDb(item.taskName); setActiveView('browser'); }} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between"><div className="min-w-0 flex-1"><div className="font-bold text-slate-700 text-sm truncate">{item.taskName}</div><div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{item.timestamp} • {item.tableCount} Tables</div></div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); const newRequests = requests.filter(r => r.id !== item.id); setRequests(newRequests); if (activeDb === item.taskName) setActiveDb(null); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={14} /></button><ArrowUpRight size={14} className="text-indigo-400" /></div></div>))}</div></div>
                  </div>
              </div>
          </div>
      );
  }

  // Dictionary Browser
  const currentDb = data[activeDb || ''] || {};
  const allObjects: any[] = [];
  Object.keys(currentDb).forEach(schema => {
      if (!currentDb[schema] || typeof currentDb[schema] !== 'object') return;
      Object.keys(currentDb[schema]).forEach(name => {
          allObjects.push({ schema, name, ...currentDb[schema][name] });
      });
  });

  const filteredObjects = allObjects.filter(obj => 
      (obj.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (obj.schema || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden animate-fade-in">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveView('management')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Home size={20}/></button>
                <div className="w-px h-8 bg-slate-100"></div>
                <h2 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{activeDb}</h2>
                <div className="bg-indigo-50 px-3 py-1 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest">Metadata Browser</div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" placeholder="Filter technical objects..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all w-48 focus:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                <button onClick={() => setShowCreateForm(true)} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"><Plus size={18}/></button>
            </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
            <aside className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto p-4 custom-scrollbar shrink-0">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Logical Schema</h3>
                <div className="space-y-1">
                    {filteredObjects.map((obj, i) => (
                        <button key={i} onClick={() => toggleObject(`${obj.schema}.${obj.name}`)} className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${expandedObjects[`${obj.schema}.${obj.name}`] ? 'bg-white shadow-md ring-1 ring-slate-200' : 'hover:bg-white/50'}`}>
                            <div className={`p-2 rounded-lg transition-colors ${expandedObjects[`${obj.schema}.${obj.name}`] ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}><TableIcon size={14}/></div>
                            <div className="min-w-0 flex-1"><p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{obj.schema}</p><p className="text-[11px] font-bold text-slate-700 truncate">{obj.name}</p></div>
                            <ChevronRight size={14} className={`text-slate-300 transition-transform ${expandedObjects[`${obj.schema}.${obj.name}`] ? 'rotate-90 text-indigo-500' : ''}`} />
                        </button>
                    ))}
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 bg-slate-100/50 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-6 pb-20">
                    {Object.keys(expandedObjects).filter(k => expandedObjects[k]).map(key => {
                        const [schema, name] = key.split('.');
                        const obj = currentDb[schema]?.[name];
                        if (!obj) return null;
                        return (
                            <div key={key} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in-up">
                                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center"><div className="flex items-center gap-4"><div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 border border-slate-100"><TableIcon size={24}/></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{schema} Schema</p><h3 className="text-xl font-black text-slate-800 tracking-tight">{name}</h3></div></div><button onClick={() => toggleObject(key)} className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-slate-600 transition-all"><X size={20}/></button></div>
                                <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100"><th className="px-8 py-4">Column Identity</th><th className="px-8 py-4">Datatype Logic</th><th className="px-8 py-4">Source Origin</th></tr></thead><tbody className="divide-y divide-slate-50">{(Array.isArray(obj.columns) ? obj.columns : []).map((col: any, i: number) => (<tr key={i} className="hover:bg-indigo-50/20 transition-colors"><td className="px-8 py-4 font-bold text-slate-700 text-sm">{col.Column_Name}</td><td className="px-8 py-4 font-mono text-[10px] text-indigo-500 font-bold">{col.Datatype}</td><td className="px-8 py-4 text-[10px] font-bold text-slate-400 italic">{col.Source_Type}</td></tr>))}</tbody></table></div>
                            </div>
                        );
                    })}
                    {Object.keys(expandedObjects).filter(k => expandedObjects[k]).length === 0 && (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300 opacity-40"><Eye size={64} className="mb-4" /><p className="font-black uppercase tracking-[0.3em] text-xs">Select objects from side panel to view details</p></div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};

export default StandaloneDataDictionary;
