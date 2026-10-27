import React, { useEffect, useState } from 'react';
import { useApp } from '../../AppContext';
import { Phone, CheckCircle2, User, ShieldAlert } from 'lucide-react';
import { distanceKm, etaMinutes } from '../../utils/geo';
import api from '../../api';

export default function CallingDriver() {
  const { trip, setTrip, go, user } = useApp();
  const [dots, setDots] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // When trip is accepted or status advances, auto-navigate
  useEffect(() => {
    if (trip && trip.status && trip.status !== 'requested') {
      if (['completed', 'cancelled', 'rejected'].includes(trip.status)) {
        setTrip(null);
        go('patientDashboard');
      } else {
        go('patientTracking');
      }
    }
  }, [trip, go, setTrip]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      if (trip?._id) {
        await api.put(`/emergency/${trip._id}/cancel`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTrip(null);
      setCancelling(false);
      go('patientDashboard');
    }
  };

  const driver = trip?.driver;
  const dist = driver && user?.coords 
    ? distanceKm(user.coords.lat, user.coords.lng, driver.coords?.lat || 11.0096, driver.coords?.lng || 76.9707)
    : 2.4;
  const eta = etaMinutes(dist);

  return (
    <div className="screen flex flex-col justify-between" style={{ minHeight: '90vh' }}>
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div className="pulse-loader" style={{ marginBottom: 28, justifyContent: 'center' }}>
          <span style={{ width: 18, height: 18 }}></span>
          <span style={{ width: 18, height: 18 }}></span>
          <span style={{ width: 18, height: 18 }}></span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Locating Nearest Ambulance{dots}
        </h2>
        <p className="text-muted" style={{ fontSize: 14, maxWidth: 280, margin: '0 auto' }}>
          Assigning the highest priority driver based on response time and emergency level.
        </p>

        <div className="card-glass mt-24" style={{ textAlign: 'left', borderLeft: '4px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <ShieldAlert size={18} color="var(--red)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase' }}>
              Priority: {trip?.severity || 'Moderate'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink)' }}>
            Emergency Type: <strong>{trip?.emergencyType || 'Medical Emergency'}</strong>
          </p>
        </div>
      </div>

      {driver && (
        <div className="card driver-card mt-24">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--red-tint)', color: 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700
            }}>
              {driver.name ? driver.name[0] : '🚑'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>DISPATCHING AMBULANCE</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{driver.name || 'Emergency Unit'}</h3>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Vehicle: {driver.ambulanceNumber || 'TN-45-AB-1080'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>ESTIMATED ETA</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>~{eta} mins</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>DISTANCE</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{dist.toFixed(1)} km</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingBottom: 20 }}>
        <button
          className="btn btn-secondary btn-block"
          onClick={handleCancel}
          disabled={cancelling}
          id="cancel-request-btn"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Request'}
        </button>
      </div>
    </div>
  );
}
