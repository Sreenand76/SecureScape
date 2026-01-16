import React, { createContext, useContext, useState, useCallback } from 'react';

const RequestLoggerContext = createContext();

export const useRequestLogger = () => {
  const context = useContext(RequestLoggerContext);
  if (!context) {
    throw new Error('useRequestLogger must be used within RequestLoggerProvider');
  }
  return context;
};

export const RequestLoggerProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [maxLogs] = useState(100); // Maximum number of logs to keep

  const addRequest = useCallback((requestData) => {
    setRequests(prev => {
      const newRequest = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        ...requestData,
      };
      // Keep only the last maxLogs requests
      const updated = [newRequest, ...prev].slice(0, maxLogs);
      return updated;
    });
  }, [maxLogs]);

  const clearLogs = useCallback(() => {
    setRequests([]);
  }, []);

  const value = {
    requests,
    addRequest,
    clearLogs,
  };

  return (
    <RequestLoggerContext.Provider value={value}>
      {children}
    </RequestLoggerContext.Provider>
  );
};
