import React from 'react';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const { mode } = useSecurityMode();
  
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: mode === 'secure' 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: mode === 'secure'
      ? 'border-2 border-green-600 text-green-600 hover:bg-green-50'
      : 'border-2 border-red-600 text-red-600 hover:bg-red-50',
    ghost: 'hover:bg-gray-100 text-gray-700',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
