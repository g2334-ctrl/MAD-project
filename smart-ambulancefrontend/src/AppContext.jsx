import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from './api';
import { connectSocket, disconnectSocket, getSocket } from './socket';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('welcome');
  const [prevScreen, setPrevScreen] = useState(null);
  const [role, setRole] = useState(null); // 'patient' | 'driver' | 'hospital'
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [driverTyping, setDriverTyping] = useState(false);
  const typingTimeout = useRef(null);

  // Navigate between screens
  const go = useCallback((s) => {
    setPrevScreen(screen);
    setScreen(s);
  }, [screen]);

  // Login: store token, set role & user, connect socket
  const login = useCallback((r, data) => {
    localStorage.setItem('amb_token', data.token);
    localStorage.setItem('amb_role', r);
    setRole(r);
    setUser(data.user);
    connectSocket(data.token);
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('amb_token');
    localStorage.removeItem('amb_role');
    disconnectSocket();
    setRole(null);
    setUser(null);
    setTrip(null);
    setChatMessages([]);
    setScreen('welcome');
  }, []);

  // Refresh trip from server
  const refreshTrip = useCallback(async () => {
    try {
      const res = await api.get('/emergency/active');
      setTrip(res.data);
      if (res.data.chatLog) setChatMessages(res.data.chatLog);
    } catch {
      setTrip(null);
    }
  }, []);

  // Auto-login on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('amb_token');
    const savedRole = localStorage.getItem('amb_role');
    if (token && savedRole) {
      setRole(savedRole);
      connectSocket(token);
      // Fetch user profile
      const endpoint = savedRole === 'hospital' ? '/hospitals/me' : savedRole === 'driver' ? '/drivers/me' : '/patients/me';
      api.get(endpoint)
        .then((res) => {
          setUser(res.data);
          setScreen(savedRole === 'hospital' ? 'hospitalDashboard' : savedRole === 'driver' ? 'driverDashboard' : 'patientDashboard');
        })
        .catch(() => {
          localStorage.removeItem('amb_token');
          localStorage.removeItem('amb_role');
        });
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onStatus = (data) => {
      setTrip(data);
      if (data.chatLog) setChatMessages(data.chatLog);
    };
    const onNewEmergency = (data) => {
      setTrip(data);
      if (role === 'driver') go('driverDashboard');
    };
    const onHospitalNotified = (data) => {
      setTrip(data);
    };
    const onLocationUpdate = (data) => {
      setTrip((prev) => prev ? { ...prev, driverLocation: { lat: data.lat, lng: data.lng } } : prev);
    };
    const onChat = (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    };
    const onTyping = () => {
      setDriverTyping(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setDriverTyping(false), 2000);
    };

    socket.on('emergency:status', onStatus);
    socket.on('emergency:new', onNewEmergency);
    socket.on('emergency:hospitalNotified', onHospitalNotified);
    socket.on('location:update', onLocationUpdate);
    socket.on('location:smooth', onLocationUpdate);
    socket.on('chat:message', onChat);
    socket.on('driver:typing', onTyping);

    return () => {
      socket.off('emergency:status', onStatus);
      socket.off('emergency:new', onNewEmergency);
      socket.off('emergency:hospitalNotified', onHospitalNotified);
      socket.off('location:update', onLocationUpdate);
      socket.off('location:smooth', onLocationUpdate);
      socket.off('chat:message', onChat);
      socket.off('driver:typing', onTyping);
    };
  }, [role, go]);

  const value = {
    screen, go, prevScreen,
    role, user, setUser,
    login, logout,
    trip, setTrip, refreshTrip,
    chatMessages, setChatMessages,
    driverTyping
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
