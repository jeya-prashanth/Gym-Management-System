import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [role, setRole] = useState(null);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    if (userRole === 'gym') {
      setGym(userData);
    }
  };

  const logout = () => {
    setUser(null);
    setGym(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, gym, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
