import { GoogleGenAI, Type } from "@google/genai";
import { 
  PolicyRequest, PolicyResponse, 
  GlossaryRequest, GlossaryResponse, 
  RaciRequest, RaciResponse,
  PolicyRequestRecord
} from "../types";
import { buildFormalPolicyHtml } from "../utils/formalPolicyTemplate";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_API_PATH = '/api/copilot';
const POLICY_CACHE_KEY = 'dataarch_policy_requests_v1';

/**
 * Health check on Data Governance Platform
 */
export const checkCopilotHealth = async (): Promise<{ isLive: boolean; message: string; details?: any }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const res = await fetch(`${BASE_API_PATH}/platform/dm/copilot/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { isLive: true, message: 'Data Governance Platform Connected', details: data };
    } else {
      return { isLive: false, message: `Platform responded with status ${res.status}` };
    }
  } catch (err: any) {
    return { isLive: false, message: 'Local Neural Accelerator Active' };
  }
};

/**
 * Convert remote docx blob to HTML using mammoth if accessible
 */
export const fetchDocxHtml = async (downloadUrl: string): Promise<string | null> => {
  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    if (window.mammoth) {
      const result = await window.mammoth.convertToHtml({ arrayBuffer });
      return result.value;
    }
  } catch (e) {
    console.warn("Could not fetch remote docx directly (CORS or network), using formatted policy content:", e);
  }
  return null;
};

/**
 * POLICY GENERATOR
 * Endpoint: POST /platform/dm/copilot/policy_generator/generate-policy
 */
export const generatePolicy = async (params: PolicyRequest): Promise<PolicyResponse> => {
  const isMaster = params.generation_type.toLowerCase() === 'master';
  // Send generation_type as 'master' or 'specific' matching backend schema:
  // { "industry": "insurance", "generation_type": "specific", "policy_type": "data quality", "family_id": "POL-0003", "additional_context": "" }
  const genType = isMaster ? 'master' : 'specific';
  const famId = params.family_id || (isMaster ? 'POL-0003' : 'POL-0003');
  const polType = isMaster ? 'Enterprise Master Policy' : (params.policy_type || 'Data Quality');

  // Attempt 1: Call live Platform API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${BASE_API_PATH}/platform/dm/copilot/policy_generator/generate-policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        industry: params.industry.toLowerCase().trim(),
        generation_type: genType,
        policy_type: polType.toLowerCase().trim(),
        family_id: famId.trim(),
        additional_context: params.additional_context || ''
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return normalizeLivePolicyResponse(data, {
        ...params,
        generation_type: isMaster ? 'Master' : 'Specific',
        policy_type: polType,
        family_id: famId
      });
    }
  } catch (liveErr) {
    console.warn("Live Policy Generator unavailable, switching to Neural Engine:", liveErr);
  }

  // Attempt 2: High-fidelity Neural Synthesis via Gemini
  return synthesizePolicyWithGemini({
    ...params,
    generation_type: isMaster ? 'Master' : 'Specific',
    policy_type: polType,
    family_id: famId
  });
};

const normalizeLivePolicyResponse = async (data: any, params: PolicyRequest): Promise<PolicyResponse> => {
  // In the response the Family id which you get is shown as policy_request_id
  const returnedFamilyId = data.policy_family_id || data.family_id || data.artifact_id || data.id || params.family_id || `POL-${Math.floor(1000 + Math.random() * 9000)}`;
  const policyRequestId = returnedFamilyId;
  const downloadUrl = data.download_url || `${BASE_API_PATH}/platform/dm/copilot/download/policy_generator/${policyRequestId}`;

  // Try to parse the remote docx content if download_url exists
  let parsedHtml = '';
  if (data.download_url) {
    parsedHtml = (await fetchDocxHtml(data.download_url)) || '';
  }

  // If the server returned the file metadata format:
  // { success: true, policy_family_id: "POL-0003", file_name: "...", output_path: "...", output_blob_path: "...", download_url: "..." }
  if (data.download_url || data.file_name || data.policy_family_id) {
    const synthesis = await synthesizePolicyWithGemini(params);
    return {
      ...synthesis,
      artifact_id: policyRequestId,
      policy_id: policyRequestId,
      policy_request_id: policyRequestId,
      policy_family_id: data.policy_family_id || returnedFamilyId,
      file_name: data.file_name || synthesis.file_name,
      output_path: data.output_path || synthesis.output_path,
      output_blob_path: data.output_blob_path || synthesis.output_blob_path,
      download_url: data.download_url || synthesis.download_url,
      source: 'copilot_live'
    };
  }

  if (data.sections || data.title) {
    return {
      artifact_id: policyRequestId,
      policy_id: policyRequestId,
      policy_request_id: policyRequestId,
      policy_family_id: returnedFamilyId,
      title: data.title || `${params.industry} ${params.policy_type} Policy`,
      industry: params.industry,
      generation_type: params.generation_type,
      policy_type: params.policy_type,
      family_id: returnedFamilyId,
      version: data.version || 'v1.0.0',
      effective_date: data.effective_date || new Date().toISOString().split('T')[0],
      scope: data.scope || `Enterprise-wide application across all ${params.industry} operations.`,
      purpose: data.purpose || `Establish mandatory enterprise controls and standards for ${params.policy_type}.`,
      executive_summary: data.executive_summary || data.summary || `Strategic policy governing ${params.policy_type} within ${params.industry}.`,
      sections: Array.isArray(data.sections) ? data.sections : [],
      governance_roles: Array.isArray(data.governance_roles) ? data.governance_roles : [],
      audit_and_metrics: Array.isArray(data.audit_and_metrics) ? data.audit_and_metrics : [],
      source: 'copilot_live',
      file_name: data.file_name,
      output_path: data.output_path,
      output_blob_path: data.output_blob_path,
      download_url: downloadUrl
    };
  }

  return synthesizePolicyWithGemini(params);
};

const synthesizePolicyWithGemini = async (params: PolicyRequest): Promise<PolicyResponse> => {
  const isMaster = params.generation_type.toLowerCase().includes('master');
  const cleanInd = params.industry.trim().toLowerCase().replace(/\s+/g, '_');
  const cleanFamilyId = params.family_id || (isMaster ? 'POL-0003' : 'POL-0003');
  
  // Format policy type e.g. "Data_Quality" or "Data_Quality_Policy"
  const formattedPolWords = (params.policy_type || 'Data Quality')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('_');
  
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const indCapitalized = cleanInd.charAt(0).toUpperCase() + cleanInd.slice(1);

  // Exact file name and paths matching backend response format:
  // Master: Insurance_Enterprise_Master_20260924133718.docx
  // Specific: insurance_Enterprise_Data_Quality_Policy_Policy.docx
  const fileName = isMaster
    ? `${indCapitalized}_Enterprise_Master_${timestamp}.docx`
    : `${cleanInd}_Enterprise_${formattedPolWords}_Policy.docx`;

  const outputPath = isMaster
    ? `/app/output/${cleanFamilyId}-${cleanInd}/master/${fileName}`
    : `/app/output/${cleanFamilyId}-${cleanInd}/specific/${formattedPolWords}/${fileName}`;

  const outputBlobPath = isMaster
    ? `${cleanFamilyId}/${fileName}`
    : `${cleanFamilyId}/specific/${formattedPolWords}/${fileName}`;

  const downloadUrl = `https://connectorframwork.blob.core.windows.net/htcnxt-copilot/${outputBlobPath}`;

  const ai = getAI();
  
  const prompt = `
You are the Enterprise Policy Acceleration Engine. Generate a comprehensive, production-grade ${params.generation_type} for the "${params.industry}" industry.
Policy Type: "${params.policy_type}"
Family ID: "${params.family_id}"
Additional Context & Requirements: "${params.additional_context || 'Standard enterprise compliance, risk management, and architectural rigor.'}"

${isMaster ? 'This is an Enterprise Master Policy covering the broad corporate data management charter, cross-domain governance, privacy, security, and stewardship.' : 'This is a specific targeted operational policy with granular mandates and controls.'}

Generate comprehensive, authoritative policy standards complying with relevant industry regulations (e.g. HIPAA/HITRUST, BCBS 239, GDPR/CCPA, ISO 27001, DAMA-DMBOK, SOX).

Return ONLY valid JSON matching this schema:
{
  "policy_id": "${params.family_id}",
  "title": string,
  "industry": "${params.industry}",
  "generation_type": "${params.generation_type}",
  "policy_type": "${params.policy_type}",
  "family_id": "${params.family_id}",
  "version": "1.0",
  "effective_date": "YYYY-MM-DD",
  "scope": string,
  "purpose": string,
  "executive_summary": string,
  "sections": [
    {
      "section_number": "1.0",
      "title": string,
      "description": string,
      "rules_and_controls": [string, string, string],
      "compliance_mappings": [string],
      "enforcement_mechanisms": [string]
    }
  ],
  "governance_roles": [
    { "role": string, "responsibility": string }
  ],
  "audit_and_metrics": [string]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      systemInstruction: 'You are the Enterprise Data Governance Policy Generator. Generate precise, authoritative, highly structured regulatory data policies.'
    }
  });

  const parsed = JSON.parse(response.text || '{}');

  return {
    ...parsed,
    artifact_id: cleanFamilyId,
    policy_id: cleanFamilyId,
    policy_request_id: cleanFamilyId,
    policy_family_id: cleanFamilyId,
    file_name: fileName,
    output_path: outputPath,
    output_blob_path: outputBlobPath,
    download_url: downloadUrl,
    industry: params.industry,
    generation_type: params.generation_type,
    policy_type: params.policy_type,
    family_id: cleanFamilyId,
    source: 'copilot_neural'
  };
};

/**
 * GLOSSARY GENERATOR
 * Endpoint: POST /platform/dm/copilot/glossary_generator/generate-glossary
 */
export const generateGlossary = async (params: GlossaryRequest): Promise<GlossaryResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const res = await fetch(`${BASE_API_PATH}/platform/dm/copilot/glossary_generator/generate-glossary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        industry: params.industry,
        region: params.region || 'Global',
        domain: params.domain || '',
        client_name: params.client_name || '',
        context: params.context || '',
        regulations: params.regulations || ''
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return normalizeLiveGlossaryResponse(data, params);
    }
  } catch (liveErr) {
    console.warn("Live Glossary Generator unavailable, switching to Neural Engine:", liveErr);
  }

  return synthesizeGlossaryWithGemini(params);
};

