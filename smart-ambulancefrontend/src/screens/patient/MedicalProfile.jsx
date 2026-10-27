import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field, PatientNav } from '../../components/common/UI';
import api from '../../api';
import { Heart, Activity, AlertCircle, Save } from 'lucide-react';

export default function MedicalProfile() {
  const { user, setUser, go } = useApp();
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [allergies, setAllergies] = useState(user?.allergies?.join(', ') || '');
  const [chronicConditions, setChronicConditions] = useState(user?.chronicConditions?.join(', ') || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setBloodGroup(user.bloodGroup || '');
      setAllergies(user.allergies ? user.allergies.join(', ') : '');
      setChronicConditions(user.chronicConditions ? user.chronicConditions.join(', ') : '');
      setPreferredLanguage(user.preferredLanguage || 'en');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const allergyArr = allergies.split(',').map((s) => s.trim()).filter(Boolean);
      const conditionArr = chronicConditions.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.put('/patients/medical-profile', {
        bloodGroup,
        allergies: allergyArr,
        chronicConditions: conditionArr,
        preferredLanguage
      });
      setUser(res.data);
      setMessage('✅ Medical Profile updated successfully');
    } catch (err) {
      setMessage('❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      <TopBar title="Medical Profile" onBack={() => go('patientDashboard')} />

      <div className="card mt-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Heart size={28} color="var(--red)" />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Emergency Health Info</h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              Shared automatically with paramedics & emergency doctors
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <Field
            label="Blood Group"
            type="select"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            id="med-blood"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </Field>

          <Field
            label="Known Allergies (comma separated)"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. Penicillin, Peanuts, Latex"
            id="med-allergies"
          />

          <Field
            label="Chronic Conditions (comma separated)"
            value={chronicConditions}
            onChange={(e) => setChronicConditions(e.target.value)}
            placeholder="e.g. Diabetes, Hypertension, Asthma"
            id="med-chronic"
          />

          <Field
            label="Preferred Language"
            type="select"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            id="med-lang"
          >
            <option value="en">English</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
          </Field>

          {message && <p style={{ fontSize: 13, marginBottom: 12 }}>{message}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            id="save-medical-btn"
          >
            <Save size={16} /> {loading ? 'Saving...' : 'Save Medical Profile'}
          </button>
        </form>
      </div>

      <PatientNav />
    </div>
  );
}
