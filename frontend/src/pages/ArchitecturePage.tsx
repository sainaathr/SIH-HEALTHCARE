import React from 'react';
import { Network, Cpu, Shield, Server, Activity, QrCode, Lock, Zap } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Network className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl font-black text-white font-['Outfit']">System Architecture & Technical Blueprint</h1>
        </div>
        <p className="text-sm text-slate-400">
          Full end-to-end technical overview of VitalGuard's IoT hardware telemetry pipeline, explainable risk scoring, and zero-trust VitalPass health passport.
        </p>
      </div>

      {/* Layer 1: Hardware & Ingestion */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 glass-panel">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">1. IoT Hardware Node & Telemetry Ingestion Layer</h2>
            <p className="text-xs text-slate-400">Low-cost ESP32 microcontrollers with non-invasive sensors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300 block">MAX30102 Optical Sensor</span>
            <p className="text-slate-400 text-[11px]">PPG photoplethysmography continuous heart rate (BPM) & SpO2 oxygen saturation level.</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-300 block">MPU6050 6-Axis IMU</span>
            <p className="text-slate-400 text-[11px]">Accelerometer and gyroscope tracking g-force impact spikes and post-fall horizontal orientation.</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-300 block">NEO-6M GPS & DS18B20</span>
            <p className="text-slate-400 text-[11px]">Real-time patient location latitude/longitude and continuous skin temperature monitoring.</p>
          </div>
        </div>
      </div>

      {/* Layer 2: Explainable Risk Engine */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 glass-panel">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">2. Explainable Patient Risk Engine & Anomaly Detection</h2>
            <p className="text-xs text-slate-400">0-100 mathematical risk score with transparent clinical weights</p>
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
          <div className="text-amber-400 font-bold">Formula: Score = Σ (Weight_i × Deviation_i) + Fall_Penalty + SOS_Penalty</div>
          <p className="text-slate-400 font-sans leading-relaxed">
            Unlike black-box AI models, VitalGuard calculates transparent scores from baseline physiological norms, multi-point trajectory trend slopes (stable vs deteriorating), and verified event triggers.
          </p>
        </div>
      </div>

      {/* Layer 3: VitalPass Security */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 glass-panel">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">3. VitalPass™ Digital Passport & Geofence Enforcement</h2>
            <p className="text-xs text-slate-400">Zero-trust emergency medical passport with Haversine boundary check</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300 block">Haversine Geofencing</span>
            <p className="text-slate-400 text-[11px]">Validates distance d = 2r arcsin(√...) between scanner GPS location and hospital center. Restricts scans outside 500m.</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-300 block">Role-Based Access Control (RBAC)</span>
            <p className="text-slate-400 text-[11px]">Nurses see emergency triage summaries; Doctors unlock full clinical history and notes; Emergency Admins track audit logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
