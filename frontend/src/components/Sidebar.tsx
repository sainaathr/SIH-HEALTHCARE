import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BellRing, 
  ShieldAlert, 
  QrCode, 
  Cpu, 
  FileText, 
  Network, 
  Compass, 
  Settings,
  Flame,
  HeartPulse,
  Pill,
  FileCheck,
  Smartphone,
  UserCheck,
  PhoneCall,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'nurse';

  const hospitalItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/nurse-priority', label: 'Nurse Priority Queue', icon: Flame, badge: 'Urgent' },
    { to: '/patients', label: 'Patient Roster', icon: Users },
    { to: '/alerts', label: 'Alert Center', icon: BellRing },
    { to: '/emergency', label: 'Emergency Events', icon: ShieldAlert },
    { to: '/vitalpass', label: 'VitalPass Passport', icon: QrCode, highlight: true },
    { to: '/access-logs', label: 'Access Audit Logs', icon: FileText },
    { to: '/devices', label: 'Hardware Devices', icon: Cpu },
    { to: '/architecture', label: 'System Architecture', icon: Network },
    { to: '/future', label: 'Future Scope', icon: Compass },
    { to: '/settings', label: 'Settings & Demo', icon: Settings },
  ];

  const patientItems: NavItem[] = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/health', label: 'My Health & Trends', icon: HeartPulse },
    { to: '/patient/devices', label: 'My Devices', icon: Smartphone },
    { to: '/patient/reports', label: 'My Reports', icon: FileCheck },
    { to: '/patient/medications', label: 'My Medications', icon: Pill },
    { to: '/patient/vitalpass', label: 'My VitalPass', icon: QrCode, highlight: true },
    { to: '/patient/vitalcircle', label: 'My VitalCircle', icon: UserCheck },
    { to: '/patient/emergency-contacts', label: 'Emergency Contacts', icon: PhoneCall },
    { to: '/patient/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const familyItems: NavItem[] = [
    { to: '/family/dashboard', label: 'Family Dashboard', icon: LayoutDashboard },
    { to: '/alerts', label: 'Emergency Alerts', icon: BellRing },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = role === 'patient' ? patientItems : role === 'family_member' ? familyItems : hospitalItems;
  const sectionTitle = role === 'patient' ? 'Patient Portal' : role === 'family_member' ? 'Caregiver Portal' : 'Clinical Operations';

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {sectionTitle}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-cyan-400 border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="rounded-xl p-3 bg-slate-800/40 border border-slate-700/50 text-xs space-y-1">
          <div className="font-semibold text-slate-300">ESP32 Hardware Ready</div>
          <p className="text-slate-400 text-[11px]">
            Software simulator active. Ready for direct ESP32 Wi-Fi ingestion.
          </p>
        </div>
      </div>
    </aside>
  );
};
