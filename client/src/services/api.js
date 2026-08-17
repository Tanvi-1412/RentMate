import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rentmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rentmate_token');
      localStorage.removeItem('rentmate_user');
    }
    return Promise.reject(error);
  }
);

export const formatApiError = (error) => {
  if (!error || !error.response) {
    return {
      status: 503,
      title: 'Connection Issue',
      description: 'Unable to reach RentMate server. Please check your network connection.',
    };
  }

  const res = error.response;
  const status = res.status || 400;
  const data = res.data || {};

  let title = data.error || (status >= 500 ? 'Server Notice' : `Status ${status}`);
  let description = data.message || 'The requested action could not be completed.';

  if (status === 401) {
    title = 'Session Expired';
    description = 'Your session has ended. Please sign in to continue.';
  } else if (status === 403) {
    title = 'Access Restricted';
    description = 'You do not have permission to access this resource.';
  } else if (status === 404) {
    title = 'Item Not Found';
    description = 'The requested listing or user record was not found.';
  } else if (status === 409) {
    title = 'Already Exists';
    description = data.message || 'This record already exists in the marketplace.';
  } else if (status >= 500) {
    title = 'Server Notice';
    description = 'Our server encountered a temporary issue. Please try again in a moment.';
  }

  return { status, title, description };
};

export default API;
