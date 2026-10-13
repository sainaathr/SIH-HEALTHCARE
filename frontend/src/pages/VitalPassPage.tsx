import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { VitalPassScanResult } from '../types';
import { QrCode, ShieldCheck, ShieldAlert, Lock, MapPin, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export const VitalPassPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPatient = searchParams.get('patient') || 'P001';

  const [patientCode, setPatientCode] = useState<string>(initialPatient);
  const [scannerId, setScannerId] = useState<string>('SCANNER-STJUDE-01');
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [scanResult, setScanResult] = useState<VitalPassScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Emergency Access Override state
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideSuccess, setOverrideSuccess] = useState<string>('');

  const handleScan = async () => {
    setError('');
    setOverrideSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/api/vitalpass/scan', {
        patient_identifier: patientCode,
        scanner_device_id: scannerId,
        scanner_latitude: latitude,
        scanner_longitude: longitude,
      });
      setScanResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'VitalPass scan rejected: Unauthorized scanner or geofence boundary breach.');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyOverride = async () => {
    if (!overrideReason.trim()) {
      alert("Please provide a clinical emergency justification reason.");
      return;
    }

    try {
      const patientIdMap: Record<string, number> = { P001: 1, P002: 2, P003: 3, P004: 4, P005: 5 };
      const pId = patientIdMap[patientCode] || 1;

      const res = await api.post(`/api/vitalpass/${pId}/emergency-access`, {
        reason: overrideReason
      });
      setOverrideSuccess("EMERGENCY OVERRIDE ACCESS GRANTED. Access logged to audit system.");
      // Re-scan to fetch updated data
      handleScan();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Emergency access override failed.");
    }
  };

  useEffect(() => {
    handleScan();
  }, [patientCode]);

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white font-['Outfit']">VitalPass™ Digital Health Passport</h1>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono">
              GEOFENCE & RBAC ENFORCED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Trust encrypted emergency health passport accessible by authorized hospital scanner devices within geofenced boundaries.
          </p>
        </div>
      </div>

      {/* Scanner Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 glass-panel">
        <div className="font-bold text-sm text-slate-200 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Simulate Hospital Scanner Device NFC / QR Scan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Target Patient Code</label>
            <select
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
            >
              <option value="P001">P001 - Eleanor Vance</option>
              <option value="P002">P002 - Arthur Pendelton</option>
              <option value="P003">P003 - Clara Oswald</option>
              <option value="P004">P004 - Marcus Sterling</option>
              <option value="P005">P005 - Sophia Lin</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Scanner Device ID</label>
            <input
              type="text"
              value={scannerId}
              onChange={(e) => setScannerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Scanner Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Scanner Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <button
              onClick={() => { setLatitude(12.9716); setLongitude(77.5946); }}
              className="text-cyan-400 underline font-mono text-[11px]"
            >
              Preset: Inside St Jude (12.9716, 77.5946)
            </button>
            <span>|</span>
            <button
              onClick={() => { setLatitude(13.5000); setLongitude(78.1000); }}
              className="text-amber-400 underline font-mono text-[11px]"
            >
              Preset: Outside Geofence (20km away)
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>{loading ? 'Decrypting...' : 'EXECUTE VITALPASS SCAN'}</span>
          </button>
        </div>
      </div>

      {/* Error / Rejection Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border-2 border-red-500/40 rounded-2xl text-red-400 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>VITALPASS ACCESS DENIED: GEOFENCE BREACH OR UNATHORIZED SCANNER</span>
          </div>
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Scan Results Display */}
      {scanResult && scanResult.access_granted && (
        <div className="space-y-6">
          
          {/* Security Banner */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="font-extrabold text-sm text-emerald-300">VITALPASS ENCRYPTED SCAN VALIDATED</div>
                <div className="text-xs text-slate-300">
                  Scanned by <strong>{scanResult.scanned_by.name}</strong> ({scanResult.scanned_by.role.toUpperCase()}) at <strong>{scanResult.hospital}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded">
                GEOFENCE: VERIFIED INSIDE
              </span>
            </div>
          </div>

          {/* Emergency Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-5 glass-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">{scanResult.emergency_summary.name}</h2>
                <p className="text-xs text-slate-400">
                  Code: <strong className="text-cyan-400 font-mono">{scanResult.emergency_summary.patient_code}</strong> • {scanResult.emergency_summary.age} yrs • {scanResult.emergency_summary.gender}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Blood Group</span>
                <span className="text-xl font-black text-rose-400 font-mono">{scanResult.emergency_summary.blood_group}</span>
              </div>
            </div>

            {/* Critical Emergency Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">ALLERGIES</span>
                <p className="text-rose-400 font-bold">{scanResult.emergency_summary.allergies}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">CRITICAL CONDITIONS</span>
                <p className="text-amber-400 font-bold">{scanResult.emergency_summary.critical_conditions}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">CURRENT MEDICATIONS</span>
                <p className="text-cyan-300 font-bold">{scanResult.emergency_summary.current_medication}</p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Emergency Contacts</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scanResult.emergency_summary.emergency_contacts.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-[11px] text-slate-400 block">({c.relationship})</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role-Based Doctor View vs Nurse View */}
            {scanResult.doctor_access ? (
              <div className="p-5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>DOCTOR FULL CLINICAL ACCESS UNLOCKED</span>
                </div>
                
                <div className="text-xs space-y-2">
                  <div className="font-semibold text-slate-200">Relevant Clinical Notes:</div>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    {scanResult.doctor_access.relevant_clinical_notes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-semibold">Nurse View: Basic Emergency Summary Only</span>
                  <span className="text-[10px] text-slate-400">Full medical history restricted to Doctors</span>
                </div>

                {/* Emergency Override Button */}
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <span className="text-xs font-bold text-slate-300">Request Emergency Clinical Access Override:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter emergency clinical justification (e.g. Unresponsive, ICU transfer)..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={handleEmergencyOverride}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-md"
                    >
                      OVERRIDE ACCESS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {overrideSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl">
                {overrideSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
