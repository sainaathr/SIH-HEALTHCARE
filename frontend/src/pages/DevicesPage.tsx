import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DeviceStatus } from '../types';
import { Cpu, Battery, Wifi, ShieldCheck, RefreshCw } from 'lucide-react';

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/api/devices');
      setDevices(res.data);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white font-['Outfit']">ESP32 Hardware & Wearable Nodes</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Status of all active ESP32 wearable sensor packages, battery telemetry, and firmware build integrity.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Scan Hardware</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div key={device.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 glass-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white font-mono">{device.device_id}</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                AUTHORIZED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">BATTERY</span>
                <span className="font-bold text-emerald-400">{device.battery}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">FIRMWARE</span>
                <span className="font-bold text-slate-300">{device.firmware_version}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
              <span className="flex items-center space-x-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>Wi-Fi Stream Active</span>
              </span>
              <span>Patient: <strong className="text-white">P00{device.patient_id}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
