import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';

export default function PatientRegister() {
  const { login, go } = useApp();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', altMobile: '', currentLocation: '', nativePlace: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/patients/register', form);
      login('patient', res.data);
      go('patientDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Patient Register" onBack={() => go('patientLogin')} />
      <div className="card mt-8">
        <form onSubmit={handleSubmit}>
          <Field label="Full Name" value={form.name} onChange={set('name')} placeholder="Your full name" id="reg-name" />
          <Field label="Mobile Number" type="tel" value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" id="reg-mobile" />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" id="reg-email" />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Create a password" id="reg-password" />
          <Field label="Alt Mobile" type="tel" value={form.altMobile} onChange={set('altMobile')} placeholder="Alternative number" id="reg-alt" />
          <Field label="Current Location" value={form.currentLocation} onChange={set('currentLocation')} placeholder="e.g. RS Puram, Coimbatore" id="reg-location" />
          <Field label="Native Place" value={form.nativePlace} onChange={set('nativePlace')} placeholder="Your hometown" id="reg-native" />
          {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="patient-register-btn">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-16" style={{ fontSize: 13 }}>
          Already have an account? <span className="link" onClick={() => go('patientLogin')}>Sign In</span>
        </p>
      </div>
    </div>
  );
}
