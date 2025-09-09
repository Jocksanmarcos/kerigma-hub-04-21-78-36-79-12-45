import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface AnimatedScrollSectionProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'slide-up';
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedScrollSection: React.FC<AnimatedScrollSectionProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '-50px 0px'
  });

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [inView, delay]);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-[${duration}ms] ease-out`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'fade-down':
          return `${baseClasses} opacity-0 -translate-y-8`;
        case 'fade-left':
          return `${baseClasses} opacity-0 translate-x-8`;
        case 'fade-right':
          return `${baseClasses} opacity-0 -translate-x-8`;
        case 'scale-in':
          return `${baseClasses} opacity-0 scale-95`;
        case 'slide-up':
          return `${baseClasses} opacity-0 translate-y-12`;
        default:
          return `${baseClasses} opacity-0 translate-y-8`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedScrollSection;