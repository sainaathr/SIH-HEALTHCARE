import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AccessLog } from '../types';
import { FileText, ShieldCheck, Lock, User, RefreshCw } from 'lucide-react';

export const AccessLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/access-logs');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch access logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white font-['Outfit']">Access Audit & Compliance Logs</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all VitalPass scans, emergency overrides, and medical data access events for HIPAA compliance.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Access Type</th>
                <th className="py-3.5 px-4">Patient Code</th>
                <th className="py-3.5 px-4">Hospital / Scanner ID</th>
                <th className="py-3.5 px-4">Clinical Reason</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {log.username || 'System Scanner'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {log.access_type}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 font-bold">
                    {log.patient_code || `P00${log.patient_id}`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {log.hospital_name || 'St. Jude'} ({log.scanner_device_id || 'LOCAL'})
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 italic max-w-xs truncate">
                    {log.reason || 'Routine VitalPass Scan'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      log.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.success ? 'SUCCESS' : 'DENIED'}
                    </span>
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
