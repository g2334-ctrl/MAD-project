import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';
import { KeyRound, Sparkles } from 'lucide-react';

export default function PatientLogin() {
  const { login, go } = useApp();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setMobile('9876543210');
    setPassword('patient123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/patients/login', { mobile, password });
      login('patient', res.data);
      go('patientDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Patient Login" onBack={() => go('roleSelect')} />
      <div style={{ marginTop: 12 }}>

        {/* Demo Credentials Quick-Fill Banner */}
        <div
          className="card-glass mb-16"
          style={{
            border: '1px solid rgba(225, 29, 46, 0.3)',
            background: 'var(--red-tint)',
            cursor: 'pointer',
            padding: '12px 14px'
          }}
          onClick={fillDemo}
          id="demo-patient-btn"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: 'var(--red)' }}>
              <Sparkles size={15} /> DEMO PATIENT CREDENTIALS
            </div>
            <span className="badge badge-critical" style={{ fontSize: 10, padding: '2px 8px' }}>
              Tap to Auto-fill
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Mobile: <strong>9876543210</strong></span>
            <span>Pass: <strong>patient123</strong></span>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>👤</div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Welcome Back</h2>
            <p className="text-muted" style={{ fontSize: 13 }}>Sign in to request emergency services</p>
          </div>
          <form onSubmit={handleSubmit}>
            <Field
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile (or tap Demo above)"
              id="patient-mobile"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              id="patient-password"
            />
            {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              id="patient-login-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center mt-16" style={{ fontSize: 13 }}>
            Don't have an account?{' '}
            <span className="link" onClick={() => go('patientRegister')}>Register</span>
          </p>
        </div>
      </div>
    </div>
  );
}
