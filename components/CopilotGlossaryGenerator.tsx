import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Sparkles, Download, Copy, Check, CloudUpload, 
  ExternalLink, Search, Filter, Database, CheckCircle2, 
  RefreshCw, Info, Tag, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import { GlossaryRequest, GlossaryResponse, GlossaryTerm } from '../types';
import { generateGlossary, publishArtifactToBlob, checkCopilotHealth } from '../services/copilotService';

interface CopilotGlossaryGeneratorProps {
  embedded?: boolean;
  initialIndustry?: string;
  initialDomain?: string;
  initialContext?: string;
  clientName?: string;
}

const INDUSTRIES = [
  'Financial Services & Banking',
  'Healthcare & Life Sciences',
  'Retail & eCommerce',
  'Manufacturing & Industrial',
  'Telecommunications & Media',
  'Energy, Oil & Utilities',
  'Insurance & Wealth Management',
  'Public Sector & Government',
  'High Tech & SaaS'
];

const REGIONS = [
  'Global',
  'North America (US / Canada)',
  'European Union (EU)',
  'United Kingdom (UK)',
  'Asia-Pacific (APAC)',
  'Latin America (LATAM)',
  'Middle East & Africa (MENA)'
];

const CopilotGlossaryGenerator: React.FC<CopilotGlossaryGeneratorProps> = ({
  embedded = false,
  initialIndustry,
  initialDomain,
  initialContext,
  clientName
}) => {
  const [industry, setIndustry] = useState(initialIndustry || 'Financial Services & Banking');
  const [region, setRegion] = useState('Global');
  const [domain, setDomain] = useState(initialDomain || 'Enterprise Core Data Domain');
  const [client, setClient] = useState(clientName || '');
  const [regulations, setRegulations] = useState('BCBS 239, GDPR, SOX, CCPA');
  const [context, setContext] = useState(initialContext || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GlossaryResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrls, setPublishedUrls] = useState<string[]>([]);
  const [serverHealth, setServerHealth] = useState<{ isLive: boolean; message: string } | null>(null);

  useEffect(() => {
    checkCopilotHealth().then(setServerHealth);
  }, []);

  useEffect(() => {
    if (initialIndustry) setIndustry(initialIndustry);
    if (initialDomain) setDomain(initialDomain);
    if (initialContext) setContext(initialContext);
    if (clientName) setClient(clientName);
  }, [initialIndustry, initialDomain, initialContext, clientName]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPublishedUrls([]);
    try {
      const res = await generateGlossary({
        industry,
        region,
        domain,
        client_name: client,
        context,
        regulations
      });
      setResult(res);
    } catch (err) {
      console.error("Glossary generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTerms = useMemo(() => {
    if (!result?.terms) return [];
    return result.terms.filter(t => {
      const matchesSearch = searchTerm === '' || 
        t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.acronym && t.acronym.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.business_domain?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassification === 'ALL' || t.data_classification === selectedClassification;

      return matchesSearch && matchesClass;
    });
  }, [result?.terms, searchTerm, selectedClassification]);

  const handleExportCsv = () => {
    if (!result?.terms?.length) return;
    const headers = ['Term', 'Acronym', 'Business Domain', 'Data Classification', 'Definition', 'Steward Role', 'Regulations', 'Calculation Rule'];
    const rows = result.terms.map(t => [
      `"${t.term.replace(/"/g, '""')}"`,
      `"${(t.acronym || '').replace(/"/g, '""')}"`,
      `"${(t.business_domain || '').replace(/"/g, '""')}"`,
      `"${(t.data_classification || '').replace(/"/g, '""')}"`,
      `"${t.definition.replace(/"/g, '""')}"`,
      `"${(t.steward_role || '').replace(/"/g, '""')}"`,
      `"${(t.regulations || []).join('; ').replace(/"/g, '""')}"`,
      `"${(t.calculation_rule || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${result.title.replace(/\s+/g, '_')}_Glossary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!result?.terms?.length) return;
    if (window.XLSX) {
      const wsData = result.terms.map(t => ({
        'Term': t.term,
        'Acronym': t.acronym || '',
        'Domain': t.business_domain || '',
        'Classification': t.data_classification,
        'Definition': t.definition,
        'Steward Role': t.steward_role || '',
        'Regulations': (t.regulations || []).join(', '),
        'Formula / Calculation': t.calculation_rule || ''
      }));
      const ws = window.XLSX.utils.json_to_sheet(wsData);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Business Glossary");
      window.XLSX.writeFile(wb, `${result.title.replace(/\s+/g, '_')}.xlsx`);
    } else {
      handleExportCsv();
    }
  };

  const handlePublishBlob = async () => {
    if (!result?.artifact_id) return;
    setIsPublishing(true);
    const pub = await publishArtifactToBlob('glossary_generator', result.artifact_id);
    if (pub.success && pub.urls) {
      setPublishedUrls(pub.urls);
    }
    setIsPublishing(false);
  };

  const getClassificationBadge = (cls?: string) => {
    switch (cls) {
      case 'PII/PHI':
      case 'Restricted':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Confidential':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Internal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Public':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-50 overflow-hidden ${embedded ? '' : 'p-6 md:p-8'}`}>
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-200">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Business Glossary</h2>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                Data Governance Kit
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Standardized business glossaries, regulatory mappings, and data stewardship classifications.</p>
          </div>
        </div>

        {/* Server status pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${serverHealth?.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500'}`} />
          <span className="text-[11px] font-bold text-slate-600">
            {serverHealth?.isLive ? 'Governance Engine Live' : 'Enterprise Glossary Engine Active'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Parameters Sidebar */}
        <div className="lg:col-span-4 bg-white border-r border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} /> Glossary Configuration
            </span>
            {client && (
              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                {client}
              </span>
            )}
          </div>

          {/* Industry Vertical */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Region & Domain */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {REGIONS.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Name</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Enterprise Client"
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Business Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Customer 360, Claims, Risk & Compliance"
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicable Regulations</label>
            <input
              type="text"
              value={regulations}
              onChange={(e) => setRegulations(e.target.value)}
              placeholder="e.g. GDPR, BCBS 239, HIPAA, CCPA, SOX"
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Context */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Additional Context & Scope</label>
            <textarea
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Specific systems (SAP, Salesforce, Snowflake), metrics, or operational goals..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Synthesizing Glossary...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Business Glossary
              </>
            )}
          </button>

          <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start gap-2.5">
            <Info size={16} className="text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-teal-900 leading-relaxed font-medium">
              Produces normalized definitions, data classifications, acronyms, and calculation logic mapped to your industry domain.
            </p>
          </div>
        </div>

        {/* Display Column */}
        <div className="lg:col-span-8 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {result ? (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {result.glossary_id || 'GLS-001'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${result.source === 'copilot_live' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                        {result.source === 'copilot_live' ? 'Governance Platform Live' : 'Enterprise Engine Synthesis'}
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight mt-2">
                      {result.title}
                    </h1>
                  </div>

                  {/* Export Toolbar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCsv}
                      className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
                      title="Export CSV"
                    >
                      <Download size={14} /> CSV
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
                      title="Export Excel"
                    >
                      <FileSpreadsheet size={14} /> Excel
                    </button>
                    {result.artifact_id && (
                      <button
                        onClick={handlePublishBlob}
                        disabled={isPublishing}
                        className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <CloudUpload size={14} />
                        {isPublishing ? 'Publishing...' : 'Publish to Blob'}
                      </button>
                    )}
                  </div>
                </div>

                {publishedUrls.length > 0 && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600" /> Published to Azure Blob Storage
                    </span>
                    <a 
                      href={publishedUrls[0]} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-black underline flex items-center gap-1 text-emerald-700"
                    >
                      View Blob URL <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Info summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry</div>
                    <div className="text-xs font-bold text-slate-800 mt-1 truncate">{result.industry}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</div>
                    <div className="text-xs font-bold text-slate-800 mt-1 truncate">{result.region}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain</div>
                    <div className="text-xs font-bold text-slate-800 mt-1 truncate">{result.domain}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Terms</div>
                    <div className="text-xs font-bold text-teal-600 mt-1">{result.terms?.length || 0} Terms</div>
                  </div>
                </div>
              </div>

              {/* Terms Search and Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search terms, acronyms, definitions..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Classification Filter */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Classification:</span>
                  {['ALL', 'Confidential', 'Restricted', 'PII/PHI', 'Internal', 'Public'].map(cls => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClassification(cls)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${selectedClassification === cls ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glossary Terms Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="py-4 px-5">Term & Acronym</th>
                        <th className="py-4 px-5">Business Domain</th>
                        <th className="py-4 px-5">Classification</th>
                        <th className="py-4 px-5">Definition</th>
                        <th className="py-4 px-5">Steward Role</th>
                        <th className="py-4 px-5">Regulations / Formula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredTerms.map((term, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{term.term}</span>
                              {term.acronym && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {term.acronym}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-medium align-top whitespace-nowrap">
                            {term.business_domain || result.domain}
                          </td>
                          <td className="py-4 px-5 align-top whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getClassificationBadge(term.data_classification)}`}>
                              {term.data_classification || 'Internal'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-medium leading-relaxed align-top min-w-[280px]">
                            {term.definition}
                          </td>
                          <td className="py-4 px-5 text-slate-700 font-bold align-top whitespace-nowrap">
                            {term.steward_role || 'Data Steward'}
                          </td>
                          <td className="py-4 px-5 align-top text-xs space-y-1">
                            {term.regulations && term.regulations.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {term.regulations.map((reg, rIdx) => (
                                  <span key={rIdx} className="text-[9px] font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-100">
                                    {reg}
                                  </span>
                                ))}
                              </div>
                            )}
                            {term.calculation_rule && (
                              <div className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                                <strong>Rule:</strong> {term.calculation_rule}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredTerms.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold">
                    No terms found matching your filter criteria.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4 shadow-inner">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">
                No Glossary Generated Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-2 font-medium leading-relaxed">
                Configure your industry, target domain, and regulatory context on the left, then click <strong>Generate Business Glossary</strong> to synthesize domain terms and classifications.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CopilotGlossaryGenerator;
