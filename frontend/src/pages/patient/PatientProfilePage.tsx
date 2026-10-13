import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { User, ShieldCheck, Heart, MapPin, Calendar, Activity, QrCode } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
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
      console.error('Error fetching patient profile:', err);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 shadow-2xl relative overflow-hidden">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-cyan-500/20 shrink-0">
          {data?.full_name?.charAt(0) || 'R'}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
                {data?.full_name || 'Rahul Kumar'}
              </h1>
              <p className="text-sm text-cyan-400 font-mono font-semibold">
                Patient Code: {data?.patient_code || 'P001'}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full">
              ACTIVE MONITORING
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800">
            <div>Age: <strong className="text-white">68</strong></div>
            <div>Gender: <strong className="text-white">Male</strong></div>
            <div>Blood Group: <strong className="text-rose-400">O+ Positive</strong></div>
            <div>Hospital: <strong className="text-white">St. Jude</strong></div>
          </div>
        </div>
      </div>

      {/* Clinical Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Conditions & History */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Clinical Conditions & Risk Profile</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-white">Primary Diagnosis</div>
              <div className="text-slate-400 mt-0.5">Type 2 Diabetes Mellitus, Mild Hypertension</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-white">Known Allergies</div>
              <div className="text-amber-400 font-semibold mt-0.5">Penicillin (Moderate rash reaction)</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-white">Fall History</div>
              <div className="text-emerald-400 font-semibold mt-0.5">No fall incidents detected in past 90 days</div>
            </div>
          </div>
        </div>

        {/* Assigned Hardware */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Hardware Telemetry Binding</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl justify-between flex items-center">
              <div>
                <div className="font-bold text-white">ESP32 Biosensor ID</div>
                <div className="text-cyan-400 font-mono mt-0.5">SCANNER-STJUDE-01</div>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">SYNCED</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl justify-between flex items-center">
              <div>
                <div className="font-bold text-white">Ingestion Rate</div>
                <div className="text-slate-400 mt-0.5">100 Samples / sec over WebSocket</div>
              </div>
              <span className="text-cyan-400 font-bold">100 Hz</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
