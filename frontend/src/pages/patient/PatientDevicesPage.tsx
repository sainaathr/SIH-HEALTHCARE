import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { Smartphone, Battery, Wifi, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const PatientDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newDeviceId, setNewDeviceId] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('Personal Wearable Band');
  const [pairingSuccess, setPairingSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await patientApi.getDevices();
      setDevices(res.data);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceId.trim()) return;

    try {
      await patientApi.registerDevice(newDeviceId.trim(), deviceName);
      setPairingSuccess(true);
      setNewDeviceId('');
      fetchDevices();
      setTimeout(() => setPairingSuccess(false), 3000);
    } catch (err) {
      console.error('Error registering device:', err);
    }
  };

  const handleUnlink = async (id: string) => {
    try {
      await patientApi.unlinkDevice(id);
      fetchDevices();
    } catch (err) {
      console.error('Error unlinking device:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
          My VitalGuard Wearables & IoT Devices
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage paired biosensor bands and wireless telemetry hardware connected to your profile.
        </p>
      </div>

      {/* Pair New Device Form */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          <span>Pair New Biosensor Band</span>
        </h3>

        {pairingSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Device paired successfully to your account!</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Device ID / Serial Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SCANNER-STJUDE-01"
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Device Name / Label
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20"
            >
              Pair Device
            </button>
          </div>
        </form>
      </div>

      {/* Linked Devices List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Active Paired Devices</h3>

        {devices.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            No devices currently linked. Use the form above to pair your ESP32 biosensor band.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((dev) => (
              <div key={dev.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{dev.device_id}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Firmware: {dev.firmware_version}</div>
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </span>
                      <span className="flex items-center space-x-1 text-cyan-400 font-semibold">
                        <Battery className="w-3.5 h-3.5" />
                        <span>{dev.battery}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleUnlink(dev.device_id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Unlink Device"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
