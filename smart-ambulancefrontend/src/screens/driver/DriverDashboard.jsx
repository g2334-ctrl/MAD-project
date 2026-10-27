import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, DriverNav, MapView } from '../../components/common/UI';
import api from '../../api';
import { startSiren, stopSiren, playRadioChime, playAlertBeep } from '../../utils/audio';
import {
  AlertCircle, CheckCircle2, ShieldAlert, Power, Navigation, Phone, MessageSquare,
  Clock, Radio, Activity, Volume2, VolumeX, Sparkles, Fuel, HeartPulse, Zap, Award, ChevronRight, PhoneCall
} from 'lucide-react';

export default function DriverDashboard() {
  const { user, setUser, trip, setTrip, refreshTrip, go } = useApp();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [fatigueFlag, setFatigueFlag] = useState(user?.fatigueFlag ?? false);
  const [sirenOn, setSirenOn] = useState(false);
  const [greenCorridor, setGreenCorridor] = useState(false);
  const [radioActive, setRadioActive] = useState(false);
  const [radioMsg, setRadioMsg] = useState('');
  const [nearbyServices, setNearbyServices] = useState({ hospitals: [], drivers: [] });

  useEffect(() => {
    refreshTrip();
    api.get('/emergency/nearby-services')
      .then((res) => setNearbyServices(res.data))
      .catch(() => {});
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

  const toggleGreenCorridor = () => {
    const next = !greenCorridor;
    setGreenCorridor(next);
    if (next) playAlertBeep();
  };

  const handleRadioTalk = () => {
    playRadioChime();
    setRadioActive(true);
    setRadioMsg('📻 108 Dispatch: "Unit ' + (user?.ambulanceNumber?.slice(-4) || '1080') + ', signal loud & clear. Standby for dispatch."');
    setTimeout(() => {
      setRadioActive(false);
    }, 4500);
  };

  const toggleAvailability = async () => {
    try {
      const nextState = !isAvailable;
      setIsAvailable(nextState);
      const res = await api.put('/drivers/shift', { isAvailable: nextState });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFatigue = async () => {
    try {
      const nextFatigue = !fatigueFlag;
      setFatigueFlag(nextFatigue);
      const res = await api.put('/drivers/shift', { fatigueFlag: nextFatigue });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async () => {
    if (!trip) return;
    try {
      if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
      playAlertBeep();
      const res = await api.put(`/emergency/${trip._id}/accept`);
      setTrip(res.data);
      go('driverNavigation');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!trip) return;
    try {
      await api.put(`/emergency/${trip._id}/reject`);
      setTrip(null);
      refreshTrip();
    } catch (err) {
      console.error(err);
    }
  };

  const hasIncoming = trip && trip.status === 'requested';
  const hasActiveTrip = trip && ['accepted', 'arrived_patient', 'picked_up', 'hospital_notified', 'arrived_hospital'].includes(trip.status);

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      {/* Header Bar */}
      <div className="dashboard-header-bar">
        <div>
          <div className="status-pill-online" style={{ background: isAvailable ? '#E8F7EF' : '#F1F5F9', color: isAvailable ? '#065F46' : '#64748B' }}>
            <span className={isAvailable ? "pulsing-green-dot" : ""} style={{ background: isAvailable ? 'var(--green)' : '#94A3B8' }}></span>
            <span>{isAvailable ? 'On-Duty • GPS Connected' : 'Off-Duty • Standby Mode'}</span>
          </div>
          <h1 className="dashboard-user-greeting">
            {user?.name || 'Driver Ravi Kumar'}
          </h1>
          <p className="dashboard-user-location">
            🚑 Unit: <strong>{user?.ambulanceNumber || 'TN-45-AB-1080'}</strong> • {user?.fleetType === 'hospital-owned' ? 'Hospital Fleet' : 'ALS Emergency'}
          </p>
        </div>
        <button
          className="dashboard-profile-avatar-btn"
          onClick={() => go('profile')}
          id="driver-profile-btn"
          aria-label="Profile"
        >
          <div className="avatar-initial" style={{ background: 'var(--red-tint)', color: 'var(--red)' }}>
            🚑
          </div>
        </button>
      </div>

      {/* Duty Status & Toggle Control */}
      <div className="card mb-16">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              DISPATCH DUTY STATUS
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: isAvailable ? 'var(--green)' : 'var(--muted)', marginTop: 2 }}>
              {isAvailable ? '🟢 Available for Dispatches' : '⚪ Off-Duty (No Alerts)'}
            </div>
          </div>
          <button
            className={`btn ${isAvailable ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleAvailability}
            id="toggle-duty-btn"
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
          >
            <Power size={14} /> {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Emergency Rapid Hardware Controls (Siren & Corridor) */}
        {isAvailable && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <button
              className={`btn ${sirenOn ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleSiren}
              id="driver-siren-toggle"
              style={{ fontSize: 12, padding: '10px 8px' }}
            >
              {sirenOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {sirenOn ? 'Siren Active' : 'Emergency Siren'}
            </button>
            <button
              className={`btn ${greenCorridor ? 'btn-success' : 'btn-secondary'}`}
              onClick={toggleGreenCorridor}
              id="green-corridor-btn"
              style={{ fontSize: 12, padding: '10px 8px' }}
            >
              <Zap size={16} />
              {greenCorridor ? '🟢 Green Corridor' : 'Signal Override'}
            </button>
          </div>
        )}
      </div>

      {/* Push-to-Talk 108 Radio Intercom */}
      <div className="card mb-16" style={{ background: '#0F172A', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={18} color="#38BDF8" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>108 Control Room Radio</span>
          </div>
          <span className="badge" style={{ background: '#1E293B', color: '#38BDF8', fontSize: 10 }}>CH-04 ACTIVE</span>
        </div>

        <button
          className={`ptt-button ${radioActive ? 'active' : ''}`}
          onClick={handleRadioTalk}
          id="driver-ptt-btn"
          style={{ width: '100%' }}
        >
          <span>{radioActive ? '🎙️ Transmitting to Base...' : '📻 Push to Talk (Control Dispatch)'}</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>PTT</span>
        </button>

        {radioMsg && (
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 10, fontStyle: 'italic', background: '#1E293B', padding: '8px 12px', borderRadius: 8 }}>
            {radioMsg}
          </div>
        )}
      </div>

      {/* REAL-TIME INCOMING EMERGENCY CARD (When a Patient Presses SOS) */}
      {hasIncoming ? (
        <div className="card mb-16 notification-card" style={{ border: '2px solid var(--red)', background: 'linear-gradient(180deg, #FFFFFF 0%, #FDEBEC 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={22} color="var(--red)" />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🚨 REAL-TIME EMERGENCY DISPATCH
              </span>
            </div>
            <span className={`badge badge-${trip.severity || 'critical'}`}>
              {trip.severity?.toUpperCase() || 'CRITICAL'}
            </span>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>
            {trip.emergencyType || 'Medical Emergency'}
          </h3>

          <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', marginTop: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
              👤 Patient: {trip.patient?.name || 'Emergency Caller'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              📍 Pickup: <strong>{trip.patientLocation?.address || 'RS Puram, Coimbatore'}</strong>
            </div>
            {trip.patient?.bloodGroup && (
              <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginTop: 3 }}>
                🩸 Blood Group: {trip.patient.bloodGroup}
                {trip.patient?.allergies?.length > 0 && ` • Allergies: ${trip.patient.allergies.join(', ')}`}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={handleReject}
              id="driver-reject-btn"
              style={{ flex: 1, fontWeight: 700 }}
            >
              Decline (Re-assign)
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAccept}
              id="driver-accept-btn"
              style={{ flex: 2, fontWeight: 800, fontSize: 14 }}
            >
              Accept & Navigate ➔
            </button>
          </div>
        </div>
      ) : hasActiveTrip ? (
        <div className="card mb-16" style={{ borderLeft: '4px solid var(--green)', background: 'var(--green-tint)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>
                ONGOING EMERGENCY • {trip.status.replace('_', ' ').toUpperCase()}
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>{trip.patient?.name}</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Destination: {trip.hospital?.name || 'Emergency Hospital'}</p>
            </div>
            <button
              className="btn btn-success"
              onClick={() => go('driverNavigation')}
              id="resume-nav-btn"
              style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700 }}
            >
              <Navigation size={14} /> Open Nav
            </button>
          </div>
        </div>
      ) : (
        <div className="card mb-16 text-center" style={{ padding: '24px 16px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📡</div>
          <h4 style={{ fontSize: 15, fontWeight: 800 }}>Dispatch Standby</h4>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            {isAvailable
              ? 'Listening on GPS dispatch grid. Incoming patient SOS requests will ring here instantly.'
              : 'You are currently off-duty. Turn on duty status above to receive patient dispatches.'}
          </p>
        </div>
      )}

      {/* Live Unit Radar Map */}
      <div className="card mb-16" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
          <h4 style={{ fontSize: 13, fontWeight: 800 }}>Live Unit Dispatch Radar</h4>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            Showing Coimbatore emergency trauma centers & standby units
          </span>
        </div>
        <MapView
          driverCoords={user?.coords || { lat: 11.0096, lng: 76.9707 }}
          hospitalCoords={{ lat: 11.0025, lng: 76.9615 }}
          nearbyServices={nearbyServices}
          height={240}
        />
      </div>

      <DriverNav />
    </div>
  );
}
