
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { 
    Question, DesignData, Requirement, InitiationItem, 
    ProjectStats, RoadmapPhase, 
    ProjectDescriptionResponse, GuideSection,
    SearchResult, Resource, TimelineItem,
    DataDictionaryItem,
    DocumentStrategy, SlideContent
} from '../types';

/* Helper function to get a fresh instance of the Google GenAI client */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

declare global {
  interface Window {
    XLSX: any;
    mermaid: any;
    mammoth: any;
    pdfjsLib: any;
  }
}

/**
 * CENTRAL LEARNING HUB
 */
const GLOBAL_LEARNING_KEY = 'dataarch_ai_global_intelligence';

export const pushLearnedContext = (module: string, fix: string, tags: string[] = []) => {
    try {
        const history = JSON.parse(localStorage.getItem(GLOBAL_LEARNING_KEY) || '[]');
        const newInsight = {
            id: Date.now(),
            module,
            fix,
            tags,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(GLOBAL_LEARNING_KEY, JSON.stringify([newInsight, ...history].slice(0, 50)));
    } catch (e) {
        console.error("Failed to persist global learning", e);
    }
};

export const getGlobalIntelligence = (): string => {
    try {
        const history = JSON.parse(localStorage.getItem(GLOBAL_LEARNING_KEY) || '[]');
        if (!Array.isArray(history) || history.length === 0) return "No platform-wide learning context available yet.";
        return history.map((h: any) => `[Learned from ${h.module} at ${h.timestamp}]: ${h.fix}`).join('\n');
    } catch (e) {
        return "";
    }
};

/* 
 * Robust JSON parsing that attempts to find JSON structures within strings
 * even if they are wrapped in reasoning text or markdown blocks.
 */
const safeJsonParse = <T>(text: string | undefined, fallback: T): T => {
    if (!text) return fallback;
    try {
        // Strip markdown blocks if present
        let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        // Find the first and last occurrences of potential JSON markers
        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');
        
        if (firstBrace === -1 && firstBracket === -1) {
            console.warn("No JSON markers found in response text");
            return fallback;
        }
        
        const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
        
        const lastBrace = cleanText.lastIndexOf('}');
        const lastBracket = cleanText.lastIndexOf(']');
        const end = Math.max(lastBrace, lastBracket);
        
        if (end === -1 || end <= start) {
            console.warn("Malformed JSON markers in response text");
            return fallback;
        }
        
        const jsonCandidate = cleanText.substring(start, end + 1);
        const parsed = JSON.parse(jsonCandidate);
        
        // Ensure we don't return null if parse succeeds but result is null
        return (parsed !== null ? parsed : fallback) as T;
    } catch (e) {
        console.warn("AI JSON Parse Failed:", e, "Source Text Snippet:", text.substring(0, 200));
        return fallback;
    }
};

/**
 * RETRY LOGIC FOR API QUOTA LIMITS (429 errors)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async <T>(apiCall: () => Promise<T>, maxAttempts = 3): Promise<T> => {
    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            const errorMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
            const isQuotaError = errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('resource_exhausted');
            
            if (isQuotaError && attempt < maxAttempts) {
                // Exponential backoff: 2s, 4s, 8s...
                const waitTime = Math.pow(2, attempt) * 1000;
                console.warn(`Quota exceeded (429). Retrying in ${waitTime}ms... (Attempt ${attempt}/${maxAttempts})`);
                await delay(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

/**
 * TEXT EXTRACTION UTILS
 */
const extractTextFromDocx = async (file: File): Promise<string> => {
    if (!window.mammoth) return "[Error: Mammoth.js library not found]";
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        return result.value || "[Empty DOCX]";
    } catch (e) {
        return `[Error parsing DOCX: ${file.name}]`;
    }
};

const extractTextFromPdf = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) return "[Error: PDF.js library not found]";
    try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `[Page ${i}]\n${pageText}\n\n`;
        }
        return fullText || "[Empty PDF]";
    } catch (e) {
        return `[Error parsing PDF: ${file.name}]`;
    }
};

