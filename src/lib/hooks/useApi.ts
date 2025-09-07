import { useState, useCallback, useRef } from 'react';
import { api } from '../api';

interface UseApiOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => void;
}

// Simple error handler
const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Simple retryable error check
const isRetryableError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return !axiosError.response || (axiosError.response.status && axiosError.response.status >= 500);
  }
  return false;
};

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onFinally
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const result = await apiCall(...args);
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        retryCount: 0
      }));

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      onError?.(errorMessage);

      // Auto-retry for retryable errors
      if (isRetryableError(error) && state.retryCount < maxRetries) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1
          }));
          execute(...args);
        }, retryDelay * (state.retryCount + 1));
      }

      return null;
    } finally {
      onFinally?.();
    }
  }, [apiCall, maxRetries, retryDelay, onSuccess, onError, onFinally, state.retryCount]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  const retry = useCallback(() => {
    if (state.data !== null) {
      execute();
    }
  }, [execute, state.data]);

  return {
    ...state,
    execute,
    reset,
    retry
  };
}

// Specialized hooks for common HTTP methods
export function useGet<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>(
    async (params?: any) => {
      const response = await api.get<T>(url, { params });
      return response.data;
    },
    options
  );
}

export function usePost<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>(
    async (data?: any) => {
      const response = await api.post<T>(url, data);
      return response.data;
    },
    options
  );
}

export function usePut<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>(
    async (data?: any) => {
      const response = await api.put<T>(url, data);
      return response.data;
    },
    options
  );
}

export function usePatch<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>(
    async (data?: any) => {
      const response = await api.patch<T>(url, data);
      return response.data;
    },
    options
  );
}

export function useDelete<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>(
    async () => {
      const response = await api.delete<T>(url);
      return response.data;
    },
    options
  );
}

// Hook for optimistic updates
export function useOptimisticUpdate<T = any>(
  updateFn: (data: T) => Promise<any>,
  options?: UseApiOptions
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const execute = useCallback(async (data: T) => {
    setIsUpdating(true);
    setOptimisticData(data);

    try {
      const result = await updateFn(data);
      setOptimisticData(null);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      setOptimisticData(null);
      const errorMessage = handleApiError(error);
      options?.onError?.(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
      options?.onFinally?.();
    }
  }, [updateFn, options]);

  return {
    execute,
    optimisticData,
    isUpdating
  };
}

// Hook for pagination
export function usePaginatedApi<T = any>(
  apiCall: (page: number, limit: number, ...args: any[]) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options?: UseApiOptions & { initialPage?: number; initialLimit?: number }
) {
  const [page, setPage] = useState(options?.initialPage || 1);
  const [limit, setLimit] = useState(options?.initialLimit || 10);
  const [hasMore, setHasMore] = useState(true);

  const { execute, ...apiState } = useApi(
    async (pageNum: number, limitNum: number, ...args: any[]) => {
      const result = await apiCall(pageNum, limitNum, ...args);
      setHasMore(result.data.length === limitNum);
      return result;
    },
    options
  );

  const loadPage = useCallback(async (pageNum: number, limitNum?: number) => {
    const result = await execute(pageNum, limitNum || limit);
    setPage(pageNum);
    if (limitNum) setLimit(limitNum);
    return result;
  }, [execute, limit]);

  const nextPage = useCallback(async () => {
    if (hasMore && !apiState.loading) {
      return await loadPage(page + 1);
    }
  }, [hasMore, apiState.loading, loadPage, page]);

  const prevPage = useCallback(async () => {
    if (page > 1 && !apiState.loading) {
      return await loadPage(page - 1);
    }
  }, [page, apiState.loading, loadPage]);

  const resetPagination = useCallback(() => {
    setPage(1);
    setHasMore(true);
    apiState.reset();
  }, [apiState]);

  return {
    ...apiState,
    page,
    limit,
    hasMore,
    loadPage,
    nextPage,
    prevPage,
    resetPagination,
    setPage,
    setLimit
  };
}
