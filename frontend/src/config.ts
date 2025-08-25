// API configuration
const getApiUrl = () => {
  // In production (when served from backend), use relative URLs
  // In development, use the explicit backend URL
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const getSocketUrl = () => {
  // In production, connect to the same origin
  // In development, connect to the backend server
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();