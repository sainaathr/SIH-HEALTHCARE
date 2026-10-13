import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { RiskMeter } from '../../components/RiskMeter';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  ShieldCheck, 
  Battery, 
  Wifi, 
  CheckCircle2, 
  BellRing, 
  Pill, 
  Flame, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Footprints
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [sosSuccess, setSosSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await patientApi.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSOS = () => {
    setSosSuccess(true);
    setTimeout(() => {
      setSosSuccess(false);
      setSosModalOpen(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const vitals = data?.vitals || {};
  const wearable = data?.wearable || {};
  const risk = data?.risk || { score: 14, risk_level: 'LOW' };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Patient Health Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              Good evening, {data?.greeting_name || 'Rahul'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Continuous monitoring active. Your vital parameters are currently <span className="text-emerald-400 font-semibold">STABLE</span>.
            </p>
          </div>

          <button
            onClick={() => setSosModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center space-x-2 animate-pulse"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* Wearable Status & Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Wearable Band</div>
              <div className="text-sm font-bold text-white">{wearable.device_id || 'SCANNER-STJUDE-01'}</div>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            CONNECTED
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Band Battery</div>
              <div className="text-sm font-bold text-white">{wearable.battery || 87}%</div>
            </div>
          </div>
          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${wearable.battery || 87}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Last Telemetry Sync</div>
              <div className="text-sm font-bold text-white">{vitals.last_sync || 'Just now'}</div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">100Hz IoT</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Today's Activity</div>
              <div className="text-sm font-bold text-white">4,820 / 8,000 steps</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400">60%</span>
        </div>
      </div>

      {/* Main Grid: Telemetry Cards & Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vitals Telemetry Grid (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Real-Time Physiological Telemetry</span>
            </h2>
            <Link to="/patient/health" className="text-xs text-cyan-400 hover:underline flex items-center space-x-1">
              <span>View History & Trends</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Heart Rate</span>
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-pulse">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white font-['Outfit']">{vitals.heart_rate || 75}</span>
                <span className="text-sm text-slate-400 font-semibold">BPM</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>Baseline: 75.0 BPM</span>
                <span className="text-emerald-400 font-semibold">Normal</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SpO2 Saturation</span>
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white font-['Outfit']">{vitals.spo2 || 98.0}</span>
                <span className="text-sm text-slate-400 font-semibold">%</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>Baseline: 98.0%</span>
                <span className="text-emerald-400 font-semibold">Optimal</span>
              </div>
            </div>

            {/* Body Temperature */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Body Temperature</span>
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Thermometer className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white font-['Outfit']">{vitals.temperature || 36.7}</span>
                <span className="text-sm text-slate-400 font-semibold">°C</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>Baseline: 36.7°C</span>
                <span className="text-emerald-400 font-semibold">Normal</span>
              </div>
            </div>

            {/* Respiration Rate */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Respiration Rate</span>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Wind className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white font-['Outfit']">{vitals.respiration_rate || 16}</span>
                <span className="text-sm text-slate-400 font-semibold">/ min</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>Baseline: 16.0 / min</span>
                <span className="text-emerald-400 font-semibold">Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Analysis Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Continuous Risk Score
            </h3>
            <RiskMeter score={risk.score} riskLevel={risk.risk_level} />
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-slate-300">Early Warning Analysis</div>
            <p className="text-slate-400 leading-relaxed">
              {risk.explanation || 'Physiological trends indicate stable status with no near-term risk escalation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Medication Reminders & VitalCircle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Medication Reminders */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Pill className="w-5 h-5 text-emerald-400" />
              <span>Today's Medication Schedule</span>
            </h3>
            <Link to="/patient/medications" className="text-xs text-cyan-400 hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.medication_reminders || []).map((med: any) => (
              <div key={med.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{med.name} ({med.dosage})</div>
                    <div className="text-xs text-slate-400">{med.due_text}</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all">
                  Take Dose
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* VitalCircle Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>VitalCircle Family Sharing</span>
            </h3>
            <Link to="/patient/vitalcircle" className="text-xs text-cyan-400 hover:underline">
              Manage Permissions
            </Link>
          </div>

          <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300">Connected Caregivers (1)</span>
              <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">ACTIVE</span>
            </div>
            <p className="text-slate-300 text-xs font-semibold">
              Priya Kumar (Daughter)
            </p>
            <p className="text-slate-400 text-xs">
              Permissions: Vitals (On), Alerts (On), Location (On Emergency), Reports (Off)
            </p>
          </div>
        </div>

      </div>

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
              <div>
                <h3 className="text-xl font-bold text-white">Trigger Emergency SOS?</h3>
                <p className="text-xs text-slate-400">Immediate response dispatch to St. Jude Hospital</p>
              </div>
            </div>

            {sosSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="font-bold text-emerald-300">SOS Signal Sent!</div>
                <div className="text-xs text-slate-300">Triage team & emergency contact (Priya) notified.</div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-300">
                  Are you sure you want to broadcast an SOS signal? Emergency personnel and your registered family circle will be alerted immediately with your live GPS location.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setSosModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerSOS}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-red-500/20"
                  >
                    CONFIRM SOS
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
