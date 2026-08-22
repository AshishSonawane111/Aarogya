import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [personas, setPersonas] = useState({ patients: [], doctors: [] });
  const [loading, setLoading] = useState(true);

  // Load available demo personas
  const loadPersonas = async () => {
    try {
      const res = await authAPI.getPersonas();
      setPersonas(res.data);
    } catch (err) {
      console.error('Failed to load personas', err);
    }
  };

  // Check existing session on boot
  useEffect(() => {
    const initAuth = async () => {
      await loadPersonas();
      const token = localStorage.getItem('hp_auth_token');
      const demoUserId = localStorage.getItem('hp_demo_user_id');

      if (token || demoUserId) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          setProfile(res.data.profile);
        } catch (err) {
          console.warn('Session expired, falling back to demo state');
          localStorage.removeItem('hp_auth_token');
          // Auto login as default demo patient (Rajesh Kumar) for smooth first impression
          switchPersona('1a000000-0000-0000-0000-000000000001');
        }
      } else {
        // Auto initialize default demo patient for instant exploration
        switchPersona('1a000000-0000-0000-0000-000000000001');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Quick switch persona (1-click test between any patient or doctor)
  const switchPersona = async (userId) => {
    setLoading(true);
    try {
      const res = await authAPI.demoLogin(userId);
      localStorage.setItem('hp_auth_token', res.data.token);
      localStorage.setItem('hp_demo_user_id', res.data.user.id);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Demo switch error:', err);
      setLoading(false);
      throw err;
    }
  };

  // Standard Login
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      localStorage.setItem('hp_auth_token', res.data.token);
      localStorage.setItem('hp_demo_user_id', res.data.user.id);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('hp_auth_token');
    localStorage.removeItem('hp_demo_user_id');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        personas,
        loading,
        login,
        logout,
        switchPersona,
        isPatient: user?.role === 'patient',
        isDoctor: user?.role === 'doctor'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
