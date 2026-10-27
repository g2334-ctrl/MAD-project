import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar } from '../../components/common/UI';
import api from '../../api';
import { AlertTriangle, Activity } from 'lucide-react';

export default function EmergencyConfirm() {
  const { go, user, setTrip } = useApp();
  const [type, setType] = useState('Medical Emergency');
  const [severity, setSeverity] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const costEstimate = severity === 'critical' ? '₹250–400' : severity === 'moderate' ? '₹150–300' : '₹100–200';

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // Trigger haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(200);
      const res = await api.post('/emergency/request', {
        emergencyType: type,
        severity,
        lat: user?.coords?.lat,
        lng: user?.coords?.lng,
        address: user?.currentLocation || 'Current Location'
      });
      setTrip(res.data);
      go('callingDriver');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request ambulance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Confirm Emergency" onBack={() => go('patientDashboard')} />

      <div className="card mt-8">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <AlertTriangle size={48} color="var(--red)" />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Request Ambulance</h2>
        </div>

        {/* Emergency Type */}
        <div className="mb-16">
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
            EMERGENCY TYPE
          </label>
          {['Medical Emergency', 'Accident / Injury'].map((t) => (
            <button
              key={t}
              className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'} btn-block mb-8`}
              onClick={() => setType(t)}
              id={`type-${t.replace(/\s/g, '-').toLowerCase()}`}
              style={{ justifyContent: 'flex-start', fontSize: 14 }}
            >
              {t === 'Medical Emergency' ? <Activity size={16} /> : <AlertTriangle size={16} />}
              {t}
            </button>
          ))}
        </div>

        {/* Severity */}
        <div className="mb-16">
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
            SEVERITY LEVEL
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'critical', label: 'Critical', cls: 'badge-critical' },
              { key: 'moderate', label: 'Moderate', cls: 'badge-moderate' },
              { key: 'minor', label: 'Minor', cls: 'badge-minor' }
            ].map((s) => (
              <button
                key={s.key}
                className={`badge ${s.cls}`}
                onClick={() => setSeverity(s.key)}
                id={`severity-${s.key}`}
                style={{
                  flex: 1, padding: '10px 8px', cursor: 'pointer', border: 'none',
                  outline: severity === s.key ? '2px solid currentColor' : 'none',
                  outlineOffset: 2, fontSize: 12
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cost Estimate */}
        <div className="card-glass mb-16" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: 12 }}>ESTIMATED COST</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{costEstimate}</p>
          <p className="text-muted" style={{ fontSize: 11 }}>Based on distance & severity</p>
        </div>

        {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button
          className="btn btn-primary btn-block"
          onClick={handleConfirm}
          disabled={loading}
          id="confirm-emergency-btn"
          style={{ fontSize: 16, padding: '16px' }}
        >
          {loading ? 'Requesting...' : '🚨 Confirm Emergency'}
        </button>
      </div>
    </div>
  );
}
