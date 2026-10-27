import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, HospitalNav } from '../../components/common/UI';
import api from '../../api';
import { HeartPulse, User, CheckCircle2, Stethoscope, AlertTriangle, ShieldCheck, Compass, Navigation } from 'lucide-react';

export default function HospitalNotification() {
  const { trip, setTrip, go } = useApp();
  const [selectedDept, setSelectedDept] = useState('Trauma Bay 1');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!trip) return;
    setLoading(true);
    try {
      const res = await api.put(`/emergency/${trip._id}/complete`);
      setTrip(res.data);
      go('hospitalDashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const patient = trip?.patient;
  const checklist = trip?.handoverChecklist;

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      <TopBar title="Emergency Pre-Brief" onBack={() => go('hospitalDashboard')} />

      {/* Triage Priority Banner */}
      <div className="card-glass mt-8 mb-16" style={{ borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase' }}>
              Priority Triage Status
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>{trip?.emergencyType || 'Medical Emergency'}</h3>
          </div>
          <span className={`badge badge-${trip?.severity || 'critical'}`}>
            {trip?.severity?.toUpperCase() || 'CRITICAL'}
          </span>
        </div>
      </div>

      {/* Patient Health File */}
      <div className="card mb-16">
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={18} color="var(--red)" /> Patient Health History
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, marginBottom: 12 }}>
          <div>
            <div className="text-muted" style={{ fontSize: 11 }}>NAME</div>
            <strong>{patient?.name || 'Emergency Patient'}</strong>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 11 }}>BLOOD GROUP</div>
            <strong style={{ color: 'var(--red)' }}>{patient?.bloodGroup || 'O+'}</strong>
          </div>
        </div>

        {patient?.allergies?.length > 0 && (
          <div style={{ fontSize: 12, background: 'var(--red-tint)', padding: '8px 12px', borderRadius: 8, marginBottom: 8, color: 'var(--red)' }}>
            <strong>Allergies:</strong> {patient.allergies.join(', ')}
          </div>
        )}

        {patient?.chronicConditions?.length > 0 && (
          <div style={{ fontSize: 12, background: 'var(--amber-tint)', padding: '8px 12px', borderRadius: 8, color: 'var(--ink)' }}>
            <strong>Chronic Conditions:</strong> {patient.chronicConditions.join(', ')}
          </div>
        )}
      </div>

      {/* Paramedic In-Transit Handover */}
      <div className="card mb-16">
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartPulse size={18} color="var(--green)" /> Paramedic Field Notes
        </h4>

        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          <p>
            Vitals Recorded:{' '}
            <strong>{checklist?.vitalsTaken ? '✅ Yes (Stabilized)' : '⚠️ Pending'}</strong>
          </p>
          <p style={{ marginTop: 4 }}>
            Mental Status:{' '}
            <strong>{checklist?.patientConscious ? 'Conscious & Alert' : '⚠️ Altered / Unconscious'}</strong>
          </p>
          {checklist?.notes && (
            <div style={{ marginTop: 8, padding: 10, background: 'var(--bg)', borderRadius: 8, fontStyle: 'italic', border: '1px solid var(--line)' }}>
              "{checklist.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Department Triage Assignment */}
      <div className="card mb-16">
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Assigned Specialty Bay</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Trauma Bay 1', 'Cardiac ICU', 'Pediatric ER', 'Resuscitation Unit'].map((dept) => (
            <button
              key={dept}
              className={`dept-tag ${selectedDept === dept ? 'selected' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn btn-secondary btn-block"
          onClick={() => go('hospitalTracking')}
        >
          <Compass size={16} /> Track Ambulance on Live Map
        </button>

        {trip?.status === 'arrived_hospital' && (
          <button
            className="btn btn-primary btn-block"
            onClick={handleComplete}
            disabled={loading}
            id="hospital-complete-intake-btn"
            style={{ padding: '15px', fontSize: 15, fontWeight: 800, background: 'var(--green)' }}
          >
            <CheckCircle2 size={18} /> {loading ? 'Processing...' : 'Confirm Patient Admitted & Clear Unit'}
          </button>
        )}
      </div>

      <HospitalNav />
    </div>
  );
}
