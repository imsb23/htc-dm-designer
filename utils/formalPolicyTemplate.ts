/**
 * Generates Enterprise Policy HTML strictly matching the standard pattern.
 * Includes complete coverage of:
 * - Cover Header & Document Information Table
 * - Table of Contents
 * - 1 Executive Summary
 * - 2 Scope (2.1 to 2.6)
 * - 3 Core Data Domains Covered (Table, Relationships, Governance Statement)
 * - 4 Roles & Responsibilities (Principles & Organization Table)
 * - 5 Enterprise Policy Catalogue (5.1 Principles & 5.2.1 to 5.2.18 detailed catalogues)
 * - 6 Policy Declaration & Approval (Declaration & Signatures Table)
 *
 * Guarantees strict boundary adherence, within-page scrolling, and responsive wrapping.
 */

export interface FormalPolicyParams {
  industry: string;
  generationType: 'Master' | 'Specific';
  policyType?: string;
  familyId?: string;
  context?: string;
  clientName?: string;
  effectiveDate?: string;
}

export const buildFormalPolicyHtml = (params: FormalPolicyParams): string => {
  const { industry, generationType } = params;

  if (generationType === 'Master') {
    return buildMasterPolicy(params);
  } else {
    return buildSpecificPolicy(params);
  }
};

