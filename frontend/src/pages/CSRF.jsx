import React, { useState, useEffect } from 'react';
import { useSecurityMode } from '../contexts/SecurityModeContext';
import DemoCard from '../components/common/DemoCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import CodeBlock from '../components/common/CodeBlock';
import Alert from '../components/common/Alert';
import InfoPanel from '../components/common/InfoPanel';
import Badge from '../components/common/Badge';
import { csrfAPI } from '../services/api';

const CSRF = () => {
  const { mode, isSecure } = useSecurityMode();
  const [formData, setFormData] = useState({ to: '', amount: '' });
  const [csrfToken, setCsrfToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForm();
  }, [mode]);

  const loadForm = async () => {
    try {
      const response = await csrfAPI.getForm(mode);
      if (response.data.csrfToken) {
        setCsrfToken(response.data.csrfToken);
      }
    } catch (error) {
      console.error('Failed to load form:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = isSecure
        ? { ...formData, csrf_token: csrfToken }
        : formData;

      const response = await csrfAPI.transfer(payload, mode);
      setResult({ success: true, data: response.data });
      setFormData({ to: '', amount: '' });
      await loadForm();
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Transfer failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cross-Site Request Forgery (CSRF) Demo
        </h1>
        <p className="text-gray-600">
          Learn how CSRF attacks trick users into performing unwanted actions and how to prevent them.
        </p>
      </div>

      {/* Mode Alert */}
      <Alert
        type={isSecure ? 'success' : 'warning'}
        title={isSecure ? 'Secure Mode: CSRF Token Protection' : 'Insecure Mode: No CSRF Protection'}
      >
        {isSecure
          ? 'This implementation uses CSRF tokens to verify that requests originate from the legitimate site.'
          : 'This implementation has no CSRF protection, making it vulnerable to cross-site request forgery attacks.'}
      </Alert>

      {/* Explanation Panel */}
      <InfoPanel title="What is Cross-Site Request Forgery (CSRF)?" defaultOpen>
        <p className="mb-3">
          CSRF is an attack that forces authenticated users to execute unwanted actions on a web
          application.
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>User is logged into a vulnerable site</li>
          <li>User visits a malicious site</li>
          <li>Malicious site sends a request</li>
          <li>Browser attaches cookies automatically</li>
          <li>Action executes without user intent</li>
        </ol>
      </InfoPanel>

      {/* Transfer Form */}
      <DemoCard title="Money Transfer Form" badge={isSecure ? 'Secure' : 'Vulnerable'}>
        {isSecure && csrfToken && (
          <Alert type="info" title="CSRF Token">
            <div className="flex justify-between items-center">
              <code>{csrfToken}</code>
              <Badge variant="secure">Protected</Badge>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Recipient Account"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            required
          />
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          {isSecure && <input type="hidden" value={csrfToken} />}

          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Transfer Money'}
          </Button>
        </form>

        {result && (
          <Alert type={result.success ? 'success' : 'error'}>
            {result.success ? JSON.stringify(result.data, null, 2) : result.error}
          </Alert>
        )}
      </DemoCard>

      {/* ✅ UPDATED: Live Attack Simulation */}
      <DemoCard title="Attack Simulation" badge="Live Demo">
        <div className="space-y-4">
          <p className="text-gray-700">
            Click below to simulate visiting a malicious website in a new tab.
          </p>

          <Button
            variant="danger"
            onClick={() =>
              window.open(
                'http://localhost:8081',
                '_blank',
                'width=600,height=400'
              )
            }
          >
            Visit Malicious Website
          </Button>

          <Alert type="warning" title="What Happens">
            If CSRF protection is disabled, the malicious site silently triggers
            a money transfer using your active session cookies.
          </Alert>
        </div>
      </DemoCard>

      {/* Code Comparison */}
      <DemoCard title="Code Comparison" badge="Implementation">
        <CodeBlock
          language="javascript"
          code={`// Insecure
POST /transfer
(no CSRF validation)

// Secure
POST /transfer
(validate CSRF token)`}
        />
      </DemoCard>
    </div>
  );
};

export default CSRF;
