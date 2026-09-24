import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ShieldCheck, Plus, Home, Search, Filter, Download, Trash2, 
  ArrowLeft, FileText, CheckCircle2, Clock, RefreshCw, Sparkles, 
  ExternalLink, Save, Bold, Italic, Underline, List, ListOrdered, 
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, 
  Undo, Redo, FileDown, Layers, Check, X, AlertCircle, History,
  GitCompare, RotateCcw
} from 'lucide-react';
import { PolicyRequestRecord, PolicyResponse, PolicyVersionRecord } from '../types';
import { 
  generatePolicy, 
  loadPolicyRequestsFromCache, 
  savePolicyRequestToCache, 
  deletePolicyRequestFromCache,
  fetchDocxHtml
} from '../services/copilotService';
import { downloadAsDocx } from '../utils/docxExport';
import { downloadAsPdf } from '../utils/pdfExport';
import { buildFormalPolicyHtml } from '../utils/formalPolicyTemplate';
import { PolicyVersionSidebar, PolicyCompareModal, PolicySnapshotModal } from './PolicyVersionHistory';

interface CopilotPolicyGeneratorProps {
  embedded?: boolean;
  initialIndustry?: string;
  initialContext?: string;
  clientName?: string;
  onNavigateHome?: () => void;
}

const CopilotPolicyGenerator: React.FC<CopilotPolicyGeneratorProps> = ({
  embedded = false,
  initialIndustry,
  initialContext,
  clientName,
  onNavigateHome
}) => {
  // Navigation State: 'home' | 'editor'
  const [view, setView] = useState<'home' | 'editor'>('home');
  const [requests, setRequests] = useState<PolicyRequestRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PolicyRequestRecord | null>(null);

  // Search & Filters on Home
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Master' | 'Specific'>('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formIndustry, setFormIndustry] = useState(initialIndustry || '');
  const [formGenType, setFormGenType] = useState<'Master' | 'Specific'>('Master');
  const [formFamilyId, setFormFamilyId] = useState('POL-0001');
  const [formPolicyType, setFormPolicyType] = useState('Data Governance');
  const [formContext, setFormContext] = useState(initialContext || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Word Editor State
  const editorRef = useRef<HTMLDivElement>(null);
  const [editableContent, setEditableContent] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasUnsavedChangesRef = useRef(false);
  const lastLoadedRequestIdRef = useRef<string | null>(null);

  // Version History & Compare State
  const [showVersionSidebar, setShowVersionSidebar] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [compareVersionAId, setCompareVersionAId] = useState<string>('v1.0');
  const [compareVersionBId, setCompareVersionBId] = useState<string>('current');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [revertToastMessage, setRevertToastMessage] = useState<string | null>(null);

  // Load requests from cache on mount
  useEffect(() => {
    const cached = loadPolicyRequestsFromCache();
    setRequests(cached);
  }, []);

  // Update initial parameters if passed
  useEffect(() => {
    if (initialIndustry) setFormIndustry(initialIndustry);
    if (initialContext) setFormContext(initialContext);
  }, [initialIndustry, initialContext]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = requests.length;
    const masterCount = requests.filter(r => r.generation_type === 'Master').length;
    const specificCount = requests.filter(r => r.generation_type === 'Specific').length;
    const completedCount = requests.filter(r => r.status === 'Completed').length;
    return { total, masterCount, specificCount, completedCount };
  }, [requests]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = 
        r.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.policy_request_id && r.policy_request_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.family_id && r.family_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.id && r.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.policy_type && r.policy_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.file_name && r.file_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || r.generation_type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [requests, searchTerm, typeFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Submit Policy Request
  const handleSubmitPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIndustry.trim()) {
      setFormError('Please enter an Industry (e.g. manufacturing, banking, healthcare)');
      return;
    }
    if (formGenType === 'Specific') {
      if (!formFamilyId.trim()) {
        setFormError('Policy Request ID is required for Specific Policy (e.g. POL-0003)');
        return;
      }
      if (!formPolicyType.trim()) {
        setFormError('Policy Type is required for Specific Policy');
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    const resolvedFamilyId = formGenType === 'Specific' ? formFamilyId.trim() : `POL-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const resolvedContext = clientName ? `Client: ${clientName}. ${formContext}` : formContext;
      
      // Execute policy generation API
      const result: PolicyResponse = await generatePolicy({
        industry: formIndustry.trim(),
        generation_type: formGenType.toLowerCase(),
        policy_type: formGenType === 'Master' ? 'Enterprise Master Policy' : formPolicyType.trim(),
        family_id: resolvedFamilyId,
        additional_context: resolvedContext
      });

      // Construct file name matching the sample format
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const cleanIndustry = formIndustry.trim().toLowerCase().replace(/\s+/g, '_');
      const indCapitalized = cleanIndustry.charAt(0).toUpperCase() + cleanIndustry.slice(1);
      const formattedPolicyType = (formGenType === 'Master' ? 'Master' : formPolicyType.trim())
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('_');

      const policyRequestId = result.policy_request_id || result.policy_family_id || result.family_id || resolvedFamilyId;
      const defaultFileName = formGenType === 'Master'
        ? `${indCapitalized}_Enterprise_Master_${timestamp}.docx`
        : `${cleanIndustry}_Enterprise_${formattedPolicyType}_Policy.docx`;

      const fileName = result.file_name || defaultFileName;
      const outputPath = result.output_path || (formGenType === 'Master'
        ? `/app/output/${policyRequestId}-${cleanIndustry}/master/${fileName}`
        : `/app/output/${policyRequestId}-${cleanIndustry}/specific/${formattedPolicyType}/${fileName}`);
      const outputBlobPath = result.output_blob_path || (formGenType === 'Master'
        ? `${policyRequestId}/${fileName}`
        : `${policyRequestId}/specific/${formattedPolicyType}/${fileName}`);
      const fallbackDownloadUrl = result.download_url || `https://connectorframwork.blob.core.windows.net/htcnxt-copilot/${outputBlobPath}`;

      // Build rich formatted text strictly matching standard Enterprise Policy pattern
      const docHtml = buildFormalPolicyHtml({
        industry: formIndustry.trim(),
        generationType: formGenType,
        policyType: formGenType === 'Master' ? 'Enterprise Master Policy' : formPolicyType.trim(),
        familyId: policyRequestId,
        context: resolvedContext,
        clientName: clientName,
        effectiveDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });

      const initialVersion: PolicyVersionRecord = {
        version_id: 'v1.0',
        version_number: '1.0',
        created_at: new Date().toISOString(),
        author: 'Data Governance Council (AI Engine)',
        summary: `Initial ${formGenType} Policy baseline generation`,
        html_content: docHtml,
        change_type: 'initial',
        word_count: docHtml.split(/\s+/).filter(Boolean).length
      };

      const record: PolicyRequestRecord = {
        id: formGenType === 'Specific' ? `${policyRequestId}-${Date.now().toString().slice(-4)}` : policyRequestId,
        policy_request_id: policyRequestId,
        policy_family_id: policyRequestId,
        family_id: policyRequestId,
        industry: formIndustry.trim(),
        generation_type: formGenType,
        policy_type: formGenType === 'Master' ? 'Enterprise Master Policy' : formPolicyType.trim(),
        requirement_context: formContext,
        status: 'Completed',
        created_at: new Date().toISOString(),
        file_name: fileName,
        download_url: fallbackDownloadUrl,
        output_path: outputPath,
        output_blob_path: outputBlobPath,
        html_content: docHtml,
        policy_data: result,
        versions: [initialVersion]
      };

      // Save to cache
      const updatedList = savePolicyRequestToCache(record);
      setRequests(updatedList);
      
      // Close modal and open in Word editor
      setIsCreateModalOpen(false);
      setSelectedRequest(record);
      setEditableContent(docHtml);
      setView('editor');
    } catch (err: any) {
      console.error("Error creating policy request:", err);
      setFormError(err.message || 'Failed to generate policy. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open existing request in editor
  const handleOpenRequest = async (req: PolicyRequestRecord) => {
    let html = req.html_content;

    // If html content not in record, try fetching from download_url or build from formal template
    if (!html && req.download_url) {
      const fetched = await fetchDocxHtml(req.download_url);
      if (fetched) html = fetched;
    }

    if (!html) {
      html = buildFormalPolicyHtml({
        industry: req.industry,
        generationType: req.generation_type as any,
        policyType: req.policy_type || (req.generation_type === 'Master' ? 'Enterprise Master Policy' : 'Data Governance'),
        familyId: req.policy_request_id || req.family_id || req.id,
        context: req.requirement_context,
        clientName: clientName,
        effectiveDate: new Date(req.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
    }

    // Ensure versions array exists with at least baseline snapshot
    let versions = req.versions;
    if (!versions || versions.length === 0) {
      const initialVersion: PolicyVersionRecord = {
        version_id: 'v1.0',
        version_number: '1.0',
        created_at: req.created_at || new Date().toISOString(),
        author: 'Data Governance Council',
        summary: `${req.generation_type} Policy Baseline Synthesis`,
        html_content: html,
        change_type: 'initial',
        word_count: html.split(/\s+/).filter(Boolean).length
      };
      versions = [initialVersion];
    }

    const updatedWithVersions: PolicyRequestRecord = {
      ...req,
      html_content: html,
      versions
    };

    setSelectedRequest(updatedWithVersions);
    setEditableContent(html);
    setView('editor');
  };

  // Delete Request
  const handleDeleteRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this policy request?")) {
      const updated = deletePolicyRequestFromCache(id);
      setRequests(updated);
      if (selectedRequest?.id === id) {
        setView('home');
        setSelectedRequest(null);
      }
    }
  };

  // Core save function to persist changes to cache
  const executeSave = useCallback((isAuto = true, customNote?: string) => {
    if (!selectedRequest || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;

    if (isAuto) {
      setAutoSaveStatus('saving');
    }

    const versions = selectedRequest.versions || [];
    let updatedVersions = [...versions];
    const latestVersion = versions[versions.length - 1];
    const hasChanged = !latestVersion || latestVersion.html_content !== currentHtml;

    // Only create a new version entry when manually saved and content changed or customNote provided
    if (!isAuto && (hasChanged || customNote)) {
      const nextVerNum = (1.0 + versions.length * 0.1).toFixed(1);
      const newVersion: PolicyVersionRecord = {
        version_id: `v${nextVerNum}`,
        version_number: nextVerNum,
        created_at: new Date().toISOString(),
        author: 'htccopilotusr',
        summary: customNote || 'Manual editor revisions & clause adjustments',
        html_content: currentHtml,
        change_type: 'edit',
        word_count: currentHtml.split(/\s+/).filter(Boolean).length
      };
      updatedVersions.push(newVersion);
    }

    const updatedRecord: PolicyRequestRecord = {
      ...selectedRequest,
      html_content: currentHtml,
      versions: updatedVersions
    };

    const updatedList = savePolicyRequestToCache(updatedRecord);
    setRequests(updatedList);
    setSelectedRequest(updatedRecord);
    setEditableContent(currentHtml);
    setHasUnsavedChanges(false);
    hasUnsavedChangesRef.current = false;
    setAutoSaveStatus('saved');
    setLastSavedAt(new Date());

    if (!isAuto) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  }, [selectedRequest]);

  // Revert to a selected past version
  const handleRevertToVersion = (version: PolicyVersionRecord) => {
    if (!selectedRequest || !editorRef.current) return;

    editorRef.current.innerHTML = version.html_content;
    setEditableContent(version.html_content);

    const versions = selectedRequest.versions || [];
    const nextVerNum = (1.0 + versions.length * 0.1).toFixed(1);
    const restoredVersion: PolicyVersionRecord = {
      version_id: `v${nextVerNum}`,
      version_number: nextVerNum,
      created_at: new Date().toISOString(),
      author: 'htccopilotusr',
      summary: `Restored to version ${version.version_id} (${version.summary})`,
      html_content: version.html_content,
      change_type: 'restore',
      word_count: version.html_content.split(/\s+/).filter(Boolean).length
    };

    const updatedRecord: PolicyRequestRecord = {
      ...selectedRequest,
      html_content: version.html_content,
      versions: [...versions, restoredVersion]
    };

    const updatedList = savePolicyRequestToCache(updatedRecord);
    setRequests(updatedList);
    setSelectedRequest(updatedRecord);
    setHasUnsavedChanges(false);
    hasUnsavedChangesRef.current = false;
    setAutoSaveStatus('saved');
    setLastSavedAt(new Date());

    setRevertToastMessage(`Successfully reverted policy to ${version.version_id}`);
    setTimeout(() => setRevertToastMessage(null), 3500);
  };

  // Open Compare modal
  const handleOpenCompare = (verAId?: string, verBId = 'current') => {
    const versions = selectedRequest?.versions || [];
    const targetA = verAId || (versions.length > 1 ? versions[versions.length - 2].version_id : (versions[0]?.version_id || 'v1.0'));
    setCompareVersionAId(targetA);
    setCompareVersionBId(verBId);
    setIsCompareModalOpen(true);
  };

  // Save manual snapshot
  const handleSaveSnapshot = (note: string) => {
    if (!selectedRequest || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const versions = selectedRequest.versions || [];
    const nextVerNum = (1.0 + versions.length * 0.1).toFixed(1);
    const snapshotVer: PolicyVersionRecord = {
      version_id: `v${nextVerNum}`,
      version_number: nextVerNum,
      created_at: new Date().toISOString(),
      author: 'htccopilotusr',
      summary: note || 'Milestone snapshot',
      html_content: currentHtml,
      change_type: 'edit',
      word_count: currentHtml.split(/\s+/).filter(Boolean).length
    };

    const updatedRecord: PolicyRequestRecord = {
      ...selectedRequest,
      html_content: currentHtml,
      versions: [...versions, snapshotVer]
    };

    const updatedList = savePolicyRequestToCache(updatedRecord);
    setRequests(updatedList);
    setSelectedRequest(updatedRecord);
    setRevertToastMessage(`Saved snapshot ${snapshotVer.version_id}: "${note}"`);
    setTimeout(() => setRevertToastMessage(null), 3500);
  };

  // Synchronize editor content when opening a request or switching view
  useEffect(() => {
    if (view === 'editor' && selectedRequest) {
      if (lastLoadedRequestIdRef.current !== selectedRequest.id) {
        lastLoadedRequestIdRef.current = selectedRequest.id;
        const htmlToSet = selectedRequest.html_content || editableContent;
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlToSet;
        }
        setHasUnsavedChanges(false);
        hasUnsavedChangesRef.current = false;
        setAutoSaveStatus('saved');
      }
    }
  }, [view, selectedRequest, editableContent]);

  // Debounced auto-save: triggers 1800ms after user pauses typing
  useEffect(() => {
    if (!hasUnsavedChanges || view !== 'editor') return;

    const timer = setTimeout(() => {
      executeSave(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, view, executeSave]);

  // Periodic safety interval: persists every 20s if changes exist
  useEffect(() => {
    if (view !== 'editor') return;

    const interval = setInterval(() => {
      if (hasUnsavedChangesRef.current) {
        executeSave(true);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [view, executeSave]);

  // Persist pending edits when window/tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChangesRef.current && selectedRequest && editorRef.current) {
        const currentHtml = editorRef.current.innerHTML;
        savePolicyRequestToCache({
          ...selectedRequest,
          html_content: currentHtml
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedRequest]);

  // Editor Input Handler
  const handleEditorInput = () => {
    setHasUnsavedChanges(true);
    hasUnsavedChangesRef.current = true;
    setAutoSaveStatus('unsaved');
  };

  // Word Editor Formatting Controls
  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Save changes manually from editor to cache
  const handleSaveEditorChanges = () => {
    executeSave(false);
  };

  // Navigation back to requests with pending auto-save guarantee
  const handleBackToRequests = () => {
    if (hasUnsavedChangesRef.current) {
      executeSave(true);
    }
    setView('home');
  };

  // Download .docx format directly from frontend
  const handleDownloadDocx = async (req?: PolicyRequestRecord) => {
    const target = req || selectedRequest;
    if (!target) return;
    setIsDownloadingDocx(true);
    try {
      const isCurrentEditor = view === 'editor' && selectedRequest?.id === target.id;
      const plainText = isCurrentEditor && editorRef.current 
        ? editorRef.current.innerText 
        : (target.html_content || target.requirement_context || '');
      const filename = target.file_name || `${target.industry}_${target.generation_type}_Policy.docx`;
      const title = `${target.industry} ${target.policy_type || 'Enterprise Policy'}`;
      await downloadAsDocx(filename, title, plainText);
    } catch (e) {
      console.error("Docx download error:", e);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  // Download .pdf format directly from frontend
  const handleDownloadPdf = async (req?: PolicyRequestRecord) => {
    const target = req || selectedRequest;
    if (!target) return;
    setIsDownloadingPdf(true);
    try {
      const isCurrentEditor = view === 'editor' && selectedRequest?.id === target.id;
      const html = isCurrentEditor && editorRef.current 
        ? editorRef.current.innerHTML 
        : (target.html_content || buildFormalPolicyHtml({
            industry: target.industry,
            generationType: target.generation_type as any,
            policyType: target.policy_type || (target.generation_type === 'Master' ? 'Enterprise Master Policy' : 'Data Governance'),
            familyId: target.policy_request_id || target.family_id || target.id,
            context: target.requirement_context,
            clientName: clientName,
            effectiveDate: new Date(target.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }));

      const filename = (target.file_name || `${target.id}.docx`).replace(/\.docx$/i, '.pdf');
      const title = `${target.industry} ${target.policy_type || 'Enterprise Policy'}`;

      await downloadAsPdf({
        filename,
        title,
        element: isCurrentEditor ? editorRef.current : null,
        htmlContent: html
      });
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: EDITOR VIEW
  // -------------------------------------------------------------
  if (view === 'editor' && selectedRequest) {
    return (
      <div className="flex-1 min-h-0 h-full flex flex-col bg-slate-100 overflow-hidden font-sans">
        
        {/* Top Navigation & Action Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToRequests}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Back to Requests
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Policy Request ID: {selectedRequest.policy_request_id || selectedRequest.family_id || selectedRequest.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedRequest.generation_type === 'Master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {selectedRequest.generation_type} Policy
                </span>
                <span className="text-xs font-bold text-slate-800 hidden md:inline truncate max-w-xs">
                  {selectedRequest.file_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Auto-Save Status Indicator */}
            <div className="flex items-center mr-1">
              {autoSaveStatus === 'saving' && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                  <RefreshCw size={13} className="animate-spin text-amber-600" />
                  <span>Auto-saving...</span>
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Auto-saved {lastSavedAt ? `(${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})` : 'to cache'}</span>
                </span>
              )}
              {autoSaveStatus === 'unsaved' && (
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                  <Clock size={13} className="text-slate-500" />
                  <span>Unsaved edits</span>
                </span>
              )}
            </div>

            {/* Version History Toggle Button */}
            <button
              onClick={() => setShowVersionSidebar(!showVersionSidebar)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs cursor-pointer ${
                showVersionSidebar
                  ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="View version history, timeline & revert to past snapshots"
            >
              <History size={14} className={showVersionSidebar ? 'text-white' : 'text-indigo-600'} />
              <span>Versions</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                showVersionSidebar ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}>
                {(selectedRequest.versions || []).length || 1}
              </span>
            </button>

            {/* Compare Versions Action */}
            <button
              onClick={() => handleOpenCompare()}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Compare differences across policy versions"
            >
              <GitCompare size={14} className="text-violet-600" />
              <span>Compare</span>
            </button>

            {/* Direct Azure Blob link if provided in response */}
            {selectedRequest.download_url && (
              <a
                href={selectedRequest.download_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
                title="Download direct from Azure Blob Storage"
              >
                <ExternalLink size={14} /> Cloud Blob
              </a>
            )}

            {/* PDF export */}
            <button
              onClick={() => handleDownloadPdf()}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              title="Export policy document as formatted multi-page PDF"
            >
              <FileDown size={15} />
              {isDownloadingPdf ? 'Generating PDF...' : 'Download .pdf'}
            </button>

            {/* Frontend .docx export */}
            <button
              onClick={() => handleDownloadDocx()}
              disabled={isDownloadingDocx}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              title="Download as Microsoft Word .docx document"
            >
              <Download size={15} />
              {isDownloadingDocx ? 'Generating .docx...' : 'Download .docx'}
            </button>

            {/* Save updates in cache */}
            <button
              onClick={() => executeSave(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Immediately persist changes to local cache"
            >
              {isSaved ? <Check size={15} /> : <Save size={15} />}
              {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Word Document Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-bold" title="Bold">
              <Bold size={14} />
            </button>
            <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Italic">
              <Italic size={14} />
            </button>
            <button onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Underline">
              <Underline size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button onClick={() => applyFormat('formatBlock', '<h1>')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Heading 1">
              <Heading1 size={14} />
            </button>
            <button onClick={() => applyFormat('formatBlock', '<h2>')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Heading 2">
              <Heading2 size={14} />
            </button>
            <button onClick={() => applyFormat('formatBlock', '<h3>')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Heading 3">
              <Heading3 size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Bullet List">
              <List size={14} />
            </button>
            <button onClick={() => applyFormat('insertOrderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Numbered List">
              <ListOrdered size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button onClick={() => applyFormat('justifyLeft')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Align Left">
              <AlignLeft size={14} />
            </button>
            <button onClick={() => applyFormat('justifyCenter')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Align Center">
              <AlignCenter size={14} />
            </button>
            <button onClick={() => applyFormat('justifyRight')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Align Right">
              <AlignRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button onClick={() => applyFormat('undo')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Undo">
              <Undo size={14} />
            </button>
            <button onClick={() => applyFormat('redo')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Redo">
              <Redo size={14} />
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium ml-auto hidden md:inline">
            Interactive Word Document Editor • Auto-saves periodically to local cache
          </span>
        </div>

        {/* Main Canvas + Version History Sidebar Container */}
        <div className="flex-1 min-h-0 flex relative overflow-hidden bg-slate-200/90">
          
          {/* Word Document Canvas Container: within-page scrolling, no context going outside bounds */}
          <div 
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 editor-scroll-container flex justify-center"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div 
              ref={(node) => {
                editorRef.current = node;
                if (node && (!node.innerHTML || node.innerHTML === '<br>') && selectedRequest) {
                  const html = selectedRequest.html_content || editableContent;
                  if (html) node.innerHTML = html;
                }
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleEditorInput}
              className="w-full max-w-[850px] min-h-[1100px] mb-32 bg-white rounded-lg shadow-2xl p-6 sm:p-10 md:p-14 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] custom-editor"
            />
          </div>

          {/* Version History Sidebar */}
          {showVersionSidebar && (
            <PolicyVersionSidebar
              isOpen={showVersionSidebar}
              onClose={() => setShowVersionSidebar(false)}
              versions={selectedRequest.versions || []}
              currentContent={editorRef.current?.innerHTML || editableContent}
              onRevert={handleRevertToVersion}
              onCompare={(verAId, verBId) => handleOpenCompare(verAId, verBId)}
              onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
            />
          )}

          {/* Revert Toast Notification */}
          {revertToastMessage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-bold animate-fade-in backdrop-blur-md">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{revertToastMessage}</span>
            </div>
          )}
        </div>

        {/* Compare Diff Modal */}
        {isCompareModalOpen && (
          <PolicyCompareModal
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            versions={selectedRequest.versions || []}
            currentContent={editorRef.current?.innerHTML || editableContent}
            initialVersionAId={compareVersionAId}
            initialVersionBId={compareVersionBId}
            onRevertToVersion={handleRevertToVersion}
          />
        )}

        {/* Create Snapshot Modal */}
        {isSnapshotModalOpen && (
          <PolicySnapshotModal
            isOpen={isSnapshotModalOpen}
            onClose={() => setIsSnapshotModalOpen(false)}
            nextVersionId={`v${(1.0 + (selectedRequest.versions?.length || 1) * 0.1).toFixed(1)}`}
            onSaveSnapshot={handleSaveSnapshot}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: HOME VIEW (REQUEST MECHANISM & STATISTICS)
  // -------------------------------------------------------------
  return (
    <div className={`h-full flex flex-col bg-slate-50 overflow-hidden font-sans ${embedded ? '' : 'p-6 md:p-8'}`}>
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Policy Generator</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Data Governance Kit
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Enterprise policy generation, compliance lifecycle, and docx artifact management.</p>
          </div>
        </div>

        {/* Right hand top side: Home button & Create button */}
        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Return to Dashboard"
            >
              <Home size={16} /> Home
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus size={16} /> Create Policy
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Generated Policies</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">Policy request records</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Master Policies</div>
            <div className="text-2xl font-black text-purple-700 mt-1">{stats.masterCount}</div>
            <div className="text-[11px] font-bold text-purple-500 mt-0.5">Enterprise charter level</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Specific Policies</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.specificCount}</div>
            <div className="text-[11px] font-bold text-blue-500 mt-0.5">Targeted operational domains</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Completed Requests</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.completedCount}</div>
            <div className="text-[11px] font-bold text-emerald-500 mt-0.5">100% docx artifacts ready</div>
          </div>
        </div>

        {/* Previous Requests Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search previous policy requests..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Generation Type:</span>
            {(['ALL', 'Master', 'Specific'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${typeFilter === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Previous Policy Requests ({filteredRequests.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Click any request to view and edit in Word Document Editor</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-3.5 px-6">Policy Request ID</th>
                  <th className="py-3.5 px-6">Industry</th>
                  <th className="py-3.5 px-6">Generation Type</th>
                  <th className="py-3.5 px-6">Policy Domain</th>
                  <th className="py-3.5 px-6">File Name (.docx)</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequests.map((req) => (
                  <tr 
                    key={req.id}
                    onClick={() => handleOpenRequest(req)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {req.policy_request_id || req.family_id || req.id}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                      {req.industry}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${req.generation_type === 'Master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {req.generation_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium whitespace-nowrap">
                      {req.policy_type || 'Enterprise Master'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {req.file_name || `${req.id}.docx`}
                    </td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-max">
                        <CheckCircle2 size={12} /> {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenRequest(req)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all"
                        >
                          Open & Edit
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(req)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Download .pdf"
                        >
                          <FileDown size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const text = req.html_content || req.requirement_context;
                            await downloadAsDocx(req.file_name || `${req.id}.docx`, `${req.industry} Policy`, text);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Download .docx"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteRequest(e, req.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Request"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <FileText size={40} className="mx-auto opacity-30" />
              <p className="text-xs font-bold">No policy requests found.</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Create First Policy Request
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* POPUP: POLICY USER REQUEST FORM (4 FIELDS)                   */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-7 space-y-5 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Policy Request Form</h3>
                  <p className="text-[11px] text-slate-500">Configure parameters to generate a new enterprise policy.</p>
                </div>
              </div>
              <button
                onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmitPolicy} className="space-y-4">
              
              {/* FIELD 1: Industry (Direct text input, NOT dropdown) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Industry <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-medium lowercase">e.g. manufacturing, banking, healthcare</span>
                </label>
                <input
                  type="text"
                  required
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  placeholder="Type industry (e.g. manufacturing, banking, healthcare, retail...)"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* FIELD 2: Generation Type (Master or Specific) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Generation Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormGenType('Master')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formGenType === 'Master' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <Layers size={14} /> Master Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormGenType('Specific')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formGenType === 'Specific' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <FileText size={14} /> Specific Policy
                  </button>
                </div>
              </div>

              {/* FIELD 3: Policy Request ID & Policy Type */}
              {/* If Master: Policy Request ID is faded out and Policy Type is faded out */}
              {/* If Specific: Policy Request ID and Policy Type are required as a string (not dropdown) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Policy Request ID {formGenType === 'Specific' && <span className="text-rose-500">*</span>}</span>
                    {formGenType === 'Specific' && <span className="text-[10px] text-slate-400 font-normal lowercase">e.g. POL-0003</span>}
                  </label>
                  <input
                    type="text"
                    disabled={formGenType === 'Master'}
                    value={formGenType === 'Master' ? 'Auto-Assigned (Master)' : formFamilyId}
                    onChange={(e) => setFormFamilyId(e.target.value)}
                    placeholder="e.g. POL-0003"
                    className={`w-full text-xs font-bold rounded-xl px-3.5 py-2.5 border transition-all ${
                      formGenType === 'Master' 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 italic">
                    {formGenType === 'Master' ? 'Auto-assigned for Master Policy' : 'Parent Policy Request ID to generate specific policy inside'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Policy Type {formGenType === 'Specific' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled={formGenType === 'Master'}
                    value={formGenType === 'Master' ? 'Enterprise Master Policy' : formPolicyType}
                    onChange={(e) => setFormPolicyType(e.target.value)}
                    placeholder="Type string (e.g. Data Privacy, Access Control)"
                    className={`w-full text-xs font-bold rounded-xl px-3.5 py-2.5 border transition-all ${
                      formGenType === 'Master' 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  {formGenType === 'Master' && (
                    <span className="text-[10px] text-slate-400 italic">Not required for Master Policy</span>
                  )}
                </div>
              </div>

              {/* FIELD 4: Requirement and Context (remains as it is) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Requirement and Context
                </label>
                <textarea
                  rows={4}
                  value={formContext}
                  onChange={(e) => setFormContext(e.target.value)}
                  placeholder="Enter business context, applicable regulations (GDPR, HIPAA, BCBS 239, SOX), data domains, and governance objectives..."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Generating Policy...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate Enterprise Policy
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

export default CopilotPolicyGenerator;
