import { useState, useEffect, useRef } from 'react';
import { useAPI, useMutation } from './useAPI';
import { conversationAPI } from '../services/apiEndpoints';

export const useConversations = (searchTerm = '', limit = 50) => {
  const { 
    data: conversationsData, 
    loading, 
    error, 
    refetch 
  } = useAPI(
    () => conversationAPI.listConversations(searchTerm || null, limit),
    [searchTerm, limit]
  );

  return {
    conversations: conversationsData?.conversations || [],
    total: conversationsData?.total || 0,
    loading,
    error,
    refetch,
    hasMore: conversationsData?.has_more || false
  };
};

export const useConversationMessages = (conversationId, limit = 100) => {
  const { 
    data: messagesData, 
    loading, 
    error, 
    refetch 
  } = useAPI(
    () => conversationId ? conversationAPI.getConversationMessages(conversationId, limit) : null,
    [conversationId, limit],
    { immediate: !!conversationId }
  );

  return {
    messages: messagesData?.messages || [],
    conversationTitle: messagesData?.conversation_title || '',
    total: messagesData?.total || 0,
    loading,
    error,
    refetch,
    hasMore: messagesData?.has_more || false
  };
};

export const useCreateConversation = () => {
  const { mutate, loading, error, data } = useMutation();

  const createConversation = async (firstQuery) => {
    return mutate(() => conversationAPI.startConversation(firstQuery));
  };

  return { createConversation, loading, error, data };
};

export const useDeleteConversation = () => {
  const { mutate, loading, error } = useMutation();

  const deleteConversation = async (conversationId) => {
    return mutate(() => conversationAPI.deleteConversation(conversationId));
  };

  return { deleteConversation, loading, error };
};

export const useUpdateConversationTitle = () => {
  const { mutate, loading, error } = useMutation();

  const updateTitle = async (conversationId, title) => {
    return mutate(() => conversationAPI.updateConversationTitle(conversationId, title));
  };

  return { updateTitle, loading, error };
};

export const useSendMessage = () => {
  const { mutate, loading, error, data } = useMutation();

  const sendMessage = async (conversationId, query) => {
    return mutate(() => conversationAPI.addMessage(conversationId, query));
  };

  return { sendMessage, loading, error, data };
};

export const useConversationState = (initialConversationId = null) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  // Set initial conversation if provided
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversation({ id: initialConversationId });
    }
  }, [initialConversationId]);

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const addConversation = (conversation) => {
    setConversations(prev => [conversation, ...prev]);
  };

  const removeConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  const updateConversation = (conversationId, updates) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      )
    );
  };

  return {
    selectedConversation,
    conversations,
    selectConversation,
    addConversation,
    removeConversation,
    updateConversation
  };
};

export const useConversationsPagination = (searchTerm = '', limit = 20) => {
  const [offset, setOffset] = useState(0);
  const [allConversations, setAllConversations] = useState([]);

  const { 
    data: conversationsData, 
    loading, 
    error 
  } = useAPI(
    () => conversationAPI.listConversations(searchTerm || null, limit, offset),
    [searchTerm, limit, offset]
  );

  useEffect(() => {
    if (conversationsData?.conversations) {
      if (offset === 0) {
        // First page - replace all conversations
        setAllConversations(conversationsData.conversations);
      } else {
        // Subsequent pages - append to existing conversations
        setAllConversations(prev => [...prev, ...conversationsData.conversations]);
      }
    }
  }, [conversationsData, offset]);

  // Reset when search term changes
  useEffect(() => {
    setOffset(0);
    setAllConversations([]);
  }, [searchTerm]);

  const loadMore = () => {
    if (conversationsData?.has_more && !loading) {
      setOffset(prev => prev + limit);
    }
  };

  const refresh = () => {
    setOffset(0);
    setAllConversations([]);
  };

  return {
    conversations: allConversations,
    loading,
    error,
    hasMore: conversationsData?.has_more || false,
    loadMore,
    refresh,
    total: conversationsData?.total || 0
  };
};


export const useStreamingConversation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  const streamMessage = async (conversationId, query, onChunk, onComplete, onError) => {
    setLoading(true);
    setIsStreaming(true);
    setError(null);

    try {
      const response = await conversationAPI.streamConversationMessage(conversationId, query);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      abortControllerRef.current = { cancel: () => reader.cancel() };
      
      let done = false;
      let accumulatedResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value);
          
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            console.log("this is line : ", line)
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              console.log("this is data : ", data)
              if (data === 'done' || data === '[DONE]') {
                done = true;
                break;
              }
              
              if (data.trim()) {
                accumulatedResponse += data;
                onChunk && onChunk(data, accumulatedResponse);
              }
            } else if (line.startsWith('event: done')) {
              done = true;
              break;
            }
          }
        }
      }
      
      onComplete && onComplete(accumulatedResponse);
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Failed to stream message';
        setError(errorMessage);
        onError && onError(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current && isStreaming) {
      abortControllerRef.current.cancel();
      setLoading(false);
      setIsStreaming(false);
    }
  };

  return {
    streamMessage,
    stopStreaming,
    loading,
    error,
    isStreaming
  };
};
