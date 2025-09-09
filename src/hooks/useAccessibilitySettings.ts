import { useState, useEffect } from 'react';

export interface AccessibilitySettings {
  theme: 'default' | 'accessibility' | 'young' | 'professional';
  fontSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  enhancedFocus: boolean;
  simplifiedUI: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  colorBlindSupport: boolean;
  textToSpeech: boolean;
}

const defaultSettings: AccessibilitySettings = {
  theme: 'default',
  fontSize: 'normal',
  contrast: 'normal',
  reducedMotion: true,
  enhancedFocus: true,
  simplifiedUI: true,
  keyboardNavigation: true,
  screenReaderMode: true,
  colorBlindSupport: true,
  textToSpeech: false
};

export const useAccessibilitySettings = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('kerigma-accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('kerigma-accessibility-settings', JSON.stringify(updatedSettings));
    applySettingsToDOM(updatedSettings);
  };

  const applySettingsToDOM = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Remove existing accessibility classes
    root.classList.remove(
      'accessibility-high-contrast',
      'accessibility-large-text',
      'accessibility-extra-large-text',
      'accessibility-reduced-motion',
      'accessibility-enhanced-focus',
      'accessibility-simplified-ui',
      'young-theme',
      'accessibility-theme',
      'professional-theme'
    );

    // Apply theme
    if (settings.theme === 'accessibility') {
      root.classList.add('accessibility-theme');
    } else if (settings.theme === 'young') {
      root.classList.add('young-theme');
    } else if (settings.theme === 'professional') {
      root.classList.add('professional-theme');
    }

    // Apply font size
    if (settings.fontSize === 'large') {
      root.classList.add('accessibility-large-text');
    } else if (settings.fontSize === 'extra-large') {
      root.classList.add('accessibility-extra-large-text');
    }

    // Apply contrast
    if (settings.contrast === 'high') {
      root.classList.add('accessibility-high-contrast');
    }

    // Apply motion preferences
    if (settings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    }

    // Apply focus enhancement
    if (settings.enhancedFocus) {
      root.classList.add('accessibility-enhanced-focus');
    }

    // Apply simplified UI
    if (settings.simplifiedUI) {
      root.classList.add('accessibility-simplified-ui');
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('kerigma-accessibility-settings');
    applySettingsToDOM(defaultSettings);
  };

  const detectUserPreferences = () => {
    const newSettings: Partial<AccessibilitySettings> = {};

    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      newSettings.reducedMotion = true;
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      newSettings.contrast = 'high';
    }

    // Auto-detect accessibility theme based on age indicators
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('accessibility') || userAgent.includes('assistive')) {
      newSettings.theme = 'accessibility';
    }

    updateSettings(newSettings);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    detectUserPreferences,
    applySettingsToDOM
  };
};