import api from './api';

// Root API
export const rootAPI = {
  getRoot: () => api.get('/'),
};

// File Upload APIs
export const uploadAPI = {
  // Upload factsheet PDF with background processing
  uploadFactsheet: (file, filename = 'factsheet') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    
    return api.post('/upload-factsheet', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 1 minute for file uploads
    });
  },

  // Upload JSON documents
  uploadDocuments: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Query APIs
export const queryAPI = {
  // Regular query
  runQuery: (query) => api.post('/query', { query }),

  // Streaming query
  streamQuery: (query) => {
    return fetch(`${api.defaults.baseURL}/stream/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify({ query }),
    });
  },
};

// Conversation APIs
export const conversationAPI = {
  // Start a new conversation
  startConversation: (query) => api.post('/conversations/', { query }),

  listConversations: (search = null, limit = 50, offset = 0) => {
    const params = { limit, offset };
    if (search) params.search = search;
    return api.get('/conversations/', { params });
  },

  // Get all messages from a specific conversation
  getConversationMessages: (conversationId, limit = 100, offset = 0) => {
    return api.get(`/conversations/${conversationId}/messages/`, {
      params: { limit, offset }
    });
  },


  // Regular chat
  chat: (conversationId, query) => api.post(`/chat/${conversationId}`, { query }),

  // Streaming chat
  streamChat: (conversationId, query) => {
    return fetch(`${api.defaults.baseURL}/stream/chat/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify({ query }),
    });
  },

  // Add message to conversation
  addMessage: (conversationId, query) => 
    api.post(`/conversations/${conversationId}/messages/`, { query }),
};