/* Aggregates multiple file contexts into parts for multi-modal synthesis */
export const prepareMultiModalContext = async (files: File[]): Promise<any[]> => {
    const parts: any[] = [];
    
    for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (file.type.startsWith('image/')) {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });
            parts.push({
                inlineData: {
                    mimeType: file.type,
                    data: base64
                }
            });
        } else if (ext === 'docx') {
            const text = await extractTextFromDocx(file);
            parts.push({ text: `[Document Context: ${file.name}]\n${text.substring(0, 20000)}` });
        } else if (ext === 'pdf') {
            const text = await extractTextFromPdf(file);
            parts.push({ text: `[Document Context: ${file.name}]\n${text.substring(0, 20000)}` });
        } else if (file.name.match(/\.(js|ts|jsx|tsx|sql|txt|csv|json|md)$/i)) {
            const text = await file.text();
            parts.push({ text: `[File Content: ${file.name}]\n${text.substring(0, 10000)}` });
        }
    }
    return parts;
};

/* Historical aggregation helper for standard text context */
export const aggregateFileContext = async (files: File[]): Promise<string> => {
    let context = "--- CROSS-MODULE GLOBAL INTELLIGENCE ---\n";
    context += getGlobalIntelligence();
    context += "\n\n--- CURRENT TASK FILE CONTEXT ---\n";
    
    for (const file of files) {
        context += `\n[File: ${file.name}]\n`;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'docx') {
            const text = await extractTextFromDocx(file);
            context += text.substring(0, 10000);
        } else if (ext === 'pdf') {
            const text = await extractTextFromPdf(file);
            context += text.substring(0, 10000);
        } else if (file.name.match(/\.(js|ts|jsx|tsx|sql|txt|csv|json|md)$/i)) {
            const text = await file.text();
            context += text.substring(0, 10000); 
        } else if (file.type.startsWith('image/')) {
            context += "[Image context provided via multi-modal stream]";
        } else {
            context += "[Non-textual or complex binary file content]";
        }
    }
    return context;
};

/**
 * INTELLIGENT ARCHITECTURE SYNTHESIS (Gemini 3 Pro + Thinking + Search)
 */
export const synthesizeIntelligentArchitecture = async (
    prompt: string, 
    files: File[], 
    activeDesign?: DesignData
): Promise<{ design: DesignData, groundingSources: any[] }> => {
    const globalCtx = getGlobalIntelligence();
    const fileParts = await prepareMultiModalContext(files);
    
    const styleInstruction = files.some(f => f.type.startsWith('image/')) 
        ? "Analyze the visual style of the provided image and replicate that aesthetic." 
        : "";

    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
            parts: [
                { text: `System Identity: Expert Enterprise Data Architect.
                Goal: Synthesize a high-precision architectural design.
                Grounding Strategy: Research external best practices for the specific user requirement.
                ${styleInstruction}
                
                Global Platform Knowledge:
                ${globalCtx}

                User Intent:
                ${prompt}
                
                Current Design Context:
                ${activeDesign ? JSON.stringify(activeDesign) : "Starting fresh."}
                
                IMPORTANT OUTPUT REQUIREMENT:
                Return a valid JSON object matching this schema. Ensure the response contains a non-empty "nodes" array.
                {
                    "classification": "SYSTEM_ARCHITECTURE",
                    "nodes": [{"id": string, "label": string, "type": string, "x": number, "y": number, "description": string}],
                    "edges": [{"from": string, "to": string, "label": string}]
                }` },
                ...fileParts
            ]
        },
        config: {
            thinkingConfig: { thinkingBudget: 16384 },
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    }));

    const design = safeJsonParse<DesignData>(response.text, { nodes: [], edges: [], classification: 'SYSTEM_ARCHITECTURE' });
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { design, groundingSources };
};

/**
 * CORE PROJECT GENERATOR (Upgraded for RFPs/SOWs)
 */
