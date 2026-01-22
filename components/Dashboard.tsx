import React, { useState } from 'react';
import { AuditReport, CriticalFlag, RiskBadge } from '../types';
import { TrustGauge } from './TrustGauge';
import { DriftChart } from './DriftChart';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Search, 
  AlertTriangle, 
  ArrowRight, 
  Ban, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  BrainCircuit,
  Lock,
  ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  report: AuditReport;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ report, onReset }) => {
  const [sectionsExpanded, setSectionsExpanded] = useState({ drift: false, quality: false });

  const getStatusConfig = (badge: RiskBadge) => {
    switch (badge) {
      case "SAFE":
        return {
          label: "SAFE",
          sublabel: "Verified Grounding Successful",
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          textColor: "text-emerald-400"
        };
      case "REVIEW":
        return {
          label: "REVIEW REQUIRED",
          sublabel: "Minor Stability Deviations",
          icon: <Activity className="w-8 h-8 text-amber-400" />,
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          textColor: "text-amber-400"
        };
      case "UNSAFE":
        return {
          label: "UNSAFE",
          sublabel: "Manual Review Required",
          icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
          bgColor: "status-unsafe-gradient",
          borderColor: "border-red-500/20",
          textColor: "text-red-400"
        };
      case "INSUFFICIENT":
        return {
          label: "INSUFFICIENT DATA",
          sublabel: "Statistical confidence below threshold",
          icon: <Ban className="w-8 h-8 text-slate-400" />,
          bgColor: "bg-slate-800/50",
          borderColor: "border-slate-700",
          textColor: "text-slate-400"
        };
    }
  };

  const status = getStatusConfig(report.riskBadge);
  const hasOverrides = report.criticalFlags.length > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
      
      {/* Top Status Card */}
      <div className={`premium-card rounded-2xl p-6 border-l-4 ${status.borderColor} ${status.bgColor} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5">
            {status.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Governance Status</span>
            </div>
            <h2 className={`text-2xl font-bold ${status.textColor} tracking-tight`}>{status.label}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{status.sublabel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Audit Timestamp</div>
            <div className="text-white font-mono text-sm">{new Date(report.timestamp).toLocaleTimeString()}</div>
          </div>
          <button onClick={onReset} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all border border-white/5">
            New Audit
          </button>
        </div>
      </div>

      {/* Governance Override Banner */}
      {hasOverrides && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
          <div className="flex-1">
            <h4 className="text-amber-500 font-bold text-sm">Governance Override Applied</h4>
            <p className="text-amber-200/60 text-xs mt-1 leading-relaxed">
              Certain AI safety failures cannot be averaged away. High-risk contradictions or severe population drift triggers mandatory gating.
              The Trust Score shown below is automatically capped to prevent institutional over-trust.
            </p>
          </div>
        </div>
      )}

      {/* Hero Grid: Trust Meter + Reason Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Circular Trust Meter Card */}
        <div className="lg:col-span-4 premium-card rounded-2xl p-8 flex flex-col items-center justify-center relative">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Trust Metric</span>
          </div>
          
          <TrustGauge score={report.overallTrustScore} />
          
          <div className="text-center -mt-6">
            <p className="text-slate-200 text-sm font-bold">
              {hasOverrides ? 'Governance-Capped' : 'Unrestricted Trust'}
            </p>
            <p className="text-slate-500 text-[10px] mt-1 max-w-[180px] mx-auto leading-relaxed">
              {hasOverrides ? 'Score limited by safety rules' : 'Full statistical confidence applied'}
            </p>
          </div>
        </div>

        {/* Why Unsafe / Reason Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReasonCard 
            icon={<BrainCircuit className="w-5 h-5 text-purple-400" />}
            title="Hallucination Risk"
            status={report.hallucination.score < 50 ? "HIGH" : "LOW"}
            desc="Factual contradictions and invalid domain claims detected in AI output."
            color={report.hallucination.score < 50 ? "text-red-400" : "text-emerald-400"}
          />
          <ReasonCard 
            icon={<Activity className="w-5 h-5 text-amber-400" />}
            title="Distribution Drift"
            status={report.drift.score < 60 ? "SEVERE" : "STABLE"}
            desc="Significant population shift detected in income and feature distributions."
            color={report.drift.score < 60 ? "text-red-400" : "text-emerald-400"}
          />
          <ReasonCard 
            icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
            title="Governance Rule"
            status={hasOverrides ? "TRIGGERED" : "PASSED"}
            desc="Safety failures override average metrics to enforce compliance gates."
            color={hasOverrides ? "text-amber-400" : "text-emerald-400"}
          />
        </div>
      </div>

      {/* Evidence Viewer: Grounding Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Grounding Evidence Viewer</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hallucination Detail Cards */}
          <div className="space-y-4">
            {report.hallucination.flags.length === 0 ? (
              <div className="premium-card rounded-2xl p-8 text-center text-slate-500 italic text-sm">
                No grounding contradictions detected in current context.
              </div>
            ) : (
              report.hallucination.flags.map((flag, idx) => (
                <div key={idx} className="premium-card rounded-xl overflow-hidden border-l-4 border-red-500/50">
                  <div className="p-5 bg-slate-900/30 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase">Severity: {flag.risk}</span>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-red-500/50" />
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1.5">
                        <Ban className="w-3 h-3" /> AI Claim
                      </div>
                      <p className="text-slate-300 text-sm font-mono italic p-3 bg-slate-950/50 rounded-lg border border-white/5">
                        "{flag.sentence}"
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-500" /> Reality Check
                      </div>
                      <p className="text-blue-200/70 text-sm leading-relaxed px-1">
                        {flag.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Explainability / XAI Summary */}
          <div className="premium-card rounded-2xl p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-200 font-bold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-400" /> Audit Reasoning Trace
              </h3>
            </div>
            
            <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5 mb-6">
              <p className="text-slate-300 text-sm leading-relaxed">
                {report.hallucination.analysisText}
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Key Governance Insights</div>
              {report.explainability.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                  <span className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">
                    {insight}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Analysis Confidence</span>
              <span className="text-blue-400 text-xs font-bold">High (Gemini Flash Audit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Secondary Metrics */}
      <div className="space-y-4">
        <CollapsibleSection 
          title="Distribution Drift Analysis" 
          isOpen={sectionsExpanded.drift}
          onToggle={() => setSectionsExpanded(p => ({...p, drift: !p.drift}))}
          icon={<Activity className="w-4 h-4 text-amber-400" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
               <DriftChart metrics={report.drift.driftedFeatures} />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Drift Threshold</div>
                <div className="text-white font-bold text-lg">0.40 PSI</div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Scores above 0.40 indicate severe distributional shift requiring immediate model retraining or recalibration.
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection 
          title="Data Integrity & Quality" 
          isOpen={sectionsExpanded.quality}
          onToggle={() => setSectionsExpanded(p => ({...p, quality: !p.quality}))}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <QualityStat label="Rows Analyzed" value={report.dataQuality.totalRows} sub="15 record cohort" />
            <QualityStat label="Factual Consistency" value={`${report.hallucination.score}%`} sub="Grounded score" />
            <QualityStat label="Outliers Detected" value={report.dataQuality.outliers} sub="Z-score > 3" color="text-red-400" />
            <QualityStat label="Missing Data" value={report.dataQuality.missingValues} sub="Empty cells" color="text-amber-400" />
          </div>
        </CollapsibleSection>
      </div>

      {/* Recommended Actions */}
      <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-slate-200 font-bold">What You Can Do Next</h3>
            <p className="text-slate-500 text-xs">Strategic remediation steps based on audit outcome.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard 
            title="Reground Output"
            desc="AI hallucinations detected. Regenerate output using stricter semantic grounding to verified IDs (0-14)."
          />
          <ActionCard 
            title="Logic Gates"
            desc="Implement domain logic to block impossible values (e.g., credit > 850) before they reach stakeholders."
          />
          <ActionCard 
            title="Drift Review"
            desc="Significant population shift in 'income' features (PSI > 0.4). Verify baseline relevance before deployment."
          />
        </div>
      </div>

      <footer className="text-center pt-12 pb-6 opacity-30 text-[10px] text-slate-500 uppercase tracking-[0.3em]">
        TruthLens Logic v2.3 • Gated Governance Engine • Enterprise Trusted
      </footer>
    </div>
  );
};

const ReasonCard = ({ icon, title, status, desc, color }: { icon: any, title: string, status: string, desc: string, color: string }) => (
  <div className="premium-card rounded-2xl p-6 flex flex-col h-full group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-900/60 rounded-lg border border-white/5">
        {icon}
      </div>
      <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-white/5 ${color}`}>
        {status}
      </span>
    </div>
    <h4 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">{title}</h4>
    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
  </div>
);

const CollapsibleSection = ({ title, icon, isOpen, onToggle, children }: any) => (
  <div className="premium-card rounded-2xl overflow-hidden">
    <button 
      onClick={onToggle}
      className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold text-slate-300">{title}</span>
      </div>
      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-1 duration-300">
        {children}
      </div>
    )}
  </div>
);

const QualityStat = ({ label, value, sub, color = "text-white" }: any) => (
  <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
  </div>
);

const ActionCard = ({ title, desc }: { title: string, desc: string }) => (
  <div className="flex gap-4 group cursor-default">
    <div className="mt-1 flex-shrink-0">
      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </div>
    <div>
      <h5 className="text-slate-300 text-xs font-bold mb-1 uppercase tracking-tighter">{title}</h5>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
);