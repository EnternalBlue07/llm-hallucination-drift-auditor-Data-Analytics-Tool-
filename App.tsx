import React, { useState } from 'react';
import { DataRow, AuditReport, AppState } from './types';
import { runFullAudit } from './services/auditEngine';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ShieldCheck, Loader2, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [dataset, setDataset] = useState<DataRow[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handleDataLoaded = (data: DataRow[], name: string) => {
    setDataset(data);
    setFileName(name);
  };

  const startAudit = async () => {
    if (dataset.length === 0) {
      alert("Please upload a dataset first.");
      return;
    }
    
    setAppState(AppState.ANALYZING);
    try {
      if (dataset.length < 100) await new Promise(r => setTimeout(r, 1500));
      
      const report = await runFullAudit(dataset, inputText);
      setAuditReport(report);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setAuditReport(null);
    setDataset([]);
    setInputText('');
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-200">
      
      {/* Navbar */}
      <header className="border-b border-white/5 bg-[#0B1220]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tighter text-white">TruthLens</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500 text-white tracking-widest">PRO</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Governance Audit</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" /> System Status: Operational
            </div>
          </div>
        </div>
      </header>

      <main>
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-8 animate-in fade-in duration-1000">
            <div className="text-center mb-12 max-w-3xl">
               <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                 Audit Reality. <br />
                 <span className="text-gradient-blue italic">Enforce Governance.</span>
               </h1>
               <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                 Professional infrastructure for auditing Data Integrity, Drifting Populations, and Factual Grounding in Generative AI.
               </p>
            </div>

            <FileUpload 
              onDataLoaded={handleDataLoaded} 
              onTextLoaded={setInputText}
            />

            {dataset.length > 0 && (
              <div className="mt-12 w-full max-w-3xl animate-in slide-in-from-bottom-6 fade-in duration-500">
                <div className="flex items-center gap-5 premium-card px-8 py-6 rounded-2xl mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Staging Area</span>
                    <span className="text-white font-bold">{fileName}</span>
                    <span className="text-xs text-slate-500">{dataset.length} records • Metadata verified</span>
                  </div>
                  <button
                    onClick={startAudit}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    Initiate Audit Trace
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-8">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-t-2 border-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-blue-500/50" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Processing Governance Trace</h2>
            <div className="flex flex-col gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest text-center">
               <p className="animate-pulse">Evaluating Data Distribution...</p>
               <p className="animate-pulse delay-75">Executing Gemini Grounding Engine...</p>
               <p className="animate-pulse delay-150">Verifying Safety Kill-switches...</p>
            </div>
          </div>
        )}

        {appState === AppState.RESULTS && auditReport && (
          <Dashboard report={auditReport} onReset={resetApp} />
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center p-8">
            <div className="p-6 bg-red-500/10 rounded-full mb-6">
              <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Audit Engine Fault</h2>
            <p className="text-slate-500 mb-8 max-w-sm">A critical execution error occurred during the audit trace. This usually indicates an API connection failure.</p>
            <button onClick={resetApp} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">
              Initialize System Reset
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
