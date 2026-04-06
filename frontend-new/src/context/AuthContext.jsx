// src/context/AuthContext.jsx — Global auth state
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('voyager_token');
    const saved = localStorage.getItem('voyager_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      // Optionally verify with /me
      authApi.me()
        .then(res => { setUser(res.data); localStorage.setItem('voyager_user', JSON.stringify(res.data)); })
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, user: u } = res.data;
    localStorage.setItem('voyager_token', access_token);
    localStorage.setItem('voyager_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (email, password, first_name, last_name) => {
    const res = await authApi.register({ email, password, first_name, last_name });
    const { access_token, user: u } = res.data;
    localStorage.setItem('voyager_token', access_token);
    localStorage.setItem('voyager_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('voyager_token');
    localStorage.removeItem('voyager_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
