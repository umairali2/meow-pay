// API utility functions for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Cat API functions
export const catApi = {
  getAllCats: (): Promise<{ success: boolean; data: any[]; count: number; timestamp: string }> =>
    apiRequest('/api/cats'),

  getCatById: (id: number): Promise<{ success: boolean; data: any; timestamp: string }> =>
    apiRequest(`/api/cats/${id}`),

  createCat: (data: { name: string; balance?: number }): Promise<{ success: boolean; data: any; message: string; timestamp: string }> =>
    apiRequest('/api/cats', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Transaction API functions
export const transactionApi = {
  getAllTransactions: (filters?: { limit?: number; senderId?: number; receiverId?: number; status?: string }): Promise<{ success: boolean; data: any[]; count: number; filters?: any; timestamp: string }> => {
    const queryParams = new URLSearchParams();
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.senderId) queryParams.append('senderId', filters.senderId.toString());
    if (filters?.receiverId) queryParams.append('receiverId', filters.receiverId.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    return apiRequest(`/api/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionStatistics: (): Promise<{ success: boolean; data: any; timestamp: string }> =>
    apiRequest('/api/transactions/statistics'),

  getCatTransactions: (catId: number, limit?: number): Promise<{ success: boolean; data: any[]; count: number; catId: number; statistics: any; timestamp: string }> => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    return apiRequest(`/api/transactions/cat/${catId}${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionById: (id: number): Promise<{ success: boolean; data: any; timestamp: string }> =>
    apiRequest(`/api/transactions/${id}`),
};

// Transfer API functions
export const transferApi = {
  executeTransfer: (data: { senderId: number; receiverId: number; amount: number }): Promise<{ success: boolean; data: any; message: string; timestamp: string }> =>
    apiRequest('/api/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  validateTransfer: (data: { senderId: number; receiverId: number; amount: number }): Promise<{ success: boolean; valid: boolean; data: any; timestamp: string }> =>
    apiRequest('/api/transfer/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Health and Info API functions
export const systemApi = {
  getHealthCheck: (): Promise<{ status: string; timestamp: string; environment: string; database: any; uptime: number; memory: any; version: string }> =>
    apiRequest('/health'),

  getApiInfo: (): Promise<{ name: string; version: string; description: string; environment: string; endpoints: any; documentation: string; health: string; timestamp: string }> =>
    apiRequest('/api/info'),
};

export default {
  catApi,
  transactionApi,
  transferApi,
  systemApi,
};
