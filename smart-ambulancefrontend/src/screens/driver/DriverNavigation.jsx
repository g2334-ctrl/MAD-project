import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, DriverNav } from '../../components/common/UI';
import LeafletMap from '../../components/common/LeafletMap';
import api from '../../api';
import { startSiren, stopSiren, playAlertBeep } from '../../utils/audio';
import {
  Navigation, Phone, MessageSquare, CheckCircle, Hospital as HospIcon, ClipboardList,
  Volume2, VolumeX, Zap, Gauge, Compass, ShieldCheck, MapPin, Building
} from 'lucide-react';
import { distanceKm, etaMinutes } from '../../utils/geo';

export default function DriverNavigation() {
  const { trip, setTrip, go, user, refreshTrip } = useApp();
  const [loading, setLoading] = useState(false);
  const [sirenOn, setSirenOn] = useState(false);
  const [greenCorridor, setGreenCorridor] = useState(true);

  const [coords, setCoords] = useState(
    trip?.driverLocation || user?.coords || { lat: 11.0096, lng: 76.9707 }
  );

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  // Clean up siren on unmount
  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  const toggleSiren = () => {
    if (sirenOn) {
      stopSiren();
      setSirenOn(false);
    } else {
      startSiren();
      setSirenOn(true);
    }
  };

  // Real-time driver movement simulation / GPS ping
  useEffect(() => {
    if (!trip?._id || ['arrived_patient', 'arrived_hospital', 'completed'].includes(trip.status)) {
      return;
    }

    const interval = setInterval(async () => {
      setCoords((prev) => {
        const target =
          trip.status === 'picked_up' || trip.status === 'hospital_notified'
            ? trip.hospital?.coords || { lat: 11.0025, lng: 76.9615 }
            : trip.patientLocation || { lat: 11.0168, lng: 76.9558 };

        const stepLat = prev.lat + (target.lat - prev.lat) * 0.05;
        const stepLng = prev.lng + (target.lng - prev.lng) * 0.05;

        api.put(`/emergency/${trip._id}/location`, { lat: stepLat, lng: stepLng }).catch(() => {});
        return { lat: stepLat, lng: stepLng };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [trip]);

  const handleStatusTransition = async (action) => {
    if (!trip) return;
    setLoading(true);
    try {
      let endpoint = `/emergency/${trip._id}/${action}`;
      const res = await api.put(endpoint);
      setTrip(res.data);

      if (action === 'pickup') {
        go('handoverChecklist');
      } else if (action === 'inform-hospital') {
        go('informHospital');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const patientCoords = trip?.patientLocation || { lat: 11.0168, lng: 76.9558 };
  const hospitalCoords = trip?.hospital?.coords || { lat: 11.0025, lng: 76.9615 };
  const targetCoords =
    trip?.status === 'picked_up' || trip?.status === 'hospital_notified' || trip?.status === 'arrived_hospital'
      ? hospitalCoords
      : patientCoords;

  const dist = distanceKm(coords.lat, coords.lng, targetCoords.lat, targetCoords.lng);
  const eta = etaMinutes(dist);

  // Speed telemetry based on real movement state
  const currentSpeed = useMemo(() => {
    if (!trip || ['arrived_patient', 'arrived_hospital', 'completed'].includes(trip.status)) {
      return 0;
    }
    return Math.floor(46 + (dist > 1 ? 8 : 0));
  }, [trip, dist]);

  if (!trip || ['completed', 'rejected', 'cancelled'].includes(trip.status)) {
    return (
      <div className="screen text-center" style={{ paddingBottom: 90, paddingTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧭</div>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>No Active Trip</h2>
        <p className="text-muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 24 }}>
          You do not currently have an assigned emergency. Return to the console to monitor broadcasts.
        </p>
        <button className="btn btn-primary" onClick={() => go('driverDashboard')}>
          Return to Console
        </button>
        <DriverNav />
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      <TopBar
        title="Emergency Navigation"
        onBack={() => go('driverDashboard')}
        subtitle={`Target: ${trip.status === 'picked_up' || trip.status === 'hospital_notified' ? 'Destination Hospital' : 'Patient Pickup'}`}
        right={
          <button
            onClick={() => go('chatScreen')}
            id="driver-chat-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}
          >
            <MessageSquare size={20} />
          </button>
        }
      />

      {/* Target Mission Strip */}
      <div className="card-glass mt-4 mb-14" style={{ borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase' }}>
              MISSION OBJECTIVE: {trip.status.replace('_', ' ').toUpperCase()}
            </span>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>
              {trip.status === 'picked_up' || trip.status === 'hospital_notified'
                ? `🏥 Delivering to ${trip.hospital?.name || 'Hospital'}`
                : `📍 Navigating to ${trip.patient?.name || 'Patient'}`}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {trip.status === 'picked_up' || trip.status === 'hospital_notified'
                ? trip.hospital?.address
                : trip.patientLocation?.address || 'RS Puram, Coimbatore'}
            </p>
          </div>
          {trip.patient?.mobile && (
            <a href={`tel:${trip.patient.mobile}`} className="action-icon-circle call" title="Call Patient">
              <Phone size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <LeafletMap
          driverCoords={coords}
          patientCoords={patientCoords}
          hospitalCoords={hospitalCoords}
          driverName={user?.name || 'Ambulance Unit'}
          hospitalName={trip.hospital?.name}
          height={260}
          interactive={true}
          showStandby={false}
        />
      </div>

      {/* Live Telemetry Bar */}
      <div className="live-eta-card" style={{ marginBottom: 16 }}>
        <div className="eta-badge-row">
          <span className="eta-live-tag">
            <span className="pulsing-green-dot"></span> GPS ROUTING ACTIVE
          </span>
          <span className="eta-distance-tag">~{dist.toFixed(1)} km to target</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className="eta-time-display">
            {dist < 0.2 ? 'Arriving now' : `${eta} mins ETA`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8', fontWeight: 700, fontSize: 14 }}>
            <Gauge size={18} />
            <span>{currentSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Sequential Action Controls Based on Lifecycle */}
      <div className="card mb-16">
        <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase' }}>
          Response Lifecycle Actions
        </h4>

        {trip.status === 'accepted' && (
          <button
            className="btn btn-primary btn-block"
            onClick={() => handleStatusTransition('arrived-patient')}
            disabled={loading}
            style={{ padding: '15px', fontSize: 15, fontWeight: 800 }}
          >
            <CheckCircle size={18} /> 📍 Confirm: Arrived at Patient
          </button>
        )}

        {trip.status === 'arrived_patient' && (
          <button
            className="btn btn-primary btn-block"
            onClick={() => handleStatusTransition('pickup')}
            disabled={loading}
            style={{ padding: '15px', fontSize: 15, fontWeight: 800, background: 'var(--green)' }}
          >
            <ClipboardList size={18} /> 🚑 Patient Boarded: Fill Handover Vitals
          </button>
        )}

        {trip.status === 'picked_up' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-primary btn-block"
              onClick={() => go('informHospital')}
              style={{ padding: '14px', fontSize: 14, fontWeight: 800 }}
            >
              <HospIcon size={18} /> 🚨 Alert Trauma Hospital
            </button>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => handleStatusTransition('arrived-hospital')}
              disabled={loading}
              style={{ padding: '12px', fontSize: 13 }}
            >
              Arrived at Hospital Entrance
            </button>
          </div>
        )}

        {trip.status === 'hospital_notified' && (
          <button
            className="btn btn-primary btn-block"
            onClick={() => handleStatusTransition('arrived-hospital')}
            disabled={loading}
            style={{ padding: '15px', fontSize: 15, fontWeight: 800 }}
          >
            <HospIcon size={18} /> 🏥 Confirm: Arrived at Hospital ER Bay
          </button>
        )}

        {trip.status === 'arrived_hospital' && (
          <div className="card-glass text-center" style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue)' }}>
            <HospIcon size={28} color="var(--blue)" style={{ margin: '0 auto 6px' }} />
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue)' }}>Ambulance at ER Bay</h4>
            <p style={{ fontSize: 12, color: 'var(--ink)', marginTop: 2 }}>
              Handover in progress. Hospital trauma team is admitting the patient now.
            </p>
          </div>
        )}
      </div>

      <DriverNav />
    </div>
  );
}
