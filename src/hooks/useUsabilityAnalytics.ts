import { useState, useEffect } from 'react';

export interface UsabilityMetrics {
  pageViews: Record<string, number>;
  timeOnPage: Record<string, number[]>;
  errorClicks: Record<string, number>;
  successfulActions: Record<string, number>;
  feedbackRatings: Record<string, number[]>;
  userProfile: 'jovem' | 'adulto' | 'idoso' | 'auto';
  accessibilityFeatures: string[];
  lastUpdated: Date;
}

const defaultMetrics: UsabilityMetrics = {
  pageViews: {},
  timeOnPage: {},
  errorClicks: {},
  successfulActions: {},
  feedbackRatings: {},
  userProfile: 'auto',
  accessibilityFeatures: [],
  lastUpdated: new Date()
};

export const useUsabilityAnalytics = () => {
  const [metrics, setMetrics] = useState<UsabilityMetrics>(defaultMetrics);

  useEffect(() => {
    const savedMetrics = localStorage.getItem('kerigma-usability-metrics');
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error('Error loading usability metrics:', error);
      }
    }
  }, []);

  const saveMetrics = (newMetrics: UsabilityMetrics) => {
    setMetrics(newMetrics);
    localStorage.setItem('kerigma-usability-metrics', JSON.stringify(newMetrics));
  };

  const trackPageView = (page: string) => {
    const newMetrics = {
      ...metrics,
      pageViews: {
        ...metrics.pageViews,
        [page]: (metrics.pageViews[page] || 0) + 1
      },
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const trackTimeOnPage = (page: string, timeSpent: number) => {
    const newMetrics = {
      ...metrics,
      timeOnPage: {
        ...metrics.timeOnPage,
        [page]: [...(metrics.timeOnPage[page] || []), timeSpent]
      },
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const trackErrorClick = (element: string) => {
    const newMetrics = {
      ...metrics,
      errorClicks: {
        ...metrics.errorClicks,
        [element]: (metrics.errorClicks[element] || 0) + 1
      },
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const trackSuccessfulAction = (action: string) => {
    const newMetrics = {
      ...metrics,
      successfulActions: {
        ...metrics.successfulActions,
        [action]: (metrics.successfulActions[action] || 0) + 1
      },
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const trackFeedbackRating = (module: string, rating: number) => {
    const newMetrics = {
      ...metrics,
      feedbackRatings: {
        ...metrics.feedbackRatings,
        [module]: [...(metrics.feedbackRatings[module] || []), rating]
      },
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const updateUserProfile = (profile: UsabilityMetrics['userProfile']) => {
    const newMetrics = {
      ...metrics,
      userProfile: profile,
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const addAccessibilityFeature = (feature: string) => {
    if (!metrics.accessibilityFeatures.includes(feature)) {
      const newMetrics = {
        ...metrics,
        accessibilityFeatures: [...metrics.accessibilityFeatures, feature],
        lastUpdated: new Date()
      };
      saveMetrics(newMetrics);
    }
  };

  const removeAccessibilityFeature = (feature: string) => {
    const newMetrics = {
      ...metrics,
      accessibilityFeatures: metrics.accessibilityFeatures.filter(f => f !== feature),
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  return {
    metrics,
    trackPageView,
    trackTimeOnPage,
    trackErrorClick,
    trackSuccessfulAction,
    trackFeedbackRating,
    updateUserProfile,
    addAccessibilityFeature,
    removeAccessibilityFeature
  };
};