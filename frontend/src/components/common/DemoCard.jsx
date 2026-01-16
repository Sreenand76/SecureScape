import React from 'react';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const DemoCard = ({ 
  title, 
  children, 
  badge,
  className = '',
  ...props 
}) => {
  const { mode } = useSecurityMode();
  
  const borderColor = mode === 'secure' ? 'border-green-500' : 'border-red-500';
  const bgTint = mode === 'secure' ? 'bg-green-50' : 'bg-red-50';
  
  return (
    <div 
      className={`bg-white border-l-4 ${borderColor} ${bgTint} rounded-lg shadow-sm p-6 ${className}`}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              mode === 'secure' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
};

export default DemoCard;
