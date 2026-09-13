// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  details?: any;
}

// Cat Types
export interface Cat {
  id: number;
  name: string;
  balance: number;
  created_at: string;
}

export interface CreateCatRequest {
  name: string;
  balance?: number;
}

// Transaction Types
export interface Transaction {
  id: number;
  sender_id: number;
  receiver_id: number;
  amount: number;
  status: string;
  created_at: string;
  sender_name: string;
  receiver_name: string;
}

export interface TransactionFilters {
  senderId?: number;
  receiverId?: number;
  status?: string;
  limit?: number;
}

export interface TransactionStatistics {
  totalTransactions: number;
  totalTreatsTransferred: number;
  averageTransferAmount: number;
  mostActiveCats: Array<{ catId: number; transactionCount: number }>;
  largestTransactions: Transaction[];
  recentTransactions: Transaction[];
}

export interface CatTransactionStats {
  sentCount: number;
  receivedCount: number;
  totalSent: number;
  totalReceived: number;
  netBalance: number;
}

// Transfer Types
export interface TransferRequest {
  senderId: number;
  receiverId: number;
  amount: number;
}

export interface TransferResponse {
  transactionId: number;
  timestamp: string;
  processingTimeMs: number;
  from: {
    id: number;
    name: string;
    previousBalance: number;
    newBalance: number;
  };
  to: {
    id: number;
    name: string;
    previousBalance: number;
    newBalance: number;
  };
  amount: number;
  status: string;
  confirmationCode: string;
}

export interface TransferValidationRequest {
  senderId: number;
  receiverId: number;
  amount: number;
}

export interface TransferValidationResponse {
  valid: boolean;
  data: {
    sender: {
      id: number;
      name: string;
      currentBalance: number;
      sufficient: boolean;
    };
    receiver: {
      id: number;
      name: string;
      currentBalance: number;
    };
    transfer: {
      amount: number;
      feasible: boolean;
      newSenderBalance: number;
      newReceiverBalance: number;
    };
  };
}

// Health Check Types
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  database: {
    status: string;
    cats: number;
    transactions: number;
  };
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
}

// API Info Types
export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  environment: string;
  endpoints: {
    cats: {
      getAll: string;
      getById: string;
      create: string;
    };
    transactions: {
      getAll: string;
      getStatistics: string;
      getByCat: string;
      getById: string;
    };
    transfer: {
      execute: string;
      validate: string;
    };
  };
  documentation: string;
  health: string;
  timestamp: string;
}
