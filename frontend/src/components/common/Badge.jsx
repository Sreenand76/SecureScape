import React from 'react';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const Badge = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const { mode } = useSecurityMode();
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    insecure: 'bg-red-100 text-red-800',
    secure: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  // If variant is 'mode', use current security mode
  const badgeVariant = variant === 'mode' 
    ? (mode === 'secure' ? 'secure' : 'insecure')
    : variant;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[badgeVariant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
