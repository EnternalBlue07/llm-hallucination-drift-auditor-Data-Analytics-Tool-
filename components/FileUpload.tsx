import React, { useCallback, useState } from 'react';
import { Upload, FileText, Database, Sparkles } from 'lucide-react';
import { DataRow } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: DataRow[], fileName: string) => void;
  onTextLoaded: (text: string) => void;
}

const SAMPLE_CSV_DATA: DataRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  customer_age: Math.floor(Math.random() * (80 - 18) + 18),
  income: i > 12 ? 9999999 : Math.floor(Math.random() * 100000 + 30000), 
  credit_score: i > 8 ? Math.floor(Math.random() * 300 + 300) : Math.floor(Math.random() * 200 + 600),
  purchase_amount: Math.random() * 1000,
}));

const SAMPLE_AI_TEXT = `
Based on the analysis of customer data, we observed that high-income individuals typically have a credit score above 850, which is impossible as FICO scores cap at 850. The dataset shows a stable trend in income, despite the clear spike in the last quartile. We recommend approving loans for all users with ID > 40 because their income is listed as 9,999,999, which is definitely a legitimate value and not a system error.
`;

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, onTextLoaded }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            onDataLoaded(json, file.name);
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',');
            const row: DataRow = {};
            headers.forEach((h, i) => {
              row[h] = values[i]?.trim();
            });
            return row;
          });
          onDataLoaded(data, file.name);
        }
      } catch (err) {
        alert("Error parsing file");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  }, []);

  const loadSample = () => {
    onDataLoaded(SAMPLE_CSV_DATA, "financial_audit_demo.json");
    onTextLoaded(SAMPLE_AI_TEXT);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div 
        className={`relative premium-card rounded-2xl p-12 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-500/5' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-5 bg-slate-900/60 rounded-2xl w-fit mx-auto mb-6 border border-white/5">
          <Upload className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Upload Audit Dataset
        </h3>
        <p className="text-slate-500 text-sm font-medium mb-8">
          Support for CSV and JSON structures. Max file size: 50MB.
        </p>
        <input 
          type="file" 
          className="hidden" 
          id="file-upload" 
          accept=".csv,.json"
          onChange={(e) => e.target.files && parseFile(e.target.files[0])} 
        />
        <label 
          htmlFor="file-upload"
          className="px-8 py-3 bg-white text-[#0B1220] rounded-xl cursor-pointer font-bold text-sm transition-all hover:bg-slate-200 active:scale-95"
        >
          Select Project File
        </label>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px bg-white/5 flex-1"></div>
        <span className="text-[10px] text-slate-600 font-black tracking-widest uppercase">Quick Start Analysis</span>
        <div className="h-px bg-white/5 flex-1"></div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={loadSample}
          className="flex items-center gap-3 px-8 py-4 bg-[#121A2F] hover:bg-[#1a2542] text-slate-300 rounded-2xl transition-all border border-white/5 group"
        >
          <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-bold">Load Grounding Demo Scenario</span>
        </button>
      </div>

      <div className="premium-card rounded-2xl p-8 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-white text-sm font-bold uppercase tracking-tight">
            AI Content Verification
          </h4>
        </div>
        <textarea 
          className="w-full h-32 bg-slate-950/50 border border-white/5 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all text-sm leading-relaxed"
          placeholder="Paste AI-generated text here to initiate semantic verification against dataset context..."
          onChange={(e) => onTextLoaded(e.target.value)}
        ></textarea>
        <p className="text-[10px] text-slate-600 mt-3 font-medium uppercase tracking-widest text-right">
          Optional Grounding Audit Stage
        </p>
      </div>
    </div>
  );
};