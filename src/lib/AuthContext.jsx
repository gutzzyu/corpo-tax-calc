import React, { createContext, useState, useContext, useEffect } from 'react';


import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Set the default state to "Already Authenticated"
  const [user, setUser] = useState({ 
    name: "Sadsad Tamesis Staff", 
    role: "Admin" 
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ 
    id: "st-wizard", 
    public_settings: {} 
  });

  // 2. Dummy functions that do nothing (to prevent errors in other files)
  const checkAppState = async () => { console.log("Standalone Mode: Skipping cloud check."); };
  const logout = () => { console.log("Logout disabled in standalone mode."); };
  const navigateToLogin = () => { console.log("Login disabled in standalone mode."); };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
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
