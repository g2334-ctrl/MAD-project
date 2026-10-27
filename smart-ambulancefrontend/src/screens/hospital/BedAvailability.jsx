import React, { useState } from 'react';
import { useApp } from '../../AppContext';
import { TopBar, Field, HospitalNav } from '../../components/common/UI';
import api from '../../api';
import { getSocket } from '../../socket';
import { Bed, Plus, Minus, Save, Check } from 'lucide-react';

export default function BedAvailability() {
  const { user, setUser, go } = useApp();
  const [totalBeds, setTotalBeds] = useState(user?.totalBeds ?? 200);
  const [availableBeds, setAvailableBeds] = useState(user?.availableBeds ?? 45);
  const [icuAvailable, setIcuAvailable] = useState(user?.icuAvailable ?? 8);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await api.put('/hospitals/beds', {
        totalBeds: Number(totalBeds),
        availableBeds: Number(availableBeds),
        icuAvailable: Number(icuAvailable)
      });
      setUser(res.data);
      setSaved(true);

      // Broadcast to socket
      const socket = getSocket();
      if (socket) {
        socket.emit('hospital:bedUpdate', {
          hospitalId: user?.hospitalId,
          availableBeds: Number(availableBeds),
          icuAvailable: Number(icuAvailable)
        });
      }
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 90 }}>
      <TopBar title="Bed Management" onBack={() => go('hospitalDashboard')} />

      <div className="card mt-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Bed size={28} color="var(--blue)" />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Real-Time Capacity</h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              Used by 108 dispatch routing algorithms for hospital selection
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-16">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              General Emergency Beds Available
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setAvailableBeds((p) => Math.max(0, p - 1))}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={availableBeds}
                onChange={(e) => setAvailableBeds(e.target.value)}
                style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, width: 80, padding: 8 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setAvailableBeds((p) => Number(p) + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mb-16">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              ICU / Ventilator Beds Available
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIcuAvailable((p) => Math.max(0, p - 1))}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={icuAvailable}
                onChange={(e) => setIcuAvailable(e.target.value)}
                style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, width: 80, padding: 8 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIcuAvailable((p) => Number(p) + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <Field
            label="Total Facility Capacity"
            type="number"
            value={totalBeds}
            onChange={(e) => setTotalBeds(e.target.value)}
            id="total-beds-input"
          />

          <button
            type="submit"
            className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-block mt-16`}
            disabled={loading}
            id="save-beds-btn"
          >
            {saved ? <><Check size={16} /> Capacity Broadcasted</> : <><Save size={16} /> Save & Broadcast</>}
          </button>
        </form>
      </div>

      <HospitalNav />
    </div>
  );
}
