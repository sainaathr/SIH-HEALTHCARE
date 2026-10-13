import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { FileText, Upload, Trash2, ShieldCheck, Download, Calendar, Hospital, Plus, CheckCircle2 } from 'lucide-react';

export const PatientReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  const [reportName, setReportName] = useState<string>('');
  const [reportType, setReportType] = useState<string>('Pathology');
  const [reportDate, setReportDate] = useState<string>('2026-08-18');
  const [doctorHospital, setDoctorHospital] = useState<string>('St. Jude General Hospital');
  const [notes, setNotes] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await patientApi.getReports();
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !reportName) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('report_name', reportName);
      formData.append('report_type', reportType);
      formData.append('report_date', reportDate);
      formData.append('doctor_hospital', doctorHospital);
      formData.append('notes', notes);
      formData.append('file', file);

      await patientApi.uploadReport(formData);
      setModalOpen(false);
      setReportName('');
      setFile(null);
      fetchReports();
    } catch (err) {
      console.error('Error uploading report:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await patientApi.deleteReport(id);
      fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
            My Medical Records & Lab Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Patient-owned health document store. Access is strictly controlled by your VitalCircle permissions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Medical Report</span>
        </button>
      </div>

      {/* Security Info Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center space-x-3 text-xs text-slate-300">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white">Patient Consent Protection: </span>
          Family members can only view your uploaded medical reports if you explicitly grant them <span className="text-cyan-400 font-semibold">"Medical Reports" permission</span> in your VitalCircle settings.
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-sm space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div>No medical reports uploaded yet.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{report.report_name}</div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {report.report_type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date: {report.report_date}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Hospital className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{report.doctor_hospital || 'St. Jude Hospital'}</span>
                </div>
              </div>

              {report.notes && (
                <p className="text-xs text-slate-300 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  {report.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Upload Medical Report</h3>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Report Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Blood Profile"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Doctor / Hospital Name
                </label>
                <input
                  type="text"
                  value={doctorHospital}
                  onChange={(e) => setDoctorHospital(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Select PDF / Image File
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Notes / Observations
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20"
                >
                  {uploading ? 'Uploading...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
