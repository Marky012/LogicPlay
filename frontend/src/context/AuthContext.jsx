import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole     = localStorage.getItem('role') || 'student';
    const storedId       = localStorage.getItem('userId');
    if (storedUsername) {
      setUser({
        username: storedUsername,
        role: storedRole,
        id: storedId ? parseInt(storedId, 10) : null,
      });
    }
    setLoading(false);
  }, []);

  // Student login (username only)
  const login = (username) => {
    localStorage.setItem('username', username);
    localStorage.setItem('role', 'student');
    localStorage.removeItem('userId');
    setUser({ username, role: 'student', id: null });
  };

  // Teacher login (username + id from server response)
  const loginTeacher = (username, id) => {
    localStorage.setItem('username', username);
    localStorage.setItem('role', 'teacher');
    localStorage.setItem('userId', String(id));
    setUser({ username, role: 'teacher', id });
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <AuthContext.Provider value={{ user, login, loginTeacher, logout, loading, isTeacher }}>
      {children}
    </AuthContext.Provider>
  );
};
