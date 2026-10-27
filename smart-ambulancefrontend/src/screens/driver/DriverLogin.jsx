import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';
import { Sparkles } from 'lucide-react';

export default function DriverLogin() {
  const { login, go } = useApp();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setMobile('9445512233');
    setPassword('driver123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/drivers/login', { mobile, password });
      login('driver', res.data);
      go('driverDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Driver Portal" onBack={() => go('roleSelect')} />

      <div style={{ marginTop: 12 }}>
        {/* Demo Credentials Quick-Fill Banner */}
        <div
          className="card-glass mb-16"
          style={{
            border: '1px solid rgba(30, 158, 107, 0.3)',
            background: 'var(--green-tint)',
            cursor: 'pointer',
            padding: '12px 14px'
          }}
          onClick={fillDemo}
          id="demo-driver-btn"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: 'var(--green)' }}>
              <Sparkles size={15} /> DEMO DRIVER CREDENTIALS
            </div>
            <span className="badge badge-minor" style={{ fontSize: 10, padding: '2px 8px' }}>
              Tap to Auto-fill
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Mobile: <strong>9445512233</strong></span>
            <span>Pass: <strong>driver123</strong></span>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🚑</div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Ambulance Driver Login</h2>
            <p className="text-muted" style={{ fontSize: 13 }}>Access emergency dispatch & navigation</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile (or tap Demo above)"
              id="driver-mobile"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              id="driver-password"
            />

            {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              id="driver-login-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In as Driver'}
            </button>
          </form>

          <p className="text-center mt-16" style={{ fontSize: 13 }}>
            New ambulance unit?{' '}
            <span className="link" onClick={() => go('driverRegister')}>Register Vehicle</span>
          </p>
        </div>
      </div>
    </div>
  );
}
