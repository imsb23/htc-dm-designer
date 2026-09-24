import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Plus, Search, Filter, Download, Trash2, 
  ArrowLeft, FileSpreadsheet, CheckCircle2, Clock, RefreshCw, 
  Sparkles, ExternalLink, ShieldCheck, Database, Layers, 
  Check, X, AlertCircle, ChevronRight, Tag, Eye, Info,
  SlidersHorizontal, Award, ArrowUpRight, Copy, Terminal
} from 'lucide-react';
import { 
  GlossaryRequestRecord, 
  GlossaryBusinessTermItem, 
  GlossarySubdomainItem, 
  GlossaryMetricItem 
} from '../types';
import { 
  loadGlossaryRequestsFromCache, 
  saveGlossaryRequestToCache, 
  deleteGlossaryRequestFromCache, 
  generateEnterpriseGlossary 
} from '../services/copilotService';
import { downloadGlossaryExcel } from '../utils/glossaryExcelExport';
import { parseRequirementContext } from '../utils/requirementContextParser';
import HtcnxtLogo from './HtcnxtLogo';

interface CopilotGlossaryGeneratorProps {
  embedded?: boolean;
  initialIndustry?: string;
  initialContext?: string;
  clientName?: string;
  onNavigateHome?: () => void;
}

const COMMON_INDUSTRIES = [
  'Insurance',
  'Banking',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Energy & Utilities',
  'Public Sector',
  'Telecommunications',
  'High Tech & SaaS'
];

