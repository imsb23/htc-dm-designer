/**
 * Intelligent Requirement Context Parser for Glossary Generator
 * 
 * Captures key-value attributes from free-flowing collaborative text:
 * - domain / subdomain: e.g. "sub-domain is customer", "subdomain: claims", "domain: underwriting"
 * - region: e.g. "region is North America", "region: APAC"
 * - client_name: e.g. "client is ACME Insurance", "client_name: Horizon"
 * - regulations: e.g. "regulations are GDPR, BCBS 239", "compliance: HIPAA"
 * - context: remaining background context and guidance
 */

export interface ParsedRequirementContext {
  region: string;
  domain: string;
  client_name: string;
  context: string;
  regulations: string;
}

export const parseRequirementContext = (rawText: string): ParsedRequirementContext => {
  if (!rawText || !rawText.trim()) {
    return {
      region: '',
      domain: '',
      client_name: '',
      context: '',
      regulations: ''
    };
  }

  const text = rawText.trim();
  let domain = '';
  let region = '';
  let client_name = '';
  let regulations = '';
  let context = text;

  // 1. Extract Domain / Subdomain: "sub-domain is customer", "subdomain: customer", "domain: customer", etc.
  const domainPatterns = [
    /(?:sub[- ]?domain|domain)\s*(?:is|:|=)\s*([a-zA-Z0-9 &/_]+?)(?=[,\n;.]|\s+(?:and|with|region|client|regulation)|$)/i,
    /(?:for|focus on)\s+(?:the\s+)?([a-zA-Z0-9 &/_]+?)\s+(?:sub[- ]?domain|domain)/i
  ];

  for (const pattern of domainPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      domain = match[1].trim();
      break;
    }
  }

  // 2. Extract Region: "region: US", "region is North America", "in the APAC region", etc.
  const regionPatterns = [
    /region\s*(?:is|:|=)\s*([a-zA-Z0-9 &/_]+?)(?=[,\n;.]|\s+(?:and|with|domain|client|regulation)|$)/i,
    /(?:jurisdiction|geography|geo)\s*(?:is|:|=)\s*([a-zA-Z0-9 &/_]+?)(?=[,\n;.]|$)/i,
    /\b(North America|US|USA|European Union|EU|UK|United Kingdom|APAC|Asia-Pacific|LATAM|MENA|Global)\b/i
  ];

  for (const pattern of regionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      region = match[1].trim();
      break;
    }
  }

  // 3. Extract Client Name: "client: XYZ", "client is XYZ", "client_name: XYZ"
  const clientPatterns = [
    /(?:client[ _-]?name|client|organization|company)\s*(?:is|:|=)\s*([a-zA-Z0-9 &/_.'-]+?)(?=[,\n;.]|\s+(?:and|with|domain|region|regulation)|$)/i
  ];

  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      client_name = match[1].trim();
      break;
    }
  }

  // 4. Extract Regulations: "regulations: GDPR, BCBS", "compliance: HIPAA", etc.
  const regPatterns = [
    /(?:regulations?|compliance|regulatory)\s*(?:are|is|:|=)\s*([a-zA-Z0-9 &,/_.-]+?)(?=[;\n.]|\s+(?:and|with|domain|region|client)|$)/i,
    /\b(GDPR|BCBS\s*239|HIPAA|SOX|CCPA|DORA|Solvency\s*II|IFRS\s*17|PCI-DSS|ISO\s*27001)\b/gi
  ];

  const regMatch = text.match(regPatterns[0]);
  if (regMatch && regMatch[1]) {
    regulations = regMatch[1].trim();
  } else {
    const directMatches = text.match(regPatterns[1]);
    if (directMatches && directMatches.length > 0) {
      regulations = Array.from(new Set(directMatches)).join(', ');
    }
  }

  return {
    region,
    domain,
    client_name,
    context,
    regulations
  };
};
