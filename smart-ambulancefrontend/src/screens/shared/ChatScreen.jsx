import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { TopBar } from '../../components/common/UI';
import api from '../../api';
import { getSocket } from '../../socket';
import { Send, MessageSquare } from 'lucide-react';

export default function ChatScreen() {
  const { trip, user, role, chatMessages, setChatMessages, go, prevScreen } = useApp();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const quickReplies =
    role === 'patient'
      ? ['I am at Gate 2', 'Please hurry!', 'Patient is conscious', 'Near landmark bakery']
      : ['On my way, 3 mins', 'Please stay calm', 'At the entrance now', 'Is patient breathing?'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async (msgText) => {
    const toSend = msgText || text;
    if (!toSend.trim() || !trip?._id) return;
    setText('');

    const newMsg = {
      sender: role,
      message: toSend,
      timestamp: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, newMsg]);

    try {
      await api.post(`/emergency/${trip._id}/chat`, { message: toSend });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && trip) {
      if (role === 'driver') {
        socket.emit('driver:typing', {
          emergencyId: trip._id,
          patientId: trip.patient?._id || trip.patient
        });
      }
    }
  };

  const handleBack = () => {
    if (role === 'driver') go('driverNavigation');
    else if (role === 'patient') go('patientTracking');
    else go('hospitalDashboard');
  };

  return (
    <div className="screen flex flex-col justify-between" style={{ minHeight: '94vh', paddingBottom: 16 }}>
      <div>
        <TopBar
          title={`Chat with ${role === 'patient' ? trip?.driver?.name || 'Driver' : trip?.patient?.name || 'Patient'}`}
          onBack={handleBack}
        />

        {/* Quick Reply Chips */}
        <div className="quick-replies mb-8">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              className="quick-reply-chip"
              onClick={() => sendMessage(qr)}
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="chat-container">
          {chatMessages.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '30px 0', fontSize: 13 }}>
              <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              No messages yet. Send a quick response to coordinate emergency arrival.
            </div>
          ) : (
            chatMessages.map((m, i) => {
              const isMe = m.sender === role;
              return (
                <div
                  key={i}
                  className={`chat-bubble ${isMe ? 'sent' : 'received'}`}
                >
                  <div>{m.message}</div>
                  <div className="chat-time" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--muted)', textAlign: isMe ? 'right' : 'left' }}>
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type message..."
          id="chat-input-field"
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          id="chat-send-btn"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
