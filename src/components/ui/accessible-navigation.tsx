import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SkipToContent } from './skip-to-content';

interface AccessibleNavigationProps {
  children: React.ReactNode;
  mainContentId?: string;
  navigationLabel?: string;
}

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  children,
  mainContentId = 'main-content',
  navigationLabel = 'Navegação principal'
}) => {
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC para sair de menus
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.getAttribute('role') === 'menuitem') {
          activeElement.blur();
        }
      }

      // Tab navigation improvements
      if (event.key === 'Tab') {
        const focusableElements = navigationRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            // Shift + Tab - going backwards
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab - going forward
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SkipToContent targetId={mainContentId} />
      <nav
        ref={navigationRef}
        role="navigation"
        aria-label={navigationLabel}
        className="focus-within:outline-none"
      >
        {children}
      </nav>
    </>
  );
};

// Hook para gerenciar foco programático
export const useFocusManagement = () => {
  const focusElement = (selector: string, delay: number = 100) => {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, delay);
  };

  const announceLiveRegion = (message: string) => {
    const liveRegion = document.getElementById('live-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  return {
    focusElement,
    announceLiveRegion
  };
};

// Componente para live announcements
export const LiveAnnouncements: React.FC = () => {
  return (
    <div
      id="live-announcements"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
};