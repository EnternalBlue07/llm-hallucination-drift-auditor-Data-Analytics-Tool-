import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TrustGaugeProps {
  score: number | null;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ score }) => {
  const displayScore = score ?? 0;
  const data = [
    { name: 'Score', value: displayScore },
    { name: 'Remaining', value: 100 - displayScore },
  ];

  // Professional Gradients
  const getGradientColor = () => {
    if (score === null) return '#475569';
    if (displayScore >= 80) return '#10b981'; // Emerald
    if (displayScore >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const color = getGradientColor();

  return (
    <div className="relative h-56 w-full flex items-center justify-center animate-in zoom-in-95 duration-700">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={95}
            startAngle={220}
            endAngle={-40}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            <Cell key="score" fill={color} fillOpacity={0.9} />
            <Cell key="remaining" fill="#1e293b" fillOpacity={0.3} /> 
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-5xl font-bold tracking-tighter text-white">
          {score !== null ? score : '—'}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">
          Index
        </span>
      </div>
    </div>
  );
};