
import React, { useState, useEffect } from 'react';
import { 
  Presentation, 
  UploadCloud, 
  Loader, 
  Sparkles, 
  CheckCircle, 
  MonitorPlay, 
  Edit3, 
  Download, 
  Layout, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  FileText,
  Pencil,
  ChevronRight,
  Monitor,
  History,
  Trash2
} from 'lucide-react';
import { analyzePPTStructure, generateSlideContent, saveHistory, getHistory, deleteHistory } from '../services/geminiService';
import { CaseStoryTemplate, SlideContent } from '../types';

declare const PptxGenJS: any;

interface CaseStoryGeneratorProps {
  setHasUnsavedChanges: (val: boolean) => void;
}

const DEFAULT_PPT_TEMPLATES: CaseStoryTemplate[] = [
    {
        id: 'standard',
        name: 'Standard Case Study',
        description: 'Classic 4-slide structure: Challenge, Solution, Result.',
        slides: [
            { title: "Project Overview", description: "Client background and high-level summary." },
            { title: "Business Challenges", description: "Pain points, legacy issues, and drivers." },
            { title: "Solution Architecture", description: "Tech stack, design patterns, and implementation." },
            { title: "Outcomes & Benefits", description: "ROI, performance gains, and future value." }
        ]
    },
    {
        id: 'technical',
        name: 'Technical Deep Dive',
        description: 'Focus on architecture, data flows, and engineering.',
        slides: [
            { title: "Technical Context", description: "Existing landscape and technical constraints." },
            { title: "Architecture Design", description: "Detailed diagram explanation and component breakdown." },
            { title: "Data Flow & Logic", description: "ETL/ELT processes and transformation logic." },
            { title: "Tech Stack & Tools", description: "List of technologies and their roles." }
        ]
    }
];