export const generateArchitectureDesign = async (context: string, pattern: string): Promise<{ design: DesignData, groundingSources: any[] }> => {
    const globalCtx = getGlobalIntelligence();
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Expert Solution Architect. 
        Global Intelligence Context: ${globalCtx}
        Requirement Data (RFP/SOW Extract): ${context}. 
        Desired Pattern Type: ${pattern}
        
        INSTRUCTIONS:
        1. Parse the requirement context. 
        2. Propose a highly optimized technical flow.
        3. Ensure terms like IICS are updated to IDMC if appropriate.
        4. Return a structured JSON block. Ensure the "nodes" array is not empty.`,
        config: { 
            thinkingConfig: { thinkingBudget: 8192 },
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    classification: { type: Type.STRING },
                    nodes: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                id: { type: Type.STRING }, 
                                label: { type: Type.STRING }, 
                                description: { type: Type.STRING },
                                type: { type: Type.STRING }, 
                                x: { type: Type.NUMBER }, 
                                y: { type: Type.NUMBER }
                            } 
                        } 
                    },
                    edges: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                from: { type: Type.STRING }, 
                                to: { type: Type.STRING }, 
                                label: { type: Type.STRING } 
                            } 
                        } 
                    }
                },
                required: ["nodes", "edges", "classification"]
            }
        }
    }));
    const design = safeJsonParse<DesignData>(response.text, { nodes: [], edges: [], classification: 'SYSTEM_ARCHITECTURE' });
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { design, groundingSources };
};

/**
 * NEURAL MERMAID ENGINE
 */
export const generateMermaidCode = async (prompt: string, currentCode: string): Promise<string> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Expert Solution Architect. 
        Task: Refine or generate Mermaid.js diagram code based on architectural requirements.
        
        Current Code State:
        ${currentCode}
        
        User Intent:
        ${prompt}
        
        OUTPUT RULES:
        1. Return ONLY the raw Mermaid code block.
        2. Do NOT wrap output in markdown code blocks or any explanations.
        3. Ensure valid syntax starting with 'graph', 'erDiagram', etc.`,
    }));
    return response.text || currentCode;
};

export const getHistory = (type: string): any[] => {
    try {
        const item = localStorage.getItem(`history_${type}`);
        if (!item) return [];
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

export const saveHistory = (type: string, summary: string, data: any, files: string[] = []) => {
    const history = getHistory(type);
    const newItem = { id: Date.now().toString(), type, summary, data, files, date: new Date().toLocaleDateString() };
    localStorage.setItem(`history_${type}`, JSON.stringify([newItem, ...history].slice(0, 20)));
    pushLearnedContext(type, `User generated a ${type} for "${summary}". Identified tags: ${files.join(', ')}`, [type, ...files]);
};

export const deleteHistory = (id: string) => {
    const types = ['Estimator', 'Architecture', 'Describer', 'ERDiagram', 'DataFlow', 'DocumentGenerator', 'CaseStory', 'DataQuality', 'DataDictionary', 'SolutionDocumentPro'];
    types.forEach(type => {
        const hist = getHistory(type);
        const filtered = hist.filter((h: any) => h.id !== id);
        if (hist.length !== filtered.length) localStorage.setItem(`history_${type}`, JSON.stringify(filtered));
    });
};

export const searchAllHistory = (query: string): SearchResult[] => {
    const types = ['Estimator', 'Architecture', 'Describer', 'ERDiagram', 'DataFlow', 'DocumentGenerator', 'CaseStory', 'DataQuality', 'DataDictionary', 'SolutionDocumentPro'];
    const results: SearchResult[] = [];
    types.forEach(type => {
        const history = getHistory(type);
        history.forEach(item => {
            if (item && item.summary && item.summary.toLowerCase().includes(query.toLowerCase())) {
                const searchType = type === 'SolutionDocumentPro' ? 'solution-doc-pro' : item.type?.toLowerCase() as any || 'request';
                results.push({ id: item.id, type: searchType, title: item.summary, subtitle: `${type} • ${item.date}`, date: item.date, data: item });
            }
        });
    });
    return results;
};

export const generateERD = async (ctx: string, p: string) => (await generateArchitectureDesign(ctx, "ER_DIAGRAM")).design;
export const generateProcessArchitecture = async (ctx: string, p: string) => (await generateArchitectureDesign(ctx, "DATA_FLOW")).design;

export const generateProjectStatistics = async (ctx: string): Promise<ProjectStats> => {
    const globalCtx = getGlobalIntelligence();
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze implementation strategy.
        Requirement: ${ctx}
        Context: ${globalCtx}`,
        config: { 
            thinkingConfig: { thinkingBudget: 4096 },
            responseMimeType: "application/json" 
        }
    }));
    return safeJsonParse<ProjectStats>(response.text, { executiveSummary: 'Failed to generate stats.', riskScore: 0, complexityScore: 0, technicalDebt: 'Medium', keyRisks: ['Internal synthesis timeout'], successProbability: 50 });
};

export const generateFutureRoadmap = async (ctx: string): Promise<RoadmapPhase[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a 4-phase delivery roadmap for: ${ctx}`,
        config: { responseMimeType: "application/json" }
    }));
    const parsed = safeJsonParse<any>(response.text, []);
    // Handle wrapped arrays if AI returns {"phases": [...]} or similar
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};

