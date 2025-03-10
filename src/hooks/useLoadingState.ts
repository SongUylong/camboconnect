'use client';

import { useCallback } from 'react';
import { useNavigation } from '@/providers/navigation-provider';

export function useLoadingState() {
  const { startLoading, stopLoading, isNavigating } = useNavigation();

  const withLoading = useCallback(async <T,>(promiseOrFn: Promise<T> | (() => Promise<T>)): Promise<T> => {
    try {
      console.log('Starting loading with withLoading');
      startLoading();
      
      if (typeof promiseOrFn === 'function') {
        return await promiseOrFn();
      } else {
        return await promiseOrFn;
      }
    } finally {
      console.log('Stopping loading with withLoading');
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return { 
    withLoading, 
    startLoading, 
    stopLoading,
    isLoading: isNavigating 
  };
} 