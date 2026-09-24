import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Sparkles, Download, Copy, Check, CloudUpload, 
  ExternalLink, Filter, CheckCircle2, RefreshCw, Info, 
  Layers, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import { RaciRequest, RaciResponse, RaciMatrixRow, RaciRoleDefinition } from '../types';
import { generateRaci, publishArtifactToBlob, checkCopilotHealth } from '../services/copilotService';

interface CopilotRaciGeneratorProps {
  embedded?: boolean;
  initialIndustry?: string;
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

const CopilotRaciGenerator: React.FC<CopilotRaciGeneratorProps> = ({
  embedded = false,
  initialIndustry,
  initialContext,
  clientName
}) => {
  const [industry, setIndustry] = useState(initialIndustry || 'Financial Services & Banking');
  const [additionalContext, setAdditionalContext] = useState(initialContext || '');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<RaciResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrls, setPublishedUrls] = useState<string[]>([]);
  const [serverHealth, setServerHealth] = useState<{ isLive: boolean; message: string } | null>(null);

  useEffect(() => {
    checkCopilotHealth().then(setServerHealth);
  }, []);

  useEffect(() => {
    if (initialIndustry) setIndustry(initialIndustry);
    if (initialContext) setAdditionalContext(initialContext);
  }, [initialIndustry, initialContext]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPublishedUrls([]);
    try {
      const fullContext = clientName 
        ? `Client: ${clientName}. ${additionalContext}`
        : additionalContext;

      const res = await generateRaci({
        industry,
        additional_context: fullContext
      });
      setResult(res);
      setSelectedPhase('ALL');
    } catch (err) {
      console.error("RACI generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const phases = useMemo(() => {
    if (!result?.matrix) return [];
    const set = new Set(result.matrix.map(m => m.phase).filter(Boolean));
    return Array.from(set);
  }, [result?.matrix]);

  const filteredMatrix = useMemo(() => {
    if (!result?.matrix) return [];
    if (selectedPhase === 'ALL') return result.matrix;
    return result.matrix.filter(m => m.phase === selectedPhase);
  }, [result?.matrix, selectedPhase]);

  const getRaciBadge = (code: string) => {
    switch (code) {
      case 'R':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-black';
      case 'A':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-black shadow-sm';
      case 'C':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-black';
      case 'I':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-black';
      default:
        return 'text-slate-300';
    }
  };

  const handleExportCsv = () => {
    if (!result?.matrix?.length || !result.roles?.length) return;
    const roleHeaders = result.roles.map(r => `"${r.name}"`);
    const headers = ['"Phase"', '"Activity ID"', '"Activity Name"', '"Description"', ...roleHeaders];
    
    const rows = result.matrix.map(row => {
      const roleCols = result.roles.map(r => `"${row.roles[r.key] || '-'}"`);
      return [
        `"${row.phase || ''}"`,
        `"${row.activity_id || ''}"`,
        `"${row.activity_name.replace(/"/g, '""')}"`,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        ...roleCols
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${result.title.replace(/\s+/g, '_')}_RACI.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result) return;
    let markdown = `# ${result.title}\nIndustry: ${result.industry}\nArtifact: ${result.artifact_id || 'RACI-001'}\n\n`;
    markdown += `| Phase | Activity | ${result.roles.map(r => r.name).join(' | ')} |\n`;
    markdown += `| --- | --- | ${result.roles.map(() => '---').join(' | ')} |\n`;
    result.matrix.forEach(row => {
      markdown += `| ${row.phase} | ${row.activity_name} | ${result.roles.map(r => row.roles[r.key] || '-').join(' | ')} |\n`;
    });
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishBlob = async () => {
    if (!result?.artifact_id) return;
    setIsPublishing(true);
    const pub = await publishArtifactToBlob('raci_builder', result.artifact_id);
    if (pub.success && pub.urls) {
      setPublishedUrls(pub.urls);
    }
    setIsPublishing(false);
  };

  return (
    <div className={`h-full flex flex-col bg-slate-50 overflow-hidden ${embedded ? '' : 'p-6 md:p-8'}`}>
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">RACI Matrix</h2>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Data Governance Kit
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Generate authoritative accountability & responsibility matrices across governance, architecture, and engineering.</p>
          </div>
        </div>

        {/* Server status pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${serverHealth?.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          <span className="text-[11px] font-bold text-slate-600">
            {serverHealth?.isLive ? 'Governance Platform Live' : 'Enterprise Engine Active'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white border-r border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} /> Matrix Parameters
            </span>
            {clientName && (
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {clientName}
              </span>
            )}
          </div>

          {/* Industry Vertical */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Industry Vertical</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Additional Context */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Additional Context & Scope</label>
            <textarea
              rows={6}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Scope of project, key governance bodies, target architecture (Snowflake/Databricks/AWS), migration lifecycle, compliance mandates..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Synthesizing RACI Matrix...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate RACI Matrix
              </>
            )}
          </button>

          {/* RACI Legend Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Info size={14} className="text-blue-600" /> RACI Governance Standards
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                <span className="font-black text-blue-700 mr-1.5">R</span> Responsible (Doer)
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                <span className="font-black text-amber-700 mr-1.5">A</span> Accountable (Single Owner)
              </div>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                <span className="font-black text-purple-700 mr-1.5">C</span> Consulted (SME)
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                <span className="font-black text-slate-700 mr-1.5">I</span> Informed (Stakeholder)
              </div>
            </div>
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
                      <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {result.raci_id || 'RACI-001'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${result.source === 'copilot_live' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {result.source === 'copilot_live' ? 'Governance Platform Live' : 'Enterprise Engine Synthesis'}
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight mt-2">
                      {result.title}
                    </h1>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
                      title="Copy Markdown"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleExportCsv}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
                      title="Export CSV"
                    >
                      <Download size={14} /> CSV
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

                {/* Scope Summary */}
                {result.context_summary && (
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.context_summary}
                  </p>
                )}

                {/* Role Definitions Cards */}
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Governance Stakeholder Roles ({result.roles?.length || 0})
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {result.roles?.map((role, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{role.category}</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 truncate" title={role.name}>{role.name}</span>
                        <span className="text-[9px] font-black text-blue-600 mt-1 uppercase">Key: {role.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phase Filter Bar */}
              {phases.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 shrink-0">Phase:</span>
                  <button
                    onClick={() => setSelectedPhase('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${selectedPhase === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    All Phases ({result.matrix?.length || 0})
                  </button>
                  {phases.map(phase => (
                    <button
                      key={phase}
                      onClick={() => setSelectedPhase(phase)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${selectedPhase === phase ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              )}

              {/* RACI Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="py-4 px-5 min-w-[130px]">Phase</th>
                        <th className="py-4 px-5 min-w-[260px]">Activity & Objective</th>
                        {result.roles?.map(r => (
                          <th key={r.key} className="py-4 px-3 text-center whitespace-nowrap" title={r.name}>
                            <div className="text-[9px] font-black text-slate-700">{r.name}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase">{r.category}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredMatrix.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-700 align-middle whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
                              {row.phase}
                            </span>
                          </td>
                          <td className="py-4 px-5 align-middle">
                            <div className="font-bold text-slate-900 text-xs">
                              {row.activity_name}
                            </div>
                            {row.description && (
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                                {row.description}
                              </div>
                            )}
                          </td>
                          {result.roles?.map(r => {
                            const val = row.roles?.[r.key] || '-';
                            return (
                              <td key={r.key} className="py-4 px-3 text-center align-middle">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-xs ${getRaciBadge(val)}`}>
                                  {val}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guidance Notes */}
              {result.guidance_notes && result.guidance_notes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Governance Guidance & Operating Principles
                  </h3>
                  <div className="space-y-2">
                    {result.guidance_notes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">
                No RACI Matrix Generated Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-2 font-medium leading-relaxed">
                Select your industry vertical and optionally add project context on the left, then click <strong>Generate RACI Matrix</strong> to synthesize the governance matrix.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CopilotRaciGenerator;
