import React, { useEffect, useState, useRef } from 'react';
import { useSecurityMode } from '../../contexts/SecurityModeContext';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';

const ModeTransition = () => {
  const { mode, isSecure } = useSecurityMode();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevModeRef = useRef(mode);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevModeRef.current = mode;
      return;
    }

    // Only animate when mode actually changes
    if (prevModeRef.current !== mode) {
      setIsAnimating(true);
      prevModeRef.current = mode;
      
      // Animation duration - ensure it clears
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // 1.5 seconds animation

      return () => {
        clearTimeout(timer);
        setIsAnimating(false);
      };
    }
  }, [mode]);

  if (!isAnimating) return null;

  const bgColor = isSecure 
    ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700' 
    : 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700';
  
  const textColor = 'text-white';
  const Icon = isSecure ? FiShield : FiAlertTriangle;
  const modeText = isSecure ? 'SECURE MODE' : 'INSECURE MODE';
  const subtitle = isSecure 
    ? 'Protected & Mitigated' 
    : 'Vulnerable & Exposed';

  return (
    <div
      className={`
        fixed inset-0 z-[9999] 
        ${bgColor}
        flex items-center justify-center
      `}
      style={{
        animation: 'fadeInOut 1.5s ease-in-out forwards',
      }}
      onAnimationEnd={() => {
        // Ensure it clears after animation
        setTimeout(() => setIsAnimating(false), 100);
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute rounded-full opacity-20
              bg-white
              animate-float
            `}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Icon with pulse animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Outer glow rings */}
            <div
              className={`
                absolute inset-0 rounded-full
                ${isSecure ? 'bg-green-400' : 'bg-red-400'}
                animate-ping opacity-75
              `}
              style={{ animationDuration: '2s' }}
            />
            <div
              className={`
                absolute inset-0 rounded-full
                ${isSecure ? 'bg-green-300' : 'bg-red-300'}
                animate-pulse opacity-50
              `}
              style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}
            />
            
            {/* Icon container */}
            <div
              className={`
                relative w-32 h-32 rounded-full
                ${isSecure ? 'bg-green-400/30' : 'bg-red-400/30'}
                backdrop-blur-sm border-4 border-white/50
                flex items-center justify-center
                animate-scaleIn
              `}
            >
              <Icon className={`w-16 h-16 ${textColor} animate-bounce`} />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h1
          className={`
            text-6xl md:text-8xl font-black mb-4
            ${textColor}
            animate-slideUp
            drop-shadow-2xl
          `}
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          {modeText}
        </h1>
        
        <p
          className={`
            text-2xl md:text-3xl font-light
            ${textColor} opacity-90
            animate-slideUp
            mb-8
          `}
          style={{ 
            animationDelay: '0.2s',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          {subtitle}
        </p>

        {/* Progress bar */}
        <div className="w-64 md:w-96 mx-auto h-1 bg-white/30 rounded-full overflow-hidden">
          <div
            className={`
              h-full ${isSecure ? 'bg-green-200' : 'bg-red-200'}
              animate-progressBar
            `}
            style={{ animationDuration: '1.5s' }}
          />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );
};

export default ModeTransition;