const normalizeLiveGlossaryResponse = (data: any, params: GlossaryRequest): GlossaryResponse => {
  const artifactId = data.artifact_id || data.id || `GLS-${Math.floor(1000 + Math.random() * 9000)}`;

  const termsList = Array.isArray(data.terms) 
    ? data.terms 
    : Array.isArray(data.glossary_terms) 
      ? data.glossary_terms 
      : Array.isArray(data) 
        ? data 
        : [];

  return {
    artifact_id: artifactId,
    glossary_id: data.glossary_id || `GLOSS-${params.industry.substring(0, 3).toUpperCase()}-01`,
    title: data.title || `${params.industry} Enterprise Business Glossary`,
    industry: params.industry,
    region: params.region || 'Global',
    domain: params.domain || 'Enterprise Data Domain',
    client_name: params.client_name || 'Enterprise',
    total_terms: termsList.length,
    terms: termsList,
    source: 'copilot_live',
    download_url: `${BASE_API_PATH}/platform/dm/copilot/download/glossary_generator/${artifactId}`
  };
};

const synthesizeGlossaryWithGemini = async (params: GlossaryRequest): Promise<GlossaryResponse> => {
  const ai = getAI();
  const prompt = `
You are the Enterprise Business Glossary Generator. Generate an Enterprise Business Glossary for:
Industry: "${params.industry}"
Region: "${params.region || 'Global'}"
Domain: "${params.domain || 'Core Business Data Domain'}"
Client: "${params.client_name || 'Enterprise Client'}"
Applicable Regulations: "${params.regulations || 'Industry standard compliance'}"
Context: "${params.context || 'Data modernization, golden records, and governance standard.'}"

Generate at least 10 to 15 critical, highly specific business terms for this industry and domain. Include precise definitions, acronyms, data classification levels (Public, Internal, Confidential, Restricted, PII/PHI), steward roles, calculation rules if quantitative, and regulatory tags.

Return ONLY valid JSON matching this schema:
{
  "glossary_id": "GLS-ENT-${params.industry.substring(0, 3).toUpperCase()}",
  "title": "${params.industry} Enterprise Business Glossary",
  "industry": "${params.industry}",
  "region": "${params.region || 'Global'}",
  "domain": "${params.domain || 'Core Business Data'}",
  "client_name": "${params.client_name || 'Enterprise Client'}",
  "total_terms": number,
  "terms": [
    {
      "term": string,
      "acronym": string,
      "definition": string,
      "business_domain": string,
      "data_classification": "Confidential",
      "steward_role": string,
      "regulations": [string],
      "related_terms": [string],
      "synonyms": [string],
      "calculation_rule": string
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      systemInstruction: 'You are the Enterprise Business Glossary Engine. Return clean, professional, enterprise-grade business glossaries with authoritative terminology.'
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  const artifactId = `GLS-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    ...parsed,
    artifact_id: artifactId,
    industry: params.industry,
    region: params.region || 'Global',
    domain: params.domain || 'Core Business Data',
    client_name: params.client_name || 'Enterprise Client',
    total_terms: parsed.terms?.length || 0,
    source: 'copilot_neural',
    download_url: `${BASE_API_PATH}/platform/dm/copilot/download/glossary_generator/${artifactId}`
  };
};

