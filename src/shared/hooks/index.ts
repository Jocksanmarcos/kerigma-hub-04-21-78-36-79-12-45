// Barrel exports for custom hooks
export * from '@/hooks/use-mobile';
export * from '@/hooks/use-toast';
export * from '@/hooks/useAccessibilitySettings';
export * from '@/hooks/useAmbienceAudioEngine';
export * from '@/hooks/useCalendarDataSources';
export * from '@/hooks/useFilters';
// export * from '@/hooks/useNotifications'; // Removido temporariamente
export * from '@/hooks/usePastoralAI';
export * from '@/hooks/usePermission';
export * from '@/hooks/useRole';
export * from '@/hooks/useScheduling';
export * from '@/hooks/useUsabilityAnalytics';

// Re-export useNewRole hooks
export { useNewUserRole, useHasNewRole, newRolePermissions } from '@/hooks/useNewRole';