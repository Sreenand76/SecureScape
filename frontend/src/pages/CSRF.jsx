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
  const [balance, setBalance] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('form');

  /* ---------- LOAD INITIAL DATA ---------- */
  useEffect(() => {
    loadForm();
    refreshVictimData();
  }, [mode]);

  const loadForm = async () => {
    try {
      const res = await csrfAPI.getForm(mode);
      setCsrfToken(res.data?.csrfToken || '');
    } catch (e) {
      console.error(e);
    }
  };

  const refreshVictimData = async () => {
    const session = await csrfAPI.getSessionInfo(mode);
    const profile = await csrfAPI.getProfile(mode);

    setSessionId(session.data.sessionId);
    setBalance(profile.data.balance);
  };

  /* ---------- LEGIT TRANSFER ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    try {
      const payload = isSecure
        ? { ...formData, csrf_token: csrfToken }
        : formData;

      const res = await csrfAPI.transfer(payload, mode);
      setResult({ success: true, data: res.data });

      refreshVictimData();
    } catch (e) {
      setResult({
        success: false,
        error: e.response?.data?.error || 'Transfer failed',
      });
    }
  };

  /* ---------- REAL CSRF ATTACK (SIMULATED) ---------- */
  const triggerCsrfAttack = async () => {
    setResult(null);

    try {
      // In insecure mode this will hit /api/attack/csrf/transfer (GET)
      // In secure mode it will hit /api/secure/csrf/transfer (GET) which is not allowed
      await csrfAPI.transferGet('attacker', 1000, mode);

      setResult({
        success: !isSecure,
        data: {
          message: isSecure
            ? 'Secure endpoint blocked the CSRF GET request'
            : 'Insecure endpoint accepted the CSRF GET request',
        },
      });
    } catch (e) {
      setResult({
        success: false,
        error:
          'CSRF GET request was blocked (this is expected in secure mode).',
      });
    }

    // Refresh victim balance after the attack attempt
    setTimeout(() => {
      refreshVictimData();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        CSRF Attack Demonstration
        <Badge className="ml-2" color={isSecure ? 'green' : 'red'}>
          {isSecure ? 'SECURE MODE' : 'INSECURE MODE'}
        </Badge>
      </h1>

      <Alert type={isSecure ? 'success' : 'warning'}>
        {isSecure
          ? 'Server validates CSRF tokens'
          : 'No CSRF validation — vulnerable'}
      </Alert>

      {/* ---------- VICTIM STATE ---------- */}
      <DemoCard title="Victim State (Live)">
        <p><b>Session ID:</b> {sessionId}</p>
        <p className="text-xl mt-2">
         Balance: <b>₹{balance}</b>
        </p>
      </DemoCard>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-6 border-b">
        {['form', 'attack', 'explain'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ---------- LEGIT FORM ---------- */}
      {activeTab === 'form' && (
        <DemoCard title="Legitimate Transfer">
          {isSecure && (
            <Alert type="info">
              CSRF Token: <code>{csrfToken}</code>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="To"
              value={formData.to}
              onChange={(e) =>
                setFormData({ ...formData, to: e.target.value })
              }
            />
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
            <Button type="submit">Transfer</Button>
          </form>

          {result && (
            <CodeBlock
              language="json"
              code={JSON.stringify(result, null, 2)}
            />
          )}
        </DemoCard>
      )}

      {/* ---------- ATTACK ---------- */}
      {activeTab === 'attack' && (
        <DemoCard title="CSRF Attack (Malicious Site)">
          <p className="mb-2">
            Victim is logged in. Browser auto-sends cookies.
          </p>

          <Button variant="danger" onClick={triggerCsrfAttack}>
            💣 Launch CSRF Attack
          </Button>

          <Alert type={isSecure ? 'success' : 'danger'} className="mt-4">
            {isSecure
              ? 'Attack blocked ❌ — CSRF token missing'
              : 'Attack succeeded 💥 — balance reduced'}
          </Alert>
        </DemoCard>
      )}

      {/* ---------- EXPLANATION ---------- */}
      {activeTab === 'explain' && (
        <InfoPanel title="What Just Happened?" defaultOpen>
          <ol className="list-decimal list-inside space-y-2">
            <li>User logs in → session cookie created</li>
            <li>Attacker site sends request automatically</li>
            <li>Browser attaches session cookie</li>
            <li>
              {isSecure
                ? 'Server rejects request (CSRF token missing)'
                : 'Server trusts request and executes it'}
            </li>
          </ol>
        </InfoPanel>
      )}
    </div>
  );
};

export default CSRF;
