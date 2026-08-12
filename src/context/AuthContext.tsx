import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, School, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  school: School | null;
  token: string | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  updateSchoolInfo: (data: Partial<School>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('edumanage_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize user from stored token or default to School Admin demo user
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const res = await api.getMe();
          setUser(res.user);
          setSchool(res.school);
        } else {
          // Auto log in as School Admin for instant app viewing!
          await login('admin@gia.edu.gm', 'SCHOOL_ADMIN');
        }
      } catch (err) {
        console.warn('Auto auth failed, fallback to demo login:', err);
        try {
          await login('admin@gia.edu.gm', 'SCHOOL_ADMIN');
        } catch (e) {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, role?: UserRole) => {
    setLoading(true);
    try {
      const res = await api.login(email, role);
      localStorage.setItem('edumanage_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSchool(res.school);
    } finally {
      setLoading(false);
    }
  };

  const quickSwitchRole = async (role: UserRole) => {
    let targetEmail = 'admin@gia.edu.gm';
    if (role === 'SUPER_ADMIN') targetEmail = 'superadmin@edumanage.com';
    else if (role === 'PRINCIPAL') targetEmail = 'principal@gia.edu.gm';
    else if (role === 'TEACHER') targetEmail = 'teacher.fatou@gia.edu.gm';
    else if (role === 'ACCOUNTANT') targetEmail = 'accountant.ousman@gia.edu.gm';
    else if (role === 'RECEPTIONIST') targetEmail = 'receptionist.mariama@gia.edu.gm';
    else if (role === 'PARENT') targetEmail = 'parent.touray@gia.edu.gm';
    else if (role === 'STUDENT') targetEmail = 'student.lamin@gia.edu.gm';

    await login(targetEmail, role);
  };

  const logout = () => {
    localStorage.removeItem('edumanage_token');
    setToken(null);
    setUser(null);
    setSchool(null);
  };

  const updateSchoolInfo = async (data: Partial<School>) => {
    if (!school) return;
    const updated = await api.updateSchool(school.id, data);
    setSchool(updated);
  };

  return (
    <AuthContext.Provider value={{ user, school, token, loading, login, logout, quickSwitchRole, updateSchoolInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
