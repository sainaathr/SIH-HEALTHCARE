import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, Lock, User as UserIcon, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('nurse_emily');
  const [password, setPassword] = useState<string>('vitalguard123');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { username, password });
      const user = res.data.user;
      login(res.data.access_token, user);
      
      if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (user.role === 'family_member') {
        navigate('/family/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const quickRoles = [
    { label: 'Patient Rahul', user: 'patient_rahul', role: 'Patient' },
    { label: 'Daughter Priya', user: 'family_priya', role: 'Family/Caregiver' },
    { label: 'Nurse Emily', user: 'nurse_emily', role: 'Nurse Triage' },
    { label: 'Dr. Jenkins', user: 'doc_jenkins', role: 'Attending Physician' },
    { label: 'Admin Steve', user: 'admin_steve', role: 'Emergency Admin' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-300 to-white bg-clip-text text-transparent font-['Outfit']">
              VITALGUARD
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Intelligent Continuous Monitoring & VitalPass Emergency Response
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 glass-panel">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="font-bold text-slate-200 text-sm">System Authentication</span>
            <span className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              ROLE BASED
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Hackathon Demo Credentials
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {quickRoles.map((qr) => (
                <button
                  key={qr.user}
                  type="button"
                  onClick={() => {
                    setUsername(qr.user);
                    setPassword('vitalguard123');
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    username === qr.user
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{qr.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{qr.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
