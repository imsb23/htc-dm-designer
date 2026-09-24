export interface KBArticle {
  id: string;
  category: 'Governance Kit' | 'Strategy and Studio' | 'Technical Studio' | 'Enterprise Architecture';
  title: string;
  badge: string;
  readTime: string;
  version: string;
  targetPersonas: string[];
  summary: string;
  businessValue: string[];
  prerequisites: string[];
  capabilities: {
    name: string;
    description: string;
  }[];
  workflow: string[];
  deliverables: string[];
  standards: string[];
  bestPractices: string[];
  relatedModuleTab?: string;
}

export const KNOWLEDGE_BASE_ARTICLES: KBArticle[] = [
  // -------------------------------------------------------------
  // 1. GOVERNANCE KIT
  // -------------------------------------------------------------
  {
    id: 'policy-generator',
    category: 'Governance Kit',
    title: 'Enterprise Policy Generator & Compliance Suite',
    badge: 'Enterprise Governance Core',
    readTime: '6 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Chief Data Officer (CDO)', 'Data Governance Council', 'Compliance Officer', 'Solution Architect'],
    summary: 'The Enterprise Policy Generator standardizes and automates the creation of rigorous, audit-proof data policies across regulatory frameworks including ISO 27001, GDPR, HIPAA, BCBS 239, and SOC 2. Features real-time Word-style canvas editing, multi-page vector PDF export, and automatic local-first caching.',
    businessValue: [
      'Compresses policy authoring cycle from 3-4 weeks of committee meetings to under 3 minutes.',
      'Ensures 100% adherence to corporate legal standards, metadata headers, and audit trails.',
      'Includes built-in enforcement mechanics, risk severity matrices, and mandatory review cadences.',
      'Eliminates vendor lock-in with dual-format Word (.docx) and high-resolution (.pdf) multi-page outputs.'
    ],
    prerequisites: [
      'Identification of target industry and regulatory jurisdiction (e.g., Banking, Healthcare, Life Sciences).',
      'Optional: Organization-specific security classifications or internal mandate references.',
      'Web browser with local storage enabled for seamless background auto-saving.'
    ],
    capabilities: [
      {
        name: 'Regulatory Framework Mapping',
        description: 'Dynamically aligns policy clauses to global compliance frameworks (GDPR Art. 30/32, HIPAA § 164.312, BCBS 239 Risk Aggregation, ISO/IEC 27001:2022).'
      },
      {
        name: 'Interactive Rich-Text Word Canvas',
        description: 'WYSIWYG document editor allowing immediate in-place revisions, heading levels, font treatments, and table styling prior to formal publication.'
      },
      {
        name: 'Auto-Save & Version Cache',
        description: 'Continuously persists modifications to local memory with visual timestamp indicators, preventing accidental data loss across browser reloads.'
      },
      {
        name: 'Dual Vector PDF & DOCX Export',
        description: 'Outputs publication-ready documents with customized enterprise headers, page numbering (Page X of Y), confidentiality disclaimers, and sign-off blocks.'
      }
    ],
    workflow: [
      'Step 1: Select Industry Domain (Financial Services, Healthcare, Retail, Supply Chain, Technology).',
      'Step 2: Enter policy subject matter or select from pre-configured enterprise templates (e.g., Data Retention, PII Handling, Master Data Governance).',
      'Step 3: Trigger Synthesis to generate complete policy sections: Purpose, Scope, Roles & Responsibilities, Standards, Compliance Controls, and Breach Remediation.',
      'Step 4: Refine content in the live Word Canvas with real-time auto-saving.',
      'Step 5: Export high-resolution A4 Multi-page PDF or editable Microsoft Word (.docx) artifact.'
    ],
    deliverables: [
      'Editable Microsoft Word Document (.docx)',
      'Vector High-Resolution Multi-page PDF (.pdf)',
      'Structured Cloud Blob JSON for Enterprise Catalog ingestion'
    ],
    standards: ['ISO/IEC 27001:2022', 'NIST Cybersecurity Framework 2.0', 'DAMA-DMBOK2 Chapter 3', 'GDPR / CCPA / HIPAA'],
    bestPractices: [
      'Review generated exception approval authorities to ensure alignment with your internal delegation of authority (DoA).',
      'Re-validate retention schedules against local statutory requirements before formal executive ratification.',
      'Publish PDF copies to your centralized Intranet or enterprise catalog (Informatica CDGC, Collibra) for company-wide distribution.'
    ],
    relatedModuleTab: 'policy-generator'
  },
  {
    id: 'glossary-generator',
    category: 'Governance Kit',
    title: 'Authoritative Business Glossary & Semantic Engine',
    badge: 'Data Stewardship Core',
    readTime: '5 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Business Data Steward', 'Data Governance Lead', 'Enterprise Data Architect', 'BI Developers'],
    summary: 'The Business Glossary Generator creates consistent semantic definitions, approved business abbreviations, domain calculations, and regulatory sensitivity tags across business lines. It bridges communication gaps between business teams and engineering implementations.',
    businessValue: [
      'Eliminates metric calculation discrepancies (e.g., ARR, Active Customer, Net Retention) across departments.',
      'Pre-labels data elements with privacy tags (PII, Confidential, Public, Sensitive PII) for automated access policies.',
      'Accelerates migration into enterprise data governance platforms like Informatica Cloud Data Governance and Catalog (CDGC).'
    ],
    prerequisites: [
      'Target domain boundary (e.g., Customer Master, Financial Accounting, Clinical Trials).',
      'Existing documentation, data dictionaries, or informal term lists.'
    ],
    capabilities: [
      {
        name: 'Domain Semantic Analysis',
        description: 'Generates unambiguous, DAMA-standard business definitions, technical aliases, and calculation formulas.'
      },
      {
        name: 'Regulatory Classification Tagging',
        description: 'Automatically annotates terms with regulatory implications (e.g., GDPR Article 9 Special Category, PCI-DSS Cardholder Data).'
      },
      {
        name: 'Stewardship Assignment Matrix',
        description: 'Maps primary business stewards and technical owners to each term for ongoing lifecycle accountability.'
      }
    ],
    workflow: [
      'Step 1: Specify enterprise domain and industry classification.',
      'Step 2: Upload source data or input candidate terms for standardization.',
      'Step 3: Generate normalized definitions, formulas, and security tags.',
      'Step 4: Review and approve authoritative definitions.',
      'Step 5: Export as structured metadata or CSV/Excel for catalog import.'
    ],
    deliverables: ['Business Glossary Master Catalog', 'Regulatory Tagging Matrix', 'CSV/Excel Import Package'],
    standards: ['DAMA-DMBOK2 Chapter 12: Reference & Master Data', 'ISO 11179 Metadata Standards'],
    bestPractices: [
      'Assign an executive sponsor for critical cross-functional terms with conflicting historical formulas.',
      'Sync glossary entries quarterly to incorporate evolving regulatory compliance updates.'
    ],
    relatedModuleTab: 'glossary-generator'
  },
  {
    id: 'raci-generator',
    category: 'Governance Kit',
    title: 'DAMA-Standard RACI Responsibility Matrix',
    badge: 'Accountability Framework',
    readTime: '4 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Program Manager', 'Data Governance Director', 'Scrum Master', 'Lead Architect'],
    summary: 'Generates comprehensive, DAMA-aligned RACI accountability frameworks. Clarifies which teams are Responsible, Accountable, Consulted, and Informed across every phase of data capture, processing, stewardship, quality management, and archival.',
    businessValue: [
      'Removes organizational friction and eliminates finger-pointing during data incidents or audit failures.',
      'Ensures single-point accountability for sensitive datasets and regulatory reporting.',
      'Standardizes project delivery handoffs between business stewards, architecture, and offshore engineering.'
    ],
    prerequisites: [
      'High-level organizational hierarchy and stakeholder department list.',
      'Scope of the data modernization or operational data program.'
    ],
    capabilities: [
      {
        name: 'Cross-Functional Stakeholder Mapping',
        description: 'Coordinates roles across Executive Committee, Data Stewards, Cloud Architects, and QA Engineers.'
      },
      {
        name: 'Lifecycle Phase Decomposition',
        description: 'Breaks responsibilities into Ingestion, Modeling, Quality Remediation, Security/Access, and Decommissioning.'
      },
      {
        name: 'DAMA Rule Enforcement',
        description: 'Ensures exactly one "Accountable" role per task to prevent governance ambiguity.'
      }
    ],
    workflow: [
      'Step 1: Input project type and operational stakeholders.',
      'Step 2: Select governance model (Centralized, Federated, or Hybrid/Hub-and-Spoke).',
      'Step 3: Synthesize comprehensive RACI matrix with role definitions.',
      'Step 4: Customize role mappings and export formal governance charter.'
    ],
    deliverables: ['Interactive Governance Matrix', 'Charter Sign-off Documentation', 'Audit Readiness Role Registry'],
    standards: ['DAMA-DMBOK2 Chapter 3: Data Governance Organization', 'COBIT 2019 Framework'],
    bestPractices: [
      'Verify that technical leads are designated as Consulted rather than Accountable for business rule validations.',
      'Share RACI matrices with all delivery partners during initial sprint planning.'
    ],
    relatedModuleTab: 'raci-generator'
  },

  // -------------------------------------------------------------
  // 2. STRATEGY AND STUDIO
  // -------------------------------------------------------------
  {
    id: 'project-describer',
    category: 'Strategy and Studio',
    title: 'Neural RFP Intelligence & Project Describer',
    badge: 'Strategic Discovery',
    readTime: '7 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Bid Manager', 'Lead Solution Architect', 'Enterprise Presales Director', 'Delivery Head'],
    summary: 'Deconstructs massive RFP, RFI, and statement-of-work (SOW) documents using advanced document parsing. Identifies core business objectives, technical constraints, non-functional requirements (NFRs), and recommends optimal cloud and data architectures.',
    businessValue: [
      'Reduces proposal discovery and technical scoping time from 10 days to under 15 minutes.',
      'Detects hidden risks and unstated technical constraints before submitting commercial bids.',
      'Suggests optimal target modern architectures (Snowflake, Databricks, Informatica IDMC, AWS, Azure, GCP).'
    ],
    prerequisites: [
      'Source technical tender, client brief, or RFP in PDF, DOCX, or text format.'
    ],
    capabilities: [
      {
        name: 'Multi-Modal RFP Parser',
        description: 'Processes multi-page complex RFPs, extracting tables, technical specifications, and milestones.'
      },
      {
        name: 'Automated Tech Stack Recommender',
        description: 'Analyzes client requirements and matches them against proven cloud architectures and integration patterns.'
      },
      {
        name: 'Risk & Gap Analysis',
        description: 'Highlights critical ambiguities, non-functional SLAs, and potential delivery bottlenecks.'
      }
    ],
    workflow: [
      'Step 1: Upload RFP document or paste client specification notes.',
      'Step 2: Trigger Deep Analysis to decompose requirements into functional and non-functional streams.',
      'Step 3: Review synthesized project executive summary, architectural risks, and timeline milestones.',
      'Step 4: Push structured requirements directly to Solution Designer or Smart Estimator with one click.'
    ],
    deliverables: ['Executive RFP Summary', 'Requirements Traceability Matrix', 'Target Tech Stack Recommendations'],
    standards: ['TOGAF 10 Enterprise Architecture', 'PMI PMBOK Scope Management'],
    bestPractices: [
      'Review extracted non-functional requirements (RPO/RTO, concurrent user capacity) to validate cloud tiering.',
      'Use the generated executive summary directly in proposal executive briefs.'
    ],
    relatedModuleTab: 'project-describer'
  },
  {
    id: 'adhoc-estimator',
    category: 'Strategy and Studio',
    title: 'Smart Workload & Effort Estimator',
    badge: 'Financial & Resource Planning',
    readTime: '6 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Engagement Director', 'Practice Lead', 'Delivery Manager', 'Pricing Analyst'],
    summary: 'A precision workload and resource modeling engine designed specifically for complex enterprise data implementations. Calculates staffing requirements, sprint timelines, and cost models across MDM, Data Integration, Data Quality, and Governance.',
    businessValue: [
      'Replaces subjective guesswork with defensible, algorithmic effort estimation grounded in industry benchmarks.',
      'Supports multi-rate blended staffing models (Onsite, Nearshore, Offshore) to optimize commercial competitiveness.',
      'Generates instantaneous phased delivery roadmaps with milestone gates and contingency buffers.'
    ],
    prerequisites: [
      'Entity counts, source systems count, and integration frequency (Batch, Real-Time, CDC).',
      'Target deployment topology (Cloud Native, Hybrid, Multi-Cloud).'
    ],
    capabilities: [
      {
        name: '4-Pillar Complexity Scoring',
        description: 'Evaluates workload complexity across MDM, DI, DQ, and Data Governance independently.'
      },
      {
        name: 'Staffing Pyramid Calculator',
        description: 'Calculates optimal headcounts for Lead Architects, Senior Engineers, Data Stewards, and QA Testers.'
      },
      {
        name: 'Roadmap & Sprint Visualizer',
        description: 'Renders timeline phase charts from Foundation & Ingestion through Golden Record Synthesis and Hypercare.'
      }
    ],
    workflow: [
      'Step 1: Configure project parameters (Number of entities, legacy sources, SLA expectations).',
      'Step 2: Adjust complexity weights and team delivery location ratios.',
      'Step 3: Calculate person-months, resource staffing breakdown, and budget estimates.',
      'Step 4: Download comprehensive estimation spreadsheet or proposal-ready cost schedule.'
    ],
    deliverables: ['Resource Staffing Plan', 'Sprint Burn-down & Phased Roadmap', 'Excel-compatible Effort Breakdown'],
    standards: ['IFPUG Function Point Analysis', 'COCOMO II Estimation Methodology'],
    bestPractices: [
      'Include a 15% buffer for source data legacy discrepancies when legacy systems lack current DDL documentation.',
      'Coordinate with the Solution Designer to ensure architectural complexity is mirrored in the estimate.'
    ],
    relatedModuleTab: 'adhoc-estimator'
  },
  {
    id: 'design-module',
    category: 'Strategy and Studio',
    title: 'AI Solution Designer & HLD Studio',
    badge: 'Architecture Engine',
    readTime: '8 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Chief Architect', 'Principal Cloud Architect', 'Enterprise Solutions Lead'],
    summary: 'The flagship architecture synthesis engine of HTC Copilot. Transforms business requirements and technical inputs into comprehensive High-Level Design (HLD) specifications, C4 architecture models, component blueprints, and security architectures.',
    businessValue: [
      'Synthesizes complete, production-grade 30+ page HLD specifications in under 5 minutes.',
      'Incorporates industry-specific compliance rules and cloud vendor best practices (AWS, Azure, GCP, Snowflake).',
      'Feeds architecture decisions directly to all downstream technical modules through global sync.'
    ],
    prerequisites: [
      'Client business drivers and core data integration objectives.',
      'Preferred cloud platform and technology ecosystem (e.g., Informatica IDMC + Snowflake on AWS).'
    ],
    capabilities: [
      {
        name: 'Multi-Perspective Blueprint Synthesis',
        description: 'Generates targeted architecture views for Executive Leaders, System Architects, and DevOps Teams.'
      },
      {
        name: 'C4 Component Architecture Modeling',
        description: 'Structures designs into Context, Container, Component, and Code architectural levels.'
      },
      {
        name: 'Security & Network Boundary Scoping',
        description: 'Details ingress/egress points, KMS encryption, IAM role hierarchies, and private networking.'
      }
    ],
    workflow: [
      'Step 1: Create a new Solution Request or link existing RFP from Project Describer.',
      'Step 2: Configure deployment model, target databases, and integration cadences.',
      'Step 3: Run AI Architecture Synthesis to generate comprehensive HLD sections.',
      'Step 4: Review, edit, and export complete Solution Architecture dossier.'
    ],
    deliverables: ['High-Level Design (HLD) Document', 'Component Blueprint Schematics', 'Security Architecture Dossier'],
    standards: ['TOGAF 10 Framework', 'C4 Model for Software Architecture', 'AWS Well-Architected Framework'],
    bestPractices: [
      'Document architectural decisions (ADRs) directly in the rationale section to streamline Architecture Review Board approval.',
      'Sync design parameters with Solution Doc Pro to generate 1:1 technical development specifications.'
    ],
    relatedModuleTab: 'design-module'
  },

  // -------------------------------------------------------------
  // 3. TECHNICAL STUDIO
  // -------------------------------------------------------------
  {
    id: 'adhoc-architecture',
    category: 'Technical Studio',
    title: 'Blueprint Studio & Architectural Canvas',
    badge: 'Visual System Flow',
    readTime: '5 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Solutions Architect', 'Data Engineer', 'Systems Integrator'],
    summary: 'An interactive architectural canvas and diagramming workspace. Allows architects to create freehand flow diagrams or leverage AI Block Synthesis to convert narrative architectural descriptions into clean Mermaid.js and vector visual diagrams.',
    businessValue: [
      'Bridges the gap between written technical specifications and visual architecture representations.',
      'Generates standard Mermaid code for version-controlled documentation in Git repositories.',
      'Supports high-resolution SVG and PNG exports for client presentations and architecture sign-offs.'
    ],
    prerequisites: ['Architecture narrative or system component list.'],
    capabilities: [
      {
        name: 'AI Block Flow Synthesis',
        description: 'Translates textual component descriptions into connected system topology diagrams.'
      },
      {
        name: 'Mermaid.js Code Engine',
        description: 'Live bidirectional editing between visual nodes and declarative Mermaid diagram code.'
      },
      {
        name: 'Export to High-Res Vector',
        description: 'Outputs crystal-clear vector graphics suitable for large format printing or slide presentations.'
      }
    ],
    workflow: [
      'Step 1: Enter architecture description or select predefined topology (Hub-and-Spoke, Mesh, Lakehouse).',
      'Step 2: Generate visual flow and inspect interactive nodes.',
      'Step 3: Customize labels, protocols, and styling in the canvas.',
      'Step 4: Copy Mermaid syntax or export vector graphic.'
    ],
    deliverables: ['Interactive System Diagram', 'Mermaid.js Source Code', 'SVG/PNG Diagram Assets'],
    standards: ['UML 2.5 Sequence & Component Diagrams', 'C4 Model System Diagrams'],
    bestPractices: [
      'Keep component clusters bounded by security zones (DMZ, Internal VPC, Analytics Tier).',
      'Store Mermaid snippets in your project GitHub repository for automated documentation builds.'
    ],
    relatedModuleTab: 'adhoc-architecture'
  },
  {
    id: 'data-modeler',
    category: 'Technical Studio',
    title: 'Domain Schema Modeler & Golden Record Synthesizer',
    badge: 'Schema Engineering',
    readTime: '6 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Data Modeler', 'Database Administrator (DBA)', 'Data Warehouse Engineer'],
    summary: 'Synthesizes enterprise-grade relational schemas, dimensional star schemas, and MDM golden record models. Outputs production-ready SQL DDL with primary/foreign keys, indexing strategies, audit tracking columns, and constraint validations.',
    businessValue: [
      'Eliminates manual DDL writing and schema drafting errors.',
      'Enforces enterprise naming conventions and standard audit columns (CREATED_AT, UPDATED_BY, HASH_DIFF).',
      'Generates dialect-specific SQL for Snowflake, BigQuery, PostgreSQL, Databricks, and Oracle.'
    ],
    prerequisites: ['Entity definitions or business domain attributes.'],
    capabilities: [
      {
        name: 'Dialect-Specific DDL Generator',
        description: 'Outputs optimized SQL statements tailored to the syntax and clustering features of target engines.'
      },
      {
        name: 'Relationship & Foreign Key Modeling',
        description: 'Establishes referential integrity constraints, bridge tables, and cardinality rules.'
      },
      {
        name: 'MDM Golden Record Structure',
        description: 'Embeds match-and-merge lineage tracking attributes, source system identifiers, and survivorship timestamps.'
      }
    ],
    workflow: [
      'Step 1: Define primary entity and business context.',
      'Step 2: Select target database engine (Snowflake, PostgreSQL, BigQuery, etc.).',
      'Step 3: Generate normalized schema with primary keys, relationships, and audit metadata.',
      'Step 4: Copy ready-to-execute SQL DDL or export ER schema definition.'
    ],
    deliverables: ['Production SQL DDL Scripts', 'Entity-Relationship Documentation', 'MDM Survivorship Schema'],
    standards: ['Third Normal Form (3NF)', 'Kimball Dimensional Modeling', 'Data Vault 2.0'],
    bestPractices: [
      'Always verify column datatypes against source transactional system ranges before running migrations.',
      'Leverage surrogate keys for dimension tables to protect against operational source key churn.'
    ],
    relatedModuleTab: 'data-modeler'
  },
  {
    id: 'case-story',
    category: 'Technical Studio',
    title: 'Case Story Deck & Executive Slide Builder',
    badge: 'Executive Presentation',
    readTime: '5 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Client Partner', 'Executive Sponsor', 'Marketing Director', 'Engagement Lead'],
    summary: 'Transforms complex technical data transformations into compelling C-level case study presentations. Synthesizes business challenges, architectural solutions, implementation timelines, and quantifiable ROI metrics into ready-to-present slide narratives.',
    businessValue: [
      'Accelerates client case study production from days to seconds.',
      'Presents quantifiable business impact (e.g., 40% query performance gain, $2.1M cloud cost reduction).',
      'Equips commercial and technical teams with polished presentation collateral for steering committee meetings.'
    ],
    prerequisites: ['Project technical summary, client context, and key delivery outcomes.'],
    capabilities: [
      {
        name: 'Narrative Arc Structuring',
        description: 'Organizes slide presentations into Executive Problem, Solution Architecture, Key Milestones, and Quantifiable ROI.'
      },
      {
        name: 'Metrics & Value Realization Engine',
        description: 'Formulates clear KPI scorecards demonstrating before-and-after improvements.'
      },
      {
        name: 'Executive Slide Layouts',
        description: 'Generates clean, presentation-ready slide cards designed for high readability.'
      }
    ],
    workflow: [
      'Step 1: Select project domain or link existing Solution Design session.',
      'Step 2: Input customer achievements, metric improvements, and platform highlights.',
      'Step 3: Generate structured executive slide deck.',
      'Step 4: Review slide narratives and export presentation.'
    ],
    deliverables: ['Executive Case Presentation Deck', 'Client Proof-of-Value Summary', 'Marketing One-Pager Narrative'],
    standards: ['Pyramid Principle Communication', 'Gartner ROI Metric Framework'],
    bestPractices: [
      'Lead with quantifiable business ROI rather than infrastructure component specs on the title slide.',
      'Highlight compliance risk reduction metrics for enterprise banking and healthcare presentations.'
    ],
    relatedModuleTab: 'case-story'
  },
  {
    id: 'dq-module',
    category: 'Technical Studio',
    title: 'Neural Data Quality (DQ) & Remediation Engine',
    badge: 'Quality & Audit Core',
    readTime: '6 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Data Quality Analyst', 'Data Steward', 'Data Pipeline Engineer', 'Compliance Lead'],
    summary: 'Applies the industry-standard 6 core data quality dimensions (Accuracy, Completeness, Consistency, Timeliness, Uniqueness, Validity) across data assets. Automatically detects sensitive data exposures (PII/SPDI) and produces executable SQL remediation fix scripts.',
    businessValue: [
      'Pre-empts data contamination before bad records propagate to executive dashboards and ML models.',
      'Generates automated SQL cleansing scripts to remediate duplicates, null violations, and pattern errors.',
      'Detects unmasked sensitive PII attributes (SSN, credit card, phone, email) to prevent compliance fines.'
    ],
    prerequisites: ['Table schema, sample data extracts, or profiling rule objectives.'],
    capabilities: [
      {
        name: '6-Dimension DQ Framework',
        description: 'Evaluates datasets systematically against Completeness, Accuracy, Validity, Consistency, Uniqueness, and Timeliness.'
      },
      {
        name: 'Executable Fix-Script Generator',
        description: 'Outputs automated SQL statements to quarantine or repair erroneous data records in pipeline stages.'
      },
      {
        name: 'PII / SPDI Exposure Scanner',
        description: 'Flags columns containing sensitive identifiable information and recommends masking or tokenization.'
      }
    ],
    workflow: [
      'Step 1: Input dataset schema or select critical business entity.',
      'Step 2: Run Neural DQ Analysis to profile potential data failure points.',
      'Step 3: Review generated DQ scorecard and severity ratings.',
      'Step 4: Copy automated remediation SQL scripts and embed into your ETL/ELT pipeline.'
    ],
    deliverables: ['Comprehensive DQ Scorecard', 'Automated SQL Remediation Scripts', 'PII Security Audit Log'],
    standards: ['ISO 8000 Data Quality Standard', 'DAMA-DMBOK2 Chapter 13: Data Quality'],
    bestPractices: [
      'Embed generated DQ rules directly into ingestion stages (e.g., dbt tests, Great Expectations, or Informatica CDQ).',
      'Establish automated quarantine tables for records failing strict Uniqueness or Validity rules.'
    ],
    relatedModuleTab: 'dq-module'
  },
  {
    id: 'data-dictionary',
    category: 'Technical Studio',
    title: 'Metadata Dictionary & Technical Model Browser',
    badge: 'Technical Metadata',
    readTime: '5 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Metadata Architect', 'Data Warehouse Developer', 'BI Engineer'],
    summary: 'Automates extraction, parsing, and cataloging of logical and physical data structures from SQL DDL, CSV, and Excel metadata definitions. Provides an interactive browser for column datatypes, keys, nullability, descriptions, and source-to-target lineages.',
    businessValue: [
      'Eliminates out-of-date Excel dictionaries with live, searchable technical metadata catalogs.',
      'Accelerates onboarding of new data engineers by providing instant schema clarity.',
      'Enables rapid impact analysis when planning upstream database alterations.'
    ],
    prerequisites: ['SQL DDL scripts, table definitions, or existing metadata spreadsheets.'],
    capabilities: [
      {
        name: 'DDL & Schema Ingestion Engine',
        description: 'Parses CREATE TABLE statements and extracts attributes, types, constraints, and defaults.'
      },
      {
        name: 'Interactive Model Browser',
        description: 'Searchable, filterable table grid with column-level descriptions and business context.'
      },
      {
        name: 'Catalog Import Package Generator',
        description: 'Exports metadata formatted for direct upload to enterprise catalogs.'
      }
    ],
    workflow: [
      'Step 1: Paste SQL DDL or upload schema definition files.',
      'Step 2: Parse and auto-extract table entities, column definitions, and primary keys.',
      'Step 3: Enrich with business descriptions and logical definitions.',
      'Step 4: Search or export master metadata dictionary.'
    ],
    deliverables: ['Searchable Metadata Dictionary', 'Schema Lineage Registry', 'Catalog Import Files'],
    standards: ['Common Warehouse Metamodel (CWM)', 'OMG MOF Metadata Architecture'],
    bestPractices: [
      'Maintain synchronized table descriptions across development, staging, and production catalogs.',
      'Ensure every foreign key attribute references an explicit parent entity and primary key.'
    ],
    relatedModuleTab: 'data-dictionary'
  },
  {
    id: 'solution-doc-pro',
    category: 'Technical Studio',
    title: 'Solution Document Pro & Technical Spec Generator',
    badge: 'Engineering Handover',
    readTime: '7 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Technical Lead', 'Principal Consultant', 'Delivery Architect', 'Senior Developer'],
    summary: 'The authoritative technical design document (TDD) generator. Normalizes legacy platform terminology (e.g., mapping Informatica PowerCenter / IICS concepts to IDMC cloud services) and synthesizes comprehensive development specifications including logical models, error handling strategies, and artifact registries.',
    businessValue: [
      'Eliminates ambiguity during development handoff, reducing rework by up to 50%.',
      'Provides developers with exact mapping specs, transformation logic, and exception recovery patterns.',
      'Standardizes documentation across multi-vendor offshore and nearshore delivery squads.'
    ],
    prerequisites: ['HLD architecture blueprint or target pipeline requirements.'],
    capabilities: [
      {
        name: 'Legacy-to-Cloud Terminology Translator',
        description: 'Maps legacy tool components (e.g., workflows, mapplets) into modern cloud equivalents (Taskflows, CDI elastic pipelines).'
      },
      {
        name: 'Comprehensive TDD Blueprinting',
        description: 'Outputs complete engineering blueprints with error thresholds, retry cadences, and alerting mechanisms.'
      },
      {
        name: 'Artifact Registry Synthesis',
        description: 'Catalogs all expected codebase deliverables, configuration parameters, and environment dependencies.'
      }
    ],
    workflow: [
      'Step 1: Define project scope and source/target technical ecosystems.',
      'Step 2: Configure transformation patterns and exception handling parameters.',
      'Step 3: Synthesize comprehensive 1:1 technical specification document.',
      'Step 4: Export production-ready technical design document for engineering sprint handoff.'
    ],
    deliverables: ['Detailed Technical Design Document (TDD)', 'Developer Mapping Specification', 'Pipeline Runbook'],
    standards: ['IEEE 1016 Software Design Descriptions', 'Informatica Velocity Methodology'],
    bestPractices: [
      'Verify that environment connection aliases adhere to enterprise naming standards prior to code handover.',
      'Review error notification webhooks to ensure integration with operational incident management (ServiceNow, PagerDuty).'
    ],
    relatedModuleTab: 'solution-doc-pro'
  },

  // -------------------------------------------------------------
  // 4. ENTERPRISE ARCHITECTURE & CROSS-MODULE SYNC
  // -------------------------------------------------------------
  {
    id: 'cross-module-learning',
    category: 'Enterprise Architecture',
    title: 'Cross-Module Global Context & AI Learning Engine',
    badge: 'Platform Intelligence',
    readTime: '4 min read',
    version: 'v2.4 Production',
    targetPersonas: ['Enterprise Architect', 'Product Manager', 'Head of AI Engineering'],
    summary: 'The central intelligence nervous system of HTC Copilot. It continuously synchronizes architectural decisions, tech stack choices, data volume constraints, and regulatory tags made in any single module across the entire platform ecosystem, preventing redundant data entry and ensuring consistency across all deliverables.',
    businessValue: [
      'Guarantees 100% consistency across all project deliverables (HLD, Estimator, Policies, and Code Specs).',
      'Prevents discrepancies between commercial bidding estimates and actual engineering specifications.',
      'Saves hours of duplicate entry by remembering enterprise preferences and organizational context.'
    ],
    prerequisites: ['Active session within any HTC Copilot workspace module.'],
    capabilities: [
      {
        name: 'Global Decision Registry',
        description: 'Persists key decisions (target database, cloud vendor, regulatory jurisdiction) in an active session bus.'
      },
      {
        name: 'Local-First Resilient Caching',
        description: 'Zero-latency local cache ensures all work in progress is protected from browser crashes or network dropouts.'
      },
      {
        name: 'Multi-Modal Contextual Recall',
        description: 'Automatically enriches downstream prompts with decisions made in earlier upstream modules.'
      }
    ],
    workflow: [
      'Step 1: Architect establishes core parameters in Project Describer or Solution Designer.',
      'Step 2: Global Context Engine synchronizes choices across background event bus.',
      'Step 3: Opening downstream modules (Estimator, Policy Generator, DQ) automatically pre-fills relevant parameters.',
      'Step 4: All generated outputs reflect a single, cohesive architectural narrative.'
    ],
    deliverables: ['Synchronized Project Knowledge Graph', 'Session State Audit Trail'],
    standards: ['Event-Driven Architecture', 'Local-First Software Principles'],
    bestPractices: [
      'Establish your core platform drivers in the Solution Designer first before generating operational policies.',
      'Use the Command Center to inspect global active projects across all workstreams.'
    ]
  }
];
