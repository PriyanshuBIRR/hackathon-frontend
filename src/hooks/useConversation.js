import { useState, useEffect } from 'react';
import { useAPI, useMutation } from './useAPI';
import { conversationAPI } from '../services/apiEndpoints';

// Hook to fetch conversations with search functionality
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

// Hook to fetch messages from a specific conversation
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

// Hook to create a new conversation
export const useCreateConversation = () => {
  const { mutate, loading, error, data } = useMutation();

  const createConversation = async (firstQuery) => {
    return mutate(() => conversationAPI.startConversation(firstQuery));
  };

  return { createConversation, loading, error, data };
};

// Hook to delete a conversation
export const useDeleteConversation = () => {
  const { mutate, loading, error } = useMutation();

  const deleteConversation = async (conversationId) => {
    return mutate(() => conversationAPI.deleteConversation(conversationId));
  };

  return { deleteConversation, loading, error };
};

// Hook to update conversation title
export const useUpdateConversationTitle = () => {
  const { mutate, loading, error } = useMutation();

  const updateTitle = async (conversationId, title) => {
    return mutate(() => conversationAPI.updateConversationTitle(conversationId, title));
  };

  return { updateTitle, loading, error };
};

// Hook for sending messages in a conversation
export const useSendMessage = () => {
  const { mutate, loading, error, data } = useMutation();

  const sendMessage = async (conversationId, query) => {
    return mutate(() => conversationAPI.addMessage(conversationId, query));
  };

  return { sendMessage, loading, error, data };
};

// Hook for managing conversation state (for chat interface)
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

// Hook for pagination
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
