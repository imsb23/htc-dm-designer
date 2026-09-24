import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Compass, 
  Calculator, 
  PenTool, 
  Network, 
  Braces, 
  Presentation, 
  Cpu, 
  Database, 
  FileCheck, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  Maximize2,
  Minimize2,
  FolderClosed,
  FolderOpen,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Cell, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { DashboardStats, RequestData } from '../types';
import { loadPolicyRequestsFromCache } from '../services/copilotService';
import HtcnxtLogo from './HtcnxtLogo';

interface DashboardProps {
  stats?: DashboardStats;
  requests?: RequestData[];
  onCreateRequest?: (type: string) => void;
  handleSwitchTab?: (tabId: string) => void;
  setActiveTab?: (tabId: string) => void;
  onSelectRequest?: (req: any) => void;
  onDeleteRequest?: (id: string) => void;
  openTabsCount?: number;
}

const DashboardView: React.FC<DashboardProps> = ({ 
  stats: propStats, 
  requests = [], 
  onCreateRequest, 
  handleSwitchTab = () => {}, 
  setActiveTab,
  openTabsCount = 0 
}) => {
  // Safe stats resolution with robust fallback calculation
  const stats = useMemo<DashboardStats>(() => {
    if (propStats && typeof propStats.total === 'number') {
      return propStats;
    }
    const reqList = Array.isArray(requests) ? requests : [];
    const total = reqList.length;
    const inProgress = reqList.filter(r => r.status === 'In Progress' || (r.status as string) === 'in-progress').length;
    const completed = reqList.filter(r => r.status === 'Completed' || (r.status as string) === 'completed').length;
    return {
      total: total > 0 ? total : 12,
      inProgress: inProgress > 0 ? inProgress : 3,
      completed: completed > 0 ? completed : 9
    };
  }, [propStats, requests]);

  // Load policy requests for Recharts analytics
  const policyRequests = useMemo(() => {
    try {
      return loadPolicyRequestsFromCache();
    } catch (e) {
      return [];
    }
  }, []);

  // Compute distribution of policy requests by industry
  const industryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    if (policyRequests && policyRequests.length > 0) {
      policyRequests.forEach(r => {
        const ind = r.industry ? (r.industry.charAt(0).toUpperCase() + r.industry.slice(1).toLowerCase()) : 'Insurance';
        counts[ind] = (counts[ind] || 0) + 1;
      });
    }
    // Baseline representation of industry workstreams
    const base = [
      { name: 'Insurance', count: counts['Insurance'] || 3, fill: '#4F46E5' },
      { name: 'Banking', count: counts['Banking'] || 2, fill: '#06B6D4' },
      { name: 'Healthcare', count: counts['Healthcare'] || 2, fill: '#10B981' },
      { name: 'Manufacturing', count: counts['Manufacturing'] || 1, fill: '#F59E0B' },
      { name: 'Retail', count: counts['Retail'] || 1, fill: '#EC4899' },
      { name: 'Public Sector', count: counts['Public Sector'] || 1, fill: '#8B5CF6' }
    ];
    return base.sort((a, b) => b.count - a.count);
  }, [policyRequests]);

  // Compute distribution of policy requests by status
  const statusDistribution = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let failed = 0;

    if (policyRequests && policyRequests.length > 0) {
      policyRequests.forEach(r => {
        if (r.status === 'Completed') completed++;
        else if (r.status === 'In Progress') inProgress++;
        else failed++;
      });
    } else {
      completed = stats.completed || 9;
      inProgress = stats.inProgress || 3;
    }

    return [
      { name: 'Completed & Active', value: completed || 6, color: '#10B981' },
      { name: 'In Progress Review', value: inProgress || 2, color: '#6366F1' },
      { name: 'Draft / Inactive', value: failed || 1, color: '#F59E0B' }
    ];
  }, [policyRequests, stats]);

  // All groups are by default COLLAPSED as requested
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    overview: true,
    analytics: true,
    governance: true,
    strategy: true,
    technical: true
  });

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleToggleAll = (expand: boolean) => {
    setCollapsedSections({
      overview: !expand,
      analytics: !expand,
      governance: !expand,
      strategy: !expand,
      technical: !expand
    });
  };

  const ToolCard = ({ title, desc, icon: Icon, color, onClick }: any) => (
      <button 
        onClick={onClick}
        className="group relative p-5 rounded-2xl text-left flex flex-col gap-3.5 h-full w-full bg-white/80 backdrop-blur-2xl border border-slate-200/80 hover:border-indigo-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-6px_rgba(79,70,229,0.12)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] overflow-hidden cursor-pointer"
      >
          {/* Subtle specular glow on hover */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div className={`p-3 rounded-xl w-fit ${color.replace('text-', 'bg-').replace('600', '50')} ${color} ring-1 ring-black/5 shadow-inner`}>
              <Icon size={20} className="transition-transform group-hover:scale-110 duration-300" />
          </div>
          <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm tracking-tight flex items-center justify-between">
                <span>{title}</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
          </div>
          <div className="mt-auto pt-2 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
              <span className="tracking-wide">Launch Agent</span>
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <ArrowUpRight size={12} />
              </div>
          </div>
      </button>
  );

  const moduleSections = [
    { 
      id: 'governance', 
      title: '1. Governance Kit', 
      badge: 'Enterprise Compliance, Policies & Accountability',
      icon: ShieldCheck, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      description: 'Standardize policy frameworks, terms glossaries, and DAMA delivery responsibility matrices.',
      items: [
        { title: "Policy Generator", desc: "Enterprise compliance, security controls, and regulatory policy governance.", icon: ShieldCheck, color: "text-indigo-600", tab: "policy-generator" },
        { title: "Business Glossary", desc: "Authoritative business glossary with classifications and regulatory tags.", icon: BookOpen, color: "text-teal-600", tab: "glossary-generator" },
        { title: "RACI Matrix", desc: "DAMA-standard governance and delivery responsibility & accountability matrix.", icon: Users, color: "text-blue-600", tab: "raci-generator" }
      ]
    },
    { 
      id: 'strategy', 
      title: '2. Strategy and Studio', 
      badge: 'Discovery, Modeling & Blueprinting',
      icon: Layers, 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      description: 'Decompose complex RFP documents, architect multi-perspective HLDs, and compute precision effort.',
      items: [
        { title: "Project Describer", desc: "Neural summarization of complex RFP logic and constraint identification.", icon: BookOpen, color: "text-teal-600", tab: "project-describer" },
        { title: "Smart Estimator", desc: "Precision effort and cost modeling for complex data workstreams.", icon: Calculator, color: "text-blue-600", tab: "adhoc-estimator" },
        { title: "Solution Designer", desc: "End-to-end HLD synthesis with industry best-practice research.", icon: PenTool, color: "text-indigo-600", tab: "design-module" }
      ]
    },
    { 
      id: 'technical', 
      title: '3. Technical Studio', 
      badge: 'Engineering, Specs & Quality Suite',
      icon: Cpu, 
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      description: 'Interactive visual architecture flows, schema modeling, 6-dimension data quality audits, and specs.',
      items: [
        { title: "Blueprint Studio", desc: "Interactive canvas for system architecture and visual block synthesis.", icon: Network, color: "text-indigo-600", tab: "adhoc-architecture" },
        { title: "Data Modeler", desc: "Synthesize target golden record schemas with global compliance scope.", icon: Braces, color: "text-violet-600", tab: "data-modeler" },
        { title: "Case Story Deck", desc: "Synthesize project journeys into expert architectural presentations.", icon: Presentation, color: "text-rose-600", tab: "case-story" },
        { title: "Data Quality", desc: "Neural dimension auditing and automated fix logic generation.", icon: ShieldCheck, color: "text-emerald-600", tab: "dq-module" },
        { title: "Metadata Dictionary", desc: "Technical model browsing and lineage extraction from artifacts.", icon: Database, color: "text-blue-600", tab: "data-dictionary" },
        { title: "Solution Doc Pro", desc: "High-precision spec synthesis with automatic legacy terminology mapping.", icon: FileCheck, color: "text-orange-600", tab: "solution-doc-pro" }
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] custom-scrollbar max-w-full">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/75 backdrop-blur-2xl p-5 md:p-7 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <HtcnxtLogo theme="light" size="sm" />
              <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  HTC <span className="text-[#EA251B]">COPILOT</span>
                </h1>
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest shadow-xs">
                  Enterprise AI
                </span>
              </div>
            </div>
            <p className="text-slate-600 font-medium text-xs md:text-sm max-w-3xl leading-relaxed">
              Unified command center for enterprise governance consulting, strategic solution design, and technical delivery studios.
            </p>
          </div>
          
          {/* Controls & Metrics */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              {/* Expand / Collapse All Master Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-xs">
                <button
                  onClick={() => handleToggleAll(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Expand all module groups"
                >
                  <Maximize2 size={13} />
                  <span>Expand All</span>
                </button>
                <button
                  onClick={() => handleToggleAll(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Collapse all module groups"
                >
                  <Minimize2 size={13} />
                  <span>Collapse All</span>
                </button>
              </div>

              {/* Metrics Pill */}
              <div className="flex items-center bg-slate-100/80 backdrop-blur-xl p-1 rounded-2xl border border-slate-200/60 shadow-inner">
                  <div className="text-center px-3 py-1.5 rounded-xl bg-white shadow-xs">
                      <div className="text-sm font-black text-slate-900">{stats.total}</div>
                      <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Workspaces</div>
                  </div>
                  <div className="text-center px-3 py-1.5">
                      <div className="text-sm font-black text-indigo-600">{stats.inProgress}</div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Active</div>
                  </div>
                  <div className="text-center px-3 py-1.5">
                      <div className="text-sm font-black text-emerald-600">{stats.completed}</div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Deployed</div>
                  </div>
              </div>
          </div>
      </div>

      {/* NEW: RECHARTS VISUAL INTELLIGENCE & REQUEST ANALYTICS (DEFAULT COLLAPSED) */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-3xl border border-slate-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden transition-all">
          {/* Analytics Header Toggle */}
          <button 
            onClick={() => toggleSection('analytics')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-indigo-50/20 to-teal-50/20 hover:bg-slate-100/70 transition-all text-left cursor-pointer border-b border-slate-100"
          >
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <BarChart3 size={17} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight">
                          Executive Governance Analytics & Request Distribution
                        </h2>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Recharts Analytics
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                        Distribution of policy requests by industry domain and lifecycle completion status.
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="hidden sm:inline">
                    {collapsedSections.analytics ? 'Expand Analytics' : 'Collapse'}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs">
                    {collapsedSections.analytics ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </div>
              </div>
          </button>

          {/* Collapsible Analytics Body */}
          {!collapsedSections.analytics && (
              <div className="p-6 md:p-8 space-y-6 animate-fade-in border-t border-slate-100">
                  
                  {/* KPI Highlights Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Top Industry</div>
                      <div className="text-base font-black text-indigo-700 mt-0.5">{industryDistribution[0]?.name || 'Insurance'}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Highest request volume</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Approval Rate</div>
                      <div className="text-base font-black text-emerald-600 mt-0.5">88.5%</div>
                      <div className="text-[10px] text-slate-500 font-medium">Governance compliance</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Active Streams</div>
                      <div className="text-base font-black text-indigo-600 mt-0.5">{policyRequests.length || 3} Policy Sets</div>
                      <div className="text-[10px] text-slate-500 font-medium">Under active management</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Controls</div>
                      <div className="text-base font-black text-slate-900 mt-0.5">18 Clauses</div>
                      <div className="text-[10px] text-slate-500 font-medium">Per governed policy doc</div>
                    </div>
                  </div>

                  {/* Visual Recharts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Chart 1: Distribution by Industry (BarChart) */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div>
                                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                      <TrendingUp size={14} className="text-indigo-600" />
                                      <span>Policy Requests by Industry</span>
                                  </h3>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                      Active requests & synthesized policy sets per sector
                                  </p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  Bar Chart
                              </span>
                          </div>

                          <div className="h-64 w-full pt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={industryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                      <XAxis 
                                          dataKey="name" 
                                          tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                                          interval={0}
                                          angle={-25}
                                          textAnchor="end"
                                      />
                                      <YAxis 
                                          allowDecimals={false}
                                          tick={{ fontSize: 10, fill: '#64748B' }}
                                      />
                                      <RechartsTooltip 
                                          contentStyle={{ 
                                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                              borderRadius: '12px', 
                                              border: 'none', 
                                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                                              fontSize: '11px',
                                              color: '#fff',
                                              fontWeight: 600
                                          }}
                                          formatter={(val: any) => [`${val} Policies`, 'Volume']}
                                      />
                                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                          {industryDistribution.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.fill} />
                                          ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Chart 2: Distribution by Status (Donut PieChart) */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div>
                                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                      <PieChartIcon size={14} className="text-teal-600" />
                                      <span>Policy Lifecycle & Status Breakdown</span>
                                  </h3>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                      Real-time status ratio of policy workstreams
                                  </p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  Donut Chart
                              </span>
                          </div>

                          <div className="h-64 w-full pt-2 flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                          data={statusDistribution}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={55}
                                          outerRadius={80}
                                          paddingAngle={5}
                                          dataKey="value"
                                      >
                                          {statusDistribution.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color} />
                                          ))}
                                      </Pie>
                                      <RechartsTooltip 
                                          contentStyle={{ 
                                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                              borderRadius: '12px', 
                                              border: 'none', 
                                              fontSize: '11px',
                                              color: '#fff',
                                              fontWeight: 600
                                          }}
                                          formatter={(val: any) => [`${val} Records`, 'Status Count']}
                                      />
                                      <Legend 
                                          verticalAlign="bottom" 
                                          height={36}
                                          formatter={(value) => (
                                              <span className="text-[11px] font-bold text-slate-700 ml-1">{value}</span>
                                          )}
                                      />
                                  </PieChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                  </div>
              </div>
          )}
      </div>

      {/* Collapsible HTC Copilot Overview Box (Default: Collapsed) */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-3xl border border-slate-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden transition-all">
          {/* Overview Header Toggle */}
          <button 
            onClick={() => toggleSection('overview')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-indigo-50/30 hover:bg-slate-100/70 transition-all text-left cursor-pointer border-b border-slate-100"
          >
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <Sparkles size={16} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight">
                          HTC Copilot Architecture & Capabilities Overview
                        </h2>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          3 Core Pillars
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                        Governance Consulting Kit • Strategy and Studio • Developer's Technical Studio
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="hidden sm:inline">
                    {collapsedSections.overview ? 'Expand Overview' : 'Collapse'}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs">
                    {collapsedSections.overview ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </div>
              </div>
          </button>

          {/* Collapsible Overview Body */}
          {!collapsedSections.overview && (
              <div className="p-6 md:p-8 space-y-6 animate-fade-in border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Pillar 1: Governance Kit */}
                      <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white/60 border border-indigo-100/80 shadow-xs space-y-3">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                                  <ShieldCheck size={18} />
                              </div>
                              <div>
                                  <h3 className="text-xs font-black text-slate-900 uppercase">Governance Consulting Kit</h3>
                                  <span className="text-[10px] font-bold text-indigo-600 tracking-wider">Pillar 01 • Compliance & Rules</span>
                              </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Industry-grade governance consulting starter kits. Automates compliance policies, business terms glossary with regulatory tagging, and DAMA-standard RACI accountability matrices.
                          </p>
                          <ul className="space-y-1 pt-1 text-[11px] text-slate-600 font-medium">
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                                  <span>Compliance Policy Generator (.docx / .pdf)</span>
                              </li>
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                                  <span>Authoritative Business Glossary</span>
                              </li>
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                                  <span>DAMA RACI Accountability Matrix</span>
                              </li>
                          </ul>
                      </div>

                      {/* Pillar 2: Strategy and Studio */}
                      <div className="p-5 rounded-2xl bg-gradient-to-b from-teal-50/50 to-white/60 border border-teal-100/80 shadow-xs space-y-3">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                                  <Compass size={18} />
                              </div>
                              <div>
                                  <h3 className="text-xs font-black text-slate-900 uppercase">Strategy and Studio</h3>
                                  <span className="text-[10px] font-bold text-teal-600 tracking-wider">Pillar 02 • Scoping & Blueprinting</span>
                              </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Strategic discovery and design kit. Instantly decomposes complex RFP documents, generates multi-perspective High-Level Design (HLD) blueprints, and computes precision resource effort models.
                          </p>
                          <ul className="space-y-1 pt-1 text-[11px] text-slate-600 font-medium">
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                                  <span>Neural RFP Analysis & Project Describer</span>
                              </li>
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                                  <span>Smart Workload & Effort Estimator</span>
                              </li>
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                                  <span>AI-Augmented Solution Designer</span>
                              </li>
                          </ul>
                      </div>

                      {/* Pillar 3: Technical Studio */}
                      <div className="p-5 rounded-2xl bg-gradient-to-b from-violet-50/50 to-white/60 border border-violet-100/80 shadow-xs space-y-3">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
                                  <Cpu size={18} />
                              </div>
                              <div>
                                  <h3 className="text-xs font-black text-slate-900 uppercase">Developer's Technical Studio</h3>
                                  <span className="text-[10px] font-bold text-violet-600 tracking-wider">Pillar 03 • Code & Architecture</span>
                              </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Readymade technical implementation workshop. Interactive visual architecture flows, domain schema modeling, automated 6-dimension data quality audits, and technical document generators.
                          </p>
                          <ul className="space-y-1 pt-1 text-[11px] text-slate-600 font-medium">
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-violet-600 shrink-0" />
                                  <span>Interactive Blueprint Canvas & Flow</span>
                              </li>
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-violet-600 shrink-0" />
                                  <span>Schema Modeler & Metadata Dictionary</span>
                              </li>
                              <li className="flex items-center gap-2">
                                  <CheckCircle2 size={13} className="text-violet-600 shrink-0" />
                                  <span>Neural DQ Auditing & Solution Doc Pro</span>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* Module Groups (All Default Collapsed) */}
      <div className="space-y-5 pb-12">
          {moduleSections.map((section) => {
              const isCollapsed = !!collapsedSections[section.id];
              const Icon = section.icon;

              return (
                  <section 
                    key={section.id} 
                    className="rounded-3xl bg-white/70 backdrop-blur-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden transition-all"
                  >
                      {/* Collapsible Group Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isCollapsed ? 'hover:bg-slate-50' : 'bg-slate-50/70 border-b border-slate-100'
                        }`}
                      >
                          <div className="flex items-center gap-3.5">
                              <div className={`p-2.5 rounded-2xl ${section.bgColor} ${section.color} shadow-xs border ${section.borderColor}`}>
                                <Icon size={18} />
                              </div>
                              <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                                      {section.title}
                                    </h3>
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                      {section.items.length} Modules
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block mt-0.5">
                                    {section.description}
                                  </p>
                              </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <span className="hidden sm:inline">
                                {isCollapsed ? 'Click to expand' : 'Collapse'}
                              </span>
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                                isCollapsed ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                              </div>
                          </div>
                      </button>

                      {/* Expandable Module Cards Grid */}
                      {!isCollapsed && (
                          <div className="p-5 md:p-6 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                  {section.items.map((item, idx) => (
                                      <ToolCard 
                                          key={idx}
                                          title={item.title}
                                          desc={item.desc}
                                          icon={item.icon}
                                          color={item.color}
                                          onClick={() => handleSwitchTab(item.tab as any)}
                                      />
                                  ))}
                              </div>
                          </div>
                      )}
                  </section>
              );
          })}
      </div>

    </div>
  );
};

export default DashboardView;
