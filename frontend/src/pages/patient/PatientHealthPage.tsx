import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { Heart, Activity, Thermometer, Wind, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PatientHealthPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'hr' | 'spo2' | 'temp' | 'resp'>('hr');

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const res = await patientApi.getHealth();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching health summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const baselines = data?.baselines || {};
  const current = data?.current_vitals || {};
  const deviations = data?.deviations || {};
  const history = data?.history_chart || [];
  const summary = data?.weekly_summary || {};

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
          My Health & Physiological Trends
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Compare real-time physiological metrics against clinical baseline measurements.
        </p>
      </div>

      {/* Baseline vs Current Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HR */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>HEART RATE</span>
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{current.heart_rate || 75} <span className="text-xs font-normal text-slate-400">BPM</span></span>
            <span className={`text-xs font-bold ${deviations.hr_diff >= 0 ? 'text-cyan-400' : 'text-emerald-400'}`}>
              {deviations.hr_diff >= 0 ? `+${deviations.hr_diff}` : deviations.hr_diff} vs base
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Baseline Target: {baselines.baseline_hr || 75} BPM
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SPO2 SATURATION</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{current.spo2 || 98.0} <span className="text-xs font-normal text-slate-400">%</span></span>
            <span className="text-xs font-bold text-emerald-400">
              {deviations.spo2_diff >= 0 ? `+${deviations.spo2_diff}` : deviations.spo2_diff}% vs base
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Baseline Target: {baselines.baseline_spo2 || 98.0}%
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{current.temperature || 36.7} <span className="text-xs font-normal text-slate-400">°C</span></span>
            <span className="text-xs font-bold text-emerald-400">
              {deviations.temp_diff >= 0 ? `+${deviations.temp_diff}` : deviations.temp_diff}°C vs base
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Baseline Target: {baselines.baseline_temperature || 36.7}°C
          </div>
        </div>

        {/* Respiration */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>RESPIRATION RATE</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{current.respiration_rate || 16} <span className="text-xs font-normal text-slate-400">/min</span></span>
            <span className="text-xs font-bold text-emerald-400">
              {deviations.resp_diff >= 0 ? `+${deviations.resp_diff}` : deviations.resp_diff} vs base
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Baseline Target: {baselines.baseline_respiration || 16.0} /min
          </div>
        </div>
      </div>

      {/* Historical Telemetry Recharts Graph */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Continuous Telemetry Window</span>
            </h3>
            <p className="text-xs text-slate-400">High-resolution IoT data streams from wearable sensor</p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('hr')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'hr' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400'}`}
            >
              Heart Rate
            </button>
            <button
              onClick={() => setActiveTab('spo2')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'spo2' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'}`}
            >
              SpO2 %
            </button>
            <button
              onClick={() => setActiveTab('temp')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'temp' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400'}`}
            >
              Temp °C
            </button>
            <button
              onClick={() => setActiveTab('resp')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'resp' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'}`}
            >
              Respiration
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              {activeTab === 'hr' && <Area type="monotone" dataKey="heart_rate" stroke="#ef4444" fillOpacity={1} fill="url(#colorHr)" strokeWidth={2} />}
              {activeTab === 'spo2' && <Area type="monotone" dataKey="spo2" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSpo2)" strokeWidth={2} />}
              {activeTab === 'temp' && <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />}
              {activeTab === 'resp' && <Area type="monotone" dataKey="respiration" stroke="#10b981" fillOpacity={1} fill="url(#colorResp)" strokeWidth={2} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Summary Metrics */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>7-Day Health Aggregate Summary</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Weekly Avg HR</div>
            <div className="text-xl font-bold text-white mt-1">{summary.avg_hr || 75.0} BPM</div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Weekly Avg SpO2</div>
            <div className="text-xl font-bold text-white mt-1">{summary.avg_spo2 || 98.0}%</div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Total Alerts</div>
            <div className="text-xl font-bold text-white mt-1">{summary.total_alerts || 0}</div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Fall / SOS Events</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">0 Detected</div>
          </div>
        </div>
      </div>

    </div>
  );
};
