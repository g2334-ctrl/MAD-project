import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field, PatientNav } from '../../components/common/UI';
import api from '../../api';
import { Users, Plus, Trash2, Send, Check } from 'lucide-react';

export default function EmergencyContactsAlert() {
  const { user, setUser, go } = useApp();
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [alertSent, setAlertSent] = useState(false);

  const addContact = async (e) => {
    e.preventDefault();
    if (!newName || !newMobile) return;
    const updated = [...contacts, { name: newName, mobile: newMobile }];
    setContacts(updated);
    setNewName('');
    setNewMobile('');
    try {
      const res = await api.put('/patients/medical-profile', { emergencyContacts: updated });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeContact = async (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    try {
      const res = await api.put('/patients/medical-profile', { emergencyContacts: updated });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerFamilyAlert = () => {
    setAlertSent(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setTimeout(() => setAlertSent(false), 4000);
  };

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      <TopBar title="Emergency Contacts" onBack={() => go('patientDashboard')} />

      {/* Instant SOS Notification Trigger */}
      <div className="card-glass mt-8 mb-16" style={{ borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Auto-Notify Family</h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              Broadcast your live tracking link via SMS/WhatsApp
            </p>
          </div>
          <button
            className={`btn ${alertSent ? 'btn-success' : 'btn-primary'}`}
            onClick={triggerFamilyAlert}
            id="broadcast-alert-btn"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            {alertSent ? <><Check size={14} /> Sent!</> : <><Send size={14} /> Send Alert</>}
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="card mb-16">
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="var(--red)" /> Saved Guardians & Relatives
        </h4>

        {contacts.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            No emergency contacts added yet. Add family members below.
          </p>
        ) : (
          contacts.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < contacts.length - 1 ? '1px solid var(--line)' : 'none'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.mobile}</div>
              </div>
              <button
                onClick={() => removeContact(i)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Contact Form */}
      <div className="card">
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Add New Contact</h4>
        <form onSubmit={addContact}>
          <Field
            label="Guardian Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Suresh (Father)"
            id="contact-name"
          />
          <Field
            label="Mobile Number"
            type="tel"
            value={newMobile}
            onChange={(e) => setNewMobile(e.target.value)}
            placeholder="10-digit mobile number"
            id="contact-mobile"
          />
          <button type="submit" className="btn btn-secondary btn-block" id="add-contact-btn">
            <Plus size={16} /> Add to Contacts
          </button>
        </form>
      </div>

      <PatientNav />
    </div>
  );
}
