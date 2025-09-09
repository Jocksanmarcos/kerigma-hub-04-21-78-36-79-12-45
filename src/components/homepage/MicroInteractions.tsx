import React from "react";

// Micro-interaction components for enhanced UX

export const HoverScale: React.FC<{ 
  children: React.ReactNode; 
  scale?: number;
  className?: string;
}> = ({ children, scale = 1.05, className = '' }) => (
  <div 
    className={`transition-transform duration-300 ease-out hover:scale-[${scale}] ${className}`}
    style={{ '--hover-scale': scale } as React.CSSProperties}
  >
    {children}
  </div>
);

export const FloatingButton: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`
    transform transition-all duration-300 ease-out
    hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25
    active:translate-y-0 active:scale-95
    ${className}
  `}>
    {children}
  </div>
);

export const ShimmerEffect: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    {children}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

export const PulseGlow: React.FC<{ 
  children: React.ReactNode;
  color?: string;
  className?: string;
}> = ({ children, color = 'primary', className = '' }) => (
  <div className={`
    relative animate-[pulse_2s_ease-in-out_infinite]
    before:absolute before:inset-0 before:rounded-full 
    before:bg-${color}/20 before:animate-ping before:duration-1000
    ${className}
  `}>
    {children}
  </div>
);

export const GlassCard: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`
    backdrop-blur-md bg-white/10 border border-white/20
    rounded-xl shadow-lg transition-all duration-300
    hover:bg-white/15 hover:border-white/30 hover:shadow-xl
    ${className}
  `}>
    {children}
  </div>
);

export const StaggeredFadeIn: React.FC<{ 
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}> = ({ children, delay = 100, className = '' }) => (
  <div className={className}>
    {React.Children.map(children, (child, index) => (
      <div
        key={index}
        className="animate-fade-in opacity-0"
        style={{
          animationDelay: `${index * delay}ms`,
          animationFillMode: 'forwards'
        }}
      >
        {child}
      </div>
    ))}
  </div>
);

export const TypewriterText: React.FC<{ 
  text: string;
  speed?: number;
  className?: string;
}> = ({ text, speed = 50, className = '' }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
};

export const MagneticButton: React.FC<{ 
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}> = ({ children, strength = 0.3, className = '', onClick }) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    buttonRef.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <button
      ref={buttonRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Add to global CSS for shimmer effect
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
`;

// Inject keyframes if not already present
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('micro-interactions-keyframes');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'micro-interactions-keyframes';
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);
  }
}