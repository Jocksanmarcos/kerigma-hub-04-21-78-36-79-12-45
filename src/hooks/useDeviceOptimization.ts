import { useState, useEffect } from 'react';

interface DeviceOptimization {
  isMobile: boolean;
  isLowPowerMode: boolean;
  shouldReduceAnimations: boolean;
  shouldDisableParallax: boolean;
}

export const useDeviceOptimization = (): DeviceOptimization => {
  const [optimization, setOptimization] = useState<DeviceOptimization>({
    isMobile: false,
    isLowPowerMode: false,
    shouldReduceAnimations: false,
    shouldDisableParallax: false,
  });

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
      const isLowPowerMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for older devices or poor performance
      const isLowEndDevice = (() => {
        if ('deviceMemory' in navigator) {
          return (navigator as any).deviceMemory < 4;
        }
        if ('hardwareConcurrency' in navigator) {
          return navigator.hardwareConcurrency < 4;
        }
        return false;
      })();

      const shouldReduceAnimations = isMobile || isLowPowerMode || isLowEndDevice;
      const shouldDisableParallax = isMobile || isLowPowerMode;

      setOptimization({
        isMobile,
        isLowPowerMode,
        shouldReduceAnimations,
        shouldDisableParallax,
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return optimization;
};