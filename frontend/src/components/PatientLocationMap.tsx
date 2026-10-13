import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, Navigation, ShieldCheck, AlertCircle } from 'lucide-react';

interface PatientLocationMapProps {
  latitude: number;
  longitude: number;
  hospitalLat?: number;
  hospitalLng?: number;
  geofenceRadius?: number;
  patientCode?: string;
  patientName?: string;
  speed?: number;
}

export const PatientLocationMap: React.FC<PatientLocationMapProps> = ({
  latitude,
  longitude,
  hospitalLat = 12.9716,
  hospitalLng = 77.5946,
  geofenceRadius = 500,
  patientCode = 'P001',
  patientName = 'Patient',
  speed = 0.0,
}) => {
  // Custom hospital icon
  const hospitalIcon = L.divIcon({
    className: 'custom-hospital-icon',
    html: `<div style="background-color: #0284c7; color: white; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v12M6 12h12"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Custom patient marker icon
  const patientIcon = L.divIcon({
    className: 'custom-patient-icon',
    html: `<div class="radar-pulse" style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(239,68,68,0.8);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-3.5 px-4 bg-slate-800/60 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-slate-200">GPS & Hospital Geofence Radar</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">Geofence Enforced (500m)</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="h-64 w-full relative z-0">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Hospital Geofence Circle */}
          <Circle
            center={[hospitalLat, hospitalLng]}
            radius={geofenceRadius}
            pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.15, weight: 2, dashArray: '5, 5' }}
          />
          {/* Hospital Marker */}
          <Marker position={[hospitalLat, hospitalLng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-slate-900 font-sans p-1 text-xs">
                <strong>St. Jude General Hospital</strong><br />
                Geofence Radius: 500 meters
              </div>
            </Popup>
          </Marker>
          {/* Patient Marker */}
          <Marker position={[latitude, longitude]} icon={patientIcon}>
            <Popup>
              <div className="text-slate-900 font-sans p-1 text-xs">
                <strong>{patientCode} - {patientName}</strong><br />
                Speed: {speed} m/s
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Readout bar */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        <div>
          <span className="text-slate-500 block text-[10px]">LATITUDE</span>
          <span className="text-cyan-300 font-semibold">{latitude.toFixed(6)}° N</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">LONGITUDE</span>
          <span className="text-cyan-300 font-semibold">{longitude.toFixed(6)}° E</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">CURRENT SPEED</span>
          <span className="text-slate-300 font-semibold">{speed} m/s</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">GEOFENCE STATUS</span>
          <span className="text-emerald-400 font-bold">INSIDE ZONE</span>
        </div>
      </div>
    </div>
  );
};
