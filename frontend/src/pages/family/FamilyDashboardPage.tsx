import React, { useState, useEffect } from 'react';
import { familyApi } from '../../services/api';
import { RiskMeter } from '../../components/RiskMeter';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  ShieldCheck, 
  Lock, 
  BellRing, 
  MapPin, 
  Pill, 
  FileText, 
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

export const FamilyDashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFamilyDashboard();
    const interval = setInterval(fetchFamilyDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFamilyDashboard = async () => {
    try {
      const res = await familyApi.getPatients();
      setPatients(res.data);
      if (res.data.length > 0) {
        const first = res.data[0];
        setSelectedPatient(first);
        fetchPatientDetail(first.patient_id);
      }
    } catch (err) {
      console.error('Error fetching family dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetail = async (patientId: number) => {
    try {
      const res = await familyApi.getPatientDetail(patientId);
      setDetail(res.data);
    } catch (err) {
      console.error('Error fetching patient detail:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const permissions = detail?.permissions || {};
  const vitals = detail?.vitals || {};
  const risk = detail?.risk || { score: 14, risk_level: 'LOW' };
  const reports = detail?.medical_reports;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4" />
              <span>VitalCircle Family Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              Caregiver Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Continuous peace of mind. Real-time telemetry & consent-enforced data sharing.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Consent Engine Enforcement: Active</span>
          </div>
        </div>
      </div>

      {/* Patient Selector Tabs */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {patients.map((p) => (
          <button
            key={p.patient_id}
            onClick={() => {
              setSelectedPatient(p);
              fetchPatientDetail(p.patient_id);
            }}
            className={`px-5 py-3 rounded-2xl border transition-all text-left flex items-center space-x-3 shrink-0 ${
              selectedPatient?.patient_id === p.patient_id
                ? 'bg-gradient-to-r from-cyan-950 to-emerald-950 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-sm">
              {p.full_name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-white">{p.full_name}</div>
              <div className="text-xs text-cyan-400">{p.relationship} • {p.patient_code}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Consent Badges Strip */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-300">Data Access Granted by {selectedPatient?.full_name}:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${permissions.can_view_vitals ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>Vitals: {permissions.can_view_vitals ? 'GRANTED' : 'LOCKED'}</span>
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${permissions.can_view_alerts ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
            <BellRing className="w-3.5 h-3.5" />
            <span>Alerts: {permissions.can_view_alerts ? 'GRANTED' : 'LOCKED'}</span>
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${permissions.can_view_location_emergency ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
            <MapPin className="w-3.5 h-3.5" />
            <span>Location: Emergency</span>
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 ${permissions.can_view_medical_reports ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
            <FileText className="w-3.5 h-3.5" />
            <span>Reports: {permissions.can_view_medical_reports ? 'GRANTED' : 'LOCKED'}</span>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vitals & Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>{selectedPatient?.full_name}'s Vitals Stream</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE SENSOR STREAM</span>
            </span>
          </div>

          {permissions.can_view_vitals ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>HEART RATE</span>
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-3xl font-black text-white font-['Outfit']">
                  {vitals.heart_rate || 75} <span className="text-sm font-normal text-slate-400">BPM</span>
                </div>
                <div className="text-xs text-emerald-400 pt-2 border-t border-slate-800">
                  Normal Range (60-100 BPM)
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>SPO2 SATURATION</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-white font-['Outfit']">
                  {vitals.spo2 || 98.0} <span className="text-sm font-normal text-slate-400">%</span>
                </div>
                <div className="text-xs text-emerald-400 pt-2 border-t border-slate-800">
                  Optimal Saturation
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>BODY TEMPERATURE</span>
                  <Thermometer className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white font-['Outfit']">
                  {vitals.temperature || 36.7} <span className="text-sm font-normal text-slate-400">°C</span>
                </div>
                <div className="text-xs text-emerald-400 pt-2 border-t border-slate-800">
                  Normal Body Temp
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>RESPIRATION RATE</span>
                  <Wind className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white font-['Outfit']">
                  {vitals.respiration_rate || 16} <span className="text-sm font-normal text-slate-400">/min</span>
                </div>
                <div className="text-xs text-emerald-400 pt-2 border-t border-slate-800">
                  Steady Breathing
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <LockKeyhole className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="font-bold text-white">Vitals Stream Locked by Patient</div>
              <p className="text-xs text-slate-400">
                {selectedPatient?.full_name} has restricted real-time vitals viewing for your caregiver account.
              </p>
            </div>
          )}
        </div>

        {/* Risk Analysis Gauge */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Patient Risk Index
            </h3>
            <RiskMeter score={risk.score} riskLevel={risk.risk_level} />
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-slate-300">Continuous Assessment</div>
            <p className="text-slate-400 leading-relaxed">
              {risk.explanation || 'Physiological parameters are within safe thresholds.'}
            </p>
          </div>
        </div>
      </div>

      {/* Medication Adherence & Medical Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Medication Schedule */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Pill className="w-5 h-5 text-emerald-400" />
            <span>Medication Adherence Monitor</span>
          </h3>

          <div className="space-y-3">
            {(detail?.medications || []).map((med: any) => (
              <div key={med.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{med.name} ({med.dosage})</div>
                    <div className="text-slate-400">{med.schedule}</div>
                  </div>
                </div>
                <span className="text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded font-bold border border-emerald-800">
                  TAKEN
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Reports Section (Consent Restricted) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Medical Reports & Records</span>
          </h3>

          {reports === null ? (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
              <Lock className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="font-bold text-white text-sm">Consent Restricted</div>
              <p className="text-xs text-slate-400">
                {selectedPatient?.full_name} has not granted permission to view medical reports.
              </p>
            </div>
          ) : reports?.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No medical reports uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {reports?.map((rep: any) => (
                <div key={rep.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rep.report_name}</div>
                    <div className="text-slate-400">{rep.report_type} • {rep.report_date}</div>
                  </div>
                  <span className="text-cyan-400 font-bold">VIEWABLE</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
