import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { QrCode, ShieldCheck, Lock, MapPin, Hospital, PhoneCall, AlertTriangle, Cpu } from 'lucide-react';

export const PatientVitalPassPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await patientApi.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching patient info:', err);
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

  const patientCode = data?.patient_code || 'P001';
  const qrData = `VITALPASS:${patientCode}:SCANNER-STJUDE-01`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
          My VitalPass Emergency Digital Passport
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Hospital-restricted emergency scanner passport with Haversine geofence verification and audit logging.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Passport Digital Card */}
        <div className="lg:col-span-1 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <QrCode className="w-4 h-4" />
              <span>VITALPASS EMERGENCY PASS</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              SECURE LOG
            </span>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center space-y-2 shadow-xl">
            <QrCode className="w-36 h-36 text-slate-900" />
            <div className="text-[10px] font-mono text-slate-600 font-bold tracking-wider">{patientCode}</div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white">{data?.full_name || 'Rahul Kumar'}</h2>
            <div className="text-xs text-slate-400">Patient Code: <strong className="text-cyan-400 font-mono">{patientCode}</strong></div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Band:</span>
              <span className="font-semibold text-white">SCANNER-STJUDE-01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Home Hospital:</span>
              <span className="font-semibold text-white">St. Jude General</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Geofence Status:</span>
              <span className="font-semibold text-emerald-400">Within 500m Campus</span>
            </div>
          </div>
        </div>

        {/* Security Flowchart & Explanation */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>How VitalPass Protects Your Medical Privacy</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">1. Hospital Geofence Verification</div>
                  <p className="text-slate-400 mt-0.5">
                    Scans are only allowed when emergency personnel are inside authorized hospital geofences (e.g. 500m radius of St. Jude Hospital).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">2. Role-Based Access Encryption</div>
                  <p className="text-slate-400 mt-0.5">
                    Nurses receive immediate triage summaries. Doctors receive full history. Unauthorized scans are rejected and logged.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">3. Immutable Access Audit Log</div>
                  <p className="text-slate-400 mt-0.5">
                    Every scan records scanner device ID, location coordinates, timestamp, and user credentials for complete auditability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Summary */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
              <span>VitalPass Emergency Contact Broadcast</span>
            </h3>
            <p className="text-xs text-slate-400">
              When VitalPass is scanned during a critical event, SMS alerts are automatically dispatched to your primary contact:
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Priya Kumar (Daughter)</div>
                <div className="text-slate-400">+91 98765 43210</div>
              </div>
              <span className="text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded font-bold">PRIMARY</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
