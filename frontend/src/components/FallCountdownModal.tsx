import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, ShieldAlert, CheckCircle, XCircle, QrCode, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FallCountdownModalProps {
  patientId: number;
  patientCode: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FallCountdownModal: React.FC<FallCountdownModalProps> = ({
  patientId,
  patientCode,
  patientName,
  isOpen,
  onClose,
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setConfirmed(false);
      setCancelled(false);
      return;
    }

    if (cancelled || confirmed) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Confirmation reached 0
      handleConfirm();
    }
  }, [isOpen, countdown, confirmed, cancelled]);

  const handleConfirm = async () => {
    try {
      await api.post(`/api/emergency/${patientId}/fall/confirm`);
      setConfirmed(true);
    } catch (err) {
      console.error("Failed to confirm fall:", err);
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/api/emergency/${patientId}/fall/cancel`);
      setCancelled(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Failed to cancel fall:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <span className="font-extrabold text-lg tracking-wide">
              {confirmed ? '🔴 FALL CONFIRMED' : '⚠ POSSIBLE FALL DETECTED'}
            </span>
          </div>
          <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">
            {patientCode}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <div className="text-slate-300">
            <div className="text-xl font-bold text-white">{patientName}</div>
            <p className="text-xs text-slate-400 mt-1">
              High g-force impact followed by prolonged horizontal orientation detected by ESP32 MPU6050 sensor.
            </p>
          </div>

          {!confirmed && !cancelled && (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping"></div>
                <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-red-500 font-mono">
                    {countdown}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Cancel immediately if this was a false alarm. Escalating to emergency response when timer expires.
              </p>

              <button
                onClick={handleCancel}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-sm transition-all shadow-md"
              >
                CANCEL FALL ALERT
              </button>
            </div>
          )}

          {confirmed && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-medium">
                Emergency protocol initiated. Patient risk score updated to <strong>CRITICAL (92+)</strong>. Nurse triage queue updated.
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/vitalpass?patient=${patientCode}`);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>OPEN VITALPASS PASSPORT</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate(`/patients/${patientId}`);
                  }}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
                >
                  <span>VIEW PATIENT PROFILE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {cancelled && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Fall alert cancelled successfully.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
