import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar } from '../../components/common/UI';
import { Activity, ShieldCheck, Heart, Stethoscope, AlertTriangle } from 'lucide-react';

export default function DepartmentRouting() {
  const { go } = useApp();
  const [departments, setDepartments] = useState([
    { name: 'Trauma & Emergency', status: 'Optimal', load: '65%', onDuty: 'Dr. Ramesh (Lead)' },
    { name: 'Cardiac Care (CCU)', status: 'High Alert', load: '88%', onDuty: 'Dr. Anita (Cardiologist)' },
    { name: 'Pediatric Emergency', status: 'Optimal', load: '40%', onDuty: 'Dr. Suresh' },
    { name: 'Neurology / Stroke Care', status: 'Optimal', load: '52%', onDuty: 'Dr. Priya' }
  ]);

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <TopBar title="Department Routing" onBack={() => go('hospitalDashboard')} />

      <p className="text-muted mt-8 mb-16" style={{ fontSize: 13 }}>
        Live telemetry routing queue to ensure ambulances are directed to active teams with ready bays.
      </p>

      <div className="flex flex-col gap-12">
        {departments.map((d, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700 }}>{d.name}</h4>
              <span className={`badge ${d.status === 'Optimal' ? 'badge-minor' : 'badge-critical'}`}>
                {d.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              On-Call: <strong>{d.onDuty}</strong>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Current Bay Utilization: <strong>{d.load}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