const CaseStoryGenerator: React.FC<CaseStoryGeneratorProps> = ({ setHasUnsavedChanges }) => {
    // Phase: 'setup' (Unified) -> 'workspace' (Preview/Edit)
    const [phase, setPhase] = useState<'setup' | 'workspace'>('setup');
    
    // Learning
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('standard');
    const [customTemplate, setCustomTemplate] = useState<CaseStoryTemplate | null>(null);
    const [isLearning, setIsLearning] = useState(false);

    // Input
    const [projectContext, setProjectContext] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    
    // Generation
    const [generatedSlides, setGeneratedSlides] = useState<SlideContent[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);

    // Editing State
    const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [historyItems, setHistoryItems] = useState<any[]>([]);

    useEffect(() => {
        setHistoryItems(getHistory('CaseStory'));
    }, []);

    // Update dirty state
    useEffect(() => {
        if (projectContext.trim().length > 0 && phase !== 'workspace') {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }
    }, [projectContext, phase, setHasUnsavedChanges]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLearning(true);
            const files = Array.from(e.target.files);
            setUploadedFiles(files);
            const fileNames = files.map((f: any) => f.name).join(', ');
            
            try {
                const structure = await analyzePPTStructure(`Uploaded PPT Files: ${fileNames}. Extract the slide sequence.`);
                const newTemplate: CaseStoryTemplate = {
                    id: 'custom-learned',
                    name: 'Learned from Uploads',
                    description: `Structure derived from ${files.length} presentation files.`,
                    slides: structure
                };
                setCustomTemplate(newTemplate);
                setSelectedTemplateId('custom-learned');
            } catch (e) {
                console.error(e);
            } finally {
                setIsLearning(false);
            }
        }
    };

    const getActiveTemplate = () => {
        if (selectedTemplateId === 'custom-learned' && customTemplate) return customTemplate;
        return DEFAULT_PPT_TEMPLATES.find(t => t.id === selectedTemplateId) || DEFAULT_PPT_TEMPLATES[0];
    };

    const startGeneration = async () => {
        if (!projectContext.trim() && uploadedFiles.length === 0) return;
        
        const template = getActiveTemplate();
        setPhase('workspace');
        setGeneratedSlides([]);
        setHasUnsavedChanges(false);
        
        const slides: SlideContent[] = [];
        
        // Use filenames in context if available
        const fullContext = projectContext + (uploadedFiles.length > 0 ? ` [Ref Files: ${uploadedFiles.map(f=>f.name).join(', ')}]` : "");

        for (let i = 0; i < template.slides.length; i++) {
            setActiveSlideIndex(i);
            setIsGenerating(true);
            const slideContent = await generateSlideContent(template.slides[i], fullContext);
            slides.push(slideContent);
            setGeneratedSlides([...slides]);
        }
        setIsGenerating(false);
        setActiveSlideIndex(null);

        // Save History
        saveHistory('CaseStory', projectContext.substring(0, 40) + '...', {
            context: projectContext,
            slides: slides
        });
        setHistoryItems(getHistory('CaseStory'));
    };

    const handleRegenerateSlide = async (index: number) => {
        const template = getActiveTemplate();
        setActiveSlideIndex(index);
        setIsGenerating(true);
        const newContent = await generateSlideContent(template.slides[index], projectContext);
        
        const updated = [...generatedSlides];
        updated[index] = newContent;
        setGeneratedSlides(updated);
        
        setIsGenerating(false);
        setActiveSlideIndex(null);
    };

    const updateSlideContent = (index: number, field: keyof SlideContent, value: any) => {
        const updated = [...generatedSlides];
        updated[index] = { ...updated[index], [field]: value };
        setGeneratedSlides(updated);
    };

    const updateBulletPoint = (slideIndex: number, bpIndex: number, text: string) => {
        const updated = [...generatedSlides];
        const newBullets = [...updated[slideIndex].bulletPoints];
        newBullets[bpIndex] = text;
        updated[slideIndex] = { ...updated[slideIndex], bulletPoints: newBullets };
        setGeneratedSlides(updated);
    };

    const exportToPPT = () => {
        if (typeof PptxGenJS === 'undefined') {
            alert("PPT Generator library not loaded.");
            return;
        }

        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: 'F1F5F9' },
            objects: [
                { rect: { x: 0, y: 0, w: '100%', h: 0.75, fill: 'EA580C' } }, // Header Bar (Orange)
                { text: { text: 'Case Story', options: { x: 0.5, y: 0.15, w: 9, h: 0.5, fontSize: 20, color: 'FFFFFF', bold: true } } },
                { rect: { x: 0, y: 6.9, w: '100%', h: 0.6, fill: 'FFFFFF' } }, 
                { text: { text: 'Generated by DataArch AI', options: { x: 0.5, y: 7.0, w: 5, h: 0.4, fontSize: 10, color: '64748B' } } }
            ]
        });

        let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
        slide.addText(getActiveTemplate().name, { x: 1, y: 2.5, w: 8, h: 1, fontSize: 36, color: '1E293B', bold: true, align: 'center' });
        slide.addText(`Client Context: ${projectContext.substring(0, 50)}...`, { x: 1.5, y: 3.5, w: 7, h: 0.5, fontSize: 18, color: '64748B', align: 'center' });

        generatedSlides.forEach(s => {
            slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
            slide.addText(s.title, { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, color: '1E293B', bold: true });
            const bullets = s.bulletPoints.map(bp => ({ text: bp, options: { fontSize: 16, color: '334155', bullet: true, breakLine: true } }));
            slide.addText(bullets, { x: 0.5, y: 2, w: 9, h: 4, lineSpacing: 32 });
            slide.addNotes(s.speakerNotes);
        });

        pptx.writeFile({ fileName: `Case_Story_${Date.now()}.pptx` });
    };

    // --- HISTORY HANDLERS ---
    const loadHistoryItem = (item: any) => {
        const data = item.data;
        setProjectContext(data.context);
        setGeneratedSlides(data.slides);
        setPhase('workspace');
        setShowHistory(false);
    };

    const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteHistory(id);
        setHistoryItems(prev => prev.filter(h => h.id !== id));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 text-white rounded-lg shadow-sm"><Presentation size={20}/></div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Case Story Generator</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={phase === 'setup' ? 'font-bold text-orange-600' : ''}>Setup</span>
                            <ChevronRight size={12}/>
                            <span className={phase === 'workspace' ? 'font-bold text-orange-600' : ''}>Slides</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm border ${showHistory ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        <History size={18} /> History
                    </button>
                    {phase === 'workspace' && (
                        <button onClick={exportToPPT} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-md">
                            <Download size={14} /> Download PPT
                        </button>
                    )}
                </div>
            </div>

            {/* History Panel */}
            {showHistory && (
                <div className="absolute top-20 right-6 z-30 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-fade-in-up">
                    <h3 className="font-bold text-sm mb-3 text-slate-800">Recent Presentations</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                    {historyItems.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">No history available</p> :
                    historyItems.map((h, i) => (
                        <button key={i} onClick={() => loadHistoryItem(h)} className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-slate-100 text-xs group relative transition-all">
                            <div className="truncate font-bold text-slate-700 mb-1">{h.summary}</div>
                            <span className="text-slate-400 text-[10px]">{h.date}</span>
                            <div 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded p-1 hover:text-red-500 cursor-pointer"
                                onClick={(e) => handleDeleteHistory(h.id, e)}
                            >
                                <Trash2 size={14} />
                            </div>
                        </button>
                    ))}
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* --- PHASE 1: UNIFIED SETUP --- */}
                {phase === 'setup' && (
                    <div className="h-full overflow-y-auto p-8 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                            {/* Left: Template Selection */}
                            <div className="lg:col-span-4 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">1. Choose Style</h3>
                                    <p className="text-xs text-slate-500 mb-4">Select the slide narrative structure.</p>
                                    <div className="space-y-3">
                                        {DEFAULT_PPT_TEMPLATES.map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => setSelectedTemplateId(t.id)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${selectedTemplateId === t.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-bold ${selectedTemplateId === t.id ? 'text-orange-700' : 'text-slate-700'}`}>{t.name}</h4>
                                                    {selectedTemplateId === t.id && <CheckCircle size={16} className="text-orange-600"/>}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                                            </button>
                                        ))}
                                        {customTemplate && (
                                            <button 
                                                onClick={() => setSelectedTemplateId('custom-learned')}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTemplateId === 'custom-learned' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-orange-700">Learned Structure</h4>
                                                    <Sparkles size={16} className="text-orange-600"/>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">From uploaded slides.</p>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Context & Files */}
                            <div className="lg:col-span-8 flex flex-col h-full">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">2. Project Context</h3>
                                        <p className="text-xs text-slate-500 mb-4">Provide details for the slide content.</p>
                                        <textarea 
                                            value={projectContext}
                                            onChange={(e) => setProjectContext(e.target.value)}
                                            className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm leading-relaxed bg-white text-slate-900 placeholder:text-slate-400"
                                            placeholder="Client: Acme Retail. Challenge: Slow reporting. Solution: Migrated to Snowflake. Impact: 50% faster queries..."
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">3. Reference Decks</h3>
                                        <div className="flex gap-4 items-start">
                                            <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-all bg-white">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {isLearning ? <Loader size={24} className="animate-spin text-orange-500"/> : <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />}
                                                    <p className="text-sm text-slate-600 font-bold">{isLearning ? 'Analyzing Structure...' : 'Click to Upload PPT'}</p>
                                                    <p className="text-xs text-slate-400">PPTX files</p>
                                                </div>
                                                <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                                            </label>
                                            <div className="w-1/3 space-y-2">
                                                {uploadedFiles.map((f, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200">
                                                        <Presentation size={12}/> <span className="truncate">{f.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex justify-end">
                                        <button 
                                            onClick={startGeneration}
                                            disabled={!projectContext && uploadedFiles.length === 0}
                                            className="flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Sparkles size={18} /> Generate Slides
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PHASE 2: WORKSPACE (SLIDE EDIT) --- */}
                {phase === 'workspace' && (
                    <div className="flex h-full">
                        {/* Slide Navigator */}
                        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
                            {generatedSlides.length === 0 && isGenerating && (
                                <div className="text-center py-8 text-slate-400">
                                    <Loader size={24} className="animate-spin text-orange-500 mx-auto mb-2"/>
                                    <p className="text-xs">Drafting slides...</p>
                                </div>
                            )}
                            {generatedSlides.map((slide, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => document.getElementById(`slide-${idx}`)?.scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full aspect-video bg-white border border-slate-300 rounded-lg shadow-sm hover:ring-2 hover:ring-orange-400 transition-all p-2 flex flex-col justify-center items-center relative group"
                                >
                                    <div className="text-[8px] font-bold text-slate-700 text-center line-clamp-2 w-full px-1">{slide.title}</div>
                                    <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400">{idx + 1}</div>
                                    {activeSlideIndex === idx && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader size={16} className="animate-spin text-orange-600"/></div>}
                                </button>
                            ))}
                        </div>

                        {/* Main Editor Canvas */}
                        <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
                            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                                {generatedSlides.map((slide, idx) => (
                                    <div key={idx} id={`slide-${idx}`} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col aspect-[16/9] relative group">
                                        
                                        {/* Slide Header */}
                                        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center h-20 shrink-0">
                                            <div className="flex items-center gap-4 w-full">
                                                <span className="bg-slate-200 text-slate-600 text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">{idx + 1}</span>
                                                {editingSlideId === slide.id ? (
                                                    <input 
                                                        className="bg-white border border-orange-300 rounded px-2 py-1 text-xl font-bold text-slate-800 outline-none w-full"
                                                        value={slide.title}
                                                        onChange={(e) => updateSlideContent(idx, 'title', e.target.value)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <h4 className="text-xl font-bold text-slate-800 line-clamp-1">{slide.title}</h4>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingSlideId(editingSlideId === slide.id ? null : slide.id)} className={`p-2 rounded-lg hover:bg-slate-200 ${editingSlideId === slide.id ? 'text-blue-600' : 'text-slate-400'}`} title="Edit Text">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleRegenerateSlide(idx)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-orange-600" title="Regenerate Slide">
                                                    <RefreshCw size={16} className={activeSlideIndex === idx ? 'animate-spin' : ''}/>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Slide Body */}
                                        <div className="p-8 flex-1 overflow-y-auto bg-white">
                                            <ul className="space-y-4 list-disc pl-5 text-lg text-slate-700 leading-relaxed">
                                                {slide.bulletPoints.map((bp, i) => (
                                                    <li key={i} className="pl-2">
                                                        {editingSlideId === slide.id ? (
                                                            <textarea 
                                                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-lg outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                                                value={bp}
                                                                onChange={(e) => updateBulletPoint(idx, i, e.target.value)}
                                                                rows={2}
                                                            />
                                                        ) : bp}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Slide Footer / Notes */}
                                        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 h-24 shrink-0 overflow-y-auto">
                                            <span className="font-bold block mb-1 text-slate-400 uppercase tracking-wider text-[10px]">Speaker Notes</span> 
                                            {editingSlideId === slide.id ? (
                                                <textarea 
                                                    className="w-full bg-white border border-slate-200 rounded p-2 text-xs outline-none resize-none h-full"
                                                    value={slide.speakerNotes}
                                                    onChange={(e) => updateSlideContent(idx, 'speakerNotes', e.target.value)}
                                                />
                                            ) : (
                                                <p>{slide.speakerNotes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseStoryGenerator;
