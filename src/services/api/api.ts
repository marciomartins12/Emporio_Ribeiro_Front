
import axios from 'axios';

// Defina a URL base da sua API aqui
const API_BASE_URL = '/api'; // Substituir pela URL real da sua API

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;
