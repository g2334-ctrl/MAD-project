import React, { useEffect, useState } from 'react';
import { useApp } from '../../AppContext';
import { PatientNav, MapView } from '../../components/common/UI';
import { AlertTriangle, Activity, ShieldAlert, PhoneCall, ChevronRight, Navigation, Sparkles } from 'lucide-react';
import api from '../../api';

export default function PatientDashboard() {
  const { user, go, trip, refreshTrip } = useApp();
  const [nearbyServices, setNearbyServices] = useState({ hospitals: [], drivers: [] });
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  // Fetch real nearby emergency units & hospitals
  useEffect(() => {
    let isMounted = true;
    setLoadingServices(true);
    api.get('/emergency/nearby-services')
      .then((res) => {
        if (isMounted) setNearbyServices(res.data);
      })
      .catch(() => {
        // Fallback demo coordinates in Coimbatore
        if (isMounted) {
          setNearbyServices({
            hospitals: [
              { hospitalId: 'H1', name: 'City Emergency Hospital', coords: { lat: 11.0025, lng: 76.9615 }, availableBeds: 45, icuAvailable: 8, phone: '0422-2345678' },
              { hospitalId: 'H2', name: 'Kovai Medical & Trauma Care', coords: { lat: 11.0280, lng: 77.0010 }, availableBeds: 82, icuAvailable: 15, phone: '0422-4567890' }
            ],
            drivers: [
              { ambulanceNumber: 'TN-45-AB-1080', name: 'Ravi Kumar', coords: { lat: 11.0096, lng: 76.9707 }, isAvailable: true, fleetType: 'Hospital-owned' },
              { ambulanceNumber: 'TN-38-EM-2020', name: 'Karthik Raja', coords: { lat: 11.0190, lng: 76.9630 }, isAvailable: true, fleetType: 'Emergency ALS' }
            ]
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingServices(false);
      });

    return () => { isMounted = false; };
  }, []);

  const hasActiveTrip = trip && trip._id && !['completed', 'rejected', 'cancelled'].includes(trip.status);

  const handleSosClick = () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([60, 40, 60]);
    }
    go('emergencyConfirm');
  };

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div>
          <div className="status-pill-online">
            <span className="pulsing-green-dot"></span>
            <span>Emergency Dispatch Active</span>
          </div>
          <h1 className="dashboard-user-greeting">
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Emergency Service'}
          </h1>
          <p className="dashboard-user-location">
            📍 {user?.currentLocation || 'Diwan Bahadur Rd, RS Puram, Coimbatore'}
          </p>
        </div>
        <button
          className="dashboard-profile-avatar-btn"
          onClick={() => go('profile')}
          id="patient-profile-btn"
          aria-label="Profile"
        >
          <div className="avatar-initial">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
        </button>
      </div>

      {/* Active Trip Banner if Emergency In Progress */}
      {hasActiveTrip && (
        <div
          className="active-emergency-banner-card"
          onClick={() => (trip.status === 'requested' ? go('callingDriver') : go('patientTracking'))}
        >
          <div className="banner-pulse-icon">🚨</div>
          <div className="banner-content">
            <div className="banner-title">Active Emergency in Progress</div>
            <div className="banner-subtitle">
              Status: <strong style={{ textTransform: 'capitalize' }}>{trip.status.replace('_', ' ')}</strong>
              {trip?.driver?.name ? ` • Driver: ${trip.driver.name}` : ''}
            </div>
          </div>
          <button className="banner-action-btn">
            Track <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Tactical High-End SOS Section */}
      <div className="sos-action-zone">
        <div className="sos-halo-outer">
          <div className="sos-shockwave shockwave-1"></div>
          <div className="sos-shockwave shockwave-2"></div>
          <div className="sos-shockwave shockwave-3"></div>
          <button
            className="sos-master-button"
            onClick={handleSosClick}
            id="sos-button"
            aria-label="Trigger SOS Emergency"
          >
            <div className="sos-glass-sheen"></div>
            <div className="sos-inner-badge">
              <ShieldAlert size={28} className="sos-shield-icon" />
              <span className="sos-core-text">SOS</span>
              <span className="sos-sub-text">EMERGENCY</span>
            </div>
          </button>
        </div>
        <div className="sos-instructions-box">
          <p className="sos-headline">Tap to Dispatch Nearest Ambulance</p>
          <p className="sos-footnote">Auto-routes to emergency triage & notifies nearest hospital</p>
        </div>
      </div>

      {/* Quick Access Medical & Emergency Cards */}
      <div className="quick-access-grid">
        <div
          className="interactive-action-card"
          onClick={() => go('medicalProfile')}
          id="quick-medical"
        >
          <div className="card-top-icon medical">
            <Activity size={20} />
          </div>
          <div className="card-info-wrap">
            <span className="card-main-title">Medical Profile</span>
            <span className="card-sub-detail">
              {user?.bloodGroup ? `Blood: ${user.bloodGroup}` : 'Set Blood & Allergies'}
            </span>
          </div>
          <ChevronRight size={16} className="card-arrow" />
        </div>

        <div
          className="interactive-action-card"
          onClick={() => go('emergencyContactsAlert')}
          id="quick-contacts"
        >
          <div className="card-top-icon contacts">
            <AlertTriangle size={20} />
          </div>
          <div className="card-info-wrap">
            <span className="card-main-title">Emergency Contacts</span>
            <span className="card-sub-detail">
              {user?.emergencyContacts?.length ? `${user.emergencyContacts.length} Contacts Alerted` : 'Add Family Contacts'}
            </span>
          </div>
          <ChevronRight size={16} className="card-arrow" />
        </div>
      </div>

      {/* Real Interactive Map Section */}
      <div className="nearby-services-panel">
        <div className="panel-header-row">
          <div>
            <h3 className="panel-section-title">Nearby Emergency Services</h3>
            <p className="panel-section-sub">
              {nearbyServices.drivers.length} Ambulances on standby • {nearbyServices.hospitals.length} Hospitals ready
            </p>
          </div>
          <button
            className="explore-map-pill"
            onClick={() => go('patientTracking')}
            title="Open Live Map"
          >
            <Navigation size={14} />
            <span>Full Radar</span>
          </button>
        </div>

        <div className="interactive-map-container-box">
          <MapView
            patientCoords={user?.coords || { lat: 11.0168, lng: 76.9558 }}
            hospitalCoords={{ lat: 11.0025, lng: 76.9615 }}
            nearbyServices={nearbyServices}
            height={220}
          />
        </div>

        {/* Quick Hospital Standby Snippet */}
        <div className="nearby-hospitals-strip">
          <div className="hospital-quick-pill">
            <span className="badge-bullet">🏥</span>
            <div className="quick-pill-text">
              <strong>City Emergency Hospital</strong>
              <span>1.4 km • 45 Beds • 8 ICU</span>
            </div>
            <a href="tel:04222345678" className="quick-dial-btn" title="Call Emergency Desk">
              <PhoneCall size={14} />
            </a>
          </div>
        </div>
      </div>

      <PatientNav />
    </div>
  );
}
