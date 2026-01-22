import { DataRow, AuditReport, DriftMetric, CriticalFlag, RiskBadge } from '../types';
import { analyzeTextForHallucinations, explainAnomalies } from './geminiService';

const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

const stdDev = (arr: number[]) => {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / arr.length);
};

const analyzeDataQuality = (data: DataRow[]) => {
  if (data.length === 0) return { score: 0, missingValues: 0, outliers: 0, totalRows: 0 };

  let missingCount = 0;
  let outlierCount = 0;
  const keys = Object.keys(data[0]);
  const numericColumns: Record<string, number[]> = {};

  keys.forEach(key => numericColumns[key] = []);

  data.forEach(row => {
    keys.forEach(key => {
      const val = row[key];
      if (val === null || val === undefined || val === '') {
        missingCount++;
      } else {
        const num = Number(val);
        if (!isNaN(num)) numericColumns[key].push(num);
      }
    });
  });

  Object.keys(numericColumns).forEach(key => {
    const values = numericColumns[key];
    if (values.length > 5) {
      const m = mean(values);
      const sd = stdDev(values);
      if (sd > 0) {
        values.forEach(v => {
          if (Math.abs((v - m) / sd) > 3) outlierCount++;
        });
      }
    }
  });

  const missingRatio = missingCount / (data.length * keys.length);
  const outlierRatio = outlierCount / (data.length * keys.length);
  const score = Math.max(0, 100 - (missingRatio * 100 * 2) - (outlierRatio * 100 * 5));

  return {
    score: Math.round(score),
    missingValues: missingCount,
    outliers: outlierCount,
    totalRows: data.length
  };
};

const analyzeDrift = (data: DataRow[]): { score: number; driftedFeatures: DriftMetric[] } => {
  if (data.length < 10) return { score: 100, driftedFeatures: [] };

  const splitIndex = Math.floor(data.length / 2);
  const reference = data.slice(0, splitIndex);
  const current = data.slice(splitIndex);
  const keys = Object.keys(data[0]);
  const driftedFeatures: DriftMetric[] = [];
  let totalDriftPenalty = 0;

  keys.forEach(key => {
    const isNumeric = !isNaN(Number(data[0][key]));
    if (isNumeric) {
      const refMean = mean(reference.map(r => Number(r[key]) || 0));
      const curMean = mean(current.map(r => Number(r[key]) || 0));
      const diff = Math.abs(refMean - curMean);
      const denominator = refMean === 0 ? 1 : Math.abs(refMean);
      const percentChange = (diff / denominator);

      if (percentChange > 0.2) {
        driftedFeatures.push({
          feature: key,
          score: parseFloat(percentChange.toFixed(2)),
          driftDetected: true
        });
        totalDriftPenalty += (percentChange * 10);
      }
    }
  });

  const score = Math.max(0, 100 - totalDriftPenalty);
  return { score: Math.round(score), driftedFeatures };
};

export const runFullAudit = async (
  data: DataRow[],
  aiOutputText: string
): Promise<AuditReport> => {
  const dq = analyzeDataQuality(data);
  const drift = analyzeDrift(data);
  
  // Use a slightly larger context window for hallucinations
  const contextSample = JSON.stringify(data.slice(0, 15));
  const hall = await analyzeTextForHallucinations(aiOutputText, contextSample);

  const explain = await explainAnomalies({
    dataQuality: dq,
    drift: drift,
    hallucinationScore: hall.score
  });

  // --- VETO GATE / KILL SWITCH LOGIC ---
  let trustScore: number | null = (dq.score * 0.35) + (drift.score * 0.25) + (hall.score * 0.30) + (explain.score * 0.10);
  let riskBadge: RiskBadge = "SAFE";
  const criticalFlags: CriticalFlag[] = [];

  // Veto 1: Insufficient Data (Governance Neutrality)
  if (data.length < 25) {
    criticalFlags.push(CriticalFlag.INSUFFICIENT_DATA);
    trustScore = null;
    riskBadge = "INSUFFICIENT";
  } else {
    // Veto 2: High Hallucination Risk (Non-Compensatory)
    if (hall.score < 50) {
      criticalFlags.push(CriticalFlag.HIGH_HALLUCINATION_RISK);
      trustScore = Math.min(trustScore, 40);
      riskBadge = "UNSAFE";
    }

    // Veto 3: Severe Drift (Review Required)
    if (drift.score < 60) {
      criticalFlags.push(CriticalFlag.SEVERE_DRIFT);
      trustScore = Math.min(trustScore, 60);
      if (riskBadge !== "UNSAFE") riskBadge = "REVIEW";
    }

    // Final Badge Logic (if no vetos triggered)
    if (criticalFlags.length === 0) {
      if (trustScore >= 80) riskBadge = "SAFE";
      else if (trustScore >= 50) riskBadge = "REVIEW";
      else riskBadge = "UNSAFE";
    }
  }

  return {
    overallTrustScore: trustScore !== null ? Math.round(trustScore) : null,
    riskBadge,
    criticalFlags,
    dataQuality: dq,
    drift: drift,
    hallucination: hall,
    explainability: explain,
    timestamp: new Date().toISOString()
  };
};