export const generateConsolidatedEstimation = async (prompt: string): Promise<{ drivers: Record<string, number>, resources: Resource[], timeline: TimelineItem[] }> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    }));
    return safeJsonParse(response.text, { drivers: {}, resources: [], timeline: [] });
};

export const analyzeAndLearn = async (a:any,b:any,c:any,d:any,e:any) => {};

export const sendChatMessage = async (history: any[], input: string, context: string): Promise<string> => {
    const chat = getAI().chats.create({ 
        model: 'gemini-3.8-flash', 
        config: { systemInstruction: context } 
    });
    const response: GenerateContentResponse = await callWithRetry(() => chat.sendMessage({ message: input }));
    return response.text || "Assistant error.";
};

export const generateProjectUnderstanding = async (context: string): Promise<ProjectDescriptionResponse> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Summarize technical spec: ${context}`,
        config: { responseMimeType: "application/json" }
    }));
    return safeJsonParse<ProjectDescriptionResponse>(response.text, { executiveSummary: '', objectives: [], techStack: {sources:[], targets:[], tools:[]}, constraints: [], implicitRequirements: [] });
};

export const generateDynamicUserGuide = async (features: string): Promise<GuideSection[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Guide for: ${features}`,
        config: { responseMimeType: "application/json" }
    }));
    const parsed = safeJsonParse<any>(response.text, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};

export const generateEstimation = async (ctx: string, type: string) => {
    const res = await generateConsolidatedEstimation(`Estimate for ${type}: ${ctx}`);
    return res.drivers;
};
export const generateProjectRequirements = async (ctx: string, type: string, audience: string[]): Promise<Requirement[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({ model: 'gemini-3.8-flash', contents: `Requirements: ${ctx}`, config: { responseMimeType: "application/json" } }));
    const parsed = safeJsonParse<any>(response.text, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};
export const generateIntelligentQuestionnaire = async (ctx: string, type: string, audience: string[]): Promise<Question[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({ model: 'gemini-3.8-flash', contents: `Scoping questions: ${ctx}`, config: { responseMimeType: "application/json" } }));
    const parsed = safeJsonParse<any>(response.text, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};
export const generateInitiationChecklist = async (ctx: string, type: string, audience: string[]): Promise<InitiationItem[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({ model: 'gemini-3.8-flash', contents: `Initiation Checklist: ${ctx}`, config: { responseMimeType: "application/json" } }));
    const parsed = safeJsonParse<any>(response.text, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};

export const generateDataDictionary = async (prompt: string, fileContext: string): Promise<DataDictionaryItem[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Data Dictionary from: ${fileContext}. Prompt: ${prompt}`,
        config: { responseMimeType: "application/json" }
    }));
    const parsed = safeJsonParse<any>(response.text, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};

export const determineDocumentStrategy = async (prompt: string, context: string): Promise<DocumentStrategy> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Strategy for: ${prompt}. Source: ${context}`,
        config: { responseMimeType: "application/json" }
    }));
    return safeJsonParse<DocumentStrategy>(response.text, { title: 'New Doc', type: 'hld', reasoning: '', sections: [], diagramMode: 'none' });
};

export const generateDocumentContent = async (sectionTitle: string, context: string, strategyType: string): Promise<string> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Write section ${sectionTitle} for ${strategyType}. Source: ${context}`,
    }));
    return response.text || "";
};

export const analyzePPTStructure = async (context: string): Promise<{ title: string; description: string }[]> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `PPT Structure for: ${context}`,
        config: { responseMimeType: "application/json" }
    }));
    const parsed = safeJsonParse<any>(response.text, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) return parsed[arrayKey];
    }
    return [];
};

export const generateSlideContent = async (slide: { title: string; description: string }, context: string): Promise<SlideContent> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Content for slide ${slide.title}. Context: ${context}`,
        config: { responseMimeType: "application/json" }
    }));
    return safeJsonParse<SlideContent>(response.text, { id: Date.now().toString(), title: slide.title, bulletPoints: [], speakerNotes: '' });
};

export const generateSolutionDocumentPro = async (projectName: string, context: string): Promise<any> => {
    const response: GenerateContentResponse = await callWithRetry(() => getAI().models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Solution Spec Pro for ${projectName}. Source: ${context}`,
        config: { responseMimeType: "application/json" }
    }));
    return safeJsonParse(response.text, {});
};
