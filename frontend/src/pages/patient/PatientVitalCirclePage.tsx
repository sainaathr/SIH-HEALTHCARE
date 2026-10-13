import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { UserCheck, ShieldCheck, Settings, UserPlus, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientVitalCirclePage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchVitalCircle();
  }, []);

  const fetchVitalCircle = async () => {
    try {
      const res = await patientApi.getVitalCircle();
      setMembers(res.data);
    } catch (err) {
      console.error('Error fetching VitalCircle:', err);
    } finally {
      setLoading(false);
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
          My VitalCircle Caregiver Network
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage authorized family members, caregivers, and grant granular data access permissions.
        </p>
      </div>

      {/* Concept Explanation Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Patient-Driven Data Sovereignty</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          You own your health data. VitalCircle allows you to choose exactly which family members can view your real-time vitals, alert notifications, medication schedules, or lab reports. Permissions can be revoked at any time.
        </p>
      </div>

      {/* Connected Members */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Connected Caregivers</h3>

        {members.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            No family members currently connected. Contact hospital admin to invite family members.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div key={member.id} className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{member.full_name}</div>
                      <div className="text-xs text-cyan-400 font-semibold">{member.relationship_label}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    CONNECTED
                  </span>
                </div>

                {/* Permissions Badge Summary */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-300">Active Permissions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${member.permissions.can_view_vitals ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-500'}`}>
                      Vitals: {member.permissions.can_view_vitals ? 'YES' : 'NO'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${member.permissions.can_view_alerts ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-500'}`}>
                      Alerts: {member.permissions.can_view_alerts ? 'YES' : 'NO'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${member.permissions.can_view_location_emergency ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-500'}`}>
                      Location: Emergency
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${member.permissions.can_view_medical_reports ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-500'}`}>
                      Reports: {member.permissions.can_view_medical_reports ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/patient/vitalcircle/${member.family_user_id}/permissions`}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Configure Granular Permissions</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
