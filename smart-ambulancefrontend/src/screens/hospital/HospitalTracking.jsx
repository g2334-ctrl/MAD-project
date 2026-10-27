import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, HospitalNav } from '../../components/common/UI';
import LeafletMap from '../../components/common/LeafletMap';
import { Truck, Clock, MapPin, Building2, MessageSquare, CheckCircle2, User, HeartPulse, Stethoscope, AlertTriangle } from 'lucide-react';
import { distanceKm, etaMinutes } from '../../utils/geo';
import api from '../../api';

export default function HospitalTracking() {
  const { trip, setTrip, user, go } = useApp();
  const [loading, setLoading] = useState(false);

  const driverCoords = trip?.driverLocation || { lat: 11.0096, lng: 76.9707 };
  const patientCoords = trip?.patientLocation || { lat: 11.0168, lng: 76.9558 };
  const hospitalCoords = user?.coords || trip?.hospital?.coords || { lat: 11.0025, lng: 76.9615 };

  const dist = distanceKm(driverCoords.lat, driverCoords.lng, hospitalCoords.lat, hospitalCoords.lng);
  const eta = etaMinutes(dist);

  const handleComplete = async () => {
    if (!trip?._id) return;
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
      <TopBar
        title="Live Inbound Telemetry"
        onBack={() => go('hospitalDashboard')}
        subtitle="Tracking Incoming Emergency Ambulance"
      />

      {/* Live ETA Card */}
      <div className="live-eta-card mb-14">
        <div className="eta-badge-row">
          <span className="eta-live-tag">
            <span className="pulsing-red-dot"></span> INBOUND TRAUMA DISPATCH
          </span>
          <span className="eta-distance-tag">~{dist.toFixed(1)} km from ER</span>
        </div>
        <div className="eta-time-display">
          {trip?.status === 'arrived_hospital' ? 'Ambulance At ER Bay' : `~${eta} mins to arrival`}
        </div>
        <div className="eta-sub-instruction">
          Ambulance {trip?.driver?.ambulanceNumber || 'TN-45-AB-1080'} is approaching with emergency priority.
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <LeafletMap
          driverCoords={driverCoords}
          patientCoords={patientCoords}
          hospitalCoords={hospitalCoords}
          driverName={trip?.driver?.name}
          hospitalName={user?.name || 'Your Facility'}
          height={260}
          interactive={true}
          showStandby={false}
        />
      </div>

      {/* Patient Emergency Problem Breakdown */}
      <div className="card mb-14" style={{ borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase' }}>
            PATIENT CLINICAL TRIAGE
          </span>
          <span className={`badge badge-${trip?.severity || 'critical'}`}>
            {trip?.severity?.toUpperCase() || 'CRITICAL'}
          </span>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
          {trip?.emergencyType || 'Medical Emergency'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, fontSize: 12 }}>
          <div style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 8 }}>
            <span className="text-muted" style={{ display: 'block', fontSize: 10 }}>PATIENT NAME</span>
            <strong>{patient?.name || 'Emergency Patient'}</strong>
          </div>
          <div style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 8 }}>
            <span className="text-muted" style={{ display: 'block', fontSize: 10 }}>BLOOD GROUP</span>
            <strong style={{ color: 'var(--red)' }}>{patient?.bloodGroup || 'O+'}</strong>
          </div>
        </div>

        {patient?.allergies?.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8, fontWeight: 600 }}>
            ⚠️ Known Allergies: {patient.allergies.join(', ')}
          </div>
        )}

        {patient?.chronicConditions?.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Chronic: {patient.chronicConditions.join(', ')}
          </div>
        )}
      </div>

      {/* Paramedic Handover Vitals if Submitted */}
      {checklist && (checklist.vitalsTaken || checklist.notes) && (
        <div className="card mb-14">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <HeartPulse size={16} color="var(--green)" />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>
              Paramedic Handover Vitals
            </span>
          </div>

          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            <p>Vitals: <strong>{checklist.vitalsTaken ? '✅ Stabilized & Logged' : 'Pending'}</strong></p>
            <p>Consciousness: <strong>{checklist.patientConscious ? 'Conscious & Responsive' : '⚠️ Unconscious'}</strong></p>
            {checklist.notes && (
              <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, fontStyle: 'italic', fontSize: 12 }}>
                "{checklist.notes}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="btn btn-secondary btn-block"
          onClick={() => go('hospitalNotification')}
          id="view-triage-intake-btn"
        >
          <Stethoscope size={16} /> Open Full Doctor Pre-Brief
        </button>

        {trip?.status === 'arrived_hospital' && (
          <button
            className="btn btn-primary btn-block"
            onClick={handleComplete}
            disabled={loading}
            style={{ padding: '14px', fontSize: 14, fontWeight: 800, background: 'var(--green)' }}
          >
            <CheckCircle2 size={18} /> {loading ? 'Admitting...' : 'Admit Patient & Complete Trip'}
          </button>
        )}
      </div>

      <HospitalNav />
    </div>
  );
}
