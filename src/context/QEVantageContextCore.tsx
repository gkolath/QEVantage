import { createContext, useContext } from 'react';

// Interfaces for Core States
export interface UserStory {
  id: string;
  title: string;
  description: string;
  coverage: number; // 0 to 100
  testCases: string[];
  module: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface TestSuite {
  id: string;
  name: string;
  framework: 'Playwright' | 'Selenium' | 'Cypress' | 'Appium';
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  status: 'Idle' | 'Running' | 'Passed' | 'Failed';
}

export interface AnomalyLog {
  id: string;
  build: string;
  metric: string;
  baseline: number;
  actual: number;
  severity: 'Warning' | 'Critical';
  timestamp: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  type: 'SAST' | 'DAST';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  file: string;
  line: number;
  status: 'Open' | 'Triaged' | 'Fixed' | 'Quarantined';
  compliance: string[];
}

export interface HealingEvent {
  id: string;
  timestamp: string;
  script: string;
  framework: string;
  brokenSelector: string;
  healedSelector: string;
  confidence: number;
  status: 'Resolved' | 'Pending';
}

export type RRSVerdict = 'GO' | 'CONDITIONAL GO' | 'NO-GO';

export type RRSVertical = 'default' | 'fintech' | 'retail' | 'healthcare';

export interface RRSDimensionScore {
  name: string;
  score: number;       // 0–100
  weight: number;      // 0–1
  explanation: string;
  flag: string | null;
}

export interface ArchivedRelease {
  id: string;
  build: string;
  score: number;
  status: RRSVerdict;
  timestamp: string;
  coverage: number;
  passRate: number;
  latency: number;
  securityOpen: number;
  notes: string;
}

export interface QEVantageContextType {
  // Navigation & UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;

  // Pillar 1: Functional Testing State
  stories: UserStory[];
  addStory: (title: string, description: string, module: string, risk: 'Low' | 'Medium' | 'High') => void;
  heatmapNodes: { id: string; name: string; coverage: number; risk: 'Low' | 'Medium' | 'High' }[];
  updateNodeCoverage: (id: string, newCoverage: number) => void;

  // Pillar 2: Automation Testing State
  testSuites: TestSuite[];
  playwrightResultsTimestamp: string;
  isHealingEnabled: boolean;
  setIsHealingEnabled: (val: boolean) => void;
  healingEvents: HealingEvent[];
  triggerSelfHealingSimulation: () => void;
  runAutomationSuites: () => void;
  quarantineFlakyTest: (suiteId: string) => void;

  // Pillar 3: Performance State
  perfHistory: { build: string; responseTime: number; throughput: number }[];
  latencySla: number;
  setLatencySla: (val: number) => void;
  anomalies: AnomalyLog[];
  triggerLoadSimulation: (pattern: 'Peak' | 'Concurrent' | 'Bulk') => void;
  liveTelemetryActive: boolean;
  setLiveTelemetryActive: (val: boolean) => void;

  // Pillar 4: Security State
  securityFindings: SecurityFinding[];
  triageFinding: (id: string, impact: 'Low' | 'Medium' | 'High' | 'Critical', status: SecurityFinding['status']) => void;
  complianceProgress: { SOC2: number; PCI_DSS: number; GDPR: number; OWASP_10: number };

  // Pillar 5: Release Management
  releaseReadinessScore: number;
  readyToShipStatus: RRSVerdict;
  rrsDimensions: RRSDimensionScore[];
  rrsVertical: RRSVertical;
  setRrsVertical: (v: RRSVertical) => void;
  isReleaseTriggered: boolean;
  releaseLogs: string[];
  triggerRelease: () => void;
  generateReleaseNotes: () => string;
  pipelineStage: 'idle' | 'code_push' | 'automated_qa' | 'security_gate' | 'uat_approval' | 'production_rollout';
  pipelineStatus: 'idle' | 'running' | 'completed' | 'failed';
  integrationSettings: { slack: boolean; teams: boolean; pagerduty: boolean; email: boolean };
  setIntegrationSettings: React.Dispatch<React.SetStateAction<{ slack: boolean; teams: boolean; pagerduty: boolean; email: boolean }>>;
  archivedReleases: ArchivedRelease[];
  deleteArchivedRelease: (id: string) => void;
  
  // Scenario Simulator
  activeScenario: 'clean' | 'performance' | 'security';
  triggerScenario: (scenario: 'clean' | 'performance' | 'security') => void;
}

export const QEVantageContext = createContext<QEVantageContextType | undefined>(undefined);

export const useQEVantage = () => {
  const context = useContext(QEVantageContext);
  if (context === undefined) {
    throw new Error('useQEVantage must be used within a QEVantageProvider');
  }
  return context;
};
