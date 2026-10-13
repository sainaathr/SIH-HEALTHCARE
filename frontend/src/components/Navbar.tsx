import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Shield, User, LogOut, Mic, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  onToggleVoice: () => void;
  isVoiceActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleVoice, isVoiceActive }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'nurse':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">NURSE</span>;
      case 'doctor':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">DOCTOR</span>;
      case 'emergency_admin':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">EMERGENCY ADMIN</span>;
      case 'patient':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">PATIENT</span>;
      case 'family_member':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">CAREGIVER / FAMILY</span>;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-300 to-white bg-clip-text text-transparent font-['Outfit']">
              VITALGUARD
            </span>
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] px-1.5 py-0.5 rounded font-mono">
              SIH PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            Continuous Non-Invasive Patient Monitoring & VitalPass Response
          </p>
        </div>
      </div>

      {/* Center status indicator */}
      <div className="hidden lg:flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1 rounded-full text-xs">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-slate-300 font-medium">IoT Telemetry Engine: Active</span>
        <span className="text-slate-500">|</span>
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-300">VitalPass Security Enforced</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-4">
        {/* Voice Assistant Toggle */}
        <button
          onClick={onToggleVoice}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isVoiceActive
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
          title="Toggle AI Voice Assistant"
        >
          <Mic className={`w-4 h-4 ${isVoiceActive ? 'animate-bounce' : ''}`} />
          <span className="hidden sm:inline">{isVoiceActive ? 'Voice Active' : 'Voice Command'}</span>
        </button>

        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{user.full_name}</div>
              <div className="flex justify-end">{getRoleBadge(user.role)}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
