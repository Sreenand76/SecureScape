import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const CodeBlock = ({ 
  code, 
  language = 'javascript', 
  title,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg text-sm font-medium">
          {title}
        </div>
      )}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        <pre className="p-4 overflow-x-auto">
          <code className={`text-sm text-gray-100 font-mono`}>
            {code}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors focus-ring"
          aria-label="Copy code"
          title="Copy code"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeBlock;
