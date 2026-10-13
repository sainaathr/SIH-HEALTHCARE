import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Alert } from '../types';
import { BellRing, ShieldAlert, CheckCircle, AlertTriangle, Filter, RefreshCw } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/api/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (alertId: number) => {
    try {
      await api.post(`/api/alerts/${alertId}/resolve`);
      fetchAlerts();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    return filterSeverity === 'ALL' || a.severity === filterSeverity;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-black text-white font-['Outfit']">Alert Monitoring Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of physiological threshold breaches, fall events, SOS signals, and sensor disconnects.
          </p>
        </div>

        {/* Severity filter */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterSeverity === sev ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Alert Type</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {alert.patient_code || `P00${alert.patient_id}`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">
                    {alert.alert_type}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] font-mono ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                      alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      alert.severity === 'MODERATE' ? 'bg-amber-500 text-slate-950' :
                      'bg-blue-500 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    {alert.message}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      alert.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {alert.status === 'ACTIVE' ? (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-300 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
                      >
                        Resolve Alert
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs">Resolved</span>
                    )}
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
