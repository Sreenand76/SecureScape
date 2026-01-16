import React, { useState } from 'react';
import { useSecurityMode } from '../contexts/SecurityModeContext';
import DemoCard from '../components/common/DemoCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import CodeBlock from '../components/common/CodeBlock';
import Alert from '../components/common/Alert';
import InfoPanel from '../components/common/InfoPanel';
import Badge from '../components/common/Badge';
import { sqlAPI } from '../services/api';

const SQLInjection = () => {
  const { mode, isSecure } = useSecurityMode();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const [loginResult, setLoginResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  // ✅ Separate loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginResult(null);

    try {
      const response = await sqlAPI.login(loginForm, mode);
      setLoginResult({
        success: response.data.success,
        data: response.data
      });
    } catch (error) {
      setLoginResult({
        success: false,
        error: error.response?.data?.error || 'Login failed'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  /* ---------------- SEARCH ---------------- */
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchResults(null);

    try {
      const response = await sqlAPI.search(searchQuery, mode);
      setSearchResults({
        success: true,
        data: response.data
      });
    } catch (error) {
      setSearchResults({
        success: false,
        error: error.response?.data?.error || 'Search failed'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  /* ---------------- SQL PREVIEW ---------------- */
  const generateSQLQuery = (type) => {
    if (type === 'login') {
      return isSecure
        ? `SELECT * FROM users WHERE username=? AND password=?`
        : `SELECT * FROM users WHERE username='${loginForm.username}' AND password='${loginForm.password}'`;
    }

    return isSecure
      ? `SELECT * FROM products WHERE name LIKE ?`
      : `SELECT * FROM products WHERE name LIKE '%${searchQuery}%'`;
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SQL Injection Demo
        </h1>
        <p className="text-gray-600">
          Learn how SQL injection attacks work and how to prevent them using parameterized queries.
        </p>
      </div>

      {/* MODE ALERT */}
      <Alert
        type={isSecure ? 'success' : 'warning'}
        title={isSecure ? 'Secure Mode: Parameterized Queries' : 'Insecure Mode: String Concatenation'}
      >
        {isSecure
          ? 'This implementation uses prepared statements to prevent SQL Injection.'
          : 'This implementation is vulnerable to SQL Injection due to string concatenation.'}
      </Alert>

      {/* INFO PANEL */}
      <InfoPanel title="What is SQL Injection?" defaultOpen={true}>
        <p className="mb-3">
          SQL Injection is a code injection technique that exploits insecure query construction.
        </p>
        <p className="mb-3">
          Attackers manipulate SQL queries by injecting malicious input.
        </p>
        <p>
          <strong>Example:</strong>{' '}
          <code className="bg-gray-200 px-1 rounded">
            admin' OR '1'='1
          </code>
        </p>
      </InfoPanel>

      {/* LOGIN DEMO */}
      <DemoCard title="Login Form" badge={isSecure ? 'Secure' : 'Vulnerable'}>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm({ ...loginForm, username: e.target.value })
            }
            required
          />
          <Input
            label="Password"
            type="password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            required
          />
          <Button type="submit" disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2">Generated SQL Query</h4>
          <CodeBlock code={generateSQLQuery('login')} language="sql" />
        </div>

        {loginResult && (
          <div className="mt-4">
            <Alert
              type={loginResult.success ? 'success' : 'error'}
              title={loginResult.success ? 'Login Successful' : 'Login Failed'}
            >
              <pre className="text-xs mt-2 overflow-x-auto">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </Alert>
          </div>
        )}
      </DemoCard>

      {/* SEARCH DEMO */}
      <DemoCard title="Product Search" badge={isSecure ? 'Secure' : 'Vulnerable'}>
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            label="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2">Generated SQL Query</h4>
          <CodeBlock code={generateSQLQuery('search')} language="sql" />
        </div>

        {searchResults && (
          <div className="mt-4">
            <Alert
              type={searchResults.success ? 'success' : 'error'}
              title={searchResults.success ? 'Search Results' : 'Search Failed'}
            >
              <pre className="text-xs mt-2 overflow-x-auto">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </Alert>
          </div>
        )}
      </DemoCard>

      {/* BEST PRACTICES */}
      <DemoCard title="Secure Implementation" badge="Best Practices">
        <CodeBlock
          language="javascript"
          code={`// Parameterized Query Example
const query = "SELECT * FROM users WHERE username=? AND password=?";
db.query(query, [username, password], (err, results) => {
  // Safe from SQL Injection
});`}
        />
      </DemoCard>

    </div>
  );
};

export default SQLInjection;
