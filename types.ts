
export interface RequestData {
  id: string;
  clientName: string;
  product: string; 
  deploymentModel: 'Cloud' | 'On-Premise' | 'Hybrid';
  type: string; 
  rfpFiles: string[];
  requirementsPrompt?: string; 
  targetAudience: string[]; 
  date: string;
  mode?: 'design' | 'estimator' | 'dq';
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface WorkspaceTab {
  id: string;
  type: string; 
  label: string;
  timestamp: number;
  data?: any; 
  viewMode?: 'create' | 'hub' | 'input';
}

export interface NodeColumn {
  name: string;
  type: string; 
  isPk?: boolean;
  isFk?: boolean;
}

export interface Node {
  id: string;
  label: string;
  description?: string; 
  type: 'source' | 'stage' | 'process' | 'target' | 'table' | 'firewall' | 'mobile' | 'web' | 'container' | 'sap' | 'database' | 'salesforce' | 'sqlserver' | 'api' | 'simple_table' | 'decision' | 'terminal' | 'storage' | 'complex' | 'server';
  shape?: 'rect' | 'rhombus' | 'stadium' | 'parallelogram' | 'cylinder' | 'hexagon';
  x: number;
  y: number;
  width?: number; 
  height?: number; 
  columns?: NodeColumn[]; 
}

export interface Edge {
  from: string;
  to: string;
  label: string;
  order?: number;      
  isReturn?: boolean;   
}

export type DiagramClassification = 'ER_DIAGRAM' | 'SYSTEM_ARCHITECTURE' | 'BUSINESS_PROCESS' | 'DATA_MODEL' | 'SEQUENCE_FLOW';

export interface DesignData {
  nodes: Node[];
  edges: Edge[];
  mermaidCode?: string; 
  classification?: DiagramClassification; 
}

export interface Question {
  id: string;
  category: string;
  question: string;
  answer: string;
  isCustom?: boolean;
}

export interface Requirement {
  id: string;
  category: 'Infrastructure' | 'Network' | 'Security' | 'License' | 'Development' | 'Testing' | 'Admin';
  item: string;
  description: string;
  criticality: 'High' | 'Medium' | 'Low';
  audience?: string;
}

export interface InitiationItem {
  title: string;
  iconType: string;
  items: string[];
}

export interface ProjectStats {
  executiveSummary: string;
  riskScore: number; 
  complexityScore: number; 
  technicalDebt: 'Low' | 'Medium' | 'High';
  keyRisks: string[];
  successProbability: number;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  focus: string;
  deliverables: string[];
}

export interface EstimationInputs {
  [driverId: string]: number;
}

export interface Resource {
  id: string;
  role: string;
  count: number;
  rate: number; 
  hours: number; 
  description?: string;
}

export interface TimelineItem {
  id: string;
  activity: string;
  startWeek: number;
  endWeek: number;
  type: 'Phase' | 'Milestone' | 'Task';
}

export interface CachedRequestData {
  design: DesignData;
  tableDesign?: DesignData; 
  processDesign?: DesignData; 
  questions: Question[];
  requirements: Requirement[];
  initiation: InitiationItem[];
  estimationInputs?: EstimationInputs;
  projectStats?: ProjectStats; 
  roadmap?: RoadmapPhase[]; 
  resources?: Resource[]; 
  timeline?: TimelineItem[]; 
  status: 'idle' | 'thinking' | 'review' | 'accepted';
}

export interface DesignCache {
  [requestId: string]: CachedRequestData;
}

export interface AiSuggestion {
  product: string;
  deployment: 'Cloud' | 'On-Premise' | 'Hybrid';
  type: string;
  reason: string;
  details: string[];
}

export interface RefinementSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'Performance' | 'Security' | 'Governance' | 'Reliability';
  suggestedDesign: DesignData; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ArchitectureCanvasHandle {
  exportImage: (format: 'png' | 'svg') => void;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  preferences: {
    defaultProduct: string;
    defaultDeployment: 'Cloud' | 'On-Premise' | 'Hybrid';
  };
}

export interface SearchResult {
  id: string;
  type: 'request' | 'estimator' | 'architecture' | 'dataflow' | 'erd' | 'dq' | 'describer' | 'document' | 'casestory' | 'dictionary' | 'solution-doc-pro' | 'data-modeler';
  title: string;
  subtitle: string;
  date: string;
  data: any; 
}

export interface AssumptionData {
  id: string;
  category: string;
  assumption: string;
}

export interface ProjectDescriptionResponse {
  client?: string;
  executiveSummary: string;
  objectives: string[];
  techStack: {
    sources: string[];
    targets: string[];
    tools: string[];
  };
  constraints: string[];
  implicitRequirements: string[];
}

export interface DataDictionaryItem {
  tableName: string;
  columnName: string;
  dataType: string;
  length?: string;
  constraint?: string;
  description: string;
  businessRule?: string;
}

export interface GuideSection {
  title: string;
  category: string;
  description: string;
  features: string[];
  bestPractice: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'generated';
}

export interface DocumentStrategy {
  title: string;
  type: 'replica' | 'hld' | 'migration';
  reasoning: string;
  sections: string[];
  diagramMode: 'none' | 'architecture_only' | 'full';
}

export interface CaseStoryTemplate {
  id: string;
  name: string;
  description: string;
  slides: { title: string; description: string }[];
}

export interface SlideContent {
  id: string;
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
}
