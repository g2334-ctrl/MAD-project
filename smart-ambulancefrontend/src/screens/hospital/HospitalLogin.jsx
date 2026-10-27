import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';
import { Sparkles } from 'lucide-react';

export default function HospitalLogin() {
  const { login, go } = useApp();
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setHospitalId('HOSP-CE-108');
    setPassword('hospital123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/hospitals/login', { hospitalId, password });
      login('hospital', res.data);
      go('hospitalDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Hospital Portal" onBack={() => go('roleSelect')} />

      <div style={{ marginTop: 12 }}>
        {/* Demo Credentials Quick-Fill Banner */}
        <div
          className="card-glass mb-16"
          style={{
            border: '1px solid rgba(33, 89, 201, 0.3)',
            background: 'var(--blue-tint)',
            cursor: 'pointer',
            padding: '12px 14px'
          }}
          onClick={fillDemo}
          id="demo-hospital-btn"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: 'var(--blue)' }}>
              <Sparkles size={15} /> DEMO HOSPITAL CREDENTIALS
            </div>
            <span className="badge" style={{ background: 'var(--blue)', color: '#fff', fontSize: 10, padding: '2px 8px' }}>
              Tap to Auto-fill
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Hospital ID: <strong>HOSP-CE-108</strong></span>
            <span>Pass: <strong>hospital123</strong></span>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏥</div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Hospital Staff Login</h2>
            <p className="text-muted" style={{ fontSize: 13 }}>Emergency triage & live inbound telemetry</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              label="Hospital ID"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              placeholder="Enter ID (or tap Demo above)"
              id="hospital-id-input"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter security password"
              id="hospital-password-input"
            />

            {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              id="hospital-login-btn"
            >
              {loading ? 'Logging In...' : 'Sign In as Hospital'}
            </button>
          </form>

          <p className="text-center mt-16" style={{ fontSize: 13 }}>
            Register new facility?{' '}
            <span className="link" onClick={() => go('hospitalRegister')}>Hospital Registration</span>
          </p>
        </div>
      </div>
    </div>
  );
}