const CopilotGlossaryGenerator: React.FC<CopilotGlossaryGeneratorProps> = ({
  embedded = false,
  initialIndustry,
  initialContext,
  clientName,
  onNavigateHome
}) => {
  // Navigation: 'home' | 'viewer'
  const [view, setView] = useState<'home' | 'viewer'>('home');
  const [requests, setRequests] = useState<GlossaryRequestRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<GlossaryRequestRecord | null>(null);

  // Search & Filters on Home
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  // Modal State for New Glossary Request
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formIndustry, setFormIndustry] = useState(initialIndustry || 'Insurance');
  const [formRequirementContext, setFormRequirementContext] = useState(initialContext || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCurlPreview, setShowCurlPreview] = useState(false);

  // Viewer State (Tabs: 'terms' | 'subdomains' | 'metrics' | 'hierarchy')
  const [activeTab, setActiveTab] = useState<'terms' | 'subdomains' | 'metrics' | 'hierarchy'>('terms');
  const [viewerSearch, setViewerSearch] = useState('');
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('ALL');
  const [onlyCde, setOnlyCde] = useState(false);
  const [selectedTermDetail, setSelectedTermDetail] = useState<GlossaryBusinessTermItem | null>(null);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // Load from cache on mount
  useEffect(() => {
    const cached = loadGlossaryRequestsFromCache();
    setRequests(cached);
    if (cached.length > 0 && !selectedRequest) {
      setSelectedRequest(cached[0]);
    }
  }, []);

  // Update initial parameters if passed
  useEffect(() => {
    if (initialIndustry) setFormIndustry(initialIndustry);
    if (initialContext) setFormRequirementContext(initialContext);
  }, [initialIndustry, initialContext]);

  // Collaborative real-time extraction preview of requirement context
  const parsedPreview = useMemo(() => {
    return parseRequirementContext(formRequirementContext);
  }, [formRequirementContext]);

  // Statistics calculation for Home View
  const stats = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const totalTerms = requests.reduce((acc, r) => acc + (r.business_term_count || 0), 0);
    const totalMetrics = requests.reduce((acc, r) => acc + (r.metric_count || 0), 0);
    const industriesCount = new Set(requests.map(r => r.industry.toLowerCase())).size;
    return { total, completed, totalTerms, totalMetrics, industriesCount };
  }, [requests]);

  // Filtered requests list for Home
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = 
        r.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.glossary_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.domain && r.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.requirement_context && r.requirement_context.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesInd = industryFilter === 'ALL' || r.industry.toLowerCase() === industryFilter.toLowerCase();
      return matchesSearch && matchesInd;
    });
  }, [requests, searchTerm, industryFilter]);

  // Handle Create Glossary
  const handleCreateGlossary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIndustry.trim()) {
      setFormError('Industry is mandatory.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      const newRecord = await generateEnterpriseGlossary(formIndustry.trim(), formRequirementContext);
      const updatedList = saveGlossaryRequestToCache(newRecord);
      setRequests(updatedList);
      setSelectedRequest(newRecord);
      setIsCreateModalOpen(false);
      setFormRequirementContext('');
      setView('viewer');
    } catch (err: any) {
      console.error("Failed to generate glossary:", err);
      setFormError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open existing request in viewer
  const handleOpenRequest = (req: GlossaryRequestRecord) => {
    setSelectedRequest(req);
    setSelectedSubdomain('ALL');
    setViewerSearch('');
    setView('viewer');
  };

  // Delete Request
  const handleDeleteRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this glossary workspace?")) {
      const updated = deleteGlossaryRequestFromCache(id);
      setRequests(updated);
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated[0] || null);
        if (view === 'viewer') setView('home');
      }
    }
  };

  // Download Excel
  const handleDownloadExcel = async (req?: GlossaryRequestRecord) => {
    const target = req || selectedRequest;
    if (!target) return;
    setIsDownloadingExcel(true);
    try {
      downloadGlossaryExcel(target);
    } catch (e) {
      console.error("Excel export error:", e);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  // Active dataset for viewer
  const activeDataset = selectedRequest?.data;

  // Filtered terms in viewer
  const filteredTerms = useMemo(() => {
    if (!activeDataset?.businessTerms) return [];
    return activeDataset.businessTerms.filter(t => {
      const matchesSub = selectedSubdomain === 'ALL' || t.parentSubdomain.toLowerCase() === selectedSubdomain.toLowerCase();
      const matchesCde = !onlyCde || t.criticalDataElement === true || t.criticalDataElement === 'TRUE';
      const matchesSearch = viewerSearch === '' || 
        t.name.toLowerCase().includes(viewerSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(viewerSearch.toLowerCase()) ||
        (t.aliasNames && t.aliasNames.toLowerCase().includes(viewerSearch.toLowerCase())) ||
        (t.classifications && t.classifications.toLowerCase().includes(viewerSearch.toLowerCase())) ||
        (t.businessLogic && t.businessLogic.toLowerCase().includes(viewerSearch.toLowerCase()));
      return matchesSub && matchesCde && matchesSearch;
    });
  }, [activeDataset, selectedSubdomain, onlyCde, viewerSearch]);

  // Filtered metrics in viewer
  const filteredMetrics = useMemo(() => {
    if (!activeDataset?.metrics) return [];
    return activeDataset.metrics.filter(m => {
      const matchesSub = selectedSubdomain === 'ALL' || m.parentSubdomain.toLowerCase() === selectedSubdomain.toLowerCase();
      const matchesCde = !onlyCde || m.criticalDataElement === true || m.criticalDataElement === 'TRUE';
      const matchesSearch = viewerSearch === '' || 
        m.name.toLowerCase().includes(viewerSearch.toLowerCase()) ||
        m.description.toLowerCase().includes(viewerSearch.toLowerCase()) ||
        (m.businessLogic && m.businessLogic.toLowerCase().includes(viewerSearch.toLowerCase())) ||
        (m.classifications && m.classifications.toLowerCase().includes(viewerSearch.toLowerCase()));
      return matchesSub && matchesCde && matchesSearch;
    });
  }, [activeDataset, selectedSubdomain, onlyCde, viewerSearch]);

  // Unique subdomains for filtering
  const subdomainsList = useMemo(() => {
    if (!activeDataset?.subdomains) return [];
    return activeDataset.subdomains;
  }, [activeDataset]);

  // -------------------------------------------------------------
  // RENDER: VIEWER / GLOSSARY STUDIO VIEW
  // -------------------------------------------------------------
  if (view === 'viewer' && selectedRequest && activeDataset) {
    return (
      <div className="flex-1 min-h-0 h-full flex flex-col bg-slate-100 overflow-hidden font-sans">
        
        {/* Top Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('home')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Requests
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Glossary ID: {selectedRequest.glossary_id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {selectedRequest.industry}
                </span>
                <span className="text-xs font-bold text-slate-800 hidden md:inline truncate max-w-xs">
                  {activeDataset.domain?.name || selectedRequest.industry} Domain
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Blob URL */}
            {selectedRequest.blob_url && (
              <a
                href={selectedRequest.blob_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
                title="Download from Azure Blob Storage"
              >
                <ExternalLink size={14} /> Cloud Blob
              </a>
            )}

            {/* Download Excel */}
            <button
              onClick={() => handleDownloadExcel()}
              disabled={isDownloadingExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download Microsoft Excel (.xlsx) file with all 4 sheets"
            >
              <FileSpreadsheet size={15} />
              {isDownloadingExcel ? 'Generating .xlsx...' : 'Download .xlsx'}
            </button>
          </div>
        </div>

        {/* Studio Sub-Header: Metrics & Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* 4 Main View Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'terms' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database size={14} />
              <span>Business Terms</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'terms' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeDataset.businessTerms?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('subdomains')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'subdomains' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={14} />
              <span>Subdomains</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'subdomains' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeDataset.subdomains?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'metrics' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award size={14} />
              <span>Metrics & KPIs</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'metrics' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeDataset.metrics?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hierarchy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} />
              <span>Domain Architecture</span>
            </button>
          </div>

          {/* Search & Subdomain Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={viewerSearch}
                onChange={(e) => setViewerSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedSubdomain}
              onChange={(e) => setSelectedSubdomain(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Subdomains ({subdomainsList.length})</option>
              {subdomainsList.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>

            <button
              onClick={() => setOnlyCde(!onlyCde)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                onlyCde 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filter by Critical Data Elements only"
            >
              <span>CDE Only</span>
              {onlyCde && <Check size={13} className="text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-100/70 custom-scrollbar">
          
          {/* TAB 1: BUSINESS TERMS TABLE */}
          {activeTab === 'terms' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Governed Business Terms Catalog ({filteredTerms.length} of {activeDataset.businessTerms?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Showing standardized enterprise definitions, business logic, CDE classification, and format types.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Business Term</th>
                      <th className="py-3 px-4">Parent Subdomain</th>
                      <th className="py-3 px-4 min-w-[280px]">Enterprise Definition</th>
                      <th className="py-3 px-3 text-center">CDE</th>
                      <th className="py-3 px-3">Classification</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-3 text-center">Security</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredTerms.map((t, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedTermDetail(t)}
                        className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-indigo-700">
                          <div className="flex items-center gap-1.5">
                            <Tag size={13} className="text-indigo-500 shrink-0" />
                            <span>{t.name}</span>
                          </div>
                          {t.aliasNames && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              Aliases: {t.aliasNames}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {t.parentSubdomain}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 leading-relaxed text-xs">
                          {t.description}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {t.criticalDataElement === true || t.criticalDataElement === 'TRUE' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              CDE
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-medium text-slate-600">
                            {t.classifications || 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {t.formatType || 'Text'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            t.securityLevel === 'Confidential' ? 'bg-amber-100 text-amber-800' :
                            t.securityLevel === 'Restricted' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {t.securityLevel || 'Internal'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTermDetail(t);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            title="View term details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SUBDOMAINS GRID */}
          {activeTab === 'subdomains' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Governed Subdomains in {selectedRequest.industry} ({subdomainsList.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Domain taxonomy decomposition and governance scope boundaries.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subdomainsList.map((sub, sIdx) => {
                  const termCount = activeDataset.businessTerms.filter(t => t.parentSubdomain === sub.name).length;
                  const metricCount = activeDataset.metrics.filter(m => m.parentSubdomain === sub.name).length;

                  return (
                    <div 
                      key={sIdx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                            SUBDOMAIN {sIdx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                            {sub.securityLevel || 'Internal'}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">
                          {sub.name}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                            {termCount} Terms
                          </span>
                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                            {metricCount} Metrics
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSubdomain(sub.name);
                            setActiveTab('terms');
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: METRICS & KPIS TABLE */}
          {activeTab === 'metrics' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Governed Metrics & Key Performance Indicators ({filteredMetrics.length} of {activeDataset.metrics?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Operational formulas, regulatory measurement rules, and calculation definitions.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Metric Name</th>
                      <th className="py-3 px-4">Subdomain</th>
                      <th className="py-3 px-4 min-w-[220px]">Metric Purpose & Description</th>
                      <th className="py-3 px-4 min-w-[280px]">Calculation Formula / Business Logic</th>
                      <th className="py-3 px-3 text-center">CDE</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-3">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredMetrics.map((m, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <Award size={13} className="text-teal-600 shrink-0" />
                            <span>{m.name}</span>
                          </div>
                          {m.aliasNames && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              Aliases: {m.aliasNames}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {m.parentSubdomain}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 leading-relaxed text-xs">
                          {m.description}
                        </td>
                        <td className="py-3 px-4">
                          <div className="bg-slate-50 p-2 rounded-lg font-mono text-[11px] text-slate-700 border border-slate-200/80 leading-relaxed">
                            {m.businessLogic || 'Count / Aggregation over measurement window'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {m.criticalDataElement === true || m.criticalDataElement === 'TRUE' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              CDE
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {m.formatType || 'Number'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {m.examples || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DOMAIN ARCHITECTURE HIERARCHY */}
          {activeTab === 'hierarchy' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  DAMA-DMBOK Level-1 Taxonomy
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  {activeDataset.domain?.name || selectedRequest.industry} Enterprise Governance Architecture
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {activeDataset.domain?.description || `Top-level governed business domain representing the ${selectedRequest.industry} industry.`}
                </p>
              </div>

              {/* Visual Tree */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database size={20} className="text-indigo-400" />
                    <div>
                      <div className="text-xs uppercase tracking-widest font-black text-indigo-300">Top-Level Domain</div>
                      <div className="text-sm font-black">{activeDataset.domain?.name}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-400">
                    {subdomainsList.length} Governed Subdomains • {activeDataset.businessTerms.length} Terms • {activeDataset.metrics.length} KPIs
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-slate-200">
                  {subdomainsList.map((sub, sIdx) => {
                    const termsInSub = activeDataset.businessTerms.filter(t => t.parentSubdomain === sub.name);
                    const metricsInSub = activeDataset.metrics.filter(m => m.parentSubdomain === sub.name);

                    return (
                      <div key={sIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Layers size={14} className="text-teal-600" />
                            <span>{sub.name}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {termsInSub.length} Terms
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {sub.description}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {termsInSub.slice(0, 4).map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {t.name}
                            </span>
                          ))}
                          {termsInSub.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">
                              +{termsInSub.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Slide-over Drawer for Term Details */}
        {selectedTermDetail && (
          <div className="fixed inset-0 z-[150] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-slate-200">
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Term Governance Spec</h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{selectedTermDetail.parentSubdomain}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTermDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed custom-scrollbar">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Canonical Term Name
                  </label>
                  <div className="text-base font-black text-slate-900">{selectedTermDetail.name}</div>
                  {selectedTermDetail.aliasNames && (
                    <div className="text-xs text-slate-500 mt-0.5">Known Aliases: {selectedTermDetail.aliasNames}</div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Enterprise Definition
                  </label>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed">
                    {selectedTermDetail.description}
                  </div>
                </div>

                {selectedTermDetail.businessLogic && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Business Logic & Invariant Constraints
                    </label>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] leading-relaxed text-indigo-900">
                      {selectedTermDetail.businessLogic}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Critical Data Element</span>
                    <span className="font-bold text-slate-900">
                      {selectedTermDetail.criticalDataElement === true || selectedTermDetail.criticalDataElement === 'TRUE' ? 'YES (CDE Target)' : 'NO'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Security Classification</span>
                    <span className="font-bold text-slate-900">{selectedTermDetail.securityLevel || 'Confidential'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Format Type</span>
                    <span className="font-bold text-slate-900">{selectedTermDetail.formatType || 'Text'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Lifecycle State</span>
                    <span className="font-bold text-emerald-600">{selectedTermDetail.lifecycle || 'Published'}</span>
                  </div>
                </div>

                {selectedTermDetail.examples && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Data Examples
                    </label>
                    <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-xs text-slate-800">
                      {selectedTermDetail.examples}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedTermDetail(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close Spec
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: HOME VIEW (REQUEST DASHBOARD & RECENT WORKSPACES)
  // -------------------------------------------------------------
  return (
    <div className={`h-full flex flex-col bg-slate-50 overflow-hidden font-sans ${embedded ? '' : 'p-6 md:p-8'}`}>
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-100">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                Enterprise Business Glossary Generator
              </h1>
              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                DAMA Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Accelerate domain terms glossary, business logic invariant rules, and regulatory metrics with multi-sheet Excel output.
            </p>
          </div>
        </div>

        {/* Header Right Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-teal-200 active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>Generate Business Glossary</span>
          </button>
        </div>
      </div>

      {/* Main Home Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Workspaces</span>
              <BookOpen size={16} className="text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-500 font-medium">Across {stats.industriesCount} industry domains</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Business Terms</span>
              <Database size={16} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600">{stats.totalTerms}</div>
            <div className="text-[11px] text-slate-500 font-medium">Standardized definitions & logic</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Governed Metrics</span>
              <Award size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.totalMetrics}</div>
            <div className="text-[11px] text-slate-500 font-medium">Calculation formulas & SLAs</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Multi-Sheet Formats</span>
              <FileSpreadsheet size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">.xlsx / .csv</div>
            <div className="text-[11px] text-slate-500 font-medium">Exact Excel workbook schema</div>
          </div>
        </div>

        {/* Requests Filter & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by industry, glossary ID, subdomain, or context..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] hidden sm:inline">Industry:</span>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">All Industries</option>
                {COMMON_INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredRequests.length} of {requests.length} workstreams
          </span>
        </div>

        {/* Requests Table / Cards */}
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <BookOpen size={40} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No glossary requests found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Initialize a new business glossary generation to synthesize standardized terms and metrics.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Generate First Glossary
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => (
              <div 
                key={req.id}
                onClick={() => handleOpenRequest(req)}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      {req.glossary_id}
                    </span>
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {req.industry}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Domain: {req.domain || req.industry}
                    </span>
                    {req.subdomain && req.subdomain !== 'All' && (
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Subdomain: {req.subdomain}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {req.requirement_context || `Enterprise business glossary covering governed data domains, business logic invariant rules, and metrics.`}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-1">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Database size={13} className="text-teal-600" />
                      <span>{req.business_term_count} Terms</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Award size={13} className="text-indigo-600" />
                      <span>{req.metric_count} Metrics</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadExcel(req);
                    }}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Download Excel spreadsheet"
                  >
                    <FileSpreadsheet size={15} />
                    <span className="hidden sm:inline">.xlsx</span>
                  </button>

                  <button
                    onClick={() => handleOpenRequest(req)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Studio</span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteRequest(e, req.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete request"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE GLOSSARY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Generate Business Glossary
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Endpoint: POST /platform/dm/copilot/glossary_generator/generate-glossary
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGlossary} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
              
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* INPUT 1: Industry (Mandatory) */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  1. Target Industry <span className="text-rose-500">* (Mandatory)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  placeholder="e.g. Insurance, Banking, Healthcare, Manufacturing..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white"
                />

                {/* Quick Industry Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setFormIndustry(ind)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        formIndustry.toLowerCase() === ind.toLowerCase()
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT 2: Requirement Context (Collaborative text capturing keys, Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    2. Requirement Context <span className="text-slate-400 font-normal">(Optional collaborative free text)</span>
                  </label>
                  <span className="text-[10px] text-teal-600 font-bold">
                    Auto-captures: domain, region, client, regulations
                  </span>
                </div>
                
                <textarea
                  rows={4}
                  value={formRequirementContext}
                  onChange={(e) => setFormRequirementContext(e.target.value)}
                  placeholder="e.g. Sub-domain is customer, in the North America region for client Acme Insurance under regulations GDPR and BCBS 239..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white"
                />

                {/* Live Parsed Extraction Preview Badges */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-teal-600" />
                    <span>Real-Time Parameter Extraction Preview</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Domain / Subdomain:</span>
                      <span className="font-bold text-indigo-700">{parsedPreview.domain || 'All Subdomains'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Region:</span>
                      <span className="font-bold text-slate-700">{parsedPreview.region || 'Global'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Client:</span>
                      <span className="font-bold text-slate-700">{parsedPreview.client_name || 'Enterprise'}</span>
                    </div>

                    {parsedPreview.regulations && (
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Regulations:</span>
                        <span className="font-bold text-emerald-700">{parsedPreview.regulations}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* cURL Inspection Drawer */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowCurlPreview(!showCurlPreview)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Terminal size={13} />
                  <span>{showCurlPreview ? 'Hide Request cURL' : 'Inspect API Request Payload (cURL)'}</span>
                </button>

                {showCurlPreview && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`curl -X 'POST' \\
  'http://127.0.0.1:8000/platform/dm/copilot/glossary_generator/generate-glossary' \\
  -H 'accept: */*' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "industry": "${formIndustry.toLowerCase()}",
  "region": "${parsedPreview.region}",
  "domain": "${parsedPreview.domain}",
  "client_name": "${parsedPreview.client_name}",
  "context": "${parsedPreview.context.replace(/"/g, '\\"')}",
  "regulations": "${parsedPreview.regulations}"
}'`}
                  </pre>
                )}
              </div>

              {/* Submit Action */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-teal-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Synthesizing Glossary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Generate Enterprise Glossary</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CopilotGlossaryGenerator;
