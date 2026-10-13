/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitalguard_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const patientApi = {
  getDashboard: () => api.get('/api/patient/me/dashboard'),
  getHealth: () => api.get('/api/patient/me/health'),
  updateProfile: (data: any) => api.put('/api/patient/me/profile', data),
  getDevices: () => api.get('/api/patient/me/devices'),
  registerDevice: (deviceId: string, deviceName?: string) => api.post(`/api/patient/me/devices?device_id=${encodeURIComponent(deviceId)}${deviceName ? `&device_name=${encodeURIComponent(deviceName)}` : ''}`),
  unlinkDevice: (deviceId: string) => api.delete(`/api/patient/me/devices/${encodeURIComponent(deviceId)}`),
  getReports: () => api.get('/api/patient/me/reports'),
  uploadReport: (formData: FormData) => api.post('/api/patient/me/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteReport: (reportId: number) => api.delete(`/api/patient/me/reports/${reportId}`),
  getMedications: () => api.get('/api/patient/me/medications'),
  addMedication: (data: any) => api.post('/api/patient/me/medications', data),
  deleteMedication: (medId: number) => api.delete(`/api/patient/me/medications/${medId}`),
  getVitalCircle: () => api.get('/api/patient/me/vitalcircle'),
  updatePermissions: (memberUserId: number, perms: any) => api.put(`/api/patient/me/vitalcircle/${memberUserId}/permissions`, perms),
  getEmergencyContacts: () => api.get('/api/patient/me/emergency-contacts'),
};

export const familyApi = {
  getPatients: () => api.get('/api/family/patients'),
  getPatientDetail: (patientId: number) => api.get(`/api/family/patients/${patientId}`),
};

export default api;
