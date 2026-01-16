import React, { createContext, useContext, useState, useEffect } from 'react';

const SecurityModeContext = createContext();

export const useSecurityMode = () => {
  const context = useContext(SecurityModeContext);
  if (!context) {
    throw new Error('useSecurityMode must be used within SecurityModeProvider');
  }
  return context;
};

export const SecurityModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Load from localStorage or default to 'insecure'
    const saved = localStorage.getItem('securityMode');
    return saved === 'secure' ? 'secure' : 'insecure';
  });

  useEffect(() => {
    // Save to localStorage whenever mode changes
    localStorage.setItem('securityMode', mode);
    
    // Announce mode change for screen readers
    const announcement = document.getElementById('mode-announcement');
    if (announcement) {
      announcement.textContent = `Security mode changed to ${mode === 'secure' ? 'secure' : 'insecure'} mode`;
    }
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'insecure' ? 'secure' : 'insecure');
  };

  const value = {
    mode,
    isSecure: mode === 'secure',
    isInsecure: mode === 'insecure',
    toggleMode,
    setMode,
  };

  return (
    <SecurityModeContext.Provider value={value}>
      {children}
      <div id="mode-announcement" className="sr-only" aria-live="polite" aria-atomic="true"></div>
    </SecurityModeContext.Provider>
  );
};
