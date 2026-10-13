import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { NursePriorityItem } from '../types';
import { Flame, ShieldAlert, Activity, ArrowUpRight, CheckCircle, RefreshCw } from 'lucide-react';

export const NursePriorityPage: React.FC = () => {
  const [priorityQueue, setPriorityQueue] = useState<NursePriorityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchPriority = async () => {
    try {
      const res = await api.get('/api/nurse-priority');
      setPriorityQueue(res.data);
    } catch (err) {
      console.error("Failed to fetch nurse priority queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriority();
    const interval = setInterval(fetchPriority, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white font-['Outfit']">Nurse Triage Priority Queue</h1>
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              REAL-TIME RISK SORTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated priority ranking based on weighted physiological deviation, early warning trend trajectory, and fall alerts.
          </p>
        </div>

        <button
          onClick={fetchPriority}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Queue Cards List */}
      <div className="space-y-4">
        {priorityQueue.map((item) => (
          <div
            key={item.patient_id}
            className={`p-5 rounded-2xl border transition-all glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              item.risk_level === 'CRITICAL' ? 'border-red-500/50 bg-red-950/10' :
              item.risk_level === 'HIGH' ? 'border-orange-500/50 bg-orange-950/10' :
              item.risk_level === 'MODERATE' ? 'border-amber-500/40 bg-amber-950/10' :
              'border-slate-800 bg-slate-900/60'
            }`}
          >
            {/* Rank badge + Patient identity */}
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center font-mono ${
                item.priority_rank === 1 ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' :
                item.priority_rank === 2 ? 'bg-orange-500 text-white' :
                'bg-slate-800 text-slate-300'
              }`}>
                #{item.priority_rank}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-white">{item.name}</span>
                  <span className="font-mono text-cyan-400 text-xs bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {item.patient_code}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {item.age} yrs • {item.gender} • Blood: <strong className="text-rose-400">{item.blood_group}</strong> • Active Alerts: <strong className="text-red-400">{item.active_alert_count}</strong>
                </div>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="grid grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">HR</span>
                <span className="font-bold text-red-400 text-sm">{item.current_vitals.heart_rate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SpO2</span>
                <span className="font-bold text-emerald-400 text-sm">{item.current_vitals.spo2}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">TEMP</span>
                <span className="font-bold text-amber-400 text-sm">{item.current_vitals.temperature}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">RESP</span>
                <span className="font-bold text-cyan-400 text-sm">{item.current_vitals.respiration_rate}</span>
              </div>
            </div>

            {/* Risk & Action */}
            <div className="flex flex-col md:items-end space-y-2 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Risk Score:</span>
                <span className={`px-3 py-1 rounded-xl text-sm font-black font-mono ${
                  item.risk_level === 'CRITICAL' ? 'bg-red-500 text-white' :
                  item.risk_level === 'HIGH' ? 'bg-orange-500 text-white' :
                  item.risk_level === 'MODERATE' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  {item.risk_score} / 100 ({item.risk_level})
                </span>
              </div>

              <div className="text-xs text-slate-300">
                Action: <strong className="text-white">{item.action_required}</strong>
              </div>

              <button
                onClick={() => navigate(`/patients/${item.patient_id}`)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>OPEN TRIAGE DASHBOARD</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
