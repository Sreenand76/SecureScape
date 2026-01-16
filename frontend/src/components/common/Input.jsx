import React from 'react';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  error,
  required = false,
  className = '',
  ...props 
}) => {
  const { mode } = useSecurityMode();
  
  const inputId = `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'input'}`;
  
  const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus-ring';
  const modeClasses = mode === 'secure' 
    ? 'border-gray-300 focus:border-green-500 focus:ring-green-500' 
    : 'border-gray-300 focus:border-red-500 focus:ring-red-500';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseClasses} ${modeClasses} ${errorClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
