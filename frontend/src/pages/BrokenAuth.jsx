import React, { useEffect, useState } from 'react';
import { useSecurityMode } from '../contexts/SecurityModeContext';
import DemoCard from '../components/common/DemoCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import CodeBlock from '../components/common/CodeBlock';
import InfoPanel from '../components/common/InfoPanel';
import Badge from '../components/common/Badge';
import { authAPI } from '../services/api';

const BrokenAuth = () => {
  const { mode, isSecure } = useSecurityMode();

  const [loginForm, setLoginForm] = useState({ username: 'user1', password: 'password123' });
  const [loginResult, setLoginResult] = useState(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [whoami, setWhoami] = useState(null);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [stepEntered, setStepEntered] = useState(false);
  const [brute, setBrute] = useState({
    running: false,
    unlocked: false,
    candidates: 'admin\nuser1\njohn\nalice\nbob\ntest\nguest\nroot',
    attemptPassword: 'wrongpass',
    found: [],
    selectedUsername: '',
    passwordList: 'admin123\npassword123\njohn123\n123456\nqwerty',
    pwRunning: false,
    pwResult: null,
    log: [],
    current: '',
    stop: false,
    pwLog: [],
    currentPassword: '',
    pwStop: false,
  });

  const refresh = async () => {
    try {
      const res = await authAPI.whoami(mode);
      setWhoami(res.data);
    } catch (e) {
      setWhoami({ error: e.message });
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    setStepEntered(false);
    const t = setTimeout(() => setStepEntered(true), 10);
    return () => clearTimeout(t);
  }, [step]);

  const doLogin = async (e) => {
    e.preventDefault();
    setLoginAttempted(true);
    setLoginResult(null);
    try {
      const res = await authAPI.login(loginForm, mode);
      setLoginResult(res.data);
      refresh();
    } catch (e2) {
      setLoginResult({ error: e2.response?.data || e2.message });
    }
  };

  const doLogout = async () => {
    setResult(null);
    setLoginResult(null);
    setLoginAttempted(false);
    try {
      const res = await authAPI.logout(mode);
      setResult(res.data);
      refresh();
    } catch (e) {
      setResult({ error: e.response?.data || e.message });
    }
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const pushBruteLog = (line) => {
    setBrute((b) => ({ ...b, log: [...b.log, `[${new Date().toLocaleTimeString()}] ${line}`] }));
  };

  const pushPwLog = (line) => {
    setBrute((b) => ({
      ...b,
      pwLog: [...b.pwLog, `[${new Date().toLocaleTimeString()}] ${line}`],
    }));
  };

  const buildPasswordSuggestions = (username) => {
    const u = (username || '').trim();
    if (!u) return [];
    const base = u.toLowerCase();
    const cap = base.charAt(0).toUpperCase() + base.slice(1);
    return [
      `${base}123`,
      `${base}@123`,
      `${base}2026`,
      `${base}#1`,
      `${cap}123`,
      `${cap}@123`,
      `${base}12345`,
      `${base}password`,
      // common defaults in this project/demo
      'admin123',
      'password123',
      'john123',
      '123456',
      'qwerty',
    ].filter(Boolean);
  };

  const addSuggestionsToWordlist = () => {
    const suggestions = buildPasswordSuggestions(brute.selectedUsername);
    setBrute((b) => {
      const existing = new Set(
        (b.passwordList || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      );
      for (const s of suggestions) existing.add(s);
      return { ...b, passwordList: Array.from(existing).join('\n') };
    });
  };

  const runUsernameBruteforce = async () => {
    const names = brute.candidates
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // avoid stale "Login successful" from previous attempts
    setLoginResult(null);
    setLoginAttempted(false);

    setBrute((b) => ({
      ...b,
      running: true,
      found: [],
      unlocked: false,
      selectedUsername: '',
      pwResult: null,
      log: [],
      current: '',
      stop: false,
    }));

    setStep(1);
    setLoginForm((f) => ({ ...f, password: brute.attemptPassword || f.password }));
    pushBruteLog(
      isSecure
        ? 'Running in SECURE mode (expect generic errors / possible lockout).'
        : 'Starting username enumeration...'
    );

    const found = [];
    for (const username of names) {
      // stop requested
      // eslint-disable-next-line no-loop-func
      let shouldStop = false;
      setBrute((b) => {
        shouldStop = b.stop;
        return b;
      });
      if (shouldStop) {
        pushBruteLog('🛑 Stopped by user.');
        break;
      }

      setBrute((b) => ({ ...b, current: username }));
      setLoginForm((f) => ({ ...f, username }));
      pushBruteLog(`Trying username "${username}"...`);

      try {
        const res = await authAPI.login(
          { username, password: brute.attemptPassword },
          mode
        );
        const err = res.data?.error || '';
        const ok = res.data?.success === true;

        // Existence heuristic:
        // - In insecure mode, error differences allow enumeration ("User not found" vs "Wrong password").
        // - In secure mode, errors should be generic, so we MUST NOT "unlock" based on message changes.
        const exists = !isSecure && (ok || (typeof err === 'string' && err !== 'User not found'));
        found.push({
          username,
          result: ok ? 'SUCCESS (password guessed)' : err || 'Unknown response',
          exists,
        });

        if (isSecure) {
          pushBruteLog(`🛡️ Generic response (expected): "${err || 'Invalid credentials'}"`);
        } else if (exists) {
          pushBruteLog(
            ok
              ? `FOUND (password guessed) for "${username}"`
              : `FOUND valid username "${username}" (error changed from "User not found")`
          );
        } else {
          pushBruteLog(`Not found: "${username}"`);
        }

        setBrute((b) => ({
          ...b,
          found: [...found],
          unlocked: found.some((x) => x.exists),
          selectedUsername: b.selectedUsername || (exists ? username : ''),
        }));

        // small delay so UI updates clearly during demos
        // eslint-disable-next-line no-await-in-loop
        await sleep(150);
      } catch (e) {
        found.push({
          username,
          result: e.response?.data?.error || e.message,
          exists: false,
        });
        setBrute((b) => ({ ...b, found: [...found] }));
        pushBruteLog(
          `⚠️ Error for "${username}": ${e.response?.status || ''} ${e.response?.data?.error || e.message}`
        );
      }
    }

    setBrute((b) => ({ ...b, running: false, current: '' }));
  };

  const runPasswordBruteforce = async () => {
    if (!brute.selectedUsername) {
      setResult({ error: 'Enter a target username first.' });
      return;
    }
    if (!isSecure && !brute.unlocked) {
      setResult({ error: 'Unlock first by finding a valid username (Step 1).' });
      return;
    }

    const pwds = brute.passwordList
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setBrute((b) => ({
      ...b,
      pwRunning: true,
      pwResult: null,
      pwLog: [],
      currentPassword: '',
      pwStop: false,
    }));

    // Animate in the victim login box too
    setStep(2);
    setLoginForm((f) => ({ ...f, username: brute.selectedUsername }));
    pushPwLog(
      `${isSecure ? '🛡️' : '🚨'} Starting password brute-force for "${brute.selectedUsername}"...`
    );

    for (const password of pwds) {
      // stop requested
      // eslint-disable-next-line no-loop-func
      let shouldStop = false;
      setBrute((b) => {
        shouldStop = b.pwStop;
        return b;
      });
      if (shouldStop) {
        pushPwLog('🛑 Stopped by user.');
        break;
      }

      setBrute((b) => ({ ...b, currentPassword: password }));
      setLoginForm((f) => ({ ...f, username: brute.selectedUsername, password }));
      pushPwLog(`Trying password "${password}"...`);
      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await authAPI.login(
          { username: brute.selectedUsername, password },
          mode
        );
        if (res.data?.success) {
          pushPwLog(`✅ SUCCESS! Password found: "${password}"`);
          setBrute((b) => ({
            ...b,
            pwRunning: false,
            currentPassword: '',
            pwResult: {
              success: true,
              username: brute.selectedUsername,
              password,
              response: res.data,
            },
          }));
          refresh();
          return;
        }
        pushPwLog('❌ Incorrect password');
      } catch (e) {
        pushPwLog(
          `⚠️ Error: ${e.response?.status || ''} ${e.response?.data?.error || e.message}`
        );
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(150);
    }

    setBrute((b) => ({
      ...b,
      pwRunning: false,
      currentPassword: '',
      pwResult: { success: false, message: 'No passwords matched.' },
    }));
  };

  const lastResult = result ?? loginResult;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white p-6 shadow-sm">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Broken Authentication</h1>
            <div className="mt-1 text-sm text-slate-600">
              Interactive demo for username enumeration and password brute-force.
            </div>
          </div>
          <Badge className="w-fit" color={isSecure ? 'green' : 'red'}>
            {isSecure ? 'SECURE MODE' : 'INSECURE MODE'}
          </Badge>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[
            { n: 1, title: 'Username enumeration', desc: 'Probe usernames and observe responses.' },
            { n: 2, title: 'Password brute-force', desc: 'Try a wordlist against a known username.' },
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`group text-left rounded-xl border p-4 transition-all duration-200 ${
                step === s.n
                  ? 'border-blue-500 bg-white shadow-sm'
                  : 'border-slate-200 bg-white/70 hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">STEP {s.n}</div>
                  <div className="mt-1 font-semibold text-slate-900">{s.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{s.desc}</div>
                </div>
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full transition-colors ${
                    step === s.n ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-slate-400'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>

        {/* "Pages" */}
        <div
          className={`rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-all duration-300 ${
            stepEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          key={step}
        >
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DemoCard title="Attacker: enumerate usernames ">
                  <div className="mt-4 space-y-4">
                   
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Candidate usernames (one per line)
                      </label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        value={brute.candidates}
                        onChange={(e) =>
                          setBrute((b) => ({ ...b, candidates: e.target.value }))
                        }
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        onClick={runUsernameBruteforce}
                        disabled={brute.running}
                      >
                        {brute.running ? 'Enumerating…' : 'Start'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setBrute((b) => ({ ...b, stop: true }))}
                        disabled={!brute.running}
                      >
                        Stop
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setBrute((b) => ({
                            ...b,
                            found: [],
                            unlocked: false,
                            selectedUsername: '',
                            pwResult: null,
                            log: [],
                            current: '',
                            stop: false,
                          }))
                        }
                        disabled={brute.running || brute.pwRunning}
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold">Unlock status</div>
                        <Badge color={brute.unlocked ? 'green' : 'red'}>
                          {brute.unlocked ? 'UNLOCKED' : isSecure ? 'LOCKED (EXPECTED)' : 'LOCKED'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {brute.unlocked
                          ? `Valid username detected: ${brute.selectedUsername}`
                          : isSecure
                            ? 'Secure mode: responses stay generic, so enumeration should not unlock.'
                            : 'Still only seeing “User not found”…'}
                      </div>
                      {brute.running && brute.current && (
                        <div className="mt-2 text-sm">
                          Testing: <code className="font-mono">{brute.current}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </DemoCard>

                <DemoCard title="Live log">
                  <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-black p-3 text-xs text-gray-100 font-mono">
                    {(brute.log.length ? brute.log : ['[waiting] Click Start…']).map(
                      (line, idx) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={idx}>{line}</div>
                      )
                    )}
                  </div>
                </DemoCard>
              </div>

              <DemoCard title="Victim login">
                <form onSubmit={doLogin} className="space-y-4">
                  <Input
                    label="Username"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">Login</Button>
                  </div>
                </form>

                {loginAttempted && loginResult && (
                  <div className="mt-4">
                    <CodeBlock language="json" code={JSON.stringify(loginResult, null, 2)} />
                  </div>
                )}
              </DemoCard>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!isSecure && !brute.unlocked}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemoCard title="Attacker: password brute-force (slow)">
                <div className="mt-4 space-y-4">
                  <Input
                    label="Target username"
                    value={brute.selectedUsername}
                    onChange={(e) =>
                      setBrute((b) => ({ ...b, selectedUsername: e.target.value }))
                    }
                  />
                  {!isSecure && brute.selectedUsername && (
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-sm">Password guess suggestions</div>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={addSuggestionsToWordlist}
                          disabled={brute.pwRunning}
                        >
                          Add to wordlist
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {buildPasswordSuggestions(brute.selectedUsername)
                          .slice(0, 10)
                          .map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() =>
                                setBrute((b) => ({
                                  ...b,
                                  passwordList: `${p}\n${b.passwordList || ''}`.trim(),
                                }))
                              }
                              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-mono transition hover:bg-gray-50 hover:shadow-sm"
                            >
                              {p}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password list (one per line)
                    </label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                      value={brute.passwordList}
                      onChange={(e) =>
                        setBrute((b) => ({ ...b, passwordList: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="danger"
                      onClick={runPasswordBruteforce}
                      disabled={brute.pwRunning || (!isSecure && !brute.unlocked)}
                    >
                      {brute.pwRunning ? 'Trying…' : 'Start'}
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setBrute((b) => ({ ...b, pwStop: true }))}
                      disabled={!brute.pwRunning}
                    >
                      Stop
                    </Button>
                  </div>
                  {brute.pwRunning && brute.currentPassword && (
                    <div className="text-sm text-gray-700">
                      Trying: <code className="font-mono">{brute.currentPassword}</code>
                    </div>
                  )}
                  {brute.pwResult && (
                    <CodeBlock language="json" code={JSON.stringify(brute.pwResult, null, 2)} />
                  )}
                </div>
              </DemoCard>

              <DemoCard title="Live password log">
                  <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-black p-3 text-xs text-gray-100 font-mono">
                  {(brute.pwLog.length ? brute.pwLog : ['[waiting] Click Start…']).map(
                    (line, idx) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={idx}>{line}</div>
                    )
                  )}
                </div>
              </DemoCard>

              <div className="space-y-6">
                <DemoCard title="Victim login">
                  <form onSubmit={doLogin} className="space-y-4">
                    <Input
                      label="Username"
                      value={loginForm.username}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, username: e.target.value })
                      }
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit">Login</Button>
                    </div>
                  </form>

                  {loginResult?.success === true && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                      <div className="font-semibold">Login successful</div>
                      <div className="text-green-700/90">
                        Session should now reflect the logged-in user.
                      </div>
                    </div>
                  )}

                    {loginAttempted && loginResult && (
                    <div className="mt-4">
                      <CodeBlock language="json" code={JSON.stringify(loginResult, null, 2)} />
                    </div>
                  )}
                </DemoCard>

                <DemoCard title="Session (Who am I?)">
                  <div className="flex gap-3 mb-4">
                    <Button onClick={refresh}>Refresh</Button>
                    <Button variant="secondary" onClick={doLogout}>
                      Logout
                    </Button>
                  </div>
                  <CodeBlock language="json" code={JSON.stringify(whoami, null, 2)} />
                </DemoCard>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <div />
            </div>
          </div>
        )}
      </div>

      {lastResult && (
        <DemoCard title="Last Result">
          <CodeBlock language="json" code={JSON.stringify(lastResult, null, 2)} />
        </DemoCard>
      )}

      <InfoPanel title="What to try" defaultOpen>
        <ul className="list-disc list-inside space-y-2">
          <li>
            In insecure mode, try wrong usernames vs wrong passwords — you should see different errors (enumeration).
          </li>
          <li>
            In secure mode, try multiple failed logins — you should eventually get a temporary lockout.
          </li>
          <li>
            In insecure mode, change any user’s password without knowing their old password.
          </li>
        </ul>
      </InfoPanel>
      </div>
    </div>
  );
};

export default BrokenAuth;

