export interface DataRow {
  [key: string]: string | number | null;
}

export enum CriticalFlag {
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
  HIGH_HALLUCINATION_RISK = "HIGH_HALLUCINATION_RISK",
  SEVERE_DRIFT = "SEVERE_DRIFT"
}

export type RiskBadge = "SAFE" | "REVIEW" | "UNSAFE" | "INSUFFICIENT";

export interface DriftMetric {
  feature: string;
  score: number; // PSI or similar
  driftDetected: boolean;
}

export interface HallucinationFlag {
  sentence: string;
  reason: string;
  risk: string;
}

export interface AuditReport {
  overallTrustScore: number | null;
  riskBadge: RiskBadge;
  criticalFlags: CriticalFlag[]; // Governance signals
  dataQuality: {
    score: number;
    missingValues: number;
    outliers: number;
    totalRows: number;
  };
  drift: {
    score: number;
    driftedFeatures: DriftMetric[];
  };
  hallucination: {
    score: number;
    flags: HallucinationFlag[];
    analysisText: string;
  };
  explainability: {
    score: number;
    insights: string[];
  };
  timestamp: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}