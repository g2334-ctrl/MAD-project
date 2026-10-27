import React from 'react';
import { useApp } from '../AppContext';
import { Heart, Shield, Zap } from 'lucide-react';

export default function WelcomeScreen() {
  const { go } = useApp();

  return (
    <div className="welcome-bg">
      <div className="welcome-logo">🚑</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Smart Ambulance
      </h1>
      <p style={{ fontSize: 15, opacity: 0.7, marginBottom: 40, lineHeight: 1.5 }}>
        Emergency Response System<br />
        <span style={{ fontSize: 13 }}>Real-time tracking • Instant dispatch • Save lives</span>
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 48 }}>
        {[
          { icon: <Zap size={18} />, label: 'Fast' },
          { icon: <Heart size={18} />, label: 'Reliable' },
          { icon: <Shield size={18} />, label: 'Secure' }
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.8 }}>
            {item.icon}
            <span style={{ fontSize: 11, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-block"
        style={{ maxWidth: 280, fontSize: 16, padding: '16px 32px', borderRadius: 50 }}
        onClick={() => go('roleSelect')}
        id="welcome-enter"
      >
        Get Started
      </button>

      <p style={{ fontSize: 11, opacity: 0.4, marginTop: 24 }}>
        v2.0 — Emergency services for Coimbatore
      </p>
    </div>
  );
}
