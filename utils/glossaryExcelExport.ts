import * as XLSX from 'xlsx';
import { GlossaryDataset, GlossaryRequestRecord } from '../types';

/**
 * Builds and downloads a multi-sheet Microsoft Excel (.xlsx) file
 * with sheets: 'Business Term', 'Subdomain', 'Metric', 'Domain'
 * perfectly matching the Enterprise_Business_Glossary.xlsx structure.
 */
export const downloadGlossaryExcel = (
  glossary: GlossaryRequestRecord, 
  customFilename?: string
): void => {
  const dataset = glossary.data;
  if (!dataset) {
    console.error('No glossary dataset available to export');
    return;
  }

  const wb = XLSX.utils.book_new();

  // 1. Sheet: Business Term
  const termRows = (dataset.businessTerms || []).map(t => ({
    'Reference ID': t.referenceId || '',
    'Name': t.name || '',
    'Description': t.description || '',
    'Alias Names': t.aliasNames || '',
    'Business Logic': t.businessLogic || '',
    'Critical Data Element': t.criticalDataElement === true || t.criticalDataElement === 'TRUE' ? 'TRUE' : 'FALSE',
    'Examples': t.examples || '',
    'Format Type': t.formatType || 'Text',
    'Format Description': t.formatDescription || '',
    'Lifecycle': t.lifecycle || 'Published',
    'Security Level': t.securityLevel || 'Confidential',
    'Submit Ticket': 'NO',
    'Classifications': t.classifications || '',
    'Reference Data': '',
    'Operation': 'Create',
    'Parent: Subdomain': t.parentSubdomain || '',
    'Parent: Business Term': '',
    'Parent: Metric': '',
    'Parent: Domain': '',
    'Stakeholder: Governance Administrator': '',
    'Stakeholder: Governance Owner': '',
    'Stakeholder: Custom- Super Admin Role': '',
    'Stakeholder: Data Access Owner': ''
  }));

  const wsTerms = XLSX.utils.json_to_sheet(termRows);
  XLSX.utils.book_append_sheet(wb, wsTerms, 'Business Term');

  // 2. Sheet: Subdomain
  const subdomainRows = (dataset.subdomains || []).map(s => ({
    'Reference ID': '',
    'Name': s.name || '',
    'Description': s.description || '',
    'Alias Names': '',
    'Business Logic': '',
    'Examples': '',
    'Lifecycle': s.lifecycle || 'Published',
    'Security Level': s.securityLevel || 'Internal',
    'Submit Ticket': 'NO',
    'Operation': 'Create',
    'Parent: Subdomain': '',
    'Parent: Domain': s.parentDomain || dataset.domain?.name || glossary.industry || '',
    'Stakeholder: Governance Administrator': '',
    'Stakeholder: Governance Owner': '',
    'Stakeholder: Custom- Super Admin Role': '',
    'Stakeholder: Data Access Owner': ''
  }));

  const wsSubdomains = XLSX.utils.json_to_sheet(subdomainRows);
  XLSX.utils.book_append_sheet(wb, wsSubdomains, 'Subdomain');

  // 3. Sheet: Metric
  const metricRows = (dataset.metrics || []).map(m => ({
    'Reference ID': m.referenceId || '',
    'Name': m.name || '',
    'Description': m.description || '',
    'Alias Names': m.aliasNames || '',
    'Business Logic': m.businessLogic || '',
    'Critical Data Element': m.criticalDataElement === true || m.criticalDataElement === 'TRUE' ? 'TRUE' : 'FALSE',
    'Examples': m.examples || '',
    'Format Type': m.formatType || 'Number',
    'Format Description': m.formatDescription || '',
    'Lifecycle': m.lifecycle || 'Published',
    'Security Level': m.securityLevel || 'Confidential',
    'Submit Ticket': 'NO',
    'Classifications': m.classifications || '',
    'Reference Data': '',
    'Operation': 'Create',
    'Parent: Subdomain': m.parentSubdomain || '',
    'Parent: Metric': '',
    'Parent: Business Term': '',
    'Parent: Domain': '',
    'Stakeholder: Governance Administrator': '',
    'Stakeholder: Governance Owner': '',
    'Stakeholder: Custom- Super Admin Role': '',
    'Stakeholder: Data Access Owner': ''
  }));

  const wsMetrics = XLSX.utils.json_to_sheet(metricRows);
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Metric');

  // 4. Sheet: Domain
  const domainRows = [
    {
      'Reference ID': '',
      'Name': dataset.domain?.name || glossary.industry || 'Enterprise Domain',
      'Description': dataset.domain?.description || `Top-level governed business domain representing the ${glossary.industry} industry.`,
      'Alias Names': '',
      'Lifecycle': dataset.domain?.lifecycle || 'Published',
      'Submit Ticket': 'NO',
      'Operation': 'Create',
      'Stakeholder: Governance Administrator': '',
      'Stakeholder: Governance Owner': '',
      'Stakeholder: Custom- Super Admin Role': '',
      'Stakeholder: Data Access Owner': ''
    }
  ];

  const wsDomain = XLSX.utils.json_to_sheet(domainRows);
  XLSX.utils.book_append_sheet(wb, wsDomain, 'Domain');

  // Trigger browser download
  const filename = customFilename || `${glossary.industry.toLowerCase().replace(/[^a-z0-9]/g, '_')}_Enterprise_Business_Glossary.xlsx`;
  XLSX.writeFile(wb, filename);
};
