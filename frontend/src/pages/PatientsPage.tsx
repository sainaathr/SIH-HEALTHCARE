import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Patient } from '../types';
import { Users, Search, Filter, ArrowUpRight, Activity, ShieldAlert, Heart } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/api/patients');
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.patient_code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || p.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-['Outfit']">Patient Roster & Medical Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous wireless monitoring roster across all hospital wards
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or P001..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['ALL', 'STABLE', 'HIGH-RISK', 'CRITICAL'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterStatus === st ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Patient Code</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Allergies & Conditions</th>
                <th className="py-3.5 px-4">Baselines (HR / SpO2)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                    {patient.patient_code}
                  </td>
                  <td className="py-4 px-4 font-bold text-white text-sm">
                    {patient.name}
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {patient.age} yrs • {patient.gender}
                  </td>
                  <td className="py-4 px-4 font-bold text-rose-400 font-mono">
                    {patient.blood_group}
                  </td>
                  <td className="py-4 px-4 max-w-xs truncate">
                    <span className="text-amber-400 font-medium">{patient.critical_conditions || 'None'}</span>
                    {patient.allergies && <span className="text-slate-400 block text-[11px] truncate">Allergies: {patient.allergies}</span>}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">
                    <span>{patient.baseline_hr} BPM</span> / <span className="text-emerald-400">{patient.baseline_spo2}%</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase font-mono ${
                      patient.status === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      patient.status === 'high-risk' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      patient.status === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all inline-flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/vitalpass?patient=${patient.patient_code}`)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      VitalPass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
