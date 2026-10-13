import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Patient, Vital, Alert, NursePriorityItem } from '../types';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  ShieldAlert, 
  Flame, 
  Users, 
  Cpu, 
  ArrowUpRight, 
  RefreshCw,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FallCountdownModal } from '../components/FallCountdownModal';

export const DashboardPage: React.FC = () => {
  const [priorityQueue, setPriorityQueue] = useState<NursePriorityItem[]>([]);
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fallModalOpen, setFallModalOpen] = useState<boolean>(false);
  const [fallPatient, setFallPatient] = useState<{ id: number; code: string; name: string } | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // 1. Fetch Priority Queue
      const queueRes = await api.get('/api/nurse-priority');
      setPriorityQueue(queueRes.data);

      // 2. Fetch P001 telemetry history for live chart
      const telemetryRes = await api.get('/api/patients/1/telemetry?limit=20');
      const chartData = telemetryRes.data.map((v: Vital) => ({
        time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        heartRate: v.heart_rate,
        spo2: v.spo2,
        temperature: v.temperature,
        respiration: v.respiration_rate,
      })).reverse();
      setVitalsHistory(chartData);

      // 3. Fetch active alerts
      const alertsRes = await api.get('/api/alerts?status=ACTIVE');
      setActiveAlerts(alertsRes.data);

      // Check if any active fall alert exists for P001
      const fallAlert = alertsRes.data.find((a: Alert) => a.alert_type === 'FALL');
      if (fallAlert && !fallModalOpen) {
        const pt = queueRes.data.find((p: NursePriorityItem) => p.patient_id === fallAlert.patient_id);
        if (pt) {
          setFallPatient({ id: pt.patient_id, code: pt.patient_code, name: pt.name });
          setFallModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // 3-second live polling
    return () => clearInterval(interval);
  }, []);

  const totalPatients = priorityQueue.length;
  const criticalCount = priorityQueue.filter(p => p.risk_level === 'CRITICAL' || p.risk_level === 'HIGH').length;
  const activeAlertCount = activeAlerts.length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between glass-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Monitored</span>
            <div className="text-2xl font-black text-white font-mono mt-1">{totalPatients} Patients</div>
            <span className="text-[11px] text-emerald-400 font-medium">100% Telemetry Active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between glass-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Urgent Priority</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{criticalCount} High Risk</div>
            <span className="text-[11px] text-amber-400/80 font-medium">Requires Nurse Action</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between glass-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Alerts</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{activeAlertCount} Signals</div>
            <span className="text-[11px] text-red-400/80 font-medium">Physiological Thresholds</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between glass-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">ESP32 Devices</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">5 Connected</div>
            <span className="text-[11px] text-emerald-400 font-medium">Wi-Fi Telemetry Stream</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Telemetry & Triage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Recharts Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-slate-200 text-base">Real-Time Telemetry Stream (P001 - Eleanor Vance)</h2>
            </div>
            <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Live 3s Polling</span>
            </span>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[30, 160]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="respiration" name="Respiration (RPM)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Triage Alert Feed (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 glass-panel flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-slate-200 text-sm">Top Priority Triage</h2>
              </div>
              <button
                onClick={() => navigate('/nurse-priority')}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {priorityQueue.slice(0, 3).map((patient) => (
                <div
                  key={patient.patient_id}
                  onClick={() => navigate(`/patients/${patient.patient_id}`)}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/50 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{patient.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                      patient.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      patient.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {patient.risk_score} / 100
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-tight">
                    Issue: <strong className="text-slate-200">{patient.main_issue}</strong>
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-700/40 pt-1.5">
                    <span>HR: <strong className="text-red-400">{patient.current_vitals.heart_rate}</strong> BPM</span>
                    <span>SpO2: <strong className="text-emerald-400">{patient.current_vitals.spo2}</strong>%</span>
                    <span>Temp: <strong className="text-amber-400">{patient.current_vitals.temperature}</strong>°C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/vitalpass')}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>SCAN VITALPASS HEALTH PASSPORT</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-200">Patient Monitoring Cards</h2>
          <span className="text-xs text-slate-400">Click any card to open full profile & controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priorityQueue.map((patient) => (
            <div
              key={patient.patient_id}
              onClick={() => navigate(`/patients/${patient.patient_id}`)}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl space-y-4 cursor-pointer transition-all glass-card hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-white">{patient.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({patient.patient_code})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {patient.age} yrs • {patient.gender} • Blood Group: <strong className="text-rose-400">{patient.blood_group}</strong>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                  patient.risk_level === 'CRITICAL' ? 'bg-red-500 text-white' :
                  patient.risk_level === 'HIGH' ? 'bg-orange-500 text-white' :
                  patient.risk_level === 'MODERATE' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  {patient.risk_score} PTS
                </div>
              </div>

              {/* Vitals snapshot */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">HR</span>
                  <span className="text-xs font-bold text-red-400">{patient.current_vitals.heart_rate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SpO2</span>
                  <span className="text-xs font-bold text-emerald-400">{patient.current_vitals.spo2}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TEMP</span>
                  <span className="text-xs font-bold text-amber-400">{patient.current_vitals.temperature}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">RESP</span>
                  <span className="text-xs font-bold text-cyan-400">{patient.current_vitals.respiration_rate}</span>
                </div>
              </div>

              {/* Issues & Actions */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 truncate max-w-[200px]">
                  Action: <strong className="text-slate-200">{patient.action_required}</strong>
                </span>
                <span className="text-cyan-400 hover:underline flex items-center font-medium">
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fall Countdown Modal */}
      {fallPatient && (
        <FallCountdownModal
          patientId={fallPatient.id}
          patientCode={fallPatient.code}
          patientName={fallPatient.name}
          isOpen={fallModalOpen}
          onClose={() => setFallModalOpen(false)}
        />
      )}
    </div>
  );
};
