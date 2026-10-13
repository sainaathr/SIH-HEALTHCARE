import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../services/api';
import { ShieldCheck, Check, ArrowLeft, Lock, FileText, Activity, BellRing, MapPin, Pill } from 'lucide-react';

export const PatientPermissionsPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [perms, setPerms] = useState({
    can_view_vitals: true,
    can_view_summary: true,
    can_view_alerts: true,
    can_view_device_status: true,
    can_view_location_emergency: true,
    can_view_medication_reminders: true,
    can_view_medical_reports: false,
    can_view_medical_history: false,
  });

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const res = await patientApi.getVitalCircle();
      const target = res.data.find((m: any) => m.family_user_id === Number(memberId));
      if (target) {
        setMember(target);
        setPerms(target.permissions);
      }
    } catch (err) {
      console.error('Error fetching member permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof perms) => {
    setPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!memberId) return;
    setSaving(true);
    try {
      await patientApi.updatePermissions(Number(memberId), perms);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving permissions:', err);
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Back Button & Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/patient/vitalcircle')}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
            Configure Consent Permissions
          </h1>
          <p className="text-sm text-slate-400">
            For caregiver: <strong className="text-cyan-400">{member?.full_name || 'Family Member'}</strong> ({member?.relationship_label})
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Permissions updated and enforced across backend API in real-time!</span>
        </div>
      )}

      {/* Permissions Toggles List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <span>Granular Consent Controls</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select what data {member?.full_name} is allowed to view in their Family Dashboard.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Vitals */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Real-Time Vitals Stream</div>
                <div className="text-xs text-slate-400">Allow viewing live HR, SpO2, Temp, and Respiration</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={perms.can_view_vitals}
              onChange={() => handleToggle('can_view_vitals')}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Alerts */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Emergency & Threshold Alerts</div>
                <div className="text-xs text-slate-400">Allow receiving alert notifications for abnormal trends</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={perms.can_view_alerts}
              onChange={() => handleToggle('can_view_alerts')}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Emergency Location */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Emergency Location Access</div>
                <div className="text-xs text-slate-400">Allow tracking GPS location during active fall or SOS events</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={perms.can_view_location_emergency}
              onChange={() => handleToggle('can_view_location_emergency')}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Medication Reminders */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Medication Reminders</div>
                <div className="text-xs text-slate-400">Allow caregiver to see daily prescription schedule</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={perms.can_view_medication_reminders}
              onChange={() => handleToggle('can_view_medication_reminders')}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Medical Reports (Sensitive) */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Uploaded Medical Reports (Sensitive)</div>
                <div className="text-xs text-slate-400">Allow viewing uploaded lab tests and pathology files</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={perms.can_view_medical_reports}
              onChange={() => handleToggle('can_view_medical_reports')}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={() => navigate('/patient/vitalcircle')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20"
          >
            {saving ? 'Saving...' : 'Save Consent Settings'}
          </button>
        </div>
      </div>

    </div>
  );
};
