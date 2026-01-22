import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DriftMetric } from '../types';

interface DriftChartProps {
  metrics: DriftMetric[];
}

export const DriftChart: React.FC<DriftChartProps> = ({ metrics }) => {
  if (metrics.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-slate-700/50 rounded-2xl border-dashed">
        <span className="text-sm font-medium">Statistical Stability Verified</span>
        <span className="text-[10px] uppercase tracking-widest mt-1 opacity-50">No significant drift detected</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={metrics}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          barSize={12}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="feature" 
            type="category" 
            stroke="#64748b" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip 
            cursor={{fill: '#ffffff05'}}
            contentStyle={{ 
              backgroundColor: '#0B1220', 
              borderColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="score" name="Magnitude" radius={[0, 4, 4, 0]}>
             {metrics.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.score > 0.4 ? '#ef4444' : '#f59e0b'} fillOpacity={0.8} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};