const buildMasterPolicy = (params: FormalPolicyParams): string => {
  const ind = params.industry || 'Insurance';
  const effectiveDate = params.effectiveDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const client = params.clientName || 'Global Enterprise Corporation';
  const context = params.context || `Enterprise-wide data governance, regulatory compliance, risk management, and operational efficiency across all ${ind} entities.`;
  const familyId = params.familyId || 'POL-0003';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.7; font-size: 14px; max-width: 100%; word-break: break-word; overflow-wrap: anywhere;">
      
      <!-- COVER TITLE -->
      <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.15em; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
          Enterprise Master Policy
        </div>
        <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px;">
          ${ind}
        </div>
        <div style="font-size: 18px; font-weight: 700; color: #2563eb;">
          Enterprise Governance Master Policy
        </div>
      </div>

      <!-- DOCUMENT INFORMATION TABLE -->
      <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 28px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        Document Information
      </h2>
      <div style="overflow-x: auto; margin-bottom: 28px; border: 1px solid #cbd5e1; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
          <colgroup>
            <col style="width: 32%;" />
            <col style="width: 68%;" />
          </colgroup>
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 9px 14px; text-align: left; font-weight: 800; color: #334155; font-size: 12px; text-transform: uppercase;">Attribute</th>
              <th style="padding: 9px 14px; text-align: left; font-weight: 800; color: #334155; font-size: 12px; text-transform: uppercase;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Policy Request ID</td><td style="padding: 8px 14px; font-family: monospace; font-weight: 800; color: #1e40af;">${familyId}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Industry</td><td style="padding: 8px 14px; color: #0f172a;">${ind}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Region</td><td style="padding: 8px 14px; color: #0f172a;">Global / Multi-Jurisdictional</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Business Domain</td><td style="padding: 8px 14px; color: #0f172a;">Enterprise Operations, Risk, Compliance & Analytics</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Generation Type</td><td style="padding: 8px 14px; font-weight: 700; color: #4338ca;">Master</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Client Name</td><td style="padding: 8px 14px; color: #0f172a;">${client}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Additional Context</td><td style="padding: 8px 14px; color: #0f172a;">${context}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Applicable Regulations</td><td style="padding: 8px 14px; color: #0f172a;">GDPR, CCPA, HIPAA, BCBS 239, SOX, ISO/IEC 27001, DAMA-DMBOK</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Policy Owner</td><td style="padding: 8px 14px; color: #0f172a;">Chief Data Officer</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Policy Custodian</td><td style="padding: 8px 14px; color: #0f172a;">Data Governance Lead</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Approval Authority</td><td style="padding: 8px 14px; color: #0f172a;">Data Governance Council</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Version</td><td style="padding: 8px 14px; color: #0f172a;">1.0</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Effective Date</td><td style="padding: 8px 14px; color: #0f172a;">${effectiveDate}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Review Frequency</td><td style="padding: 8px 14px; color: #0f172a;">Annual and Upon Material Change</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Classification</td><td style="padding: 8px 14px; color: #0f172a;">Internal</td></tr>
            <tr><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Version History</td><td style="padding: 8px 14px; color: #0f172a;">Version 1.0 - Initial Release - ${effectiveDate}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- TABLE OF CONTENTS -->
      <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 32px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        Table of Contents
      </h2>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px 20px; margin-bottom: 32px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1;"><span>Document Information</span><span style="font-weight: 700; color: #64748b;">2</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1;"><span>Table of Contents</span><span style="font-weight: 700; color: #64748b;">3</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>1 Executive Summary</span><span>4</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>2 Scope</span><span>4</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>2.1 Organizational Scope</span><span>4</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>2.2 Business Scope</span><span>5</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>2.3 Data Scope</span><span>5</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>2.4 Technology Scope</span><span>5</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>2.5 Operational Scope</span><span>5</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>2.6 Stakeholder Scope</span><span>5</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>3 Core Data Domains Covered</span><span>6</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>Enterprise Core Data Domains</span><span>6</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>Domain Relationships</span><span>8</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>Domain Governance Statement</span><span>8</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>4 Roles & Responsibilities</span><span>8</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>Enterprise Governance Principles</span><span>8</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>Enterprise Governance Organization</span><span>9</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>5 Enterprise Policy Catalogue</span><span>11</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>5.1 Policy Generation Principles</span><span>11</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>5.2 Enterprise Policy Catalogue (5.2.1 - 5.2.18)</span><span>11</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>6 Policy Declaration & Approval</span><span>18</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>6.1 Policy Declaration</span><span>18</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>6.2 Approval Signatures</span><span>18</span></div>
      </div>

      <!-- 1 EXECUTIVE SUMMARY -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        1 Executive Summary
      </h2>
      <p style="margin-bottom: 14px;">
        This Enterprise Master Policy establishes the authoritative governance framework for enterprise data across the global <strong>${ind}</strong> organization. It exists to define the policy-level mandate, accountabilities, and portfolio of downstream Specific Policies that collectively ensure data is managed as a strategic asset, protected to meet legal and contractual obligations, and fit for the operational, regulatory, actuarial, underwriting, claims, distribution, and financial reporting needs of the business.
      </p>
      <p style="margin-bottom: 14px;">
        Enterprise governance objectives include: establishing clear ownership and stewardship for core ${ind} data domains; ensuring data quality, lineage, and metadata to support underwriting, claims adjudication, pricing, risk management, and regulatory reporting; protecting personal and sensitive information across jurisdictions; enabling secure data sharing with distribution partners, reinsurers, vendors, and regulators; and providing assurance through controls, oversight, and auditability.
      </p>
      <p style="margin-bottom: 14px;">
        Business value derived from this Master Policy includes improved risk management and underwriting accuracy, faster and higher confidence regulatory reporting, reduced operational cost and leakage in claims and billing, improved distribution partner integrations, enhanced actuarial and analytics capability, and strengthened customer trust through privacy and security practices.
      </p>
      <p style="margin-bottom: 14px;">
        Intended audience comprises executive leadership, the Chief Data Officer and enterprise data function, the Data Governance Council, business data owners and domain owners (underwriting, claims, actuarial, distribution, finance), data stewards, IT and platform custodians, Information Security, Privacy / Data Protection Officers, Compliance, Risk Management, Legal, Internal Audit, project and delivery teams, and third-party data processors.
      </p>
      <p style="margin-bottom: 24px;">
        This Master Policy is the parent authority for downstream Specific Policies. It defines the enterprise-level scope, roles, and policy catalogue; mandates that domain- and function-specific Specific Policies implement detailed controls, standards, and procedures aligned to the enterprise principles herein; and requires that all Specific Policies be approved, versioned, and maintained under the governance processes established by the Chief Data Officer and the Data Governance Council.
      </p>

      <!-- 2 SCOPE -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        2 Scope
      </h2>
      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">2.1 Organizational Scope</h3>
      <p style="margin-bottom: 14px;">
        This policy applies to all legal entities, subsidiaries, branches, business units, affiliates, and joint ventures in which the enterprise exercises governance authority. It governs data created, received, processed, transmitted, stored, or disposed by any enterprise organizational unit worldwide, including wholly owned subsidiaries and business units operating under local brands. Where local regulatory regimes require supplemental or stricter controls, Specific Policies shall reflect those requirements while aligning to this Master Policy. Where contractual arrangements or joint-venture governance limit direct enterprise control, parties remain accountable for ensuring compliance with applicable portions of this Master Policy through contractual and governance mechanisms.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">2.2 Business Scope</h3>
      <p style="margin-bottom: 14px;">
        This Master Policy governs core ${ind} business functions and capabilities including distribution and agency management, policy administration, underwriting, pricing and actuarial analysis, claims intake and adjudication, billing and collections, reinsurance placement and recovery, finance and regulatory reporting, fraud investigation, provider and network management (for health products), customer service and retention, and analytics supporting product development and risk management. It applies to business processes that capture, transform, validate, and consume enterprise data across these capabilities.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">2.3 Data Scope</h3>
      <p style="margin-bottom: 14px;">
        The policy covers all enterprise data types relevant to ${ind} operations: master data (e.g., parties, policies, producers), reference data, transactional data (e.g., premiums, claims transactions, payments), metadata (business definitions, lineage, data quality rules), analytical and model inputs/outputs (actuarial and predictive models), documents and case data (policy documents, claims files, medical records where applicable), and consent and communication records. Both structured and unstructured data falling within these categories are governed. System-of-record and derived analytical datasets are in scope for governance controls, quality objectives, and lifecycle management.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">2.4 Technology Scope</h3>
      <p style="margin-bottom: 14px;">
        Applicable technologies include core policy administration systems, claims management systems, billing and payment platforms, CRM and distribution management systems, producer/agent portals, MDM and reference-data platforms, enterprise data warehouses and data lakes, analytics and model management platforms, integration middleware and APIs, cloud infrastructure and platform services, document and case-management systems, and third-party hosted services. The policy applies to both on-premises and cloud environments, and to integration points connecting enterprise and partner systems. No vendor-specific technologies are mandated by this Master Policy.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">2.5 Operational Scope</h3>
      <p style="margin-bottom: 14px;">
        Governance coverage spans the full enterprise data lifecycle: creation and capture; validation and enrichment; authoritative-source designation and approval; change control and maintenance; authorized consumption and publication; archival and long-term storage; legal holds; and secure retirement and disposition. The policy mandates lifecycle controls, evidence of approvals, and retention consistent with Records & Retention obligations but does not prescribe operational procedures.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">2.6 Stakeholder Scope</h3>
      <p style="margin-bottom: 24px;">
        Stakeholders include executive leadership and governance bodies, the Chief Data Officer and enterprise data team, Data Governance Council members, Business Data Owners and Domain Data Owners (underwriting, claims, actuarial, distribution, finance), Data Stewards, Business Custodians, Technology Custodians, Application Owners, Information Security, Privacy / Data Protection, Risk Management, Compliance / Regulatory Affairs, Legal, Enterprise Architecture, Project / Portfolio Management Office, Internal Audit, business users, and third-party processors, vendors, and partners engaged in processing enterprise data. All stakeholders must operate within the accountabilities defined in Section 4 and supporting Specific Policies.
      </p>

      <!-- 3 CORE DATA DOMAINS COVERED -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        3 Core Data Domains Covered
      </h2>
      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">Enterprise Core Data Domains</h3>
      <div style="overflow-x: auto; margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed;">
          <colgroup>
            <col style="width: 25%;" />
            <col style="width: 45%;" />
            <col style="width: 30%;" />
          </colgroup>
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Core Data Domain</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Business Description</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Example Data</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Customer / Party</td><td style="padding: 7px 12px;">Parties to relationships including policyholders, claimants, beneficiaries, third parties, and legal entities. Critical for onboarding, KYC-like risk assessments, servicing, and regulatory reporting.</td><td style="padding: 7px 12px; color: #64748b;">Customer identifiers, names, contacts, KYC status, relationship roles, corporate legal entity identifiers</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Policy</td><td style="padding: 7px 12px;">Contractual products and endorsements describing coverage terms, effective dates, limits, deductibles, and policy lifecycle events. Central to premium computation, claims adjudication, and regulatory reporting.</td><td style="padding: 7px 12px; color: #64748b;">Policy number, product code, effective/expiry dates, coverage terms, endorsements, status</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Coverage / Benefit</td><td style="padding: 7px 12px;">Specific coverages, benefit schedules, limits, and sub-limits associated with policies, including ride-ons and endorsements. Used for claims liability assessment and pricing.</td><td style="padding: 7px 12px; color: #64748b;">Coverage types, limits, sub-limits, exclusions, benefit schedules</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Claim</td><td style="padding: 7px 12px;">Records of reported losses, investigations, reserves, payments, recoveries, and adjudication outcomes. Core to operational expense management and claims analytics.</td><td style="padding: 7px 12px; color: #64748b;">Claim number, loss date, reported date, reserve amounts, status, payee, payments</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Underwriting & Risk</td><td style="padding: 7px 12px;">Underwriting decisions, risk assessments, rating factors, exposures, and risk selection data used for pricing and portfolio management.</td><td style="padding: 7px 12px; color: #64748b;">Underwriting decision records, risk scores, exposures, rating factors, submission data</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Premium, Billing & Payment</td><td style="padding: 7px 12px;">Premium calculations, billing schedules, invoice records, payment allocations, commissions, and refunds. Essential for finance, collections, and revenue recognition.</td><td style="padding: 7px 12px; color: #64748b;">Premium amount, billing cycle, invoice number, payment status, payment method</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Producer / Distribution</td><td style="padding: 7px 12px;">Agents, brokers, distribution partners, producer appointments, commissions, and relationships. Critical for sales, compliance, and compensation.</td><td style="padding: 7px 12px; color: #64748b;">Producer ID, appointment status, commission schedules, distribution channel</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Reinsurance</td><td style="padding: 7px 12px;">Reinsurance treaties, facultative placements, cessions, recoverables, and reinsurance accounting records. Important for risk-transfer and capital management.</td><td style="padding: 7px 12px; color: #64748b;">Treaty identifiers, cession terms, recoverable amounts, reinsurer details</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Actuarial & Pricing</td><td style="padding: 7px 12px;">Actuarial datasets, exposure bases, loss histories, pricing models, and reserving inputs used for pricing, reserving, and capital modelling.</td><td style="padding: 7px 12px; color: #64748b;">Loss triangles, exposure data, model inputs/outputs, assumptions</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Provider / Medical (where applicable)</td><td style="padding: 7px 12px;">For health and medical-related products: provider networks, credentials, claims medical records, and provider billing details.</td><td style="padding: 7px 12px; color: #64748b;">Provider identifiers, credentials, network contracts, medical procedure codes</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Commission & Compensation</td><td style="padding: 7px 12px;">Commission calculations, overrides, and agent compensation records tied to sales and renewals.</td><td style="padding: 7px 12px; color: #64748b;">Commission amounts, payment schedules, contractual terms</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Financial & Regulatory Reporting</td><td style="padding: 7px 12px;">Ledgers, regulatory-specified reports, statutory reporting datasets, and reconciliations used for financial statements and regulator submissions.</td><td style="padding: 7px 12px; color: #64748b;">General ledger mappings, statutory report feeds, regulatory submission artifacts</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Document & Case Management</td><td style="padding: 7px 12px;">Policy documents, claim files, medical records, correspondence, and adjudication casework required for evidence, audit, and recordkeeping.</td><td style="padding: 7px 12px; color: #64748b;">Policy binders, claims files, letters, scanned documents, e-signature records</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Reference Data</td><td style="padding: 7px 12px;">Standardized codes, product catalogues, actuarial tables, geographic codes, and industry classifications used across systems.</td><td style="padding: 7px 12px; color: #64748b;">Product codes, rating tables, currency codes, country codes</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Metadata & Lineage</td><td style="padding: 7px 12px;">Business definitions, data models, lineage, quality rules, and stewardship records that enable data understanding and governance.</td><td style="padding: 7px 12px; color: #64748b;">Business glossary entries, lineage diagrams, data quality metrics, stewardship assignments</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Consent & Communication</td><td style="padding: 7px 12px;">Customer consents, marketing preferences, communication logs, and opt-in/opt-out records required for privacy and regulatory compliance.</td><td style="padding: 7px 12px; color: #64748b;">Consent records, channel preferences, contact logs, consent timestamps</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Fraud & Investigation</td><td style="padding: 7px 12px;">Records related to suspected fraud, investigations, referrals, and outcomes. Important for loss control and legal actions.</td><td style="padding: 7px 12px; color: #64748b;">Fraud case IDs, investigation notes, evidence links, referral status</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Supplier & Third-Party</td><td style="padding: 7px 12px;">Vendor and service-provider records supporting outsourcing, third-party processing, and contractual obligations.</td><td style="padding: 7px 12px; color: #64748b;">Vendor IDs, contracts, service-level agreements, processor locations</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Organization & Legal Entity</td><td style="padding: 7px 12px;">Corporate structure, legal entity identifiers, regulatory licenses, and corporate governance data used in regulatory reporting and contracts.</td><td style="padding: 7px 12px; color: #64748b;">Legal entity name, registration numbers, license data, corporate relationships</td></tr>
            <tr><td style="padding: 7px 12px; font-weight: 700;">Location & Geospatial</td><td style="padding: 7px 12px;">Locations relevant to risk assessment, underwriting, claims handling, and regulatory tax/jurisdictional requirements.</td><td style="padding: 7px 12px; color: #64748b;">Addresses, geocodes, jurisdictional tags, exposure zones</td></tr>
          </tbody>
        </table>
      </div>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 18px; margin-bottom: 8px;">Domain Relationships</h3>
      <p style="margin-bottom: 14px;">
        Core data domains are interdependent: Customer / Party data links to Policy records which define Coverage and determine Premium, Billing & Payment flows. Claims reference Policy and Coverage records and feed into Actuarial & Pricing and Financial & Regulatory Reporting. Underwriting & Risk data informs pricing and ties to Reinsurance arrangements for risk transfer. Producer / Distribution and Commission & Compensation intersect with Policy lifecycle events and Billing data. Metadata & Lineage, Reference Data, and Consent & Communication provide the governance scaffolding across all domains. Document & Case Management and Fraud & Investigation support evidentiary and control functions. Supplier & Third-Party and Organization & Legal Entity domains describe control relationships and contractual responsibilities affecting data processing.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 18px; margin-bottom: 8px;">Domain Governance Statement</h3>
      <p style="margin-bottom: 24px;">
        The Core Data Domains listed above are declared authoritative enterprise domains governed under this Enterprise Master Policy. Domain-specific custody, stewardship, quality objectives, authoritative source designations, and operational controls shall be defined and enforced by downstream Specific Policies. Domain Data Owners and Data Stewards shall ensure domain-level requirements conform to this Master Policy and are coordinated through the Data Governance Council.
      </p>

      <!-- 4 ROLES & RESPONSIBILITIES -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        4 Roles & Responsibilities
      </h2>
      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">Enterprise Governance Principles</h3>
      <p style="margin-bottom: 14px;">
        Executive sponsorship provides strategic direction, resourcing, and escalation authority for enterprise data governance. Business accountability resides with Business Data Owners and Domain Data Owners who define fitness-for-purpose, business definitions, and acceptable use. Operational stewardship is performed by Data Stewards who maintain metadata, data quality monitoring, and remediation coordination. Technology Custodians and Application Owners are responsible for secure implementation, availability, and platform controls, while Information Security and Privacy functions define security and privacy-by-design requirements and oversight. Compliance, Risk, and Legal provide independent interpretation of regulatory and contractual obligations; Internal Audit provides independent assurance. Escalation for cross-domain conflicts follows explicit decision rights through the Data Governance Council and Executive Sponsor. This separation ensures ownership, stewardship, technical custody, oversight, and assurance remain distinct and auditable.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 18px; margin-bottom: 8px;">Enterprise Governance Organization</h3>
      <div style="overflow-x: auto; margin-bottom: 24px; border: 1px solid #cbd5e1; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed;">
          <colgroup>
            <col style="width: 25%;" />
            <col style="width: 45%;" />
            <col style="width: 30%;" />
          </colgroup>
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Governance Role</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Primary Responsibilities</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Typical Organizational Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Executive Sponsor</td><td style="padding: 7px 12px;">Provide executive sponsorship, approve strategic data policy direction, allocate resources, and resolve escalated governance conflicts.</td><td style="padding: 7px 12px; color: #64748b;">Executive leadership (Board-level or C-suite sponsor)</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Chief Data Officer</td><td style="padding: 7px 12px;">Establish and maintain the enterprise data governance framework, own the Master Policy, coordinate Specific Policies, and drive enterprise data strategy and prioritization.</td><td style="padding: 7px 12px; color: #64748b;">Enterprise Data Executive / CDO Office</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Data Governance Council</td><td style="padding: 7px 12px;">Approve governance principles and material policy decisions, resolve cross-domain disputes, and oversee policy compliance and risk escalations.</td><td style="padding: 7px 12px; color: #64748b;">Cross-functional senior representatives (business, actuarial, risk, IT)</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Business Data Owner</td><td style="padding: 7px 12px;">Define business requirements, acceptance criteria, data definitions, acceptable uses, and quality objectives for business processes.</td><td style="padding: 7px 12px; color: #64748b;">Senior Business Leader for the relevant function (e.g., Head of Underwriting)</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Domain Data Owner</td><td style="padding: 7px 12px;">Accountable for governance of a specific Core Data Domain, authoritative-source decisions, lifecycle expectations, and domain-level compliance.</td><td style="padding: 7px 12px; color: #64748b;">Functional leader with domain accountability (e.g., Head of Claims Data)</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Data Steward</td><td style="padding: 7px 12px;">Execute operational stewardship: maintain metadata, manage business definitions, monitor quality, coordinate remediation, and support lineage documentation.</td><td style="padding: 7px 12px; color: #64748b;">Business or centralized data operations team</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Business Custodian</td><td style="padding: 7px 12px;">Perform day-to-day custodianship in business applications: data capture, validation, correction, and adherence to approved business rules.</td><td style="padding: 7px 12px; color: #64748b;">Business operations teams and application SMEs</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Technology Custodian</td><td style="padding: 7px 12px;">Operate and maintain platforms, integrations, access controls, logging, backups, and technical controls for governed data.</td><td style="padding: 7px 12px; color: #64748b;">IT Operations / Platform Engineering</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Application Owner</td><td style="padding: 7px 12px;">Own application lifecycle, configuration, change control, and alignment of application data with enterprise/domain requirements.</td><td style="padding: 7px 12px; color: #64748b;">Application Product Owner or IT Line Manager</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Information Security</td><td style="padding: 7px 12px;">Define and oversee security requirements, access standards, monitoring, incident-response coordination, and cryptographic controls.</td><td style="padding: 7px 12px; color: #64748b;">Information Security Function</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Privacy / Data Protection</td><td style="padding: 7px 12px;">Provide privacy governance, data protection oversight, cross-border transfer controls, DPIA coordination, and individual-rights processes.</td><td style="padding: 7px 12px; color: #64748b;">Privacy / Data Protection Office</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Risk Management</td><td style="padding: 7px 12px;">Identify and monitor data-related risks, ensure treatments align with enterprise risk appetite, and provide risk reporting.</td><td style="padding: 7px 12px; color: #64748b;">Enterprise Risk Function</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Compliance / Regulatory Affairs</td><td style="padding: 7px 12px;">Interpret regulatory obligations, coordinate evidence for supervisory bodies, and advise on regulatory reporting requirements.</td><td style="padding: 7px 12px; color: #64748b;">Compliance Function</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Internal Audit</td><td style="padding: 7px 12px;">Provide independent assurance of governance, controls, and policy adherence; report findings to Audit Committee and governance bodies.</td><td style="padding: 7px 12px; color: #64748b;">Internal Audit</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Legal</td><td style="padding: 7px 12px;">Advise on legal requirements, contracts, data-sharing agreements, legal holds, and regulatory obligations with legal interpretation.</td><td style="padding: 7px 12px; color: #64748b;">Legal Function</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Enterprise Architecture</td><td style="padding: 7px 12px;">Ensure data architecture, integration patterns, and interoperability align with governance requirements and standards.</td><td style="padding: 7px 12px; color: #64748b;">Enterprise Architecture</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 12px; font-weight: 700;">Project / Portfolio PMO</td><td style="padding: 7px 12px;">Ensure governance engagement in project lifecycles and that policy obligations are embedded into delivery.</td><td style="padding: 7px 12px; color: #64748b;">PMO</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 7px 12px; font-weight: 700;">Business Users</td><td style="padding: 7px 12px;">Use data according to policy, maintain data accuracy where responsible, and report incidents, quality or compliance issues.</td><td style="padding: 7px 12px; color: #64748b;">Front-line and back-office users</td></tr>
            <tr><td style="padding: 7px 12px; font-weight: 700;">Third Parties / Data Processors</td><td style="padding: 7px 12px;">Comply with contractual and regulatory obligations when processing enterprise data; maintain required controls and evidence.</td><td style="padding: 7px 12px; color: #64748b;">Vendors, Reinsurers, Brokers, Partners</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 5 ENTERPRISE POLICY CATALOGUE -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        5 Enterprise Policy Catalogue
      </h2>
      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">5.1 Policy Generation Principles</h3>
      <p style="margin-bottom: 18px;">
        The Enterprise Policy Catalogue is determined by assessing ${ind} industry requirements, global operational footprint, applicable regional regulations, critical business capabilities (underwriting, claims, actuarial, distribution, finance), and the Core Data Domains identified in Section 3. Policies are selected to ensure legal and regulatory compliance, protect personal and sensitive information, preserve actuarial and financial integrity, enable secure third-party interactions (brokers, reinsurers, vendors), and sustain analytics and model reliability. Catalogue composition prioritizes policies that close material control gaps, enable regulatory reporting, support enterprise risk appetite, and align stewardship, technology, and process responsibilities. Each Specific Policy derives authority from this Master Policy and is required to reference the Core Data Domains and supply measurable objectives, roles, and enforcement mechanisms appropriate to regional legal requirements.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 20px; margin-bottom: 12px;">5.2 Enterprise Policy Catalogue</h3>

      ${[
        {
          num: '5.2.1',
          name: 'Data Classification & Handling Policy',
          purpose: 'Establish enterprise-wide rules for classifying data by sensitivity, criticality, and regulatory treatment to ensure consistent handling and protection in insurance operations.',
          capability: 'Enables appropriate security, storage, and sharing controls; supports retention, access controls, encryption, and cross-border transfer decisions.',
          industryRel: `${ind} data contains personal information, health or medical information (for certain products), financial records, and proprietary actuarial models requiring precise classification.`,
          regApp: 'Applicable globally; Specific Policies shall reflect regional privacy, data-localization, and regulatory nuances.',
          regRel: 'Supports compliance with jurisdictional privacy, security, and financial reporting obligations by ensuring calibrated controls based on classification.',
          domains: 'Customer/Party, Policy, Claim, Provider/Medical, Financial & Regulatory Reporting, Metadata & Lineage.',
          relMaster: 'Implements the Master Policy requirement to protect data commensurate with business risk and regulatory obligations; downstream policies will define handling procedures.'
        },
        {
          num: '5.2.2',
          name: 'Data Quality Policy',
          purpose: 'Define enterprise expectations for data fitness-for-purpose, quality dimensions, measurement frequency, and remediation governance to support operational reliability and analytics.',
          capability: 'Ensures accuracy of underwriting, claims adjudication, premium billing, actuarial modeling, and regulatory reporting datasets.',
          industryRel: 'Accurate data underpins pricing, reserves, claims settlement, and solvency assessments; poor quality exposes the enterprise to financial and regulatory risk.',
          regApp: 'Global; Specific Policies will incorporate local data quality thresholds where regulation or business practice requires.',
          regRel: 'Supports regulatory reporting integrity and auditability by mandating evidence of quality controls and remediation.',
          domains: 'Policy, Claim, Underwriting & Risk, Premium/Billing, Actuarial & Pricing, Financial & Regulatory Reporting.',
          relMaster: 'Provides enterprise-level quality objectives and requires domain-specific quality rules and ownership under downstream policies.'
        },
        {
          num: '5.2.3',
          name: 'Master Data Management Policy',
          purpose: 'Establish enterprise rules for authoritative-source designation, consolidation, reconciliation, and synchronization of master entities (customers, policies, producers, products).',
          capability: 'Reduces duplication, enables a single source of truth for operational processing, reporting, and analytics.',
          industryRel: 'Ensures consistent customer, policy, and producer records across distribution, policy administration, billing, claims, and reinsurance workflows.',
          regApp: 'Global; Specific Policies will address local identifier usage and regulatory requirements for identity verification.',
          regRel: 'Facilitates audit trails and regulator inquiries by identifying authoritative sources and stewardship responsibilities.',
          domains: 'Customer/Party, Policy, Producer/Distribution, Reference Data, Organization & Legal Entity.',
          relMaster: 'Provides enterprise authority for master-entity governance; Specific Policies specify synchronization mechanisms and reconciliation frequencies.'
        },
        {
          num: '5.2.4',
          name: 'Privacy & Data Protection Policy',
          purpose: 'Define privacy and data protection obligations for personal and sensitive data processing, including legal basis, cross-border transfers, retention, and individual rights processes.',
          capability: 'Enables lawful customer data processing, supports privacy-by-design, and operationalizes rights requests and consent management.',
          industryRel: `${ind} processes extensive personal data, health information for certain lines, and requires strict protections to maintain trust and regulatory compliance.`,
          regApp: 'Global; Specific Policies shall incorporate regional data-protection laws and supervisory authority requirements.',
          regRel: 'Supports adherence to applicable privacy regulations and supervisory expectations without substituting legal counsel.',
          domains: 'Customer/Party, Provider/Medical, Consent & Communication, Claims, Policy.',
          relMaster: 'Establishes enterprise-level privacy governance and delegates operational controls to downstream Specific Policies and local privacy frameworks.'
        },
        {
          num: '5.2.5',
          name: 'Data Security & Access Control Policy',
          purpose: 'Mandate security controls, least-privilege access, authentication, encryption, monitoring, and incident-reporting requirements to protect confidentiality, integrity, and availability.',
          capability: 'Protects underwriting, claims, financial, and personal data against unauthorized access and cyber threats.',
          industryRel: 'Data is a primary target for fraud and cyber risk; strong security preserves solvency, customer trust, and regulatory compliance.',
          regApp: 'Global; Specific Policies will address local encryption, logging, and cross-border control requirements.',
          regRel: 'Aligns with regulatory expectations for prudential security controls and incident reporting obligations.',
          domains: 'All domains, with emphasis on Customer/Party, Claims, Policy, Financial & Regulatory Reporting, Provider/Medical.',
          relMaster: 'Provides enterprise security mandates; Specific Policies define technical controls and operational processes consistent with this policy.'
        },
        {
          num: '5.2.6',
          name: 'Records & Retention Policy',
          purpose: 'Establish retention, archival, legal hold, and disposition requirements for records supporting regulatory, legal, and business needs.',
          capability: 'Ensures compliance with statutory retention periods, evidentiary requirements for claims and disputes, and supports defensible deletion.',
          industryRel: `${ind} is subject to retention obligations for policies, claims files, and financial records that vary by jurisdiction and product line.`,
          regApp: 'Global; Specific Policies must map retention to local statutory and supervisory requirements.',
          regRel: 'Supports regulatory and legal obligations for recordkeeping and auditability.',
          domains: 'Document & Case Management, Policy, Claim, Financial & Regulatory Reporting, Provider/Medical.',
          relMaster: 'Prescribes enterprise retention principles and requires Specific Policies to implement retention schedules and legal-hold procedures.'
        },
        {
          num: '5.2.7',
          name: 'Data Lifecycle Management Policy',
          purpose: 'Define lifecycle requirements for creation, approval, change control, archival, and secure disposal of governed data throughout its operational life.',
          capability: 'Ensures controlled evolution of data, prevents stale or unsupported datasets, and maintains lineage for auditability.',
          industryRel: 'Proper lifecycle controls minimize operational risk in policy changes, claims handling, and regulatory reporting.',
          regApp: 'Global; Specific Policies will address local regulatory lifecycle requirements.',
          regRel: 'Enables compliance with recordkeeping, audit trails, and supervisory inquiries.',
          domains: 'All enterprise domains, notably Policy, Claim, Financial & Regulatory Reporting, Metadata & Lineage.',
          relMaster: 'Sets lifecycle governance expectations; downstream policies will implement domain-specific lifecycle procedures and evidence requirements.'
        },
        {
          num: '5.2.8',
          name: 'Reference Data Management Policy',
          purpose: 'Govern the creation, approval, distribution, and versioning of reference data to maintain consistency across pricing, underwriting, and reporting systems.',
          capability: 'Ensures stable, authoritative code lists and rating tables used in pricing, billing, and reporting.',
          industryRel: 'Accurate reference data is crucial for consistent premium calculations, geographic risk classification, and regulatory submissions.',
          regApp: 'Global; Specific Policies will reflect local code standards and regulatory identifiers.',
          regRel: 'Supports reproducible regulatory reporting and actuarial calculations.',
          domains: 'Reference Data, Actuarial & Pricing, Policy, Underwriting & Risk.',
          relMaster: 'Provides enterprise direction for reference data stewardship; domain-specific reference tables and release processes are defined in Specific Policies.'
        },
        {
          num: '5.2.9',
          name: 'Metadata & Lineage Policy',
          purpose: 'Require enterprise metadata standards, business glossaries, and lineage capture to enable transparency, repeatability, and auditability of data flows.',
          capability: 'Enhances trust in analytics, regulatory reporting, and model validation by providing clear provenance and definitions.',
          industryRel: 'Needed for actuarial model validation, regulatory reporting reconciliation, and dispute resolution in claims and underwriting.',
          regApp: 'Global; Specific Policies will address preservation of lineage for regulated data in each jurisdiction.',
          regRel: 'Supports supervisor inquiries and audit evidence by ensuring lineage and metadata are maintained.',
          domains: 'Metadata & Lineage, Actuarial & Pricing, Financial & Regulatory Reporting, Claim, Policy.',
          relMaster: 'Establishes enterprise metadata requirements; Specific Policies and operating procedures will prescribe tools and capture points.'
        },
        {
          num: '5.2.10',
          name: 'Third-Party Data Sharing & Processing Policy',
          purpose: 'Define governance for data sharing, processing, contracts, due diligence, security, and oversight of third parties including reinsurers, vendors, and brokers.',
          capability: 'Enables secure and compliant outsourcing, data exchange, and partner integrations essential to distribution, claims processing, and reinsurance recovery.',
          industryRel: `${ind} relies on a broad ecosystem of partners; robust third-party controls mitigate regulatory and operational risk.`,
          regApp: 'Global; Specific Policies must address cross-border processing, local data-processor requirements, and contractual clauses.',
          regRel: 'Supports contractual and supervisory expectations for vendor management and data-controller/processor relationships.',
          domains: 'Third-Party & Supplier, Reinsurance, Producer/Distribution, Provider/Medical, Customer/Party.',
          relMaster: 'Governs third-party relationships at enterprise level; Specific Policies will operationalize contractual templates and monitoring requirements.'
        },
        {
          num: '5.2.11',
          name: 'Analytics, Modeling & Actuarial Governance Policy',
          purpose: 'Set governance for model development, validation, versioning, input data quality, documentation, and deployment to ensure integrity of pricing, reserving, and predictive use cases.',
          capability: 'Ensures actuarial and analytics outputs are robust, explainable, and auditable for business and regulatory use.',
          industryRel: 'Pricing, reserving, and capital modeling are core functions with direct financial impact and regulatory scrutiny.',
          regApp: 'Global; Specific Policies will reflect local actuarial standards and model governance requirements.',
          regRel: 'Supports model risk management expectations from prudential regulators and auditors.',
          domains: 'Actuarial & Pricing, Underwriting & Risk, Policy, Claim, Financial & Regulatory Reporting, Metadata & Lineage.',
          relMaster: 'Provides enterprise-level model governance expectations; Specific Policies will define validation, testing, and deployment controls.'
        },
        {
          num: '5.2.12',
          name: 'Claims Data Governance Policy',
          purpose: 'Define governance for claims capture, triage, reserving data, adjudication records, payments, recoveries, and supporting evidentiary documents.',
          capability: 'Ensures reliable claims data for operational settlement, reinsurance recoveries, fraud detection, and reserving.',
          industryRel: 'Accurate claims data is essential to financial performance, customer outcomes, and regulatory compliance.',
          regApp: 'Global; Specific Policies will address local statutory claims processes and medical record handling where applicable.',
          regRel: 'Supports statutory claims reporting, solvency calculations, and supervisory reviews.',
          domains: 'Claim, Policy, Provider/Medical, Fraud & Investigation, Financial & Regulatory Reporting.',
          relMaster: 'Sets enterprise expectations for claims data stewardship; downstream policies will define adjudication data standards and retention.'
        },
        {
          num: '5.2.13',
          name: 'Policy Administration, Underwriting & Reinsurance Data Governance Policy',
          purpose: 'Provide integrated governance for policy lifecycle data, underwriting submissions and decisions, and reinsurance placements and recoverables.',
          capability: 'Ensures consistency between policy issuance, risk selection, pricing, and reinsurance accounting to support risk transfer strategies and financial integrity.',
          industryRel: 'Coherent governance across these functions prevents gaps between underwriting decisions, policy administration, and reinsurance coverage.',
          regApp: 'Global; Specific Policies will address local underwriting rules, licensing, and treaty requirements.',
          regRel: 'Supports insurer solvency, premium reporting, and reinsurance disclosure obligations.',
          domains: 'Policy, Underwriting & Risk, Reinsurance, Premium/Billing, Producer/Distribution.',
          relMaster: 'Provides enterprise alignment for lifecycle and authoritative sources across related domains; Specific Policies will address operational controls and reconciliations.'
        },
        {
          num: '5.2.14',
          name: 'Financial & Regulatory Reporting Data Governance Policy',
          purpose: 'Define governance for the preparation, reconciliation, and certification of financial statements and regulatory returns, ensuring data provenance and control evidence.',
          capability: 'Ensures reliable statutory and regulatory submissions, supports auditability, and reduces risk of material misstatement.',
          industryRel: `${ind} is highly regulated; accurate financial and solvency reporting is critical to regulatory standing and market confidence.`,
          regApp: 'Global; Specific Policies must incorporate local statutory formats, chart of accounts mapping, and submission processes.',
          regRel: 'Directly underpins compliance with financial reporting standards and supervisory return requirements.',
          domains: 'Financial & Regulatory Reporting, Policy, Claim, Actuarial & Pricing, Organization & Legal Entity.',
          relMaster: 'Establishes enterprise control expectations for reporting data; downstream policies require reconciliations and evidence trails.'
        },
        {
          num: '5.2.15',
          name: 'Data Incident & Breach Response Policy',
          purpose: 'Define enterprise requirements for detection, reporting, escalation, containment, remediation, regulatory notification, and post-incident review of data incidents and breaches.',
          capability: 'Enables timely response to minimize harm to customers, operational disruption, and regulatory exposure.',
          industryRel: 'Data incidents involving customer, claims, or financial data can materially impact solvency, reputation, and regulatory standing.',
          regApp: 'Global; Specific Policies must incorporate jurisdictional notification timelines and supervisory engagement processes.',
          regRel: 'Supports compliance with breach-notification laws and sector-specific supervisory reporting obligations.',
          domains: 'Customer/Party, Claim, Policy, Provider/Medical, Financial & Regulatory Reporting.',
          relMaster: 'Provides enterprise-level incident governance; Specific Policies will operationalize detection mechanisms and notification procedures.'
        },
        {
          num: '5.2.16',
          name: 'Consent & Communications Policy',
          purpose: 'Govern capture, management, and evidencing of customer consents, marketing preferences, and communication history to ensure lawful contact and regulatory compliance.',
          capability: 'Enables compliant customer engagement, consent lifecycle management, and defense against regulatory complaints.',
          industryRel: 'Customer communications affect renewal, claims handling, and marketing; consent is often required for direct marketing and certain data uses.',
          regApp: 'Global; Specific Policies must reflect regional consent requirements, electronic communications laws, and do-not-contact registries.',
          regRel: 'Supports compliance with privacy statutes and communications regulation.',
          domains: 'Consent & Communication, Customer/Party, Marketing, Policy.',
          relMaster: 'Implements enterprise consent standards; Specific Policies will define capture mechanisms, retention of consent evidence, and rights fulfillment.'
        },
        {
          num: '5.2.17',
          name: 'Data Lineage & Provenance Policy',
          purpose: 'Require capture and retention of data lineage and provenance for governed datasets to enable traceability from source systems through transformations to consumption.',
          capability: 'Facilitates validation of analytics, model inputs, regulatory submissions, and audit investigations.',
          industryRel: 'Lineage underpins actuarial validation, reserve justification, and reconciliations between front-office and finance systems.',
          regApp: 'Global; Specific Policies will specify lineage scope for regulated datasets in each jurisdiction.',
          regRel: 'Supports supervisory inquiries and audit evidence for reported figures.',
          domains: 'Metadata & Lineage, Financial & Regulatory Reporting, Actuarial & Pricing, Policy, Claim.',
          relMaster: 'Establishes enterprise lineage requirements; Specific Policies detail tooling, capture points, and retention.'
        },
        {
          num: '5.2.18',
          name: 'Data Ethics & AI Governance Policy',
          purpose: 'Set enterprise expectations for ethical use of data and governance of AI/ML models, including fairness, transparency, explainability, and mitigation of bias in pricing, underwriting, or claims automation.',
          capability: 'Enables responsible innovation while managing model risk and reputational exposure.',
          industryRel: 'Decisions driven by models and data impact pricing, access, and customer outcomes and are subject to regulatory and public scrutiny.',
          regApp: 'Global; Specific Policies will reflect emerging regulatory requirements and local expectations for automated decision-making.',
          regRel: 'Prepares the enterprise to meet supervisory expectations on algorithmic transparency and non-discrimination where applicable.',
          domains: 'Actuarial & Pricing, Underwriting & Risk, Customer/Party, Policy, Claim, Metadata & Lineage.',
          relMaster: 'Provides ethical guardrails and governance expectations for models and advanced analytics; Specific Policies will define validation, documentation, and monitoring.'
        }
      ].map(pol => `
        <div style="margin-bottom: 22px; padding: 14px 18px; background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
            ${pol.num} ${pol.name}
          </h4>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Purpose:</strong> ${pol.purpose}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Capability Supported:</strong> ${pol.capability}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Industry Relevance:</strong> ${pol.industryRel}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Regional Applicability:</strong> ${pol.regApp}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Regulatory Relevance:</strong> ${pol.regRel}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Applicable Core Data Domain(s):</strong> ${pol.domains}</div>
          <div style="font-size: 13px;"><strong>Relationship to Master Policy:</strong> ${pol.relMaster}</div>
        </div>
      `).join('')}

      <!-- 6 POLICY DECLARATION & APPROVAL -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        6 Policy Declaration & Approval
      </h2>
      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 8px;">6.1 Policy Declaration</h3>
      <p style="margin-bottom: 20px;">
        By endorsement of this Enterprise Master Policy, the enterprise establishes a single authoritative governance framework that defines enterprise scope, Core Data Domains, roles and accountabilities, and the catalogue of downstream Specific Policies. This Master Policy is the parent authority for all Specific Policies that govern the creation, processing, protection, lifecycle management, sharing, and disposition of enterprise data. All Specific Policies, standards, and controls that implement the obligations established herein shall be approved, published, maintained, and enforced in accordance with the governance processes managed by the Chief Data Officer and overseen by the Data Governance Council. Compliance with this Master Policy is mandatory for all organizational units, business functions, and third parties processing enterprise data.
      </p>

      <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 16px; margin-bottom: 10px;">6.2 Approval Signatures</h3>
      <div style="overflow-x: auto; margin-bottom: 28px; border: 1px solid #cbd5e1; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
          <colgroup>
            <col style="width: 32%;" />
            <col style="width: 26%;" />
            <col style="width: 24%;" />
            <col style="width: 18%;" />
          </colgroup>
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Approval Role</th>
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Name</th>
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Signature</th>
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 700;">Executive Sponsor</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;">
              <td style="padding: 10px 12px; font-weight: 700;">Chief Data Officer</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: 700;">Data Governance Council Representative</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
              <td style="padding: 10px 12px; color: #94a3b8;">____________________</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `;
};

const buildSpecificPolicy = (params: FormalPolicyParams): string => {
  const ind = params.industry || 'Insurance';
  const polType = params.policyType || 'data quality';
  const familyId = params.familyId || 'POL-0003';
  const effectiveDate = params.effectiveDate || '2026-10-01';
  const client = params.clientName || '';
  const context = params.context || '';
  const businessDomain = 'Retail & Corporate Banking';

  // Format title e.g. "Data Quality Policy"
  const formattedTitle = polType.toLowerCase().includes('policy')
    ? polType.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : `${polType.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Policy`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.7; font-size: 14px; max-width: 100%; word-break: break-word; overflow-wrap: anywhere;">
      
      <!-- COVER TITLE -->
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px;">
          ${formattedTitle}
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 6px;">
          ${ind} | ${businessDomain}
        </div>
        <div style="font-size: 16px; font-weight: 700; color: #2563eb;">
          Enterprise Governance Policy
        </div>
      </div>

      <!-- DOCUMENT INFORMATION TABLE -->
      <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 28px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        Document Information
      </h2>
      <div style="overflow-x: auto; margin-bottom: 28px; border: 1px solid #cbd5e1; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
          <colgroup>
            <col style="width: 32%;" />
            <col style="width: 68%;" />
          </colgroup>
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 9px 14px; text-align: left; font-weight: 800; color: #334155; font-size: 12px; text-transform: uppercase;">Attribute</th>
              <th style="padding: 9px 14px; text-align: left; font-weight: 800; color: #334155; font-size: 12px; text-transform: uppercase;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Industry</td><td style="padding: 8px 14px; color: #0f172a;">${ind}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Region</td><td style="padding: 8px 14px; color: #0f172a;">United Kingdom & European Union</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Business Domain</td><td style="padding: 8px 14px; color: #0f172a;">${businessDomain}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Policy Type</td><td style="padding: 8px 14px; color: #0f172a;">${polType}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Generation Type</td><td style="padding: 8px 14px; font-weight: 700; color: #2563eb;">Specific</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Client Name</td><td style="padding: 8px 14px; color: #0f172a;">${client}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Additional Context</td><td style="padding: 8px 14px; color: #0f172a;">${context}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Applicable Regulations</td><td style="padding: 8px 14px; color: #0f172a;">EU/UK GDPR, BCBS 239, AML Directives, Solvency II, FCA / PRA</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Parent Policy</td><td style="padding: 8px 14px; font-family: monospace; font-weight: 800; color: #1e40af;">${familyId}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Policy Owner</td><td style="padding: 8px 14px; color: #0f172a;">Chief Data Officer</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Policy Custodian</td><td style="padding: 8px 14px; color: #0f172a;">Data Governance Lead</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Approval Authority</td><td style="padding: 8px 14px; color: #0f172a;">Data Governance Council / Executive Leadership</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Version</td><td style="padding: 8px 14px; color: #0f172a;">1.0</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Effective Date</td><td style="padding: 8px 14px; color: #0f172a;">${effectiveDate}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Review Frequency</td><td style="padding: 8px 14px; color: #0f172a;">Annual</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;"><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Classification</td><td style="padding: 8px 14px; color: #0f172a;">Internal — Confidential</td></tr>
            <tr><td style="padding: 8px 14px; font-weight: 700; color: #475569;">Version History</td><td style="padding: 8px 14px; color: #0f172a;">Version 1.0 - Initial Release - ${effectiveDate}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- TABLE OF CONTENTS -->
      <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 32px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        Table of Contents
      </h2>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px 20px; margin-bottom: 32px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1;"><span>Document Information</span><span style="font-weight: 700; color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1;"><span>Table of Contents</span><span style="font-weight: 700; color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>3 Executive Summary</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>4 Scope</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>4.1 Organizational Scope</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>4.2 Business Scope</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>4.3 Data Scope</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>4.4 Technology Scope</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>4.5 Operational Scope</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>4.6 Stakeholder Scope</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>5 Purpose</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>6 Governance Framework</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>7 Roles & Responsibilities</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>7.1 Executive Sponsor</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>7.2 Business Owner</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>7.3 Data Owner</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>7.4 Data Steward</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>7.5 Technology Custodian</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>7.6 Risk, Security & Compliance</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>8 Regulatory Mapping</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>9 Policy Requirements</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.1 MDM Governance & Strategy</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.2 Master Data Model & Canonical Definitions</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.3 Identity Resolution & Golden Record Management</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.4 Data Quality & Stewardship</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.5 Data Lifecycle, Change Control & Provenance</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.6 Integration, Interoperability & Reference Data Management</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.7 Access, Security & Privacy for Master Data</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.8 Monitoring, Metrics & Reporting</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.9 Issue Management, Remediation & Escalation</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>9.10 Auditability & Regulatory Compliance</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>10 Related Sub-Policies</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>10.1 Master Data Standards</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>10.2 Data Quality Standard</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>10.3 Identity Resolution Guideline</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>10.4 Data Stewardship Operating Model</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 700; color: #0f172a;"><span>11 Policy Declaration & Approval</span><span style="color: #64748b;">1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; border-bottom: 1px dashed #e2e8f0; color: #475569;"><span>11.1 Policy Declaration</span><span>1</span></div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0 3px 18px; color: #475569;"><span>11.2 Approval Signatures</span><span>1</span></div>
      </div>

      <!-- 3 EXECUTIVE SUMMARY -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        3 Executive Summary
      </h2>
      <p style="margin-bottom: 14px; text-align: justify;">
        This Master Data Management (MDM) Policy establishes enterprise-level governance for creation, maintenance, stewardship and authoritative use of master data within the retail and corporate banking lines of business operating in the United Kingdom and European Union. The policy defines governance expectations for Customer, Account, Product and Legal Entity master data to ensure trusted information for client onboarding, KYC/AML, credit decisioning, regulatory reporting and customer servicing.
      </p>
      <p style="margin-bottom: 24px; text-align: justify;">
        The policy addresses enterprise objectives to strengthen data integrity, support risk-sensitive decision-making, enable regulatory compliance (including data accuracy and traceability), and reduce operational risk arising from inconsistent or duplicate master records. It aligns with and is governed by the Enterprise Master Policy, providing specific requirements for MDM capability, governance structure, stewardship responsibilities and regulatory alignment. High-level regulatory drivers include EU/UK data protection requirements (accuracy and processing principles), financial regulatory expectations for risk-data aggregation and reporting, and AML/KYC obligations; this policy establishes organizational obligations and governance direction to meet those expectations without prescribing technical implementation.
      </p>

      <!-- 4 SCOPE -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        4 Scope
      </h2>
      <p style="margin-bottom: 14px; text-align: justify;">
        This policy applies to the specified organizational, business, data, technology, operational and stakeholder boundaries described below. It defines where MDM governance applies across the enterprise and does not prescribe implementation or operational procedures.
      </p>
      
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">4.1 Organizational Scope</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          This policy applies to all subsidiaries, business units and operational locations of the enterprise that provide banking services within the United Kingdom and European Union, including retail banking, corporate banking, wealth management and centralized functions that contribute or rely upon master data (for example: Risk, Finance, Compliance, Operations).
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">4.2 Business Scope</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          This policy governs business functions and capabilities that create, maintain, approve or consume master data, including but not limited to: customer lifecycle management (onboarding, KYC), account and product management, credit decisioning, customer relationship management, regulatory reporting, finance and treasury processes, and client servicing. It applies to business processes that require consistent, authoritative master data to support operational and regulatory outcomes.
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">4.3 Data Scope</h3>
        <p style="margin-bottom: 8px; color: #334155;">This policy governs master data assets and associated metadata for the following core domains:</p>
        <ul style="padding-left: 24px; margin-bottom: 10px; color: #334155;">
          <li style="margin-bottom: 4px;">Customer master data (identity, legal names, identifiers, status, relationships)</li>
          <li style="margin-bottom: 4px;">Account master data (account identifiers, status, product mappings)</li>
          <li style="margin-bottom: 4px;">Product master data (product definitions, attributes, pricing identifiers)</li>
          <li style="margin-bottom: 4px;">Legal Entity master data (corporate identifiers, ownership structures)</li>
          <li style="margin-bottom: 4px;">Reference data that establishes canonical codes and taxonomies used by master records</li>
          <li style="margin-bottom: 4px;">Business and technical metadata required to establish provenance, stewardship and lineage for master data</li>
        </ul>
        <p style="color: #334155; text-align: justify;">
          Transactional, analytical and derived datasets that reference or depend on governed master data are within scope to the extent governance relies upon authoritative master records.
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">4.4 Technology Scope</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The policy applies across the enterprise technology landscape that stores, manages or references master data including enterprise systems (CRM, Core Banking, Credit Systems), centralized MDM capability (logical or platform-agnostic), data integration layers, data warehouses and analytics platforms, and metadata repositories. The policy is technology-neutral and does not mandate specific products or configurations.
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">4.5 Operational Scope</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          Governance applies across the master data lifecycle: creation, validation, enrichment, maintenance, usage, sharing, archival and retirement. The policy governs decision rights, stewardship activities, data quality expectations and controls at each lifecycle stage; it does not define operational procedures or technical processes.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">4.6 Stakeholder Scope</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          Stakeholders covered by this policy include Executive Leadership, Chief Data Officer, Business Data Owners, Data Stewards, Technology Custodians, Risk & Compliance functions, Privacy Office, Information Security, Internal Audit and line-of-business managers who create or consume master data. Third-party providers delivering master data services are in scope to the extent contractual arrangements embed compliance with this policy.
        </p>
      </div>

      <!-- 5 PURPOSE -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        5 Purpose
      </h2>
      
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Purpose</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          This policy establishes governance requirements for the enterprise Master Data Management capability to ensure that master data is authoritative, accurate, consistent and auditable across banking operations in the UK and EU. It exists to reduce operational, compliance and reputational risk arising from inconsistent or inaccurate master records that affect customer due diligence, risk assessment, regulatory reporting and customer experience.
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Business Objectives</h3>
        <ul style="padding-left: 24px; margin-bottom: 10px; color: #334155;">
          <li style="margin-bottom: 4px;">Provide a single source of truth for enterprise master data to support timely and accurate decision-making.</li>
          <li style="margin-bottom: 4px;">Ensure master data accuracy, completeness and integrity for KYC/AML compliance, credit risk management and regulatory reporting.</li>
          <li style="margin-bottom: 4px;">Enable accountable stewardship and clear decision rights for master data lifecycle activities.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Policy Statement</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The enterprise shall govern master data as a strategic asset. Master data creation, maintenance, use and retirement shall be subject to defined governance, stewardship, security and compliance obligations. Business owners and data stewards shall be accountable for the quality and trustworthiness of master records within their domains.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Relationship with Enterprise Master Policy</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          This policy is a child document governed by the Enterprise Master Policy and provides specific governance direction for the Master Data Management capability. It complements enterprise-level governance by detailing MDM responsibilities, data domain coverage and regulatory alignment without supplanting enterprise policies.
        </p>
      </div>

      <!-- 6 GOVERNANCE FRAMEWORK -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        6 Governance Framework
      </h2>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Purpose</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The Governance Framework defines how the enterprise will govern master data to achieve trusted information, regulatory compliance and business value. It organizes governance into domains that collectively manage strategy, stewardship, quality, interoperability, security and compliance.
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Governance Domains</h3>
        <ul style="padding-left: 24px; margin-bottom: 10px; color: #334155;">
          <li style="margin-bottom: 4px;"><strong>Strategy & Oversight</strong> — Executive alignment, investment prioritization and MDM capability governance.</li>
          <li style="margin-bottom: 4px;"><strong>Data Model & Canonical Definitions</strong> — Enterprise data model, canonical definitions and Critical Data Elements (CDEs).</li>
          <li style="margin-bottom: 4px;"><strong>Stewardship & Accountability</strong> — Business ownership, steward roles and decision rights.</li>
          <li style="margin-bottom: 4px;"><strong>Data Quality Management</strong> — Quality dimensions, measurement, thresholds and exception handling.</li>
          <li style="margin-bottom: 4px;"><strong>Identity Resolution & Golden Record</strong> — Policies for identity matching, linkage and golden record designation.</li>
          <li style="margin-bottom: 4px;"><strong>Lifecycle & Change Control</strong> — Governance for creation, change approval, versioning and retirement of master records.</li>
          <li style="margin-bottom: 4px;"><strong>Integration & Reference Data Management</strong> — Standards for interoperability, reference data authorities and mapping.</li>
          <li style="margin-bottom: 4px;"><strong>Access, Security & Privacy</strong> — Access control, least privilege, privacy preservation and data minimization for master data.</li>
          <li style="margin-bottom: 4px;"><strong>Monitoring, Metrics & Reporting</strong> — KPIs, dashboards and reporting obligations for governance performance.</li>
          <li style="margin-bottom: 4px;"><strong>Compliance, Auditability & Evidence</strong> — Recordkeeping, lineage, audit trails and regulatory evidence requirements.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Governance Principles (applied within domains)</h3>
        <ul style="padding-left: 24px; margin-bottom: 10px; color: #334155;">
          <li style="margin-bottom: 4px;"><strong>Data as an Enterprise Asset</strong> — Master data shall be managed as a core enterprise asset, with explicit valuation and accountability.</li>
          <li style="margin-bottom: 4px;"><strong>Business Ownership & Accountability</strong> — Business units shall own master data definitions and quality targets; stewardship shall be operationalized through designated roles.</li>
          <li style="margin-bottom: 4px;"><strong>Trusted Single Sources</strong> — Authoritative master records shall be defined and published for enterprise consumption.</li>
          <li style="margin-bottom: 4px;"><strong>Security & Privacy by Design</strong> — Access, processing and sharing of master data shall embed security and privacy principles.</li>
          <li style="margin-bottom: 4px;"><strong>Risk-Based Controls</strong> — Governance shall be proportionate to business and regulatory risk associated with each master data domain.</li>
          <li style="margin-bottom: 4px;"><strong>Transparency & Auditability</strong> — Provenance, lineage and decisions affecting master data shall be traceable and auditable.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Governance Oversight</h3>
        <ul style="padding-left: 24px; margin-bottom: 10px; color: #334155;">
          <li style="margin-bottom: 4px;">The Data Governance Council shall provide executive oversight of MDM strategy, approve critical CDEs, and arbitrate cross‐business conflicts.</li>
          <li style="margin-bottom: 4px;">The Chief Data Officer shall operationalize the framework and report governance performance to Executive Leadership and regulators as required.</li>
        </ul>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Decision-Making Model</h3>
        <ul style="padding-left: 24px; margin-bottom: 10px; color: #334155;">
          <li style="margin-bottom: 4px;">Strategic decisions (policy, investment, CDE designation) shall be escalated to the Data Governance Council.</li>
          <li style="margin-bottom: 4px;">Business data modeling and stewardship decisions shall be owned by Business Data Owners with Data Steward facilitation.</li>
          <li style="margin-bottom: 4px;">Technical integration and operational availability decisions shall be coordinated with Technology Custodians.</li>
        </ul>
      </div>

      <!-- 7 ROLES & RESPONSIBILITIES -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        7 Roles & Responsibilities
      </h2>
      <p style="margin-bottom: 14px; color: #334155;">
        This section defines governance accountabilities for MDM. Responsibilities are governance-focused and do not describe operational tasks.
      </p>

      <div style="margin-bottom: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 4px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 4px;">7.1 Executive Sponsor</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Provide visible executive support and ensure alignment with enterprise strategy.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Responsibilities:</p>
        <ul style="font-size: 13px; color: #334155; padding-left: 20px; margin: 0;">
          <li>Sponsor enterprise MDM objectives and secure necessary investment.</li>
          <li>Endorse MDM policy, strategy and major governance decisions.</li>
          <li>Champion cross-functional cooperation and escalation resolution.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 4px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 4px;">7.2 Business Owner</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Own business outcomes and accountability for master data within a business domain.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Responsibilities:</p>
        <ul style="font-size: 13px; color: #334155; padding-left: 20px; margin: 0;">
          <li>Define and approve business definitions, CDEs and acceptable quality levels for domain master data.</li>
          <li>Authorize major changes to master data definitions or golden record policy for their domain.</li>
          <li>Ensure business processes incorporate authoritative master data in operational decision-making.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 4px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 4px;">7.3 Data Owner</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Maintain formal accountability for the accuracy and fitness-for-purpose of master data.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Responsibilities:</p>
        <ul style="font-size: 13px; color: #334155; padding-left: 20px; margin: 0;">
          <li>Accept accountability for data quality, lifecycle decisions and regulatory obligations for assigned master data.</li>
          <li>Approve data stewardship assignments and delegated decision rights.</li>
          <li>Validate that master data meets business, risk and regulatory requirements.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 4px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 4px;">7.4 Data Steward</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Act as the day-to-day governance representative for master data domains.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Responsibilities:</p>
        <ul style="font-size: 13px; color: #334155; padding-left: 20px; margin: 0;">
          <li>Coordinate stewardship activities, maintain metadata and ensure adherence to canonical definitions.</li>
          <li>Facilitate remediation of data quality issues and manage exception processes in collaboration with Data Owners.</li>
          <li>Maintain documentation of lineage, business rules and stewardship decisions.</li>
        </ul>
      </div>

      <div style="margin-bottom: 16px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 4px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 4px;">7.5 Technology Custodian</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Provide governance-aligned operational custody of systems and technical controls that store or process master data.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Responsibilities:</p>
        <ul style="font-size: 13px; color: #334155; padding-left: 20px; margin: 0;">
          <li>Ensure systems support required provenance, audit logging and access controls to meet governance obligations.</li>
          <li>Collaborate with Data Stewards to enable data lineage, integration and interoperability requirements.</li>
          <li>Validate technical controls supporting data quality and security are in place and documented.</li>
        </ul>
      </div>

      <div style="margin-bottom: 24px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 4px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 4px;">7.6 Risk, Security & Compliance</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Provide independent oversight of risk, privacy and regulatory compliance aspects of master data governance.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Responsibilities:</p>
        <ul style="font-size: 13px; color: #334155; padding-left: 20px; margin: 0;">
          <li>Validate that MDM governance meets regulatory expectations for accuracy, traceability and privacy.</li>
          <li>Assess residual risk related to master data usage and provide recommendations for mitigating controls.</li>
          <li>Coordinate regulatory reporting implications and audit readiness activities with Data Owners and Stewards.</li>
        </ul>
      </div>

      <!-- 8 REGULATORY MAPPING -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        8 Regulatory Mapping
      </h2>
      <p style="margin-bottom: 14px; color: #334155; text-align: justify;">
        The table below maps relevant regulations and standards to governance requirements and indicates how this policy supports compliance.
      </p>

      <div style="overflow-x: auto; margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed;">
          <colgroup>
            <col style="width: 30%;" />
            <col style="width: 35%;" />
            <col style="width: 35%;" />
          </colgroup>
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Regulation / Standard</th>
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Governance Requirement</th>
              <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11px; text-transform: uppercase;">Policy Coverage</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">EU General Data Protection Regulation (GDPR) & UK GDPR</td>
              <td style="padding: 10px 12px; color: #334155;">Ensure accuracy, updateability, lawful basis for processing, and data subject rights for personal master data.</td>
              <td style="padding: 10px 12px; color: #334155;">Establishes accuracy, provenance, stewardship and privacy-aligned access controls for Customer master records.</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Anti-Money Laundering Directives / AML Regulations (EU/UK)</td>
              <td style="padding: 10px 12px; color: #334155;">Maintain accurate, verifiable identity and relationship data to support customer due diligence and transaction monitoring.</td>
              <td style="padding: 10px 12px; color: #334155;">Requires authoritative Customer and Legal Entity master records, stewardship accountability and evidence of validation.</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Basel Committee on Banking Supervision (BCBS 239) — Risk Data Aggregation & Reporting</td>
              <td style="padding: 10px 12px; color: #334155;">Ensure completeness, accuracy, timeliness and governance of risk-critical master data used in aggregation and reporting.</td>
              <td style="padding: 10px 12px; color: #334155;">Requires CDE identification, governance oversight, lineage and quality metrics for master data used in risk reporting.</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Financial Conduct Authority (FCA) / National Supervisory Authorities</td>
              <td style="padding: 10px 12px; color: #334155;">Demonstrate governance, controls and evidence supporting customer outcomes, reporting and operational resilience.</td>
              <td style="padding: 10px 12px; color: #334155;">Policy prescribes stewardship, auditability and decision rights supporting regulatory evidence and reporting.</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">Payment Services Directive (PSD2) — where applicable</td>
              <td style="padding: 10px 12px; color: #334155;">Maintain consistent customer and account identifiers to support secure payment initiation and reconciliation.</td>
              <td style="padding: 10px 12px; color: #334155;">Governance for Account and Customer master data supporting secure and auditable payment processes.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="margin-bottom: 24px; color: #475569; font-size: 13px; text-align: justify; font-style: italic;">
        This policy provides governance direction to meet the obligations above through defined stewardship, CDE designation, quality targets, provenance and access controls; detailed implementation and controls shall be reflected in supporting standards and procedures.
      </p>

      <!-- 9 POLICY REQUIREMENTS -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        9 Policy Requirements
      </h2>
      <p style="margin-bottom: 16px; color: #334155; text-align: justify;">
        This section defines governance requirements for enterprise Master Data Management. Each governance domain states expectations, direction and accountability without prescribing operational implementation.
      </p>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.1 MDM Governance & Strategy</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Ensure enterprise alignment and sustainable MDM capability.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">The enterprise shall maintain an MDM strategy approved by the Data Governance Council that articulates objectives, scope, operating model and investment priorities.</li>
          <li style="margin-bottom: 4px;">MDM governance shall be integrated with enterprise risk and compliance frameworks; funding and resources shall be commensurate with criticality of master data.</li>
          <li style="margin-bottom: 4px;">The Data Governance Council shall approve the enterprise list of Critical Data Elements (CDEs) and the criteria for designation.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.2 Master Data Model & Canonical Definitions</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Establish consistent semantics and authoritative definitions.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">The enterprise shall maintain and publish a canonical enterprise data model for master data domains that defines business semantics, mandatory attributes and relationships.</li>
          <li style="margin-bottom: 4px;">Business Owners shall be accountable for approving canonical definitions for their domain; definitions shall be discoverable via enterprise metadata.</li>
          <li style="margin-bottom: 4px;">All master data attributes identified as CDEs shall have documented business definitions, accepted value domains, and clear source system authorities.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.3 Identity Resolution & Golden Record Management</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Provide governance for entity resolution, deduplication and authoritative record designation.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">The enterprise shall define and document the governance criteria for identity matching, record linkage and conditions under which a golden record is established, modified or deprecated.</li>
          <li style="margin-bottom: 4px;">Golden record designations shall be explicit, documented, and authorized by the relevant Business Owner; provenance and linkage decisions shall be retained as auditable metadata.</li>
          <li style="margin-bottom: 4px;">Rules for resolving conflicts between source systems shall be governed by business-approved precedence and reconciliation policies.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.4 Data Quality & Stewardship</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Ensure master data meets business and regulatory quality expectations.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">Data Owners shall set measurable quality targets and thresholds for master data attributes and CDEs, aligned to business use-cases and regulatory obligations.</li>
          <li style="margin-bottom: 4px;">Data Stewards shall monitor quality metrics, report exceptions, and coordinate remediation; material quality exceptions that affect business or regulatory outcomes shall be escalated per governance procedures.</li>
          <li style="margin-bottom: 4px;">Quality expectations shall consider accuracy, completeness, timeliness, consistency and uniqueness; measurement definitions and reporting cadence shall be defined in supporting standards.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.5 Data Lifecycle, Change Control & Provenance</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Govern master data changes and provide traceable provenance.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">Changes to canonical definitions, CDE status, or golden record determination shall follow formal change control governance with documented approvals by Business Owners and notification to impacted stakeholders.</li>
          <li style="margin-bottom: 4px;">Master data lifecycle states (creation, active, dormant, archived, retired) shall be defined; transitions shall be governed and recorded with authoritative timestamps and responsible parties.</li>
          <li style="margin-bottom: 4px;">Provenance metadata capturing source system, steward actions and change rationale shall be maintained to support auditability and regulatory inquiries.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.6 Integration, Interoperability & Reference Data Management</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Ensure consistent use of reference data and interoperability across systems.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">The enterprise shall designate authoritative sources for reference data and maintain controlled mapping between enterprise canonical codes and local system codes.</li>
          <li style="margin-bottom: 4px;">Integration patterns and data exchange semantics for master data shall be governed to ensure consumers receive authoritative values and mapping metadata.</li>
          <li style="margin-bottom: 4px;">Reference data authorities and stewardship shall be subject to the same governance, change control and quality expectations as master data.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.7 Access, Security & Privacy for Master Data</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Protect master data confidentiality, integrity and privacy in line with regulatory obligations.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">Access to master data shall be governed by least-privilege principles; authorization for elevated access shall be approved by Business Owners and logged.</li>
          <li style="margin-bottom: 4px;">Master data containing personal data shall be processed in accordance with applicable data protection requirements; Data Owners shall ensure lawful bases, retention limits and data subject rights are respected.</li>
          <li style="margin-bottom: 4px;">Security and encryption expectations for master data at rest and in transit shall be defined in supporting security standards; Technology Custodians shall ensure systems can provide required audit trails.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.8 Monitoring, Metrics & Reporting</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Provide transparency and measure MDM effectiveness.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">The enterprise shall maintain a dashboard of MDM metrics covering CDE quality, exception volumes, stewardship performance and remediation progress; the Chief Data Officer shall report these metrics to Executive Leadership and the Data Governance Council.</li>
          <li style="margin-bottom: 4px;">Key performance indicators shall be defined for business-relevant outcomes (e.g., percentage of verified customer identities, duplicate rate, time-to-remediate critical issues).</li>
          <li style="margin-bottom: 4px;">Regular reporting shall include material incidents that affect regulatory reporting or customer outcomes and actions taken to remediate.</li>
        </ul>
      </div>

      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.9 Issue Management, Remediation & Escalation</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Ensure timely resolution of material master data issues.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">Data Stewards shall triage data quality incidents and coordinate remediation with Business Owners and Technology Custodians; incident classification criteria and escalation paths shall be established.</li>
          <li style="margin-bottom: 4px;">Material issues that present regulatory, financial or reputational risk shall be escalated to the Data Governance Council and Risk function within defined timeframes.</li>
          <li style="margin-bottom: 4px;">Remediation plans shall include root cause assessment, corrective actions and verification of effectiveness; evidence of remediation shall be retained for audit.</li>
        </ul>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">9.10 Auditability & Regulatory Compliance</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>Purpose:</strong> Maintain evidence of governance and compliance for regulators and auditors.</p>
        <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Requirements:</p>
        <ul style="padding-left: 24px; margin-bottom: 0; color: #334155; font-size: 13px;">
          <li style="margin-bottom: 4px;">The enterprise shall retain auditable evidence of stewardship decisions, provenance, change approvals and remediation activities for master data sufficient to support regulatory examinations.</li>
          <li style="margin-bottom: 4px;">Periodic governance reviews and independent audits shall assess adherence to this policy and the effectiveness of MDM controls; deficiencies shall be remediated under Risk oversight.</li>
          <li style="margin-bottom: 4px;">Where master data supports regulated activities (e.g., KYC, capital calculations), Data Owners shall demonstrate that data meets regulatory accuracy and traceability expectations.</li>
        </ul>
      </div>

      <!-- 10 RELATED SUB-POLICIES -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        10 Related Sub-Policies
      </h2>
      
      <div style="margin-bottom: 14px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">10.1 Master Data Standards</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The Master Data Standards document shall define required attribute-level definitions, allowable value sets, metadata requirements and CDE classification rules. It supports this policy by operationalizing canonical definitions and providing consistent technical and business standards for master data across the enterprise.
        </p>
      </div>

      <div style="margin-bottom: 14px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">10.2 Data Quality Standard</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The Data Quality Standard shall specify quality dimensions, measurement methodologies, acceptable thresholds and reporting formats. It supports this policy by translating governance expectations for accuracy, completeness, timeliness and uniqueness into measurable quality controls and monitoring requirements.
        </p>
      </div>

      <div style="margin-bottom: 14px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">10.3 Identity Resolution Guideline</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The Identity Resolution Guideline shall provide governance direction for matching logic, confidence scoring, duplicate handling and golden record criteria. It supports this policy by ensuring identity linkage practices are governed, auditable and aligned with business risk and regulatory obligations.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">10.4 Data Stewardship Operating Model</h3>
        <p style="margin-bottom: 10px; color: #334155; text-align: justify;">
          The Data Stewardship Operating Model shall define steward role profiles, operating procedures for stewardship activities and collaboration mechanisms with Technology Custodians and Business Owners. It supports this policy by specifying how stewardship responsibilities are organized and executed to meet governance obligations.
        </p>
      </div>

      <!-- 11 POLICY DECLARATION & APPROVAL -->
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 36px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        11 Policy Declaration & Approval
      </h2>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">11.1 Policy Declaration</h3>
        <p style="margin-bottom: 14px; color: #334155; text-align: justify;">
          This Master Data Management Policy establishes enterprise governance requirements for the Master Data Management capability within the Retail and Corporate Banking domains operating in the United Kingdom and European Union. It is governed by the Enterprise Master Policy and sets mandatory governance expectations for master data domains including Customer, Account, Product and Legal Entity data. The governance responsibilities, requirements and obligations described herein are subject to enterprise approval and shall be enforced by the Data Governance Council, Chief Data Officer and Business Owners in accordance with the Enterprise Master Policy.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">11.2 Approval Signatures</h3>
        <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
            <colgroup>
              <col style="width: 35%;" />
              <col style="width: 25%;" />
              <col style="width: 25%;" />
              <col style="width: 15%;" />
            </colgroup>
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Approval Role</th>
                <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Name</th>
                <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Signature</th>
                <th style="padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; font-size: 11.5px; text-transform: uppercase;">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 12px; font-weight: 700;">Policy Owner</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________________</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________________</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafafa;">
                <td style="padding: 12px 12px; font-weight: 700;">Approval Authority</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________________</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________________</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________</td>
              </tr>
              <tr>
                <td style="padding: 12px 12px; font-weight: 700;">Data Governance Council Representative</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________________</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________________</td>
                <td style="padding: 12px 12px; color: #94a3b8;">__________</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
};
