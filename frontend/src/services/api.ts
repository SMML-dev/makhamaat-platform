import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      const token = localStorage.getItem('token');
      if (token) {
        authService.logout();
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
  updateProfile: async (updateData: any) => {
    const response = await api.put('/users/profile', updateData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (resetData: any) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/avatar-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

const normalizeLang = (lang?: string) => lang ? lang.split('-')[0] : undefined;

export const productsService = {
  getProducts: async (lang?: string) => {
    const normalized = normalizeLang(lang);
    const response = await api.get('/products', { params: normalized ? { lang: normalized } : {} });
    return response.data;
  },
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  uploadProductImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/products/img-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  getProductHistory: async (id: string) => {
    const response = await api.get(`/products/${id}/history`);
    return response.data;
  },
  getMarketPriceComparison: async (lang?: string) => {
    const normalized = normalizeLang(lang);
    const response = await api.get('/products/market-comparison', { params: normalized ? { lang: normalized } : {} });
    return response.data;
  },
  updateMarketPrice: async (productId: string, marketPriceData: any) => {
    const response = await api.put(`/products/${productId}/market-price`, marketPriceData);
    return response.data;
  },
};

export const usersService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  changePassword: async (passwordData: any) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },
  generate2FA: async () => {
    const response = await api.get('/users/2fa/generate');
    return response.data;
  },
  confirm2FA: async (token: string) => {
    const response = await api.post('/users/2fa/confirm', { token });
    return response.data;
  },
  disable2FA: async () => {
    const response = await api.post('/users/2fa/disable');
    return response.data;
  }
};

export const actorsService = {
  getActors: async () => {
    const response = await api.get('/actors');
    return response.data;
  },
  createActor: async (actorData: any) => {
    const response = await api.post('/actors', actorData);
    return response.data;
  },
  updateActor: async (id: string, actorData: any) => {
    const response = await api.put(`/actors/${id}`, actorData);
    return response.data;
  },
  deleteActor: async (id: string) => {
    const response = await api.delete(`/actors/${id}`);
    return response.data;
  }
};

export const activitiesService = {
  getActivities: async () => {
    const response = await api.get('/activities');
    return response.data;
  },
  getLogs: async (page: number = 1, limit: number = 50, filter: string = '') => {
    const response = await api.get(`/activities/logs?page=${page}&limit=${limit}&filter=${filter}`);
    return response.data;
  },
  getUserOrders: async () => {
    const response = await api.get('/activities/my-orders');
    return response.data;
  },
  getUserStats: async () => {
    const response = await api.get('/activities/my-stats');
    return response.data;
  },
  cancelOrder: async (id: string) => {
    const response = await api.put(`/activities/${id}/cancel`);
    return response.data;
  },
  createActivity: async (activityData: any) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },
  updateActivity: async (id: string, activityData: any) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  },
  getActorStats: async (actorId: string) => {
    const response = await api.get(`/activities/stats/${actorId}`);
    return response.data;
  }
};

export const messagesService = {
  getMessages: async (folder?: string) => {
    const url = folder ? `/messages?folder=${folder}` : '/messages';
    const response = await api.get(url);
    return response.data;
  },
  getMyMessages: async () => {
    const response = await api.get('/messages/my-messages');
    return response.data;
  },
  getAdminInbox: async () => {
    const response = await api.get('/messages/admin-inbox');
    return response.data;
  },
  sendMessage: async (messageData: any) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  sendContactMessage: async (contactData: any) => {
    const response = await api.post('/messages/contact', contactData);
    return response.data;
  },
  sendBroadcast: async (broadcastData: { subject: string; content: string; targetRole: 'ADMIN' | 'USER' | 'ALL'; attachments?: { name: string; url: string }[] }) => {
    const response = await api.post('/messages/broadcast', broadcastData);
    return response.data;
  },
  getBroadcasts: async () => {
    const response = await api.get('/messages/broadcasts');
    return response.data;
  },
  updateMessageStatus: async (id: string, updateData: any) => {
    const response = await api.put(`/messages/${id}`, updateData);
    return response.data;
  },
  deleteMessage: async (id: string) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  }
};


export const systemService = {
  requestResetOtp: async (password: string) => {
    const response = await api.post('/reset/request-otp', { password });
    return response.data;
  },
  resetPlatform: async (otp: string) => {
    const response = await api.delete('/reset', { data: { otp } });
    return response.data;
  },
  getMaintenanceStatus: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },
  setMaintenanceMode: async (status: boolean) => {
    const response = await api.post('/maintenance', { status });
    return response.data;
  },
  getPlatformBackup: async () => {
    const response = await api.get('/backup');
    return response.data;
  },
  rotateMasterKeys: async () => {
    const response = await api.post('/security/rotate-keys');
    return response.data;
  }
};

export const paymentService = {
  initiatePayment: async (paymentData: { 
    amount: number; 
    currency: string; 
    orderIds: string[]; 
    returnUrl?: string;
    customer?: { name: string; email: string; phone: string }
  }) => {
    const response = await api.post('/payment/initiate', paymentData);
    return response.data;
  }
};

export default api;
