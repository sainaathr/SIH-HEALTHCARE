import React from 'react';
import { Compass, Zap, Cpu, Radio, ShieldCheck, HeartPulse } from 'lucide-react';

export const FuturePage: React.FC = () => {
  const roadmapItems = [
    {
      title: '5G NB-IoT & LoRaWAN Cellular Fallback',
      desc: 'Deploy direct cellular Narrowband IoT (NB-IoT) connectivity so patients moving outside hospital Wi-Fi maintain continuous telemetry transmission to cloud servers.',
      tag: 'Hardware Expansion',
      icon: Radio,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      title: 'Continuous Single-Lead ECG Ingestion',
      desc: 'Integrate AD8232 ECG sensor chips into the ESP32 wearable chest strap for real-time arrhythmia, atrial fibrillation, and QT interval anomaly detection.',
      tag: 'Clinical Sensor Upgrade',
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      title: 'TinyML On-Device Fall & Seizure Model',
      desc: 'Embed TensorFlow Lite for Microcontrollers directly onto the ESP32 chip to infer complex epileptic seizures and violent mechanical falls in under 200ms without relying on cloud connectivity.',
      tag: 'Edge AI Intelligence',
      icon: Cpu,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'ABDM & FHIR EHR Integration',
      desc: 'Full interoperability with Ayushman Bharat Digital Mission (ABDM) and Fast Healthcare Interoperability Resources (FHIR) standard EHR systems across India.',
      tag: 'National Compliance',
      icon: ShieldCheck,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Compass className="w-7 h-7 text-emerald-400" />
          <h1 className="text-3xl font-black text-white font-['Outfit']">Future Roadmap & Hardware Expansion</h1>
        </div>
        <p className="text-sm text-slate-400">
          Commercial deployment strategy, next-generation sensor integrations, and national healthcare compliance pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roadmapItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 glass-panel flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400 font-semibold flex items-center justify-between">
                <span>Phase {idx + 1} Target</span>
                <span>Q3 2026 - Q1 2027</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
