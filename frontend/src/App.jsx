import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SecurityModeProvider } from './contexts/SecurityModeContext';
import { RequestLoggerProvider, useRequestLogger } from './contexts/RequestLoggerContext';
import { setRequestLogger } from './services/api';
import Layout from './components/layout/Layout';
import ModeTransition from './components/common/ModeTransition';
import Dashboard from './pages/Dashboard';
import SQLInjection from './pages/SQLInjection';
import XSS from './pages/XSS';
import CSRF from './pages/CSRF';

// Component to initialize request logger
const RequestLoggerInitializer = () => {
  const { addRequest } = useRequestLogger();
  
  useEffect(() => {
    setRequestLogger(addRequest);
  }, [addRequest]);
  
  return null;
};

function App() {
  return (
    <SecurityModeProvider>
      <RequestLoggerProvider>
        <RequestLoggerInitializer />
        <ModeTransition />
        <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Layout showSidebar={false}>
                <Dashboard />
              </Layout>
            } 
          />
          <Route 
            path="/sql-injection" 
            element={
              <Layout>
                <SQLInjection />
              </Layout>
            } 
          />
          <Route 
            path="/xss" 
            element={
              <Layout>
                <XSS />
              </Layout>
            } 
          />
          <Route 
            path="/csrf" 
            element={
              <Layout>
                <CSRF />
              </Layout>
            } 
          />
        </Routes>
        </Router>
      </RequestLoggerProvider>
    </SecurityModeProvider>
  );
}

export default App;
