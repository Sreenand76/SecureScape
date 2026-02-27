import React, { useState, useEffect } from 'react';
import { useSecurityMode } from '../contexts/SecurityModeContext';
import DemoCard from '../components/common/DemoCard';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import CodeBlock from '../components/common/CodeBlock';
import Alert from '../components/common/Alert';
import InfoPanel from '../components/common/InfoPanel';
import Badge from '../components/common/Badge';
import { xssAPI } from '../services/api';

const XSS = () => {
  const { mode, isSecure } = useSecurityMode();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadComments();
  }, [mode]);
  
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
      setComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
          <li><strong>Stored XSS:</strong> Malicious script is stored in the database</li>
          <li><strong>Reflected XSS:</strong> Malicious script is reflected in the response</li>
          <li><strong>DOM-based XSS:</strong> Vulnerability exists in client-side code</li>
        </ul>
        <p>
          <strong>Example attack payload:</strong> <code className="bg-gray-200 px-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
        </p>
      </InfoPanel>
      
      {/* Comment Form */}
      <DemoCard 
        title="Add a Comment" 
        badge={isSecure ? 'Secure' : 'Vulnerable'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Your Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment here..."
            rows={4}
            required
          />
          <div className="text-sm text-gray-500">
            Try entering: <code className="bg-gray-100 px-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </DemoCard>
      
      {/* Comments Display */}
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
