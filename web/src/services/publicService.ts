import api from './api';

const API_URL = '/public';

export const publicService = {
  // Get About Us information
  getAboutUs: async () => {
    const response = await api.get(`${API_URL}/about-us`);
    return response.data;
  },

  // Get Contact Us information
  getContactUs: async () => {
    const response = await api.get(`${API_URL}/contact-us`);
    return response.data;
  },

  // Get Services information
  getServices: async () => {
    const response = await api.get(`${API_URL}/services`);
    return response.data;
  },

  // Get FAQ information
  getFAQ: async () => {
    const response = await api.get(`${API_URL}/faq`);
    return response.data;
  }
};
