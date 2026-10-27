import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, PatientNav } from '../../components/common/UI';
import LeafletMap from '../../components/common/LeafletMap';
import { MessageSquare, Phone, MapPin, Building, ShieldCheck, AlertCircle, PhoneCall, ChevronRight, Activity, Clock, ShieldAlert } from 'lucide-react';
import { distanceKm, etaMinutes } from '../../utils/geo';
import api from '../../api';

export default function PatientTracking() {
  const { trip, user, go, driverTyping, refreshTrip } = useApp();
  const [nearbyServices, setNearbyServices] = useState({ hospitals: [], drivers: [] });

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  // Fetch nearby services for the map
  useEffect(() => {
    api.get('/emergency/nearby-services')
      .then((res) => setNearbyServices(res.data))
      .catch(() => {});
  }, []);

  const isTripActive = trip && trip._id && !['completed', 'rejected', 'cancelled'].includes(trip.status);

  // Status steps
  const statusSteps = [
    { key: 'requested', label: 'Requested', desc: 'Finding nearest unit' },
    { key: 'accepted', label: 'Accepted', desc: 'Driver en route' },
    { key: 'arrived_patient', label: 'At Patient', desc: 'Arrived at pickup' },
    { key: 'picked_up', label: 'Picked Up', desc: 'Heading to hospital' },
    { key: 'hospital_notified', label: 'Hospital Notified', desc: 'ER & ICU ready' },
    { key: 'arrived_hospital', label: 'At Hospital', desc: 'Handover in progress' },
    { key: 'completed', label: 'Completed', desc: 'Patient admitted' }
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.key === trip?.status);

  // Dynamic coordinates
  const patientCoords = trip?.patientLocation || user?.coords || { lat: 11.0168, lng: 76.9558 };
  const driverCoords = trip?.driverLocation || trip?.driver?.coords;
  const hospitalCoords = trip?.hospital?.coords || { lat: 11.0025, lng: 76.9615 };

  // Calculate real distance & dynamic ETA
  const dist = useMemo(() => {
    if (!driverCoords || !patientCoords) return 0;
    return distanceKm(patientCoords.lat, patientCoords.lng, driverCoords.lat, driverCoords.lng);
  }, [driverCoords, patientCoords]);

  const liveEta = useMemo(() => {
    if (dist <= 0) return 3;
    return etaMinutes(dist, 45); // 45 km/h avg ambulance speed
  }, [dist]);

  // If NO active emergency requested: Show Standby / Ready radar screen
  if (!isTripActive) {
    return (
      <div className="screen" style={{ paddingBottom: 90 }}>
        <TopBar
          title="Emergency Radar"
          onBack={() => go('patientDashboard')}
          subtitle="Standby Network & Available Units"
        />

        {/* Standby Banner */}
        <div className="standby-status-banner">
          <div className="standby-badge">
            <span className="pulsing-green-dot"></span>
            <span>No Active Emergency Request</span>
          </div>
          <h2 className="standby-headline">Emergency Fleet on Standby</h2>
          <p className="standby-body">
            Ambulances and trauma centers are active in your area. Request an ambulance immediately if you or someone nearby needs urgent medical assistance.
          </p>

          <button
            className="standby-sos-action-btn"
            onClick={() => go('emergencyConfirm')}
            id="standby-request-btn"
          >
            <ShieldAlert size={20} />
            <span>Request Ambulance (SOS)</span>
          </button>
        </div>

        {/* Interactive Standby Map */}
        <div className="card mt-16" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
              Live Emergency Network Map
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 2 }}>
              Tap any hospital or ambulance marker for live bed & contact info
            </span>
          </div>

          <LeafletMap
            patientCoords={patientCoords}
            hospitalCoords={{ lat: 11.0025, lng: 76.9615 }}
            nearbyServices={nearbyServices}
            height={280}
            interactive={true}
            showStandby={true}
          />
        </div>

        {/* Emergency Speed Dial */}
        <div className="card mt-16">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Emergency Speed Dial</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <a href="tel:108" className="emergency-hotline-card hotline-108">
              <span className="hotline-number">108</span>
              <span className="hotline-desc">National Ambulance Hotline</span>
            </a>
            <a href="tel:112" className="emergency-hotline-card hotline-112">
              <span className="hotline-number">112</span>
              <span className="hotline-desc">All-in-One Emergency Response</span>
            </a>
          </div>
        </div>

        <PatientNav />
      </div>
    );
  }

  // ACTIVE EMERGENCY TRACKING VIEW
  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      <TopBar
        title="Live Tracking"
        onBack={() => go('patientDashboard')}
        subtitle={`Emergency #${trip._id?.slice(-5).toUpperCase()}`}
        right={
          <button
            onClick={() => go('chatScreen')}
            id="open-chat-btn"
            className="tracking-chat-btn"
            aria-label="Open Chat"
          >
            <MessageSquare size={20} />
            {trip?.chatLog?.length > 0 && <span className="chat-badge-dot"></span>}
          </button>
        }
      />

      {/* Real Interactive Leaflet Map */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <LeafletMap
          driverCoords={driverCoords}
          patientCoords={patientCoords}
          hospitalCoords={hospitalCoords}
          driverName={trip?.driver?.name}
          hospitalName={trip?.hospital?.name}
          nearbyServices={nearbyServices}
          height={280}
          interactive={true}
          showStandby={false}
        />

        {driverTyping && (
          <div className="driver-typing-pill">
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
            <span>Driver is typing a message...</span>
          </div>
        )}
      </div>

      {/* Dynamic Real ETA Card */}
      <div className="live-eta-card">
        <div className="eta-badge-row">
          <span className="eta-live-tag">
            <span className="pulsing-red-dot"></span> LIVE GPS ETA
          </span>
          <span className="eta-distance-tag">~{dist.toFixed(1)} km away</span>
        </div>

        <div className="eta-time-display">
          {trip.status === 'arrived_patient'
            ? 'Ambulance Has Arrived!'
            : trip.status === 'picked_up'
            ? 'En Route to Hospital'
            : trip.status === 'arrived_hospital'
            ? 'At Hospital ER'
            : trip.status === 'completed'
            ? 'Emergency Handled'
            : `${liveEta} min arrival`}
        </div>

        <div className="eta-sub-instruction">
          {trip.status === 'arrived_patient'
            ? 'The ambulance is outside your pickup location. Please prepare to board.'
            : trip.status === 'picked_up'
            ? `Heading to ${trip.hospital?.name || 'Hospital'}. Vitals & triage communicated.`
            : trip.status === 'hospital_notified'
            ? 'Trauma team & ICU prepped at destination hospital.'
            : 'Driver is moving towards you with emergency sirens active.'}
        </div>
      </div>

      {/* Stepper Status Timeline */}
      <div className="card mt-14">
        <div className="timeline-header-row">
          <span className="timeline-title">RESPONSE TIMELINE</span>
          <span className="timeline-step-count">
            Step {Math.max(1, currentStatusIndex + 1)} of {statusSteps.length}
          </span>
        </div>

        <div className="stepper-horizontal">
          {statusSteps.map((step, idx) => {
            const isDone = idx < currentStatusIndex || trip.status === 'completed';
            const isActive = idx === currentStatusIndex;
            return (
              <div
                key={step.key}
                className={`stepper-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="stepper-circle">
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className="stepper-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Profile Card */}
      {trip?.driver && (
        <div className="card mt-14 driver-assigned-card">
          <div className="driver-card-header">
            <div className="driver-avatar-circle">
              <span style={{ fontSize: 22 }}>🚑</span>
            </div>
            <div className="driver-meta-wrap">
              <span className="driver-name">{trip.driver.name}</span>
              <span className="driver-vehicle-plate">
                Vehicle: <strong>{trip.driver.ambulanceNumber}</strong>
              </span>
              <span className="driver-badge-verified">
                <ShieldCheck size={13} /> Verified Emergency Responder
              </span>
            </div>
            <div className="driver-actions-stack">
              <a
                href={`tel:${trip.driver.mobile}`}
                className="action-icon-circle call"
                title="Call Driver"
              >
                <Phone size={18} />
              </a>
              <button
                onClick={() => go('chatScreen')}
                className="action-icon-circle chat"
                title="Message Driver"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Pre-Briefing Card */}
      {trip?.hospital && (
        <div className="card mt-14 hospital-assigned-card">
          <div className="hospital-card-content">
            <div className="hospital-badge-pill">
              <Building size={14} /> Destination Trauma Center
            </div>
            <h4 className="hospital-assigned-name">{trip.hospital.name}</h4>
            <p className="hospital-assigned-address">📍 {trip.hospital.address}</p>

            <div className="hospital-meta-row">
              <div className="meta-item">
                <span className="meta-val">{trip.hospital.availableBeds || 45}</span>
                <span className="meta-lbl">Available Beds</span>
              </div>
              <div className="meta-item">
                <span className="meta-val">{trip.hospital.icuAvailable || 8}</span>
                <span className="meta-lbl">ICU Ready</span>
              </div>
              <div className="meta-item">
                <span className="meta-val" style={{ color: 'var(--red)' }}>
                  {trip.severity?.toUpperCase() || 'MODERATE'}
                </span>
                <span className="meta-lbl">Triage Priority</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PatientNav />
    </div>
  );
}
