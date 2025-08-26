import { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced API hook for all endpoints
export const useAPI = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const { immediate = true, onSuccess, onError } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const response = await apiCall();

      setData(response.data);
      onSuccess?.(response.data);
    } catch (err) {
      if (err.name === 'AbortError') return;

      const errorMessage = err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'An error occurred';
      setError(errorMessage);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate]);

  return { data, loading, error, refetch: fetchData };
};

// Mutation hook for POST/PUT/DELETE operations
export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error, data };
};

// Streaming hook for real-time responses
export const useStreamingQuery = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const readerRef = useRef(null);

  const streamQuery = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      setResponse('');
      setIsStreaming(true);

      const response = await apiCall();
      const reader = response.body.getReader();
      readerRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === 'done') {
              setIsStreaming(false);
              break;
            }
            console.log(`this is data : '${data}'`)
            setResponse(prev => prev + data);
          } else if (line.startsWith('event: done')) {
            setIsStreaming(false);
            break;
          }
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Streaming failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      setIsStreaming(false);
    }
  }, []);

  return {
    streamQuery,
    response,
    loading,
    error,
    isStreaming,
    stopStreaming,
    setResponse
  };
};
