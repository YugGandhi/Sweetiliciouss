import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for other errors
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  getUsers: () => api.get('/auth/users')
};

// Orders API
export const orders = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (orderId) => api.get(`/orders/order/${orderId}`),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}`, { status }),
  updatePaymentStatus: (orderId, paymentStatus) => api.put(`/orders/${orderId}/payment-status`, { paymentStatus }),
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  search: (params) => api.get('/orders/search', { params })
};

// Sweets API
export const sweets = {
  getAll: () => api.get('/sweets'),
  getOne: (id) => api.get(`/sweets/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photos') {
        data[key].forEach(photo => formData.append('photos', photo));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/sweets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photos') {
        data[key].forEach(photo => formData.append('photos', photo));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/sweets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/sweets/${id}`)
};

// Notifications API
export const notifications = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

export default api; 