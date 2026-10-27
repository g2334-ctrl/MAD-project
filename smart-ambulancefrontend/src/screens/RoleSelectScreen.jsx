import React from 'react';
import { useApp } from '../AppContext';
import { TopBar } from '../components/common/UI';
import { Siren, Truck, Building2 } from 'lucide-react';

export default function RoleSelectScreen() {
  const { go } = useApp();

  const roles = [
    {
      key: 'patient',
      title: 'Patient',
      desc: 'Request emergency ambulance & track live',
      icon: <Siren size={28} />,
      color: '#E11D2E',
      bg: '#FDEBEC',
      screen: 'patientLogin'
    },
    {
      key: 'driver',
      title: 'Ambulance Driver',
      desc: 'Accept requests, navigate & update status',
      icon: <Truck size={28} />,
      color: '#1E9E6B',
      bg: '#E8F7EF',
      screen: 'driverLogin'
    },
    {
      key: 'hospital',
      title: 'Hospital',
      desc: 'Receive alerts, track incoming ambulances',
      icon: <Building2 size={28} />,
      color: '#2159C9',
      bg: '#EAF0FD',
      screen: 'hospitalLogin'
    }
  ];

  return (
    <div className="screen">
      <TopBar title="Select Role" onBack={() => go('welcome')} />
      <p className="text-muted mb-16" style={{ fontSize: 14 }}>
        Choose how you'd like to use Smart Ambulance
      </p>
      <div className="flex flex-col gap-12">
        {roles.map((r) => (
          <div
            key={r.key}
            className="role-card"
            onClick={() => go(r.screen)}
            id={`role-${r.key}`}
          >
            <div className="role-icon" style={{ background: r.bg, color: r.color }}>
              {r.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
