import React, { useState, useEffect } from 'react';
import { 
  CloudLightning, 
  UploadCloud, 
  Sparkles, 
  Code2, 
  ShieldAlert, 
  Beaker, 
  X, 
  FileText, 
  MessageSquareText, 
  FileUp, 
  BrainCircuit, 
  Settings,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { aggregateFileContext } from '../services/geminiService';

interface CreateFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  userProfile?: UserProfile;
  onDirtyChange?: (isDirty: boolean) => void;
}

// Configuration for Product Catalog
const BASE_CATALOG: Record<string, any> = {
  "Informatica": {
    "Cloud": [
        "Integrated MDM Solution (DI + DQ + MDM)", 
        "Integrated Governance Solution (DI + DQ + MDM + Gov)",
        "Cloud Data Integration (CDI)", 
        "Cloud Data Quality (CDQ)", 
        "MDM SaaS", 
        "Cloud Mass Ingestion", 
        "Cloud Data Governance (CDGC)"
    ],
    "On-Premise": [
        "Integrated IDQ + MDM Bundle",
        "PowerCenter", 
        "Informatica Data Quality (IDQ)", 
        "MDM Multidomain", 
        "Enterprise Data Catalog (EDC)"
    ]
  },
  "Talend": {
    "Cloud": ["Talend Cloud Data Integration", "Talend Pipeline Designer", "Stitch Data Loader"],
    "On-Premise": ["Talend Open Studio", "Talend Data Fabric", "Talend ESB"]
  },
  "Azure Data Factory": {
    "Cloud": ["Data Factory V2", "Synapse Analytics Pipelines", "Azure Purview"],
    "On-Premise": ["SSIS (via IR)", "SQL Server Data Tools"]
  },
  "Matillion": {
    "Cloud": ["Matillion for Snowflake", "Matillion for Redshift", "Matillion for Databricks"],
    "On-Premise": [] 
  },
  "AWS Glue": {
    "Cloud": ["AWS Glue ETL", "AWS Glue DataBrew", "AWS Lake Formation"],
    "On-Premise": []
  },
  "Profisee": {
    "Cloud": ["Profisee MDM SaaS", "Profisee Governance"],
    "On-Premise": ["Profisee Platform"]
  },
  "BigID": {
    "Cloud": ["BigID Data Discovery", "BigID Privacy", "BigID Security"],
    "On-Premise": ["BigID Enterprise"]
  },
  "Ataccama": {
    "Cloud": ["Ataccama ONE Gen2", "Data Quality Cloud", "MDM Cloud"],
    "On-Premise": ["Ataccama ONE On-Prem"]
  },
  "Databricks": {
    "Cloud": ["Delta Live Tables", "Unity Catalog", "Databricks SQL", "Workflows"],
    "On-Premise": []
  }
};

const aggregateServices = (deployment: 'Cloud' | 'On-Premise') => {
  const allServices: string[] = [];
  Object.values(BASE_CATALOG).forEach((prod: any) => {
    if (prod[deployment]) {
      allServices.push(...prod[deployment]);
    }
  });
  return Array.from(new Set(allServices)).sort();
};

const PRODUCT_CATALOG = {
  ...BASE_CATALOG,
  "HTC Enterprise Data Management": {
    "Cloud": aggregateServices("Cloud"),
    "On-Premise": aggregateServices("On-Premise")
  }
};

