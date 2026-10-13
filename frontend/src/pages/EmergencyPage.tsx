import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, AlertTriangle, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/emergency/events');
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch emergency events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            <h1 className="text-2xl font-black text-white font-['Outfit']">Emergency Event Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active and historical fall detections, SOS distress triggers, and critical physiological collapse events.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-2xl border border-red-500/40 bg-red-950/20 glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base text-white">{ev.patient_code} - Emergency Event</span>
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded font-mono">
                    {ev.event_type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Location: <strong className="text-cyan-400 font-mono">{ev.latitude?.toFixed(4)}, {ev.longitude?.toFixed(4)}</strong> (Inside St. Jude Hospital)
                </p>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Triggered at: {new Date(ev.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-400 font-semibold bg-red-950 border border-red-800 px-3 py-1 rounded-xl">
                CRITICAL DISPATCH ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
