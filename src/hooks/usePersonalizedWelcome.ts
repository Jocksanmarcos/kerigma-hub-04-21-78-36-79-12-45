import { useState, useEffect } from 'react';

interface PersonalizedData {
  isFirstTime: boolean | null;
  showWelcomeModal: boolean;
  userPreference: 'first_time' | 'returning' | null;
}

export interface UsePersonalizedWelcomeReturn {
  isFirstTime: boolean | null;
  showWelcomeModal: boolean;
  userPreference: 'first_time' | 'returning' | null;
  handleWelcomeResponse: (response: 'first_time' | 'returning') => void;
  closeWelcomeModal: () => void;
}

export const usePersonalizedWelcome = (): UsePersonalizedWelcomeReturn => {
  const [personalizedData, setPersonalizedData] = useState<PersonalizedData>({
    isFirstTime: null,
    showWelcomeModal: false,
    userPreference: null,
  });

  useEffect(() => {
    const savedPreference = localStorage.getItem('user_welcome_preference');
    const hasVisited = localStorage.getItem('has_visited_kerigma');

    if (!hasVisited && !savedPreference) {
      // First time visitor - show modal after 2 seconds
      const timer = setTimeout(() => {
        setPersonalizedData(prev => ({
          ...prev,
          showWelcomeModal: true,
          isFirstTime: true,
        }));
      }, 2000);

      return () => clearTimeout(timer);
    } else if (savedPreference) {
      setPersonalizedData(prev => ({
        ...prev,
        userPreference: savedPreference as 'first_time' | 'returning',
        isFirstTime: savedPreference === 'first_time',
      }));
    }

    // Mark as visited
    localStorage.setItem('has_visited_kerigma', 'true');
  }, []);

  const handleWelcomeResponse = (response: 'first_time' | 'returning') => {
    setPersonalizedData(prev => ({
      ...prev,
      userPreference: response,
      isFirstTime: response === 'first_time',
      showWelcomeModal: false,
    }));
    localStorage.setItem('user_welcome_preference', response);
    localStorage.setItem('has_visited_kerigma', 'true');
  };

  const closeWelcomeModal = () => {
    setPersonalizedData(prev => ({
      ...prev,
      showWelcomeModal: false,
    }));
  };

  return {
    isFirstTime: personalizedData.isFirstTime,
    showWelcomeModal: personalizedData.showWelcomeModal,
    userPreference: personalizedData.userPreference,
    handleWelcomeResponse,
    closeWelcomeModal,
  };
};