import React from 'react';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  error,
  required = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  const { mode } = useSecurityMode();
  
  const textareaId = `textarea-${label?.toLowerCase().replace(/\s+/g, '-') || 'textarea'}`;
  
  const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus-ring resize-y';
  const modeClasses = mode === 'secure' 
    ? 'border-gray-300 focus:border-green-500 focus:ring-green-500' 
    : 'border-gray-300 focus:border-red-500 focus:ring-red-500';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${baseClasses} ${modeClasses} ${errorClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
