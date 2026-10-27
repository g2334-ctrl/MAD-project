import React from 'react';
import { ChevronLeft, Home, Navigation, HeartPulse, User, Activity, Bell, Settings } from 'lucide-react';
import { useApp } from '../../AppContext';
import LeafletMap from './LeafletMap';

/* ── TOP BAR ── */
export function TopBar({ title, onBack, right, subtitle }) {
  const { go, prevScreen } = useApp();
  const handleBack = onBack || (() => (prevScreen ? go(prevScreen) : go('welcome')));
  return (
    <div className="top-bar">
      <button className="top-bar-back" onClick={handleBack} id="top-bar-back" aria-label="Go Back">
        <ChevronLeft size={20} />
      </button>
      <div className="top-bar-title-wrap">
        <h1>{title}</h1>
        {subtitle && <p className="top-bar-subtitle">{subtitle}</p>}
      </div>
      <div className="top-bar-right-slot">{right || null}</div>
    </div>
  );
}

/* ── FORM FIELD ── */
export function Field({ label, type = 'text', value, onChange, placeholder, id, error, icon, ...rest }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="field-input-box">
        {icon && <span className="field-icon-prefix">{icon}</span>}
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...rest}
          />
        ) : type === 'select' ? (
          <select id={id} value={value} onChange={onChange} {...rest}>
            {rest.children}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...rest}
          />
        )}
      </div>
      {error && <span className="field-error-msg">{error}</span>}
    </div>
  );
}

/* ── MAP VIEW (Now uses REAL interactive Leaflet Map) ── */
export function MapView({ driverCoords, patientCoords, hospitalCoords, nearbyServices, height = 220 }) {
  return (
    <LeafletMap
      driverCoords={driverCoords}
      patientCoords={patientCoords}
      hospitalCoords={hospitalCoords}
      nearbyServices={nearbyServices}
      height={height}
      interactive={true}
      showStandby={true}
    />
  );
}

/* ── PATIENT BOTTOM NAV ── */
export function PatientNav() {
  const { screen, go } = useApp();
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${screen === 'patientDashboard' ? 'active' : ''}`}
        onClick={() => go('patientDashboard')}
        id="nav-home"
      >
        <div className="nav-icon-wrapper">
          <Home size={20} />
        </div>
        <span>Home</span>
      </button>
      <button
        className={`nav-item ${screen === 'patientTracking' ? 'active' : ''}`}
        onClick={() => go('patientTracking')}
        id="nav-track"
      >
        <div className="nav-icon-wrapper">
          <Navigation size={20} />
        </div>
        <span>Track</span>
      </button>
      <button
        className={`nav-item ${screen === 'medicalProfile' ? 'active' : ''}`}
        onClick={() => go('medicalProfile')}
        id="nav-medical"
      >
        <div className="nav-icon-wrapper">
          <HeartPulse size={20} />
        </div>
        <span>Medical</span>
      </button>
      <button
        className={`nav-item ${screen === 'profile' ? 'active' : ''}`}
        onClick={() => go('profile')}
        id="nav-profile"
      >
        <div className="nav-icon-wrapper">
          <User size={20} />
        </div>
        <span>Profile</span>
      </button>
    </nav>
  );
}

/* ── DRIVER BOTTOM NAV ── */
export function DriverNav() {
  const { screen, go } = useApp();
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${screen === 'driverDashboard' ? 'active' : ''}`}
        onClick={() => go('driverDashboard')}
        id="nav-driver-home"
      >
        <div className="nav-icon-wrapper">
          <Home size={20} />
        </div>
        <span>Console</span>
      </button>
      <button
        className={`nav-item ${screen === 'driverNavigation' ? 'active' : ''}`}
        onClick={() => go('driverNavigation')}
        id="nav-driver-nav"
      >
        <div className="nav-icon-wrapper">
          <Navigation size={20} />
        </div>
        <span>Navigate</span>
      </button>
      <button
        className={`nav-item ${screen === 'profile' ? 'active' : ''}`}
        onClick={() => go('profile')}
        id="nav-driver-profile"
      >
        <div className="nav-icon-wrapper">
          <User size={20} />
        </div>
        <span>Profile</span>
      </button>
    </nav>
  );
}

/* ── HOSPITAL BOTTOM NAV ── */
export function HospitalNav() {
  const { screen, go } = useApp();
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${screen === 'hospitalDashboard' ? 'active' : ''}`}
        onClick={() => go('hospitalDashboard')}
        id="nav-hospital-home"
      >
        <div className="nav-icon-wrapper">
          <Home size={20} />
        </div>
        <span>Command</span>
      </button>
      <button
        className={`nav-item ${screen === 'bedAvailability' ? 'active' : ''}`}
        onClick={() => go('bedAvailability')}
        id="nav-hospital-beds"
      >
        <div className="nav-icon-wrapper">
          <Activity size={20} />
        </div>
        <span>Beds</span>
      </button>
      <button
        className={`nav-item ${screen === 'hospitalNotification' ? 'active' : ''}`}
        onClick={() => go('hospitalNotification')}
        id="nav-hospital-alerts"
      >
        <div className="nav-icon-wrapper">
          <Bell size={20} />
        </div>
        <span>Alerts</span>
      </button>
      <button
        className={`nav-item ${screen === 'profile' ? 'active' : ''}`}
        onClick={() => go('profile')}
        id="nav-hospital-profile"
      >
        <div className="nav-icon-wrapper">
          <Settings size={20} />
        </div>
        <span>Settings</span>
      </button>
    </nav>
  );
}
