import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';
import { ClipboardCheck, HeartPulse, Check, Activity } from 'lucide-react';

export default function HandoverChecklist() {
  const { trip, setTrip, go } = useApp();
  const [vitalsTaken, setVitalsTaken] = useState(trip?.handoverChecklist?.vitalsTaken ?? false);
  const [patientConscious, setPatientConscious] = useState(trip?.handoverChecklist?.patientConscious ?? true);
  const [notes, setNotes] = useState(trip?.handoverChecklist?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trip) return;
    setLoading(true);
    try {
      const res = await api.put(`/emergency/${trip._id}/handover-checklist`, {
        vitalsTaken,
        patientConscious,
        notes
      });
      setTrip(res.data);
      go('informHospital');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <TopBar title="Handover Checklist" onBack={() => go('driverNavigation')} />

      <div className="card mt-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <ClipboardCheck size={28} color="var(--green)" />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Pre-Hospital Handover</h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              Transmit preliminary vital status to incoming trauma team
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Vitals Taken Toggle */}
          <div className="checklist-item" onClick={() => setVitalsTaken(!vitalsTaken)} style={{ cursor: 'pointer' }}>
            <div className={`checklist-toggle ${vitalsTaken ? 'checked' : ''}`}>
              {vitalsTaken && <Check size={14} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Vitals Measured (BP, Pulse, SpO2)</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Checked and logged in ambulance</div>
            </div>
          </div>

          {/* Consciousness Toggle */}
          <div className="checklist-item" onClick={() => setPatientConscious(!patientConscious)} style={{ cursor: 'pointer' }}>
            <div className={`checklist-toggle ${patientConscious ? 'checked' : ''}`}>
              {patientConscious && <Check size={14} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Patient is Conscious & Responsive</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {patientConscious ? 'Alert & oriented' : '⚠️ Unresponsive / Altered mental status'}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <Field
              label="Paramedic Observation Notes"
              type="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Oxygen administered at 4L/min, bleeding controlled with pressure bandage"
              id="handover-notes"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block mt-16"
            disabled={loading}
            id="save-handover-btn"
          >
            {loading ? 'Submitting...' : 'Save & Proceed to Hospital Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