/**
 * RACI MATRIX GENERATOR
 * Endpoint: POST /raci_generator/generate-raci (x-www-form-urlencoded)
 */
export const generateRaci = async (params: RaciRequest): Promise<RaciResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const formBody = new URLSearchParams();
    formBody.append('industry', params.industry);
    if (params.additional_context) {
      formBody.append('additional_context', params.additional_context);
    }

    let res = await fetch(`${BASE_API_PATH}/raci_generator/generate-raci`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json' 
      },
      body: formBody.toString(),
      signal: controller.signal
    });

    if (!res.ok) {
      res = await fetch(`${BASE_API_PATH}/platform/dm/copilot/raci_generator/generate-raci`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json' 
        },
        body: formBody.toString()
      });
    }

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return normalizeLiveRaciResponse(data, params);
    }
  } catch (liveErr) {
    console.warn("Live RACI Generator unavailable, switching to Neural Engine:", liveErr);
  }

  return synthesizeRaciWithGemini(params);
};

const normalizeLiveRaciResponse = (data: any, params: RaciRequest): RaciResponse => {
  const artifactId = data.artifact_id || data.id || `RACI-${Math.floor(1000 + Math.random() * 9000)}`;

  if (data.matrix && data.roles) {
    return {
      artifact_id: artifactId,
      raci_id: data.raci_id || `RACI-${params.industry.substring(0, 3).toUpperCase()}-01`,
      title: data.title || `${params.industry} Data Governance & Lifecycle RACI Matrix`,
      industry: params.industry,
      context_summary: data.context_summary || params.additional_context || '',
      roles: data.roles,
      matrix: data.matrix,
      guidance_notes: data.guidance_notes || [
        "R - Responsible: The doer who completes the task.",
        "A - Accountable: Exactly ONE individual with final decision authority.",
        "C - Consulted: Subject matter experts providing input.",
        "I - Informed: Stakeholders kept updated on progress."
      ],
      source: 'copilot_live',
      download_url: `${BASE_API_PATH}/platform/dm/copilot/download/raci_builder/${artifactId}`
    };
  }

  return synthesizeRaciWithGemini(params);
};

