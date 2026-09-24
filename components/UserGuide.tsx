import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Download, 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  Cpu, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Users,
  Printer,
  FileCheck,
  Building,
  HelpCircle,
  Share2,
  Clock
} from 'lucide-react';
import { KNOWLEDGE_BASE_ARTICLES, KBArticle } from '../data/knowledgeBaseData';
import { exportKnowledgeBasePdf } from '../utils/kbPdfExport';
import HtcnxtLogo from './HtcnxtLogo';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchModule?: (moduleId: string) => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose, onLaunchModule }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('policy-generator');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingAllPdf, setIsExportingAllPdf] = useState<boolean>(false);

  // Grouped Categories
  const categories = [
    'All',
    'Governance Kit',
    'Strategy and Studio',
    'Technical Studio',
    'Enterprise Architecture'
  ];

  const filteredArticles = useMemo(() => {
    return KNOWLEDGE_BASE_ARTICLES.filter(art => {
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
      const matchesSearch = 
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.capabilities.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        art.targetPersonas.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const activeArticle: KBArticle = useMemo(() => {
    return KNOWLEDGE_BASE_ARTICLES.find(a => a.id === selectedArticleId) || KNOWLEDGE_BASE_ARTICLES[0];
  }, [selectedArticleId]);

  const handleExportCurrent = async () => {
    try {
      setIsExportingPdf(true);
      await exportKnowledgeBasePdf(activeArticle, false);
    } catch (err) {
      console.error('Failed to export article PDF', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setIsExportingAllPdf(true);
      await exportKnowledgeBasePdf(null, true);
    } catch (err) {
      console.error('Failed to export full guide PDF', err);
    } finally {
      setIsExportingAllPdf(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Governance Kit': return ShieldCheck;
      case 'Strategy and Studio': return Compass;
      case 'Technical Studio': return Cpu;
      default: return Layers;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-2xl animate-fade-in">
      
      {/* iOS27 Styled Full Modal Canvas */}
      <div className="bg-slate-50/95 backdrop-blur-3xl rounded-3xl sm:rounded-[2.5rem] border border-white/40 shadow-[0_25px_70px_rgba(0,0,0,0.35)] w-full max-w-7xl max-h-[94vh] h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Top Navigation & Brand Header - Informatica KB Portal Style */}
        <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <HtcnxtLogo theme="light" size="sm" />
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 tracking-tight">KNOWLEDGE BASE</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Enterprise Documentation
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                HTC Copilot Architectural Blueprint, Governance Reference & Capability Catalog
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download Complete Guide PDF */}
            <button
              onClick={handleExportAll}
              disabled={isExportingAllPdf}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-95"
              title="Download entire Knowledge Base as a complete enterprise product document"
            >
              <Download size={14} className={isExportingAllPdf ? 'animate-bounce text-indigo-600' : 'text-slate-500'} />
              <span>{isExportingAllPdf ? 'Generating PDF...' : 'Download Full Product Guide (PDF)'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close Documentation Portal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Body: 2-Column Split (Left Navigation & Right Content) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Navigation Sidebar (Informatica KB Navigation) */}
          <div className="w-full md:w-80 lg:w-96 bg-white/60 backdrop-blur-xl border-r border-slate-200/80 flex flex-col shrink-0 overflow-hidden">
            
            {/* Search Input Box */}
            <div className="p-4 border-b border-slate-200/60 space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles, capabilities, regulations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200/70 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category Pills (iOS27 Segments) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Articles ({filteredArticles.length})
              </div>

              {filteredArticles.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No articles matched your criteria.
                </div>
              ) : (
                filteredArticles.map((art) => {
                  const isSelected = art.id === activeArticle.id;
                  const Icon = getCategoryIcon(art.category);

                  return (
                    <button
                      key={art.id}
                      onClick={() => setSelectedArticleId(art.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 group ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                          : 'hover:bg-white hover:shadow-sm text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            isSelected ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            {art.category}
                          </span>
                          <span className={`text-[9px] font-medium ${
                            isSelected ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            {art.readTime}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'
                        }`}>
                          {art.title}
                        </h4>
                        <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-500'
                        }`}>
                          {art.summary}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom Status */}
            <div className="p-3.5 bg-slate-100/50 border-t border-slate-200/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                HTC Copilot v2.4 Enterprise Production
              </span>
            </div>
          </div>

          {/* Right Main Content Pane (Informatica KB Article Layout) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-white/70 backdrop-blur-md">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Knowledge Base</span>
              <ChevronRight size={13} />
              <span className="text-slate-600">{activeArticle.category}</span>
              <ChevronRight size={13} />
              <span className="text-indigo-600">{activeArticle.title}</span>
            </div>

            {/* Article Top Header Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {activeArticle.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest border border-indigo-500/30">
                    {activeArticle.badge}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1.5 ml-auto">
                    <Clock size={13} /> {activeArticle.readTime} • {activeArticle.version}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {activeArticle.title}
                </h1>

                {/* Target Personas */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Audience:
                  </span>
                  {activeArticle.targetPersonas.map((persona, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-200 text-[11px] font-medium border border-white/10"
                    >
                      {persona}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={handleExportCurrent}
                    disabled={isExportingPdf}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all active:scale-95"
                  >
                    <Download size={14} className={isExportingPdf ? 'animate-bounce text-indigo-600' : 'text-slate-700'} />
                    <span>{isExportingPdf ? 'Exporting PDF...' : 'Download Article Spec (PDF)'}</span>
                  </button>

                  {activeArticle.relatedModuleTab && onLaunchModule && (
                    <button
                      onClick={() => onLaunchModule(activeArticle.relatedModuleTab!)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-900/30 transition-all active:scale-95"
                    >
                      <span>Launch Module in Workspace</span>
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Executive Summary Card */}
            <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 shadow-sm space-y-2">
              <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-600" /> Executive Overview
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {activeArticle.summary}
              </p>
            </div>

            {/* Section 1: Business Value & Commercial Impact */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">
                1. Business Value & Commercial Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeArticle.businessValue.map((bv, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="text-xs text-slate-700 leading-relaxed font-medium">{bv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Core Enterprise Capabilities */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">
                2. Core Technical Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeArticle.capabilities.map((cap, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-indigo-200 transition-all space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {cap.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: End-to-End Operational Workflow */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">
                3. End-to-End Operational Workflow
              </h3>
              <div className="space-y-2.5">
                {activeArticle.workflow.map((wf, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </div>
                    <span className="text-xs text-slate-700 font-medium leading-relaxed pt-0.5">{wf}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Deliverables & Governing Standards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deliverables */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} className="text-indigo-600" /> Generated Deliverables
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {activeArticle.deliverables.map((deliv, idx) => (
                    <li key={idx} className="flex items-center gap-2 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Governing Standards */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={15} className="text-indigo-600" /> Governing Frameworks & Standards
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {activeArticle.standards.map((std, idx) => (
                    <li key={idx} className="flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                      <span>{std}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 5: Best Practices & Guardrails */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 shadow-md space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                Enterprise Best Practices & Architectural Guardrails
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeArticle.bestPractices.map((bp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{bp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Bottom Bar */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <HtcnxtLogo theme="light" size="sm" />
                <span>• Official Enterprise Documentation Portal</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCurrent}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Printer size={13} /> Export PDF Specification
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuide;
