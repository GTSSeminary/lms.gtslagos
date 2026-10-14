import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('lms_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const data = await api.get('/api/auth/me');
      // Normalize so both snake_case and camelCase name fields are present
      // regardless of which endpoint produced the payload.
      const normalized = {
        ...data,
        full_name: data.full_name ?? data.fullName,
        fullName: data.fullName ?? data.full_name,
      };
      setUser(normalized);
      return normalized;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password }, { auth: false });
    localStorage.setItem('lms_token', data.token);
    setToken(data.token);
    // Load the authoritative profile from /me (it carries full_name, matric_no,
    // status) instead of relying on the login payload's shape.
    const user = await loadUser();
    return user;
  }

  function logout() {
    localStorage.removeItem('lms_token');
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    role: user?.role || null,
    login,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
