'use client';

import Iridescence from './Iridescence';

export default function BackgroundWrapper({ 
  children, 
  color = [0.5, 0.7, 1.0], 
  speed = 0.5,
  amplitude = 0.2,
  mouseReact = true,
  className = ''
}) {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <Iridescence 
          color={color}
          speed={speed}
          amplitude={amplitude}
          mouseReact={mouseReact}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
