import axios from 'axios';

// In Vite, environment variables must be prefixed with VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
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

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/users/register', userData),
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/login', credentials),
  logout: () => api.get('/users/logout'),
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData: { name?: string; email?: string }) =>
    api.put('/users/me/update', userData),
  updatePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    api.put('/users/password/update', passwords),
};

// Products API
// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  seller: string;
  stock: number;
  images: string[]; // base64 strings
  features: string[];
  inStock: boolean;
  featured: boolean;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const productsAPI = {
  getProducts: (params: any = {}) => api.get<{ products: Product[]; productsCount: number; resPerPage: number }>('/products', { params }),
  getProduct: (id: string) => api.get<{ product: Product }>(`/products/${id}`),
  createProduct: (data: any) => api.post<Product>('/products/admin/new', data),
updateProduct: (id: string, data: any) => api.put<Product>(`/products/admin/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/admin/${id}`),
  createReview: (productId: string, review: { rating: number; comment: string }) =>
    api.put(`/products/${productId}/review`, review),
  getProductReviews: (productId: string) => api.get(`/products/${productId}/reviews`),
  getTopProducts: () => api.get('/products/top'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData: any) => api.post('/orders/new', orderData),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/me'),
  getAllOrders: () => api.get('/orders/admin/orders'),
  updateOrderToDelivered: (id: string) =>
    api.put(`/orders/admin/order/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData: FormData) =>
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default api;
