
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Search, 
  FileText,
  HelpCircle,
  X, 
  Filter, 
  Trash2, 
  ArrowLeft, 
  LayoutGrid, 
  List as ListIcon, 
  Clock, 
  MoreHorizontal, 
  FolderOpen, 
  PieChart 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import CreateForm from './CreateForm';
import { RequestData, UserProfile } from '../types';

interface DesignHubProps {
  requests: RequestData[];
  onRequestCreate: (data: any) => void;
  onSelectRequest: (req: RequestData) => void;
  onDeleteRequest: (id: string) => void;
  userProfile?: UserProfile;
  setHasUnsavedChanges: (val: boolean) => void;
  handleSwitchTab: (tab: string) => void;
  initialView?: 'hub' | 'create';
}

const DesignHub: React.FC<DesignHubProps> = ({ 
  requests, 
  onRequestCreate, 
  onSelectRequest, 
  onDeleteRequest, 
  userProfile, 
  setHasUnsavedChanges,
  handleSwitchTab,
  initialView = 'hub'
}) => {
  const [view, setView] = useState<'hub' | 'create'>('hub');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [showHelp, setShowHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Completed' | 'Not Started'>('All');

  // Handle external navigation intent
  useEffect(() => {
      if (initialView) {
          setView(initialView);
      }
  }, [initialView]);

  // Watch for view change to clean up dirty state
  useEffect(() => {
      if (view === 'hub') {
          setHasUnsavedChanges(false);
      }
  }, [view, setHasUnsavedChanges]);

  const handleFormDirty = (isDirty: boolean) => {
      setHasUnsavedChanges(isDirty);
  };

  const handleBackToOverview = () => {
      setView('hub');
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || r.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics Data
  const statusCounts = [
      { name: 'Completed', value: requests.filter(r => r.status === 'Completed').length, color: '#10B981' },
      { name: 'In Progress', value: requests.filter(r => r.status === 'In Progress').length, color: '#3B82F6' },
      { name: 'Not Started', value: requests.filter(r => r.status === 'Not Started').length, color: '#94A3B8' },
  ];

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Completed': return 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50';
          case 'In Progress': return 'bg-blue-100/50 text-blue-700 border-blue-200/50';
          default: return 'bg-slate-100/50 text-slate-600 border-slate-200/50';
      }
  };

  if (view === 'create') {
    return (
      <div className="relative h-full flex flex-col bg-white/30 backdrop-blur-3xl">
        <div className="bg-white/50 backdrop-blur-md border-b border-white/50 p-4 px-8 flex justify-between items-center shadow-sm sticky top-0 z-30">
            <button onClick={handleBackToOverview} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16}/> Back to Design Hub
            </button>
        </div>
        <div className="flex-1 overflow-hidden">
            <CreateForm 
            onSubmit={(data) => {
                onRequestCreate(data);
                setView('hub'); 
                setHasUnsavedChanges(false);
            }} 
            onCancel={() => {
                setView('hub');
                setHasUnsavedChanges(false);
            }} 
            userProfile={userProfile}
            onDirtyChange={handleFormDirty} 
            />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[2400px] mx-auto h-full flex flex-col relative animate-fade-in space-y-8 overflow-y-auto custom-scrollbar">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Solution Design Hub</h2>
          <p className="text-slate-500 mt-1">Manage, track, and initiate architectural blueprints.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white/50 border border-white/50 rounded-xl hover:bg-white transition-colors shadow-sm backdrop-blur-md">
             <HelpCircle size={16} /> Help
           </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="w-full shrink-0">
          <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between">
             <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Design Velocity</h4>
                <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusCounts} layout="vertical" barSize={12}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#64748B'}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)'}} />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                {statusCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
             <div className="w-px h-24 bg-slate-200/50 mx-10 hidden md:block"></div>
             <div className="flex gap-10 pr-4">
                 <div className="text-center">
                     <div className="text-4xl font-black text-indigo-600">{requests.length}</div>
                     <div className="text-xs text-slate-400 font-bold uppercase mt-1">Total Designs</div>
                 </div>
                 <div className="text-center">
                     <div className="text-4xl font-black text-emerald-500">{statusCounts[0].value}</div>
                     <div className="text-xs text-slate-400 font-bold uppercase mt-1">Deployed</div>
                 </div>
             </div>
          </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/40 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-sm shrink-0">
         <div className="flex items-center gap-2 w-full md:w-auto p-1">
            <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                <input 
                type="text" 
                placeholder="Search clients or stacks..." 
                className="w-full pl-9 pr-4 py-2 bg-white/50 border border-white/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="h-6 w-px bg-slate-200/50 mx-2 hidden md:block"></div>
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {['All', 'In Progress', 'Completed', 'Not Started'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === status ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:bg-white/30'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>
         </div>
         <div className="flex gap-2 p-1">
             <button onClick={() => setDisplayMode('grid')} className={`p-2 rounded-xl transition-all ${displayMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18} /></button>
             <button onClick={() => setDisplayMode('list')} className={`p-2 rounded-xl transition-all ${displayMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon size={18} /></button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
          {filteredRequests.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200/50 rounded-3xl bg-white/20">
                 <FolderOpen size={48} className="mb-4 opacity-20"/>
                 <p className="text-sm font-medium">No designs found matching your filters.</p>
                 <button onClick={() => {setSearchTerm(''); setStatusFilter('All');}} className="text-indigo-600 text-xs font-bold mt-2 hover:underline">Clear Filters</button>
             </div>
          ) : (
             <div className={displayMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" : "space-y-4"}>
                {filteredRequests.map((req) => (
                    <div 
                        key={req.id} 
                        onClick={() => onSelectRequest(req)}
                        className={`
                            glass-card cursor-pointer group relative overflow-hidden
                            ${displayMode === 'grid' ? 'rounded-3xl p-7 flex flex-col h-full' : 'rounded-2xl p-5 flex items-center justify-between'}
                        `}
                    >   
                        {/* Grid View Content */}
                        {displayMode === 'grid' && (
                            <>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center font-bold text-sm border border-white/50 text-indigo-600 shadow-sm">
                                        {req.clientName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${getStatusColor(req.status)}`}>{req.status}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors relative z-10 truncate tracking-tight">{req.clientName}</h3>
                                <p className="text-sm text-slate-500 mb-6 relative z-10">{req.type} ({req.deploymentModel})</p>
                                
                                <div className="mt-auto pt-6 border-t border-slate-100/50 flex justify-between items-center relative z-20">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                        <Clock size={12} /> {req.date}
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            type="button"
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-colors z-30"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                e.preventDefault();
                                                onDeleteRequest(req.id); 
                                            }}
                                            title="Delete Request"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="bg-indigo-50/80 text-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform"><ArrowUpRight size={16} /></div>
                                    </div>
                                </div>
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none z-0 blur-xl"></div>
                            </>
                        )}

                        {/* List View Content */}
                        {displayMode === 'list' && (
                            <>
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-bold text-sm border border-indigo-100 text-indigo-600">
                                        {req.clientName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{req.clientName}</h3>
                                        <p className="text-xs text-slate-500">{req.type} • <span className="text-slate-400">{req.id}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100">
                                        <FileText size={12} /> {req.rfpFiles.length} Files
                                    </div>
                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase border ${getStatusColor(req.status)}`}>{req.status}</span>
                                    <div className="w-px h-8 bg-slate-200/50 mx-2"></div>
                                    <button 
                                        type="button"
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-slate-100/50 rounded-xl z-20"
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            e.preventDefault(); 
                                            onDeleteRequest(req.id); 
                                        }}
                                        title="Delete Request"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ArrowUpRight size={20} className="text-slate-300 group-hover:text-indigo-500" />
                                </div>
                            </>
                        )}
                    </div>
                ))}
             </div>
          )}
      </div>

      {/* Help Modal */}
      {showHelp && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative border border-white/50">
                 <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                 <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3"><HelpCircle className="text-indigo-500" /> Design Hub Guide</h3>
                 <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <p><strong>Design Hub v2.0:</strong> This is your command center for all architecture initiatives.</p>
                    <ul className="list-disc pl-5 space-y-3">
                       <li><strong>Create:</strong> Use the "New Request" button to start an AI-assisted design session.</li>
                       <li><strong>Manage:</strong> Switch between Grid and List views to organize your work. Use filters to find specific designs.</li>
                       <li><strong>Track:</strong> The metrics bar at the top gives you a live pulse on your design velocity and deployment status.</li>
                    </ul>
                 </div>
              </div>
           </div>
        )}
    </div>
  );
};

export default DesignHub;
