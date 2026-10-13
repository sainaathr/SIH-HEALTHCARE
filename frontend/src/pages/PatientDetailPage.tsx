import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Patient, Vital, RiskAssessment, Alert } from '../types';
import { 
  ArrowLeft, 
  Heart, 
  Thermometer, 
  Wind, 
  Activity, 
  Battery, 
  Compass, 
  ShieldAlert, 
  QrCode, 
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskMeter } from '../components/RiskMeter';
import { PatientLocationMap } from '../components/PatientLocationMap';
import { FallCountdownModal } from '../components/FallCountdownModal';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestVital, setLatestVital] = useState<Vital | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fallModalOpen, setFallModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchPatientDetails = async () => {
    if (!id) return;
    try {
      // 1. Patient info
      const pRes = await api.get(`/api/patients/${id}`);
      setPatient(pRes.data);

      // 2. Latest vital
      const vRes = await api.get(`/api/patients/${id}/vitals/latest`);
      setLatestVital(vRes.data);

      // 3. Telemetry history
      const tRes = await api.get(`/api/patients/${id}/telemetry?limit=25`);
      const chartData = tRes.data.map((v: Vital) => ({
        time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        heartRate: v.heart_rate,
        spo2: v.spo2,
        temperature: v.temperature,
        respiration: v.respiration_rate,
      })).reverse();
      setTelemetryHistory(chartData);

      // 4. Risk assessment
      const rRes = await api.get(`/api/patients/${id}/risk`);
      setRiskAssessment(rRes.data);

      // 5. Patient alerts
      const aRes = await api.get(`/api/patients/${id}/alerts`);
      setAlerts(aRes.data);
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
    const interval = setInterval(fetchPatientDetails, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const triggerScenario = async (scenario: string) => {
    if (!id) return;
    try {
      if (scenario === 'FALL') {
        await api.post(`/api/emergency/${id}/fall`);
        setFallModalOpen(true);
      } else if (scenario === 'SOS') {
        await api.post(`/api/emergency/${id}/sos`);
      } else {
        await api.post(`/api/simulation/${id}/start/${scenario}`);
      }
      fetchPatientDetails();
    } catch (err) {
      console.error("Failed to trigger scenario:", err);
    }
  };

  if (loading || !patient) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
        <p>Loading patient physiological stream...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white font-['Outfit']">{patient.name}</h1>
              <span className="font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 text-xs px-2 py-0.5 rounded font-bold">
                {patient.patient_code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {patient.age} yrs • {patient.gender} • DOB: {patient.date_of_birth || '1968-04-12'} • Blood Group: <strong className="text-rose-400">{patient.blood_group}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/vitalpass?patient=${patient.patient_code}`)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>SCAN VITALPASS</span>
          </button>
        </div>
      </div>

      {/* Quick Scenario Triggers Bar for this Patient */}
      <div className="bg-slate-900/90 border border-cyan-500/30 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 glass-panel">
        <span className="text-xs font-bold text-cyan-400 font-mono flex items-center space-x-1">
          <Activity className="w-4 h-4" />
          <span>Patient Simulation Overrides:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => triggerScenario('NORMAL')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/30">
            Normal
          </button>
          <button onClick={() => triggerScenario('DETERIORATION')} className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/30">
            Deteriorate
          </button>
          <button onClick={() => triggerScenario('FALL')} className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/30">
            Simulate Fall
          </button>
          <button onClick={() => triggerScenario('LOW_SPO2')} className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-semibold hover:bg-orange-500/30">
            Low SpO2
          </button>
          <button onClick={() => triggerScenario('SOS')} className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold hover:bg-purple-500/30">
            Trigger SOS
          </button>
        </div>
      </div>

      {/* Live Vitals Grid */}
      {latestVital && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase">Heart Rate</span>
              <Heart className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {latestVital.heart_rate} <span className="text-xs font-sans text-slate-400 font-normal">BPM</span>
            </div>
            <span className="text-[10px] text-slate-500">Baseline: {patient.baseline_hr} BPM</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase">SpO2 Oxygen</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {latestVital.spo2}%
            </div>
            <span className="text-[10px] text-slate-500">Baseline: {patient.baseline_spo2}%</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase">Temperature</span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {latestVital.temperature}°C
            </div>
            <span className="text-[10px] text-slate-500">Baseline: {patient.baseline_temperature}°C</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase">Respiration</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {latestVital.respiration_rate} <span className="text-xs font-sans text-slate-400 font-normal">RPM</span>
            </div>
            <span className="text-[10px] text-slate-500">Baseline: {patient.baseline_respiration} RPM</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase">Orientation</span>
              <Compass className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white font-mono mt-2 truncate">
              {latestVital.orientation}
            </div>
            <span className="text-[10px] text-slate-500">{latestVital.activity_state}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase">Battery / Connectivity</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {latestVital.battery}%
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">ESP32 Online</span>
          </div>
        </div>
      )}

      {/* Main Grid: Risk Engine & Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Assessment Component */}
        {riskAssessment && (
          <RiskMeter assessment={riskAssessment} />
        )}

        {/* GPS Location & Geofence Map */}
        {latestVital && (
          <PatientLocationMap
            latitude={latestVital.latitude || 12.9716}
            longitude={latestVital.longitude || 77.5946}
            patientCode={patient.patient_code}
            patientName={patient.name}
            speed={latestVital.speed}
          />
        )}
      </div>

      {/* Telemetry Trajectory Chart & Medical Record */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 glass-panel">
          <h3 className="font-bold text-sm text-slate-200">Historical Physiological Trajectory</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[30, 150]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical History & Allergies (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 glass-panel">
          <h3 className="font-bold text-sm text-slate-200">Clinical History & Baseline Profile</h3>
          
          <div className="space-y-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 uppercase text-[10px] font-bold block">ALLERGIES</span>
              <p className="text-rose-400 font-medium mt-0.5">{patient.allergies || 'No known drug allergies'}</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 uppercase text-[10px] font-bold block">CRITICAL CONDITIONS</span>
              <p className="text-amber-400 font-medium mt-0.5">{patient.critical_conditions || 'None'}</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 uppercase text-[10px] font-bold block">CURRENT MEDICATIONS</span>
              <p className="text-cyan-300 font-medium mt-0.5">{patient.current_medications || 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fall Modal */}
      <FallCountdownModal
        patientId={patient.id}
        patientCode={patient.patient_code}
        patientName={patient.name}
        isOpen={fallModalOpen}
        onClose={() => setFallModalOpen(false)}
      />
    </div>
  );
};
