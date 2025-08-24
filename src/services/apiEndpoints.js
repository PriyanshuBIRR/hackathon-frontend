import api from './api';

// Root API
export const rootAPI = {
  getRoot: () => api.get('/'),
};

export const documentAPI = {
  getAllDocuments() {
    return api.get('/documents')
  }
}
export const uploadAPI = {
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

export const queryAPI = {
  runQuery: (query) => api.post('/query', { query }),

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

export const conversationAPI = {
  startConversation: (query) => api.post('/conversations/', { query }),

  listConversations: (search = null, limit = 50, offset = 0) => {
    const params = { limit, offset };
    if (search) params.search = search;
    return api.get('/conversations/', { params });
  },

  getConversationMessages: (conversationId, limit = 100, offset = 0) => {
    return api.get(`/conversations/${conversationId}/messages/`, {
      params: { limit, offset }
    });
  },


  chat: (conversationId, query) => api.post(`/chat/${conversationId}`, { query }),

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

    streamConversationMessage: (conversationId, query) => {
    return fetch(`${api.defaults.baseURL}/conversations/${conversationId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify({ query }),
    });
  },
};
