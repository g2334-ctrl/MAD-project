import React from 'react';
import { useApp } from '../AppContext';
import { TopBar } from '../components/common/UI';
import { LogOut, User, Phone, Mail, MapPin } from 'lucide-react';

export default function Profile() {
  const { user, role, logout, go } = useApp();

  if (!user) return null;

  const dashScreen = role === 'hospital' ? 'hospitalDashboard' : role === 'driver' ? 'driverDashboard' : 'patientDashboard';

  const fields = [
    { icon: <User size={16} />, label: 'Name', value: user.name },
    { icon: <Phone size={16} />, label: 'Mobile', value: user.mobile || user.hospitalId },
    { icon: <Mail size={16} />, label: 'Email', value: user.email || '—' },
    { icon: <MapPin size={16} />, label: 'Location', value: user.currentLocation || user.city || '—' }
  ];

  return (
    <div className="screen">
      <TopBar title="Profile" onBack={() => go(dashScreen)} />

      <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(145deg, var(--red), var(--red-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', fontSize: 32, color: '#fff'
        }}>
          {user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</h2>
        <span className="badge badge-moderate" style={{ marginTop: 6 }}>
          {role?.toUpperCase()}
        </span>
      </div>

      <div className="card">
        {fields.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: i < fields.length - 1 ? '1px solid var(--line)' : 'none'
          }}>
            <span style={{ color: 'var(--muted)' }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>{f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary btn-block mt-20"
        onClick={logout}
        id="logout-btn"
        style={{ color: 'var(--red)' }}
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