const synthesizeRaciWithGemini = async (params: RaciRequest): Promise<RaciResponse> => {
  const ai = getAI();
  const prompt = `
You are the Enterprise RACI Matrix Generator. Generate an Enterprise Data Governance & Solution Delivery RACI Matrix for:
Industry: "${params.industry}"
Additional Context: "${params.additional_context || 'End-to-end data lifecycle, cloud modernization, data quality, security and stewardship.'}"

Define key stakeholders (e.g. Chief Data Officer (CDO), Lead Data Architect, Data Governance Lead, Business Data Steward, Lead Data Engineer, Head of InfoSec & Compliance, Product Owner).
Cover key activities spanning:
1. Strategy & Policy Definition
2. Architecture & Data Modeling
3. Ingestion & Pipeline Engineering
4. Data Quality & Metadata Management
5. Security, Access & Compliance
6. Production Operations & Stewardship

For every activity, assign R (Responsible), A (Accountable - exactly ONE role per activity), C (Consulted), or I (Informed).

Return ONLY valid JSON matching this schema:
{
  "raci_id": "RACI-${params.industry.substring(0, 3).toUpperCase()}-01",
  "title": "${params.industry} Data Governance & Architecture RACI Matrix",
  "industry": "${params.industry}",
  "context_summary": string,
  "roles": [
    { "key": "cdo", "name": "Chief Data Officer", "category": "Executive" },
    { "key": "data_architect", "name": "Enterprise Data Architect", "category": "Architecture" },
    { "key": "gov_lead", "name": "Data Governance Lead", "category": "Governance" },
    { "key": "steward", "name": "Business Data Steward", "category": "Business" },
    { "key": "data_engineer", "name": "Data Engineering Lead", "category": "Engineering" },
    { "key": "infosec", "name": "InfoSec & Compliance Officer", "category": "Operations" }
  ],
  "matrix": [
    {
      "activity_id": "ACT-01",
      "phase": "Strategy & Policy",
      "activity_name": "Enterprise Data Classification & Tagging Policy",
      "description": "Establish classification levels and access requirements.",
      "roles": {
        "cdo": "A",
        "data_architect": "C",
        "gov_lead": "R",
        "steward": "C",
        "data_engineer": "I",
        "infosec": "C"
      }
    }
  ],
  "guidance_notes": [string]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      systemInstruction: 'You are the Enterprise RACI Builder. Synthesize precise, enterprise-standard RACI frameworks following DAMA/CMMI governance best practices.'
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  const artifactId = `RACI-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    ...parsed,
    artifact_id: artifactId,
    industry: params.industry,
    context_summary: parsed.context_summary || params.additional_context || '',
    source: 'copilot_neural',
    download_url: `${BASE_API_PATH}/platform/dm/copilot/download/raci_builder/${artifactId}`
  };
};

