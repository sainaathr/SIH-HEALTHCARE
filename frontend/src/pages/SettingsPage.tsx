import React, { useState } from 'react';
import api from '../services/api';
import { Settings, Play, RotateCcw, ShieldCheck, Zap, Server, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [demoStatus, setDemoStatus] = useState<string>('Ready for demonstration');
  const [loading, setLoading] = useState<boolean>(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.post('/api/simulation/demo/reset');
      setDemoStatus('Demo reset to clean baseline (P001 Stable).');
    } catch (err) {
      setDemoStatus('Error resetting demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDemo = async () => {
    setLoading(true);
    try {
      await api.post('/api/simulation/1/start/DETERIORATION');
      setDemoStatus('Demo sequence initiated: P001 physiological deterioration active.');
    } catch (err) {
      setDemoStatus('Error starting demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Settings className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl font-black text-white font-['Outfit']">System Settings & Hackathon Controls</h1>
        </div>
        <p className="text-sm text-slate-400">
          Manage hardware polling intervals, API target endpoints, active user session, and demo controls.
        </p>
      </div>

      {/* User Session Info */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 glass-panel">
        <h2 className="font-bold text-base text-white flex items-center space-x-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Authenticated Account Details</span>
        </h2>

        {user && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">FULL NAME</span>
              <span className="font-bold text-white">{user.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">USERNAME</span>
              <span className="font-bold text-cyan-400">{user.username}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CLINICAL ROLE</span>
              <span className="font-bold text-emerald-400 uppercase">{user.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* Master Demo Control Card */}
      <div className="bg-slate-900/80 border border-cyan-500/40 p-6 rounded-2xl space-y-4 glass-panel">
        <h2 className="font-bold text-base text-white flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Hackathon Demo Master Controller</span>
        </h2>
        
        <p className="text-xs text-slate-300 leading-relaxed">
          Use these triggers during judge presentation to instantly reset or execute the complete 5-minute hackathon demo flow.
        </p>

        {demoStatus && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-xs font-mono rounded-xl font-semibold">
            {demoStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleRunDemo}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>EXECUTE DEMO SCENARIO</span>
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET ALL PATIENTS TO STABLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
