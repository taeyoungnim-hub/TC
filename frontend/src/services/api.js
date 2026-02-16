import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const chatAPI = {
  // Single AI chat
  chat: async (ai, messages, mode, sop, apiKeys) => {
    const response = await api.post('/chat', {
      ai,
      messages,
      mode,
      sop,
      apiKeys
    });
    return response.data;
  },

  // Parallel chat to multiple AIs
  parallelChat: async (ais, message, mode, sop, apiKeys) => {
    const response = await api.post('/parallel-chat', {
      ais,
      message,
      mode,
      sop,
      apiKeys
    });
    return response.data;
  },

  // Deep research mode
  deepResearch: async (ais, message, sop, apiKeys) => {
    const response = await api.post('/deep-research', {
      ais,
      message,
      sop,
      apiKeys
    });
    return response.data;
  },

  // Health check
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
