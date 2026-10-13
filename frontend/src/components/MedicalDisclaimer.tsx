import React from 'react';
import { AlertCircle } from 'lucide-react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-slate-800/80 pt-4 pb-6 px-4 text-center text-xs text-slate-500">
      <div className="flex items-center justify-center space-x-1.5 text-amber-500/80 mb-1">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="font-semibold text-[11px] uppercase tracking-wider">HACKATHON DEMO DISCLAIMER</span>
      </div>
      <p className="max-w-3xl mx-auto text-[11px] leading-relaxed">
        VitalGuard is a functional proof-of-concept healthcare prototype engineered for SIH. Sensor inputs and risk assessments are simulated or derived from continuous non-invasive telemetry. Not intended for clinical diagnostic use without medical device certification.
      </p>
    </footer>
  );
};
