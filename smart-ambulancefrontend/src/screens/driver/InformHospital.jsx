import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar } from '../../components/common/UI';
import api from '../../api';
import { Building, Send, CheckCircle2, Bed, Activity } from 'lucide-react';

export default function InformHospital() {
  const { trip, setTrip, go } = useApp();
  const [loading, setLoading] = useState(false);
  const [notified, setNotified] = useState(trip?.status === 'hospital_notified');

  const hospital = trip?.hospital;

  const handleInform = async () => {
    if (!trip) return;
    setLoading(true);
    try {
      const res = await api.put(`/emergency/${trip._id}/inform-hospital`);
      setTrip(res.data);
      setNotified(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <TopBar title="Inform Hospital" onBack={() => go('driverNavigation')} />

      <div className="card mt-8 mb-16">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building size={24} color="var(--blue)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{hospital?.name || 'City Emergency Hospital'}</h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              {hospital?.address || '123 Medical Avenue, Coimbatore'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="bed-stat" style={{ padding: 12 }}>
            <div className="bed-stat-value" style={{ fontSize: 22, color: 'var(--green)' }}>
              {hospital?.availableBeds ?? 45}
            </div>
            <div className="bed-stat-label">Available Beds</div>
          </div>
          <div className="bed-stat" style={{ padding: 12 }}>
            <div className="bed-stat-value" style={{ fontSize: 22, color: 'var(--blue)' }}>
              {hospital?.icuAvailable ?? 8}
            </div>
            <div className="bed-stat-label">ICU Beds</div>
          </div>
        </div>

        <div className="card-glass mb-16" style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Prepared Handover Summary:</div>
          <div>Emergency: <strong>{trip?.emergencyType}</strong></div>
          <div>Severity: <strong style={{ color: 'var(--red)' }}>{trip?.severity?.toUpperCase()}</strong></div>
          <div>Conscious: <strong>{trip?.handoverChecklist?.patientConscious ? 'Yes' : 'No'}</strong></div>
        </div>

        {notified ? (
          <div className="card-glass text-center" style={{ background: 'var(--green-tint)', border: '1px solid var(--green)' }}>
            <CheckCircle2 size={32} color="var(--green)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>Hospital ER Team Alerted</h4>
            <p style={{ fontSize: 12, color: 'var(--ink)', marginTop: 4 }}>
              Trauma bay is being prepared for immediate intake upon arrival.
            </p>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-block"
            onClick={handleInform}
            disabled={loading}
            id="inform-hospital-submit-btn"
            style={{ padding: '16px', fontSize: 15 }}
          >
            <Send size={18} /> {loading ? 'Broadcasting...' : '🚨 Broadcast Emergency to Hospital'}
          </button>
        )}
      </div>

      <button
        className="btn btn-secondary btn-block"
        onClick={() => go('driverNavigation')}
        id="back-to-nav-btn"
      >
        Back to Navigation Map
      </button>
    </div>
  );
}
