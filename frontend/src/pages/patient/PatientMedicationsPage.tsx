import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { Pill, Plus, Trash2, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export const PatientMedicationsPage: React.FC = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('500 mg');
  const [frequency, setFrequency] = useState<string>('Twice daily');
  const [schedule, setSchedule] = useState<string>('8:00 AM & 8:00 PM');
  const [prescribingDoctor, setPrescribingDoctor] = useState<string>('Dr. Sarah Jenkins');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await patientApi.getMedications();
      setMedications(res.data);
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await patientApi.addMedication({
        name,
        dosage,
        frequency,
        schedule,
        prescribing_doctor: prescribingDoctor,
        notes
      });
      setModalOpen(false);
      setName('');
      fetchMedications();
    } catch (err) {
      console.error('Error adding medication:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await patientApi.deleteMedication(id);
      fetchMedications();
    } catch (err) {
      console.error('Error deleting medication:', err);
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
            My Medications & Dosage Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track active prescriptions, daily schedules, and automated medication reminder notifications.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prescription</span>
        </button>
      </div>

      {/* Adherence Rate Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">30-Day Medication Adherence Score</div>
            <div className="text-xs text-slate-400">Excellent compliance! 92% of prescribed doses taken on schedule.</div>
          </div>
        </div>
        <span className="text-2xl font-black text-emerald-400 font-['Outfit']">92%</span>
      </div>

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-sm space-y-3">
          <Pill className="w-12 h-12 text-slate-600 mx-auto" />
          <div>No active medications added yet.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{med.name}</div>
                    <div className="text-xs text-slate-400">{med.dosage} — {med.frequency}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(med.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Remove Medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Schedule: <strong className="text-white">{med.schedule || 'Daily'}</strong></span>
                </div>
                {med.prescribing_doctor && (
                  <div className="text-slate-400">Prescribed by: {med.prescribing_doctor}</div>
                )}
                {med.notes && (
                  <div className="text-slate-400 pt-1 border-t border-slate-800/60">{med.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Add Prescription</h3>
            
            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Twice daily"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Daily Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8:00 AM & 8:00 PM"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Prescribing Doctor
                </label>
                <input
                  type="text"
                  value={prescribingDoctor}
                  onChange={(e) => setPrescribingDoctor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Instructions / Notes
                </label>
                <input
                  type="text"
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
