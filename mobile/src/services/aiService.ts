import axios from 'axios';
import { API_CONFIG } from '../constants';

export const aiService = {
  predictLoan: async (payload: Record<string, unknown>) => {
    const response = await axios.post(`${API_CONFIG.AI_ENGINE_URL}/predict-loan`, payload, {
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  detectFraud: async (payload: Record<string, unknown>) => {
    const response = await axios.post(`${API_CONFIG.AI_ENGINE_URL}/detect-fraud`, payload, {
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  predictSavings: async (payload: Record<string, unknown>) => {
    const response = await axios.post(`${API_CONFIG.AI_ENGINE_URL}/predict-savings`, payload, {
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  fetchSavingsGoals: async () => {
    const response = await axios.get(`${API_CONFIG.AI_ENGINE_URL}/savings-goals`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    return response.data;
  },

  modelStatus: async () => {
    const response = await axios.get(`${API_CONFIG.AI_ENGINE_URL}/model-status`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    return response.data;
  },
};
