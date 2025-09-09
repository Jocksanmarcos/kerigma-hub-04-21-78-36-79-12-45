import React, { useEffect, useRef, useState } from "react";

interface ParallaxBackgroundProps {
  children: React.ReactNode;
  backgroundImage?: string;
  speed?: number;
  className?: string;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  backgroundImage,
  speed = 0.5,
  className = ''
}) => {
  const [offsetY, setOffsetY] = useState(0);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const rect = parallaxRef.current.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const scrolled = window.scrollY - elementTop;
        setOffsetY(scrolled * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      ref={parallaxRef}
      className={`relative overflow-hidden ${className}`}
    >
      {backgroundImage && (
        <div 
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transform: `translateY(${offsetY}px)`,
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ParallaxBackground;