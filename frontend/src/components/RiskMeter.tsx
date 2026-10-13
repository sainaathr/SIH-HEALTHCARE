import React from 'react';
import { RiskAssessment } from '../types';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react';

interface RiskMeterProps {
  assessment?: RiskAssessment;
  score?: number;
  riskLevel?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ assessment, score: directScore, riskLevel: directRiskLevel }) => {
  const score = assessment?.score ?? directScore ?? 14;
  const risk_level = assessment?.risk_level ?? directRiskLevel ?? 'LOW';
  const contributors = assessment?.contributors;
  const explanation = assessment?.explanation;
  const early_warning = assessment?.early_warning;

  const getRiskTheme = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/40',
          text: 'text-red-400',
          badge: 'bg-red-500 text-white',
          gauge: '#ef4444'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          badge: 'bg-orange-500 text-white',
          gauge: '#f97316'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-950',
          gauge: '#f59e0b'
        };
      default:
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950',
          gauge: '#10b981'
        };
    }
  };

  const theme = getRiskTheme(risk_level);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'DETERIORATING':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'IMPROVING':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`rounded-2xl border p-5 ${theme.bg} ${theme.border} space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className={`w-5 h-5 ${theme.text}`} />
          <h3 className="font-bold text-sm text-slate-200">Explainable Patient Risk Engine</h3>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${theme.badge}`}>
          {risk_level} RISK
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        {/* Score gauge circle */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.5"
              stroke={theme.gauge}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black font-mono ${theme.text}`}>{score}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">/ 100</span>
          </div>
        </div>

        {/* Explanation & Early Warning */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="text-slate-300 font-medium leading-relaxed">
            {explanation}
          </div>

          {early_warning && (
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTrendIcon(early_warning.trend)}
                <div>
                  <span className="font-semibold text-slate-200">Early Warning: {early_warning.label}</span>
                  <p className="text-[11px] text-slate-400">{early_warning.explanation}</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block">PREDICTED NEAR-TERM</span>
                <span className="font-bold text-slate-200">{early_warning.predicted_near_term_risk} / 100</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transparent Risk Contributors */}
      {contributors && contributors.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Score Calculation Breakdown</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {contributors.map((c, i) => (
              <div key={i} className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div className="truncate mr-2">
                  <span className="font-semibold text-slate-300 block truncate">{c.factor}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{c.detail}</span>
                </div>
                <div className="font-mono text-right flex-shrink-0">
                  <span className="text-amber-400 font-bold">+{c.impact} pts</span>
                  <span className="text-[10px] text-slate-500 block">w: {(c.weight * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