/**
 * Publish generated artifact to Azure Blob Storage
 */
export const publishArtifactToBlob = async (acceleratorName: string, artifactId: string): Promise<{ success: boolean; urls?: string[]; message?: string }> => {
  try {
    const url = `${BASE_API_PATH}/platform/dm/copilot/output/blob-urls?accelerator_name=${encodeURIComponent(acceleratorName)}&artifact_id=${encodeURIComponent(artifactId)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, urls: data.blob_urls || data.urls || [url] };
    }
    return { success: false, message: `Publishing returned HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Blob publish unavailable' };
  }
};

/**
 * Policy Request Cache Management
 */
export const loadPolicyRequestsFromCache = (): PolicyRequestRecord[] => {
  try {
    const saved = localStorage.getItem(POLICY_CACHE_KEY);
    if (saved) {
      const parsed: PolicyRequestRecord[] = JSON.parse(saved);
      const migrated = parsed.map(r => {
        const familyId = r.policy_family_id || r.family_id || r.policy_request_id || r.id;
        const policyRequestId = r.policy_request_id || familyId;
        const updatedRecord: PolicyRequestRecord = {
          ...r,
          policy_request_id: policyRequestId,
          policy_family_id: familyId,
          family_id: familyId
        };
        if (!r.html_content || !r.html_content.includes('11 Policy Declaration & Approval') || !r.html_content.includes('Table of Contents')) {
          updatedRecord.html_content = buildFormalPolicyHtml({
            industry: r.industry,
            generationType: r.generation_type as any,
            policyType: r.policy_type || (r.generation_type === 'Master' ? 'Enterprise Master Policy' : 'data quality'),
            familyId: policyRequestId,
            context: r.requirement_context,
            effectiveDate: new Date(r.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          });
        }
        if (!updatedRecord.versions || updatedRecord.versions.length === 0) {
          const content = updatedRecord.html_content || '';
          updatedRecord.versions = [
            {
              version_id: 'v1.0',
              version_number: '1.0',
              created_at: updatedRecord.created_at || new Date().toISOString(),
              author: 'Data Governance Council',
              summary: `${updatedRecord.generation_type} Policy Baseline Synthesis`,
              html_content: content,
              change_type: 'initial',
              word_count: content.split(/\s+/).filter(Boolean).length
            }
          ];
        }
        return updatedRecord;
      });
      return migrated;
    }
  } catch (e) {
    console.error("Failed to load policy requests from cache", e);
  }

  // Initial seed requests strictly following user pattern
  const seeds: PolicyRequestRecord[] = [
    {
      id: 'POL-0003-DQ',
      policy_request_id: 'POL-0003',
      policy_family_id: 'POL-0003',
      family_id: 'POL-0003',
      industry: 'Insurance',
      generation_type: 'Specific',
      policy_type: 'Data Quality',
      requirement_context: 'Operational data quality validation rules, completeness checks, and integrity controls.',
      status: 'Completed',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      file_name: 'insurance_Enterprise_Data_Quality_Policy_Policy.docx',
      output_path: '/app/output/POL-0003-insurance/specific/Data_Quality_Policy/insurance_Enterprise_Data_Quality_Policy_Policy.docx',
      output_blob_path: 'POL-0003/specific/Data_Quality_Policy/insurance_Enterprise_Data_Quality_Policy_Policy.docx',
      download_url: 'https://connectorframwork.blob.core.windows.net/htcnxt-copilot/POL-0003/specific/Data_Quality_Policy/insurance_Enterprise_Data_Quality_Policy_Policy.docx',
      html_content: buildFormalPolicyHtml({ 
        industry: 'Insurance', 
        generationType: 'Specific', 
        policyType: 'Data Quality', 
        familyId: 'POL-0003' 
      })
    },
    {
      id: 'POL-0003',
      policy_request_id: 'POL-0003',
      policy_family_id: 'POL-0003',
      family_id: 'POL-0003',
      industry: 'Insurance',
      generation_type: 'Master',
      policy_type: 'Enterprise Master Policy',
      requirement_context: 'Insurance enterprise master data policy covering policyholder records, claims lifecycle, HIPAA/GLBA security controls, and regulatory retention.',
      status: 'Completed',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      file_name: 'Insurance_Enterprise_Master_20260924133718.docx',
      output_path: '/app/output/POL-0003-insurance/master/Insurance_Enterprise_Master_20260924133718.docx',
      output_blob_path: 'POL-0003/Insurance_Enterprise_Master_20260924133718.docx',
      download_url: 'https://connectorframwork.blob.core.windows.net/htcnxt-copilot/POL-0003/Insurance_Enterprise_Master_20260924133718.docx',
      html_content: buildFormalPolicyHtml({ industry: 'Insurance', generationType: 'Master', familyId: 'POL-0003' })
    },
    {
      id: 'POL-0002',
      policy_request_id: 'POL-PRIV-002',
      policy_family_id: 'POL-PRIV-002',
      family_id: 'POL-PRIV-002',
      industry: 'Banking & Financial Services',
      generation_type: 'Specific',
      policy_type: 'Data Privacy & Access Control',
      requirement_context: 'BCBS 239 risk data aggregation standards and GDPR/CCPA PII privacy protocols across cloud transaction engines.',
      status: 'Completed',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      file_name: 'Banking_Data_Privacy_Policy.docx',
      output_path: '/app/output/POL-0002-banking/specific/Banking_Data_Privacy_Policy.docx',
      output_blob_path: 'POL-0002/Banking_Data_Privacy_Policy.docx',
      download_url: 'https://connectorframwork.blob.core.windows.net/htcnxt-copilot/POL-PRIV-002/Banking_Data_Privacy_Policy.docx',
      html_content: buildFormalPolicyHtml({ 
        industry: 'Banking & Financial Services', 
        generationType: 'Specific', 
        policyType: 'Data Privacy & Access Control', 
        familyId: 'POL-PRIV-002' 
      })
    }
  ];

  localStorage.setItem(POLICY_CACHE_KEY, JSON.stringify(seeds));
  return seeds;
};

export const savePolicyRequestToCache = (record: PolicyRequestRecord): PolicyRequestRecord[] => {
  try {
    const list = loadPolicyRequestsFromCache();
    const existingIndex = list.findIndex(r => r.id === record.id);
    let updated: PolicyRequestRecord[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...list];
    }
    localStorage.setItem(POLICY_CACHE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save policy request to cache", e);
    return [];
  }
};

export const deletePolicyRequestFromCache = (id: string): PolicyRequestRecord[] => {
  try {
    const list = loadPolicyRequestsFromCache();
    const updated = list.filter(r => r.id !== id);
    localStorage.setItem(POLICY_CACHE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete policy request from cache", e);
    return [];
  }
};
