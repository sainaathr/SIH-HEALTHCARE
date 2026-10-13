import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { PhoneCall, Plus, Trash2, User, Phone, ShieldAlert } from 'lucide-react';

export const PatientContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await patientApi.getEmergencyContacts();
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
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
          Emergency Dispatch Contacts
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registered family and primary contacts automatically alerted during fall or SOS events.
        </p>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact, idx) => (
          <div key={contact.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">{contact.name}</div>
                  <div className="text-xs text-slate-400">{contact.relationship}</div>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold ${idx === 0 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-400'}`}>
                {idx === 0 ? 'PRIMARY DISPATCH' : `PRIORITY ${contact.priority}`}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-cyan-400 font-mono font-semibold bg-slate-950 p-3 rounded-xl border border-slate-800">
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
