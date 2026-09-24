import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  GitCompare, 
  Plus, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Columns, 
  Split, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { PolicyVersionRecord } from '../types';
import { computePolicyDiff, DiffResult, BlockDiff, htmlToStructuredLines } from '../utils/diffUtil';

// -------------------------------------------------------------
// 1. VERSION HISTORY SIDEBAR COMPONENT
// -------------------------------------------------------------
interface PolicyVersionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  versions: PolicyVersionRecord[];
  currentContent: string;
  onRevert: (version: PolicyVersionRecord) => void;
  onCompare: (versionAId: string, versionBId?: string) => void;
  onOpenSnapshotModal: () => void;
}

export const PolicyVersionSidebar: React.FC<PolicyVersionSidebarProps> = ({
  isOpen,
  onClose,
  versions,
  currentContent,
  onRevert,
  onCompare,
  onOpenSnapshotModal
}) => {
  const [revertConfirmId, setRevertConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Reverse chronological order: newest version first
  const sortedVersions = [...versions].reverse();

  return (
    <div className="w-80 md:w-96 h-full flex flex-col bg-white border-l border-slate-200/90 shadow-2xl z-30 shrink-0 animate-slide-left font-sans">
      
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <History size={17} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Version History
            </h3>
            <span className="text-[10px] text-slate-500 font-bold">
              {versions.length} {versions.length === 1 ? 'Snapshot' : 'Saved Snapshots'}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          title="Close Version History"
        >
          <X size={16} />
        </button>
      </div>

      {/* Snapshot Action Bar */}
      <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
        <span className="text-[11px] text-indigo-900 font-medium leading-tight">
          Create named milestone to freeze current changes:
        </span>
        <button
          onClick={onOpenSnapshotModal}
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={12} /> Snapshot
        </button>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {sortedVersions.map((ver, idx) => {
          const isLatest = idx === 0;
          const formattedDate = new Date(ver.created_at || Date.now()).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const isConfirmingRevert = revertConfirmId === ver.version_id;

          const badgeStyles = {
            initial: 'bg-purple-100 text-purple-800 border-purple-200',
            edit: 'bg-blue-100 text-blue-800 border-blue-200',
            restore: 'bg-amber-100 text-amber-800 border-amber-200',
            ai_refine: 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }[ver.change_type || 'edit'] || 'bg-slate-100 text-slate-800 border-slate-200';

          return (
            <div 
              key={ver.version_id} 
              className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 ${
                isLatest 
                  ? 'bg-slate-50/90 border-indigo-300 ring-2 ring-indigo-500/10 shadow-xs' 
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Card Top: Version Tag & Timestamp */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {ver.version_id}
                  </span>
                  {isLatest && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                      Current
                    </span>
                  )}
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeStyles}`}>
                    {ver.change_type || 'revision'}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {formattedDate}
                </span>
              </div>

              {/* Summary description */}
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {ver.summary || 'Policy revision and clause adjustment'}
              </p>

              {/* Author & Stats */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
                <span className="flex items-center gap-1 truncate max-w-[150px]">
                  <User size={12} className="text-slate-400" />
                  <span className="truncate">{ver.author || 'htccopilotusr'}</span>
                </span>
                <span>{ver.word_count ? `${ver.word_count} words` : 'Full artifact'}</span>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-1">
                {/* Compare Button */}
                <button
                  onClick={() => onCompare(ver.version_id, 'current')}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-[11px] font-bold transition-all border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  title={`Compare ${ver.version_id} against current editor`}
                >
                  <GitCompare size={12} className="text-indigo-600" />
                  <span>Compare</span>
                </button>

                {/* Revert Button */}
                {!isConfirmingRevert ? (
                  <button
                    onClick={() => setRevertConfirmId(ver.version_id)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-xl text-[11px] font-bold transition-all border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    title={`Revert editor to ${ver.version_id}`}
                  >
                    <RotateCcw size={12} className="text-amber-600" />
                    <span>Revert</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-1">
                    <button
                      onClick={() => {
                        onRevert(ver);
                        setRevertConfirmId(null);
                      }}
                      className="flex-1 py-1 px-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-xs cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setRevertConfirmId(null)}
                      className="py-1 px-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-[10px] font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
        Reverting to a past version creates a new restore record.
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// 2. COMPARE DIFF MODAL COMPONENT (UNIFIED & SIDE-BY-SIDE)
// -------------------------------------------------------------
interface PolicyCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: PolicyVersionRecord[];
  currentContent: string;
  initialVersionAId?: string;
  initialVersionBId?: string;
  onRevertToVersion: (version: PolicyVersionRecord) => void;
}

export const PolicyCompareModal: React.FC<PolicyCompareModalProps> = ({
  isOpen,
  onClose,
  versions,
  currentContent,
  initialVersionAId = 'v1.0',
  initialVersionBId = 'current',
  onRevertToVersion
}) => {
  const [versionAId, setVersionAId] = useState<string>(initialVersionAId);
  const [versionBId, setVersionBId] = useState<string>(initialVersionBId);
  const [diffMode, setDiffMode] = useState<'unified' | 'split'>('unified');

  // Build the complete options list including "current"
  const versionBContent = useMemo(() => {
    if (versionBId === 'current') return currentContent;
    const found = versions.find(v => v.version_id === versionBId);
    return found ? found.html_content : currentContent;
  }, [versionBId, versions, currentContent]);

  const versionA = useMemo(() => {
    return versions.find(v => v.version_id === versionAId) || versions[0] || {
      version_id: 'v1.0',
      version_number: '1.0',
      created_at: new Date().toISOString(),
      author: 'Data Governance Council',
      summary: 'Baseline policy',
      html_content: currentContent
    };
  }, [versionAId, versions, currentContent]);

  // Compute Diff
  const diffResult: DiffResult = useMemo(() => {
    return computePolicyDiff(versionA.html_content, versionBContent);
  }, [versionA, versionBContent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[90vh] max-h-[94vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 shadow-xs">
              <GitCompare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Policy Version Comparison & Diff Analysis
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Audit Grade
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Inspecting structural and clause revisions across lifecycle snapshots.
              </p>
            </div>
          </div>

          {/* Mode Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDiffMode('unified')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  diffMode === 'unified' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Split size={14} />
                <span>Unified Diff</span>
              </button>
              <button
                onClick={() => setDiffMode('split')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  diffMode === 'split' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns size={14} />
                <span>Side-by-Side</span>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comparison Selector & Metrics Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Version A Selector */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Baseline (A):</span>
              <select
                value={versionAId}
                onChange={(e) => setVersionAId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {versions.map(v => (
                  <option key={v.version_id} value={v.version_id}>
                    {v.version_id} ({v.summary})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight size={14} className="text-slate-300 hidden sm:block" />

            {/* Version B Selector */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Compared (B):</span>
              <select
                value={versionBId}
                onChange={(e) => setVersionBId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="current">Current Editor Content (Active State)</option>
                {versions.map(v => (
                  <option key={v.version_id} value={v.version_id}>
                    {v.version_id} ({v.summary})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{diffResult.additions} Additions
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              -{diffResult.deletions} Deletions
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              {diffResult.unchanged} Unchanged
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              {diffResult.similarity}% Match
            </span>
          </div>
        </div>

        {/* Diff Canvas Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 bg-slate-100/70 custom-scrollbar">
          {diffMode === 'unified' ? (
            /* Unified Diff View */
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 space-y-3 font-sans">
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Unified Clause & Section Changelog</span>
                <span>Green: Added • Red Strike: Removed</span>
              </div>

              {diffResult.blocks.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-slate-700">Both versions are 100% identical.</p>
                  <p className="text-xs">No additions, deletions, or structural modifications detected.</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs leading-relaxed">
                  {diffResult.blocks.map((block, bIdx) => {
                    if (block.type === 'modified' && block.wordDiffs) {
                      return (
                        <div key={bIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 my-2">
                          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            Modified Block:
                          </div>
                          <div>
                            {block.wordDiffs.map((w, wIdx) => {
                              if (w.type === 'added') {
                                return (
                                  <span key={wIdx} className="bg-emerald-100 text-emerald-900 font-bold px-1 py-0.5 rounded mx-0.5 border border-emerald-200">
                                    {w.text}
                                  </span>
                                );
                              }
                              if (w.type === 'removed') {
                                return (
                                  <span key={wIdx} className="bg-rose-100 text-rose-800 line-through px-1 py-0.5 rounded mx-0.5 border border-rose-200">
                                    {w.text}
                                  </span>
                                );
                              }
                              return <span key={wIdx}>{w.text}</span>;
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (block.type === 'added') {
                      return (
                        <div key={bIdx} className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500 my-1 font-medium">
                          <span className="font-mono font-bold mr-1.5 text-emerald-600">+</span>
                          {block.newText}
                        </div>
                      );
                    }

                    if (block.type === 'removed') {
                      return (
                        <div key={bIdx} className="p-2.5 rounded-lg bg-rose-50 text-rose-800 line-through border-l-4 border-rose-500 my-1">
                          <span className="font-mono font-bold mr-1.5 text-rose-600">-</span>
                          {block.oldText}
                        </div>
                      );
                    }

                    // Unchanged
                    return (
                      <div key={bIdx} className="py-1 px-2 text-slate-600 border-l-2 border-transparent">
                        {block.newText}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Side-by-Side Split View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Left Column: Version A */}
              <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{versionA.version_id}</span>
                    <span className="text-slate-500 font-normal">({versionA.summary})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Baseline</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 leading-relaxed custom-scrollbar">
                  <div dangerouslySetInnerHTML={{ __html: versionA.html_content }} />
                </div>
              </div>

              {/* Right Column: Version B */}
              <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {versionBId === 'current' ? 'Current Editor' : versionBId}
                    </span>
                    <span className="text-slate-500 font-normal">
                      {versionBId === 'current' ? '(Active Changes)' : ''}
                    </span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-black uppercase">Target</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 leading-relaxed custom-scrollbar">
                  <div dangerouslySetInnerHTML={{ __html: versionBContent }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Comparing Baseline <strong className="text-slate-800">{versionA.version_id}</strong> against <strong className="text-slate-800">{versionBId}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onRevertToVersion(versionA);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw size={14} className="text-amber-600" />
              <span>Revert Editor to {versionA.version_id}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


// -------------------------------------------------------------
// 3. CREATE SNAPSHOT MODAL COMPONENT
// -------------------------------------------------------------
interface PolicySnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextVersionId: string;
  onSaveSnapshot: (note: string) => void;
}

export const PolicySnapshotModal: React.FC<PolicySnapshotModalProps> = ({
  isOpen,
  onClose,
  nextVersionId,
  onSaveSnapshot
}) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSnapshot(note.trim() || 'Milestone snapshot');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-800">
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Plus size={16} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase">Save Version Snapshot</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              New Version Identifier
            </label>
            <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-mono font-black text-indigo-700 border border-slate-200">
              {nextVersionId}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Milestone Change Summary / Notes
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Added section on data residency, aligned with GDPR & BCBS 239..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
