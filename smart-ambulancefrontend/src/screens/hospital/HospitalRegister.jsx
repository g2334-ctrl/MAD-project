import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';

export default function HospitalRegister() {
  const { login, go } = useApp();
  const [form, setForm] = useState({
    name: '',
    hospitalId: '',
    password: '',
    address: '',
    city: 'Coimbatore',
    pincode: '641001',
    phone: '',
    email: '',
    adminName: '',
    totalBeds: 150,
    availableBeds: 30,
    icuAvailable: 6
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/hospitals/create', form);
      login('hospital', res.data);
      go('hospitalDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Hospital registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Register Hospital" onBack={() => go('hospitalLogin')} />
      <div className="card mt-8">
        <form onSubmit={handleSubmit}>
          <Field label="Hospital Name" value={form.name} onChange={set('name')} placeholder="e.g. City Emergency Hospital" id="hosp-reg-name" />
          <Field label="Unique Hospital ID" value={form.hospitalId} onChange={set('hospitalId')} placeholder="e.g. HOSP-CE-108" id="hosp-reg-id" />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Create password" id="hosp-reg-pass" />
          <Field label="Address / Street" value={form.address} onChange={set('address')} placeholder="123 Medical Avenue" id="hosp-reg-addr" />
          <Field label="Contact Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="0422-2345678" id="hosp-reg-phone" />
          <Field label="Administrator Name" value={form.adminName} onChange={set('adminName')} placeholder="Dr. Priya Sharma" id="hosp-reg-admin" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Total Beds" type="number" value={form.totalBeds} onChange={set('totalBeds')} id="hosp-reg-tb" />
            <Field label="Available Beds" type="number" value={form.availableBeds} onChange={set('availableBeds')} id="hosp-reg-ab" />
          </div>

          <Field label="ICU Beds Ready" type="number" value={form.icuAvailable} onChange={set('icuAvailable')} id="hosp-reg-icu" />

          {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="hospital-register-btn">
            {loading ? 'Creating Facility...' : 'Register Hospital'}
          </button>
        </form>
        <p className="text-center mt-16" style={{ fontSize: 13 }}>
          Already registered? <span className="link" onClick={() => go('hospitalLogin')}>Sign In</span>
        </p>
      </div>
    </div>
  );
}
