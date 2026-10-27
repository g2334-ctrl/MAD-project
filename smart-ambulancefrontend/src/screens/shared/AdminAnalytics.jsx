import React from 'react';
import { useApp } from '../../AppContext';
import { TopBar } from '../../components/common/UI';
import { BarChart3, Clock, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export default function AdminAnalytics() {
  const { go } = useApp();

  const metrics = [
    { title: 'Avg Response Time', value: '4m 18s', diff: '-32s (12% faster)', good: true },
    { title: 'Emergency Dispatches', value: '142', diff: '+18 today', good: true },
    { title: 'Bed Turnaround', value: '18 mins', diff: 'Optimal', good: true },
    { title: 'Satisfaction Rate', value: '98.4%', diff: '⭐ 4.9 / 5.0', good: true }
  ];

  const hourlyLoad = [
    { hour: '6am', val: 35 },
    { hour: '9am', val: 75 },
    { hour: '12pm', val: 90 },
    { hour: '3pm', val: 60 },
    { hour: '6pm', val: 100 },
    { hour: '9pm', val: 80 },
    { hour: '12am', val: 40 }
  ];

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <TopBar title="Dispatch Analytics" onBack={() => go('hospitalDashboard')} />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12, marginBottom: 16 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              {m.title}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, fontFamily: 'var(--font-display)' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 2, fontWeight: 500 }}>
              {m.diff}
            </div>
          </div>
        ))}
      </div>

      {/* Response Time by Zone Chart */}
      <div className="card mb-16">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700 }}>Dispatch Heatmap (Hours)</h4>
          <span className="badge badge-critical">Live Traffic</span>
        </div>

        <div className="chart-bar-group" style={{ marginBottom: 24 }}>
          {hourlyLoad.map((b, i) => (
            <div key={i} className="chart-bar" style={{ height: `${b.val}%` }}>
              <span className="chart-bar-label">{b.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Performance Leaderboard */}
      <div className="card">
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Award size={18} color="var(--amber)" /> Top Responding Units
        </h4>

        {[
          { name: 'Ravi Kumar (TN-45-AB-1080)', trips: '14 trips', score: '3.8m avg' },
          { name: 'Selvan M (TN-38-XY-9002)', trips: '11 trips', score: '4.1m avg' },
          { name: 'Karthik P (TN-45-CD-1088)', trips: '9 trips', score: '4.5m avg' }
        ].map((u, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
              fontSize: 13
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.trips}</div>
            </div>
            <span className="badge badge-minor">{u.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
