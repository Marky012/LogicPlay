import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role') || 'student';
    const storedId = localStorage.getItem('userId');
    if (storedUsername) {
      setUser({
        username: storedUsername,
        role: storedRole,
        id: storedId ? parseInt(storedId, 10) : null,
      });
    }
    setLoading(false);
  }, []);

  // Ensure device token exists
  useEffect(() => {
    let token = localStorage.getItem('deviceToken');
    if (!token) {
      token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('deviceToken', token);
    }
  }, []);

  const getDeviceToken = () => localStorage.getItem('deviceToken');

  // Unified login
  const loginUnified = (username, role, id) => {
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    if (id) localStorage.setItem('userId', String(id));
    setUser({ username, role, id });
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    //Intentionally keep the deviceToken to recognize the device for future logins
    setUser(null);
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <AuthContext.Provider value={{ user, loginUnified, getDeviceToken, logout, loading, isTeacher }}>
      {children}
    </AuthContext.Provider>
  );
};
