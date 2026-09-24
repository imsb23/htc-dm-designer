
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, UploadCloud, Sparkles, Loader, BrainCircuit, Target, Layers, Plus, Search, ArrowLeft, Home, Building2, AlertCircle, ArrowUpRight, Box, PieChart as PieChartIcon, History, Clock,
  // Added Trash2 to imports
  Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateProjectUnderstanding, saveHistory, getHistory, deleteHistory, aggregateFileContext } from '../services/geminiService';
import { ProjectDescriptionResponse } from '../types';

const ProjectDescriber: React.FC<{ initialView?: string, initialData?: any }> = ({ initialView = 'hub', initialData }) => {
    const [view, setView] = useState<'hub' | 'create' | 'detail'>(initialView as any);
    const [projects, setProjects] = useState<any[]>([]);
    const [activeProject, setActiveProject] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({ title: '', context: '' });
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const history = getHistory('Describer');
        setProjects(history);
        if (initialData) {
            setActiveProject(initialData);
            setView('detail');
        }
    }, [initialData]);

    const handleCreate = async () => {
        if (!formData.title.trim()) { setError("Title required."); return; }
        setIsGenerating(true);
        setError(null);
        try {
            const fileContext = await aggregateFileContext(uploadedFiles);
            const fullContext = `${formData.context}\n\n${fileContext}`;
            const result = await generateProjectUnderstanding(fullContext);
            const entry = { summary: formData.title, data: { title: formData.title, context: fullContext, data: result }, date: new Date().toLocaleDateString(), files: uploadedFiles.map(f => f.name) };
            saveHistory('Describer', formData.title, entry.data, entry.files);
            setActiveProject(entry);
            setView('detail');
        } catch (e) { setError("Analysis failed."); } finally { setIsGenerating(false); }
    };

    const dashboardStats = useMemo(() => {
        const totalFiles = projects.reduce((acc, curr) => acc + (curr.files?.length || 0), 0);
        const data = projects.map((p, i) => ({ name: p.summary.substring(0, 10), value: p.files?.length || 0 }));
        return { total: projects.length, totalFiles, data };
    }, [projects]);

    const filteredProjects = projects.filter(p => p.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    if (view === 'hub') {
        return (
            <div className="h-full flex flex-col bg-slate-50 animate-fade-in p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto w-full space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Project Intelligence</h2>
                            <p className="text-slate-500 font-medium mt-1">Deep analysis of complex technical specifications and RFPs.</p>
                        </div>
                        <button onClick={() => setView('create')} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"><Plus size={20} /> New Analysis</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><FileText size={20}/></div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Summaries</div>
                            <div className="text-3xl font-black text-slate-800 mt-1">{dashboardStats.total}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Target size={20}/></div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ingested Files</div>
                            <div className="text-3xl font-black text-emerald-600 mt-1">{dashboardStats.totalFiles}</div>
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><BrainCircuit size={20}/></div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Insights Extracted</div>
                            <div className="text-3xl font-black text-blue-600 mt-1">{dashboardStats.total * 5}</div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Layers size={80} className="text-indigo-400"/></div>
                             <div className="relative z-10">
                                <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">RFP Intelligence</div>
                                <div className="text-3xl font-black text-white">V3.0</div>
                                <div className="text-[10px] text-slate-500 font-bold mt-2">ACTIVE NLP LEXICON</div>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                             <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PieChartIcon size={22} className="text-indigo-500"/> Volume Distribution</h3></div>
                             <div className="flex-1 min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardStats.data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} />
                                        <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>{dashboardStats.data.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#64748B'][index % 5]} />))}</Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col"><h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><History size={22} className="text-slate-400"/> Analysis History</h3>
                            <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Filter project title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                                {filteredProjects.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs italic">No intelligence records found.</div>) : filteredProjects.map((p, i) => (
                                    <div key={i} onClick={() => { setActiveProject(p); setView('detail'); }} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between">
                                        <div className="min-w-0 flex-1"><div className="font-bold text-slate-700 text-sm truncate">{p.summary}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{p.date} • {p.files?.length || 0} Files Ingested</div></div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); deleteHistory(p.id); setProjects(getHistory('Describer')); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={14} /></button><ArrowUpRight size={14} className="text-indigo-400" /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-8 animate-fade-in">
                <div className="max-w-2xl w-full bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200 space-y-8 animate-fade-in-up">
                    <button onClick={() => setView('hub')} className="flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/> Back</button>
                    <h2 className="text-3xl font-bold text-slate-900">New Technical Analysis</h2>
                    <div className="space-y-4">
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Project Title" className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                        <textarea value={formData.context} onChange={e => setFormData({...formData, context: e.target.value})} placeholder="Context / Requirements..." className="w-full h-32 p-4 rounded-xl border border-slate-200 resize-none outline-none" />
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <UploadCloud className="text-slate-400 mb-2" size={32} />
                            <span className="text-sm font-bold text-slate-600">Attach Specifications (PDF, Word, etc.)</span>
                            <input type="file" multiple className="hidden" onChange={e => e.target.files && setUploadedFiles(Array.from(e.target.files))} />
                        </label>
                        {uploadedFiles.length > 0 && <div className="flex gap-2 flex-wrap">{uploadedFiles.map((f, i) => <span key={i} className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 p-1 rounded px-2 font-bold">{f.name}</span>)}</div>}
                    </div>
                    {error && <div className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={14}/> {error}</div>}
                    <button onClick={handleCreate} disabled={isGenerating} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                        {isGenerating ? <Loader size={20} className="animate-spin" /> : <Sparkles size={20} />} Run Neural Analysis
                    </button>
                </div>
            </div>
        );
    }

    const result = activeProject.data.data;
    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
                <button onClick={() => setView('hub')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Home size={20}/></button>
                <h2 className="font-bold text-slate-800 text-lg uppercase italic">{activeProject.summary}</h2>
                <div className="w-10"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Target size={100}/></div>
                    <div className="flex items-center gap-3 mb-4 bg-slate-50 p-4 rounded-xl w-fit">
                        <Building2 size={24} className="text-teal-600" />
                        <span className="font-bold text-lg">{result.client || 'Client Confidential'}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Executive Summary</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">{result.executiveSummary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest text-blue-600 border-b border-slate-50 pb-2">Objectives</h4>
                        <ul className="space-y-3">{result.objectives.map((o: any, i: number) => <li key={i} className="text-sm text-slate-600 flex gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"/> {o}</li>)}</ul>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest text-orange-600 border-b border-slate-50 pb-2">Constraints</h4>
                        <ul className="space-y-3">{result.constraints.map((c: any, i: number) => <li key={i} className="text-sm text-slate-600 flex gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"/> {c}</li>)}</ul>
                    </div>
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                    <h4 className="font-bold mb-8 flex gap-2 items-center text-lg uppercase italic"><Layers size={22} className="text-teal-400"/> Inferred Tech Stack</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"><span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Sources</span><p className="mt-2 text-sm font-bold">{result.techStack.sources.join(', ')}</p></div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"><span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Targets</span><p className="mt-2 text-sm font-bold">{result.techStack.targets.join(', ')}</p></div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"><span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Tools</span><p className="mt-2 text-sm font-bold">{result.techStack.tools.join(', ')}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDescriber;