const CreateForm: React.FC<CreateFormProps> = ({ onSubmit, onCancel, userProfile, onDirtyChange }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    requirementsPrompt: '',
    product: '',
    deploymentModel: 'Cloud' as 'Cloud' | 'On-Premise',
    solutionType: '',
    targetAudience: ['Developer'] as string[], 
    description: '',
    priority: 'Normal'
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [inputType, setInputType] = useState<'upload' | 'prompt'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Dynamic Options
  const [availableProducts] = useState<string[]>(Object.keys(PRODUCT_CATALOG).sort());
  const [availableDeployments, setAvailableDeployments] = useState<string[]>(['Cloud', 'On-Premise']);
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Track dirty status
  useEffect(() => {
      const isDirty = formData.clientName !== '' || formData.requirementsPrompt !== '' || selectedFiles.length > 0;
      if (onDirtyChange) onDirtyChange(isDirty);
  }, [formData.clientName, formData.requirementsPrompt, selectedFiles, onDirtyChange]);

  // Apply User Profile Defaults
  useEffect(() => {
    if (userProfile && userProfile.preferences) {
        setFormData(prev => ({
            ...prev,
            product: prev.product || userProfile.preferences.defaultProduct || '',
            deploymentModel: (userProfile.preferences.defaultDeployment !== 'Hybrid' ? userProfile.preferences.defaultDeployment : 'Cloud') as any
        }));
    }
  }, [userProfile]);

  // Update Services Logic
  useEffect(() => {
    if (formData.product && PRODUCT_CATALOG[formData.product as keyof typeof PRODUCT_CATALOG]) {
      const productConfig = PRODUCT_CATALOG[formData.product as keyof typeof PRODUCT_CATALOG];
      const validDeployments = Object.keys(productConfig).filter(k => productConfig[k].length > 0);
      setAvailableDeployments(validDeployments);
      if (!validDeployments.includes(formData.deploymentModel)) {
        setFormData(prev => ({ ...prev, deploymentModel: validDeployments[0] as any }));
      }
    } else {
      setAvailableDeployments([]);
      setAvailableServices([]);
    }
  }, [formData.product]);

  useEffect(() => {
    if (formData.product && formData.deploymentModel && PRODUCT_CATALOG[formData.product as keyof typeof PRODUCT_CATALOG]) {
      const services = PRODUCT_CATALOG[formData.product as keyof typeof PRODUCT_CATALOG][formData.deploymentModel] || [];
      setAvailableServices(services);
      if (!services.includes(formData.solutionType)) {
        setFormData(prev => ({ ...prev, solutionType: '' }));
      }
    }
  }, [formData.product, formData.deploymentModel]);

  const roles = [
    { id: 'Developer', label: 'Developer', icon: Code2 },
    { id: 'Tester', label: 'Tester', icon: Beaker },
    { id: 'Admin', label: 'Admin', icon: ShieldAlert }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => {
      const current = prev.targetAudience;
      if (current.includes(roleId)) {
        if (current.length === 1) return prev; 
        return { ...prev, targetAudience: current.filter(r => r !== roleId) };
      } else {
        return { ...prev, targetAudience: [...current, roleId] };
      }
    });
  };

  const processFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
        // Step 1: Aggregate Technical Context from Documents & Global Learning
        const fileContentContext = selectedFiles.length > 0 
            ? await aggregateFileContext(selectedFiles) 
            : "";

        // Step 2: Combine User Instructions with Technical Context
        let compositePrompt = formData.requirementsPrompt || "Synthesize architectural solution based on provided technical artifacts.";
        
        if (fileContentContext) {
            compositePrompt = `${compositePrompt}\n\n${fileContentContext}`;
        }

        // Step 3: Inject System Preferences from Profile
        if (userProfile && !compositePrompt.toLowerCase().includes('prefer')) {
            compositePrompt += `\n\n[Architect Preference: ${userProfile.preferences.defaultProduct || 'Unspecified'} on ${userProfile.preferences.defaultDeployment}.]`;
        }

        onSubmit({
          clientName: formData.clientName,
          product: formData.product,
          deploymentModel: formData.deploymentModel,
          type: formData.solutionType || 'Custom Solution',
          rfpFiles: selectedFiles.map(f => f.name),
          requirementsPrompt: compositePrompt,
          targetAudience: formData.targetAudience,
          date: new Date().toLocaleDateString(),
          mode: 'design'
        });
    } catch (err) {
        console.error("Critical error during context synthesis:", err);
        alert("Failed to synthesize technical context. Please check file integrity.");
    } finally {
        setIsProcessing(false);
    }
  };

  const isFormValid = formData.clientName && (inputType === 'upload' ? selectedFiles.length > 0 : formData.requirementsPrompt.length > 10);

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-50">
        
        {/* LEFT: INTERACTIVE FORM */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-10">
                
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Let's design a solution.</h2>
                    <p className="text-slate-500">Provide your requirements, and our AI will immediately architect the technical blueprint.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Client Name */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">1. Project Identity</label>
                        <input
                            type="text"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            placeholder="Client Name / Project Code"
                            className="w-full text-lg px-4 py-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                            autoFocus
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Input Method */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">2. Requirements Source</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setInputType('upload')}
                                disabled={isProcessing}
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${inputType === 'upload' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${inputType === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><FileUp size={20}/></div>
                                    <span className={`font-bold ${inputType === 'upload' ? 'text-indigo-900' : 'text-slate-700'}`}>Upload RFP</span>
                                </div>
                                <p className="text-xs text-slate-500">PDF, DOCX, TXT documents.</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('prompt')}
                                disabled={isProcessing}
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${inputType === 'prompt' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${inputType === 'prompt' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><MessageSquareText size={20}/></div>
                                    <span className={`font-bold ${inputType === 'prompt' ? 'text-indigo-900' : 'text-slate-700'}`}>Describe It</span>
                                </div>
                                <p className="text-xs text-slate-500">Paste text or type logic.</p>
                            </button>
                        </div>

                        {inputType === 'upload' ? (
                            <div 
                                className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-white'}`}
                                onDragOver={(e) => { e.preventDefault(); !isProcessing && setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileDrop}
                            >
                                <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileSelect} disabled={isProcessing} />
                                <label htmlFor="file-upload" className={`cursor-pointer block ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <UploadCloud size={32} className="mx-auto mb-3 text-slate-400" />
                                    <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
                                    <p className="text-xs text-slate-400 mt-1">Maximum 5 files</p>
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        {selectedFiles.map((f, i) => (
                                            <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                                                {f.name} <button type="button" onClick={(e) => {e.preventDefault(); removeFile(f.name);}} className="hover:text-red-500" disabled={isProcessing}><X size={12}/></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <textarea 
                                name="requirementsPrompt"
                                value={formData.requirementsPrompt}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className="w-full h-40 p-4 mt-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
                                placeholder="E.g., We need to migrate SAP HANA to Snowflake. Data volume is 5TB. Require rigorous data quality checks on Customer Email..."
                            />
                        )}
                    </div>

                    {/* MANUAL CONFIGURATION SECTION */}
                    <div className="space-y-4 bg-slate-100 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide">
                            <Settings size={16} className="text-indigo-600"/> 3. Technical Configuration (Optional)
                        </div>
                        <p className="text-xs text-slate-500">Leave blank to let AI auto-detect, or select manually.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Platform / Product</label>
                                <select 
                                    name="product" 
                                    value={formData.product} 
                                    onChange={handleInputChange} 
                                    disabled={isProcessing}
                                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Auto-Detect</option>
                                    {availableProducts.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Deployment Model</label>
                                <div className="flex gap-2">
                                    {['Cloud', 'On-Premise'].map(mode => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setFormData(prev => ({...prev, deploymentModel: mode as any}))}
                                            disabled={isProcessing || (!availableDeployments.includes(mode) && formData.product !== '')}
                                            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${formData.deploymentModel === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {formData.product && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold text-slate-600 mb-1">Service / Module</label>
                                <select 
                                    name="solutionType" 
                                    value={formData.solutionType} 
                                    onChange={handleInputChange} 
                                    disabled={isProcessing}
                                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Select Service...</option>
                                    {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Audience Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">4. Target Audience</label>
                        <div className="flex gap-3">
                            {roles.map((role) => {
                                const isSelected = formData.targetAudience.includes(role.id);
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => toggleRole(role.id)}
                                        disabled={isProcessing}
                                        className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <role.icon size={20} />
                                        <span className="text-xs font-bold">{role.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                        <button 
                            type="submit" 
                            disabled={!isFormValid || isProcessing}
                            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${(!isFormValid || isProcessing) ? 'bg-slate-300 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Synthesizing Context...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    <span>Analyze & Design Solution</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>

        {/* RIGHT: AI COMPANION PANEL */}
        <div className="hidden lg:flex lg:w-[35%] xl:w-[450px] bg-slate-900 text-slate-200 flex-col border-l border-slate-800 relative transition-all duration-500 shrink-0">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="p-8 flex-1 flex flex-col relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        <BrainCircuit size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">AI Architect</h3>
                        <p className="text-xs text-slate-400">Context Awareness: Active</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                    {isProcessing ? (
                        <div className="animate-fade-in space-y-6">
                            <div className="relative">
                                <Loader2 size={64} className="text-indigo-500 animate-spin" />
                                <BrainCircuit size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-white uppercase tracking-tighter italic">Mapping Technical Logic</p>
                                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                                    Parsing uploaded specifications and cross-referencing global best practices to build your solution blueprint.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="opacity-80 space-y-6">
                            <FileText size={48} className="text-slate-600 mx-auto" />
                            <p className="text-sm leading-relaxed max-w-xs">
                                "I'm ready to analyze your documents. Upload your RFP or paste requirements, and I'll infer the optimal tech stack and deployment model by learning from your inputs."
                            </p>
                        </div>
                    )}
                </div>
                
                {!isProcessing && (
                    <div className="mt-auto bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3 text-xs font-black text-indigo-400 uppercase tracking-widest">
                            <Sparkles size={14} /> Knowledge Retrieval
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            Your architectural decisions in other sessions (Blueprint Studio, Estimator) will influence the synthesis of this design.
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CreateForm;