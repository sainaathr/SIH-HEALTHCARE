export type UserRole = 'nurse' | 'doctor' | 'emergency_admin' | 'patient' | 'family_member';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  hospital_id?: number;
  patient_id?: number;
  is_active: boolean;
}

export interface Patient {
  id: number;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  date_of_birth?: string;
  blood_group: string;
  allergies?: string;
  critical_conditions?: string;
  current_medications?: string;
  status: 'stable' | 'moderate' | 'high-risk' | 'critical';
  baseline_hr: number;
  baseline_spo2: number;
  baseline_temperature: number;
  baseline_respiration: number;
  created_at: string;
}

export interface Vital {
  id: number;
  patient_id: number;
  timestamp: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  respiration_rate: number;
  activity_state: 'RESTING' | 'WALKING' | 'MOVING' | 'INACTIVE';
  acceleration: number;
  orientation: 'UPRIGHT' | 'LYING_FLAT' | 'TILTED';
  latitude?: number;
  longitude?: number;
  speed: number;
  battery: number;
  device_connected: boolean;
}

export interface Alert {
  id: number;
  patient_id: number;
  patient_code?: string;
  patient_name?: string;
  alert_type: string;
  severity: 'INFO' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  timestamp: string;
  resolved_at?: string;
}

export interface RiskContributor {
  factor: string;
  weight: number;
  impact: number;
  detail: string;
}

export interface EarlyWarning {
  label: string;
  current_risk: number;
  predicted_near_term_risk: number;
  trend: 'STABLE' | 'IMPROVING' | 'DETERIORATING' | 'UNKNOWN';
  explanation: string;
}

export interface RiskAssessment {
  patient_id: number;
  score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  contributors: RiskContributor[];
  explanation: string;
  early_warning: EarlyWarning;
}

export interface NursePriorityItem {
  priority_rank: number;
  patient_id: number;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  main_issue: string;
  trend: string;
  action_required: string;
  current_vitals: {
    heart_rate: number;
    spo2: number;
    temperature: number;
    respiration_rate: number;
    battery: number;
    connected: boolean;
  };
  active_alert_count: number;
  last_update: string;
}

export interface VitalPassSummary {
  patient_id: number;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  allergies: string;
  critical_conditions: string;
  current_medication: string;
  vitals: {
    heart_rate: number;
    spo2: number;
    temperature: number;
    respiration_rate: number;
    battery: number;
    connected: boolean;
    timestamp: string;
  };
  risk_score: number;
  risk_level: string;
  emergency_contacts: {
    name: string;
    relationship: string;
    phone: string;
    priority: number;
  }[];
  location: {
    latitude: number;
    longitude: number;
    hospital_name: string;
  };
  recent_alerts: {
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }[];
}

export interface VitalPassScanResult {
  access_granted: boolean;
  scanned_by: {
    user_id: number;
    name: string;
    role: UserRole;
  };
  hospital: string;
  geofence_verified: boolean;
  emergency_summary: VitalPassSummary;
  doctor_access?: {
    medical_history: { date: string; condition: string; procedure?: string; notes?: string }[];
    previous_procedures: string[];
    hospitalizations: string[];
    medication_history: string;
    relevant_clinical_notes: string;
  };
}

export interface MedicalReport {
  id: number;
  patient_id: number;
  report_name: string;
  report_type: string;
  report_date: string;
  doctor_hospital?: string;
  notes?: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

export interface Medication {
  id: number;
  patient_id: number;
  name: string;
  dosage: string;
  frequency: string;
  schedule?: string;
  start_date?: string;
  end_date?: string;
  prescribing_doctor?: string;
  notes?: string;
  created_at: string;
}

export interface VitalCirclePermission {
  id: number;
  family_user_id: number;
  patient_id: number;
  can_view_vitals: boolean;
  can_view_summary: boolean;
  can_view_alerts: boolean;
  can_view_device_status: boolean;
  can_view_location_emergency: boolean;
  can_view_medication_reminders: boolean;
  can_view_medical_reports: boolean;
  can_view_medical_history: boolean;
}

export interface VitalCircleMember {
  id: number;
  family_user_id: number;
  full_name: string;
  username: string;
  relationship_label: string;
  permissions: VitalCirclePermission;
}

export interface FamilyPatientSummary {
  patient_id: number;
  patient_code: string;
  name: string;
  status: string;
  relationship: string;
  risk_score: number;
  risk_level: string;
  wearable_connected: boolean;
  battery: number;
  permissions: VitalCirclePermission;
  vitals?: {
    heart_rate: number;
    spo2: number;
    temperature: number;
    respiration_rate: number;
    last_sync: string;
  };
  recent_alerts?: Alert[];
  location?: {
    latitude: number;
    longitude: number;
    location_name: string;
    is_emergency_active: boolean;
  };
  medications?: { name: string; dosage: string; schedule?: string }[];
  reports?: { id: number; report_name: string; date: string }[];
  emergency_alert?: {
    is_active: boolean;
    event_type: string;
    message: string;
    timestamp: string;
  };
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

