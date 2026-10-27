import React, { useEffect } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, HospitalNav, MapView } from '../../components/common/UI';
import { Building2, Bed, Activity, Bell, Compass, FileSpreadsheet, ShieldAlert, CheckCircle2, ChevronRight, Phone, Stethoscope } from 'lucide-react';
import api from '../../api';

export default function HospitalDashboard() {
  const { user, trip, setTrip, refreshTrip, go } = useApp();

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  const hasActiveEmergency = trip && trip._id && !['completed', 'rejected', 'cancelled'].includes(trip.status);

  const handleQuickAdmit = async () => {
    if (!trip?._id) return;
    try {
      const res = await api.put(`/emergency/${trip._id}/complete`);
      setTrip(res.data);
      refreshTrip();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div>
          <div className="status-pill-online">
            <span className="pulsing-green-dot"></span>
            <span>Trauma & ER Command Active</span>
          </div>
          <h1 className="dashboard-user-greeting">
            {user?.name || 'City Emergency Hospital'}
          </h1>
          <p className="dashboard-user-location">
            🏥 ID: {user?.hospitalId || 'HOSP-CE-108'} • {user?.address || 'Gandhipuram, Coimbatore'}
          </p>
        </div>
        <button
          className="dashboard-profile-avatar-btn"
          onClick={() => go('profile')}
          id="hospital-profile-btn"
          aria-label="Profile"
        >
          <div className="avatar-initial" style={{ background: 'var(--blue)', color: 'white' }}>
            H
          </div>
        </button>
      </div>

      {/* Real-time Inbound Emergency Alert Banner (Shown to Hospital & Doctors) */}
      {hasActiveEmergency ? (
        <div className="card notification-card mb-16" style={{ border: '2px solid var(--red)', background: 'linear-gradient(180deg, #FFFDFD 0%, #FDEBEC 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={22} color="var(--red)" />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🚨 Incoming Patient Emergency
              </span>
            </div>
            <span className={`badge badge-${trip.severity || 'critical'}`}>
              {trip.severity?.toUpperCase() || 'CRITICAL'}
            </span>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
            {trip.emergencyType || 'Medical Emergency'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, fontSize: 12 }}>
            <div style={{ background: 'white', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <span className="text-muted" style={{ display: 'block', fontSize: 10 }}>PATIENT</span>
              <strong>{trip.patient?.name || 'Emergency Patient'}</strong>
              <span style={{ color: 'var(--red)', marginLeft: 6, fontWeight: 700 }}>({trip.patient?.bloodGroup || 'O+'})</span>
            </div>
            <div style={{ background: 'white', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <span className="text-muted" style={{ display: 'block', fontSize: 10 }}>AMBULANCE UNIT</span>
              <strong>{trip.driver?.name || 'Unit 108'}</strong>
              <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>{trip.driver?.ambulanceNumber}</span>
            </div>
          </div>

          {/* Current Lifecycle Status */}
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Status: <strong style={{ color: 'var(--red)', textTransform: 'capitalize' }}>{trip.status.replace('_', ' ')}</strong></span>
            {trip.handoverChecklist?.vitalsTaken && (
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Vitals Transmitted</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              className="btn btn-primary"
              onClick={() => go('hospitalNotification')}
              id="view-inbound-details-btn"
              style={{ flex: 1, fontSize: 13 }}
            >
              <Stethoscope size={16} /> Doctor Pre-Brief
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => go('hospitalTracking')}
              id="track-inbound-btn"
              style={{ flex: 1, fontSize: 13 }}
            >
              <Compass size={16} /> Live GPS
            </button>
          </div>

          {trip.status === 'arrived_hospital' && (
            <button
              className="btn btn-success btn-block mt-8"
              onClick={handleQuickAdmit}
              style={{ background: 'var(--green)', color: 'white', fontWeight: 700 }}
            >
              <CheckCircle2 size={16} /> Admit Patient & Complete Trip
            </button>
          )}
        </div>
      ) : (
        <div className="card-glass mb-16 text-center" style={{ padding: '20px 16px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🟢</div>
          <h4 style={{ fontSize: 14, fontWeight: 700 }}>Emergency Grid Connected</h4>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
            No incoming ambulance calls at this second. ER and Trauma bays are on standby.
          </p>
        </div>
      )}

      {/* Bed Capacity Quick Management */}
      <div className="card mb-16">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700 }}>Live Bed & ICU Availability</h4>
          <button
            className="btn btn-secondary"
            onClick={() => go('bedAvailability')}
            id="manage-beds-btn"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <Bed size={14} /> Update Beds
          </button>
        </div>

        <div className="bed-grid">
          <div className="bed-stat">
            <div className="bed-stat-value" style={{ color: 'var(--green)' }}>
              {user?.availableBeds ?? 45}
            </div>
            <div className="bed-stat-label">General Beds Available</div>
          </div>
          <div className="bed-stat">
            <div className="bed-stat-value" style={{ color: 'var(--blue)' }}>
              {user?.icuAvailable ?? 8}
            </div>
            <div className="bed-stat-label">ICU Trauma Ready</div>
          </div>
        </div>
      </div>

      {/* Department Quick Routing */}
      <div className="card mb-16">
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Clinical Operations</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => go('departmentRouting')}
            id="btn-dept-routing"
            style={{ fontSize: 13, padding: '12px 10px', justifyContent: 'flex-start' }}
          >
            <Activity size={16} color="var(--red)" /> Dept Routing
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => go('adminAnalytics')}
            id="btn-hospital-analytics"
            style={{ fontSize: 13, padding: '12px 10px', justifyContent: 'flex-start' }}
          >
            <FileSpreadsheet size={16} color="var(--blue)" /> ER Analytics
          </button>
        </div>
      </div>

      {/* Hospital Coverage Map with Leaflet */}
      <div className="card">
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Hospital Service Grid</h4>
        <MapView
          hospitalCoords={user?.coords || { lat: 11.0025, lng: 76.9615 }}
          patientCoords={trip?.patientLocation}
          driverCoords={trip?.driverLocation}
          height={200}
        />
      </div>

      <HospitalNav />
    </div>
  );
}
