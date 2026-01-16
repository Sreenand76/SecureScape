import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sessions/CSRF
});

// Request interceptor for logging
let requestLoggerCallback = null;

export const setRequestLogger = (callback) => {
  requestLoggerCallback = callback;
};

api.interceptors.request.use(
  (config) => {
    // Log request
    if (requestLoggerCallback) {
      requestLoggerCallback({
        method: config.method.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`,
        params: config.params,
        data: config.data,
        headers: config.headers,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    return config;
  },
  (error) => {
    // Log request error
    if (requestLoggerCallback) {
      requestLoggerCallback({
        method: 'ERROR',
        url: error.config?.url || 'unknown',
        error: error.message,
        status: 'error',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log successful response
    if (requestLoggerCallback) {
      const responseTime = response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : null;
      
      requestLoggerCallback({
        method: response.config.method.toUpperCase(),
        url: response.config.url,
        fullUrl: `${response.config.baseURL}${response.config.url}`,
        params: response.config.params,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        responseTime: responseTime,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    return response;
  },
  (error) => {
    // Log error response
    if (requestLoggerCallback) {
      const responseTime = error.config?.metadata?.startTime 
        ? Date.now() - error.config.metadata.startTime 
        : null;
      
      requestLoggerCallback({
        method: error.config?.method?.toUpperCase() || 'ERROR',
        url: error.config?.url || 'unknown',
        fullUrl: error.config 
          ? `${error.config.baseURL}${error.config.url}` 
          : 'unknown',
        params: error.config?.params,
        status: error.response?.status || 'error',
        statusText: error.response?.statusText || error.message,
        error: error.message,
        data: error.response?.data,
        responseTime: responseTime,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    return Promise.reject(error);
  }
);

// Track request start time
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// Helper function to get the correct endpoint based on mode
export const getEndpoint = (path, mode = 'insecure') => {
  const modePrefix = mode === 'secure' ? 'secure' : 'attack';
  return `/${modePrefix}${path}`;
};

// SQL Injection endpoints
export const sqlAPI = {
  login: (credentials, mode) => 
    api.post(getEndpoint('/sql/login', mode), credentials),
  
  search: (query, mode) => 
    api.get(getEndpoint('/sql/search', mode), { params: { q: query } }),
};

// XSS endpoints
export const xssAPI = {
  getComments: (mode) => 
    api.get(getEndpoint('/xss/comments', mode)),
  
  addComment: (comment, mode) => 
    api.post(getEndpoint('/xss/comment', mode), { text: comment }),
};

// CSRF endpoints
export const csrfAPI = {
  getForm: (mode) => 
    api.get(getEndpoint('/csrf/form', mode)),
  
  transfer: (data, mode) => 
    api.post(getEndpoint('/csrf/transfer', mode), data),
};

export default api;
