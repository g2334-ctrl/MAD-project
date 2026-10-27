import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field } from '../../components/common/UI';
import api from '../../api';

export default function DriverRegister() {
  const { login, go } = useApp();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    altMobile: '',
    ambulanceNumber: '',
    assignedHospitalId: 'HOSP-CE-108',
    fleetType: 'hospital-owned'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/drivers/register', form);
      login('driver', res.data);
      go('driverDashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Driver registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Register Ambulance" onBack={() => go('driverLogin')} />
      <div className="card mt-8">
        <form onSubmit={handleSubmit}>
          <Field label="Driver Full Name" value={form.name} onChange={set('name')} placeholder="e.g. Ravi Kumar" id="drv-name" />
          <Field label="Mobile Number" type="tel" value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" id="drv-mobile" />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="driver@ambulance.in" id="drv-email" />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Create password" id="drv-password" />
          <Field label="Ambulance Number Plate" value={form.ambulanceNumber} onChange={set('ambulanceNumber')} placeholder="e.g. TN-45-AB-1080" id="drv-plate" />
          <Field label="Assigned Hospital ID" value={form.assignedHospitalId} onChange={set('assignedHospitalId')} placeholder="e.g. HOSP-CE-108" id="drv-hosp" />
          <Field
            label="Fleet Type"
            type="select"
            value={form.fleetType}
            onChange={set('fleetType')}
            id="drv-fleet"
          >
            <option value="hospital-owned">Hospital-Owned Fleet</option>
            <option value="private">Private Emergency Fleet</option>
          </Field>

          {error && <p className="text-red" style={{ fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="driver-register-btn">
            {loading ? 'Registering...' : 'Register Vehicle & Driver'}
          </button>
        </form>
        <p className="text-center mt-16" style={{ fontSize: 13 }}>
          Already registered? <span className="link" onClick={() => go('driverLogin')}>Sign In</span>
        </p>
      </div>
    </div>
  );
}
