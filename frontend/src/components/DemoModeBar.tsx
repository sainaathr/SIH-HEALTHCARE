import React, { useState } from 'react';
import api from '../services/api';
import { Play, RotateCcw, Activity, Zap, AlertTriangle, ShieldAlert, HeartPulse, Stethoscope, RefreshCw } from 'lucide-react';

interface DemoModeBarProps {
  onScenarioTriggered?: (scenario: string) => void;
  onFullDemoTriggered?: () => void;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({ onScenarioTriggered, onFullDemoTriggered }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1); // P001 by default
  const [activeScenario, setActiveScenario] = useState<string>('NORMAL');
  const [loading, setLoading] = useState<boolean>(false);

  const scenarios = [
    { key: 'NORMAL', label: 'NORMAL', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' },
    { key: 'DETERIORATION', label: 'DETERIORATION', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' },
    { key: 'FALL', label: 'FALL', color: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' },
    { key: 'LOW_SPO2', label: 'LOW SpO2', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30' },
    { key: 'HIGH_HEART_RATE', label: 'HIGH HR', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30' },
    { key: 'SOS', label: 'SOS', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30' },
    { key: 'SENSOR_FAILURE', label: 'SENSOR FAIL', color: 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' },
    { key: 'RECOVERY', label: 'RECOVERY', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30' },
  ];

  const handleTriggerScenario = async (scenario: string) => {
    setLoading(true);
    try {
      if (scenario === 'FALL') {
        await api.post(`/api/emergency/${selectedPatientId}/fall`);
      } else if (scenario === 'SOS') {
        await api.post(`/api/emergency/${selectedPatientId}/sos`);
      } else {
        await api.post(`/api/simulation/${selectedPatientId}/start/${scenario}`);
      }
      setActiveScenario(scenario);
      if (onScenarioTriggered) onScenarioTriggered(scenario);
    } catch (err) {
      console.error("Failed to trigger scenario:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await api.post('/api/simulation/demo/reset');
      setActiveScenario('NORMAL');
      if (onScenarioTriggered) onScenarioTriggered('NORMAL');
    } catch (err) {
      console.error("Failed to reset demo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullDemo = async () => {
    if (onFullDemoTriggered) {
      onFullDemoTriggered();
    } else {
      // Sequence: Normal -> Deterioration -> Fall
      handleTriggerScenario('DETERIORATION');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-cyan-500/30 px-6 py-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 px-3 py-1 rounded-lg text-xs font-bold font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>DEMO MODE CONTROLLER</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Target Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>P001 - Eleanor Vance</option>
              <option value={2}>P002 - Arthur Pendelton</option>
              <option value={3}>P003 - Clara Oswald</option>
              <option value={4}>P004 - Marcus Sterling</option>
              <option value={5}>P005 - Sophia Lin</option>
            </select>
          </div>
        </div>

        {/* Scenario buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {scenarios.map((sc) => (
            <button
              key={sc.key}
              onClick={() => handleTriggerScenario(sc.key)}
              disabled={loading}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${sc.color} ${
                activeScenario === sc.key ? 'ring-2 ring-white shadow-md scale-105' : ''
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Master Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunFullDemo}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN FULL DEMO</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEMO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
