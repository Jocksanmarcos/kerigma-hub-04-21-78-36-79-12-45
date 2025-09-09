import React, { createContext, useContext, useState, useEffect } from 'react';
import { Church, useUserChurch, useIsSuperAdmin, useChurches } from '@/hooks/useChurches';

interface ChurchContextType {
  selectedChurch: Church | null;
  setSelectedChurch: (church: Church | null) => void;
  userChurch: Church | null;
  isSuperAdmin: boolean;
  availableChurches: Church[];
  isLoading: boolean;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const useChurchContext = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurchContext must be used within a ChurchProvider');
  }
  return context;
};

interface ChurchProviderProps {
  children: React.ReactNode;
}

export const ChurchProvider: React.FC<ChurchProviderProps> = ({ children }) => {
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  
  const { data: userChurch, isLoading: isLoadingUserChurch } = useUserChurch();
  const { data: isSuperAdmin = false, isLoading: isLoadingSuperAdmin } = useIsSuperAdmin();
  const { data: availableChurches = [], isLoading: isLoadingChurches } = useChurches();

  const isLoading = isLoadingUserChurch || isLoadingSuperAdmin || isLoadingChurches;

  // Auto-select user's church on load if not super admin
  useEffect(() => {
    if (!isLoading && userChurch && !isSuperAdmin && !selectedChurch) {
      setSelectedChurch(userChurch);
    }
  }, [userChurch, isSuperAdmin, selectedChurch, isLoading]);

  // If super admin and no church selected, default to first available
  useEffect(() => {
    if (!isLoading && isSuperAdmin && !selectedChurch && availableChurches.length > 0) {
      setSelectedChurch(availableChurches[0]);
    }
  }, [isSuperAdmin, selectedChurch, availableChurches, isLoading]);

  return (
    <ChurchContext.Provider
      value={{
        selectedChurch,
        setSelectedChurch,
        userChurch,
        isSuperAdmin,
        availableChurches,
        isLoading,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};