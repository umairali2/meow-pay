'use client';

import { useState, useEffect } from 'react';
import { transactionApi } from '@/lib/api';
import { useRefresh } from '@/contexts/RefreshContext';
import type { Transaction } from '@/types/api';

interface TransactionHistoryProps {
  limit?: number;
  showFilters?: boolean;
  refreshTrigger?: number;
}

export default function TransactionHistory({ 
  limit = 50, 
  showFilters = true,
  refreshTrigger 
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSender, setFilterSender] = useState<string>('');
  const [filterReceiver, setFilterReceiver] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const { refreshTrigger: globalRefresh } = useRefresh();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = { limit };
      if (filterSender) filters.senderId = parseInt(filterSender);
      if (filterReceiver) filters.receiverId = parseInt(filterReceiver);
      if (filterStatus) filters.status = filterStatus;
      
      const response = await transactionApi.getAllTransactions(filters);
      
      if (response.success) {
        setTransactions(response.data);
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [refreshTrigger, globalRefresh]);

  const handleFilterChange = () => {
    loadTransactions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={loadTransactions}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-600 font-medium mb-3">No transactions found</p>
          <p className="text-sm text-gray-500">
            {showFilters && (filterSender || filterReceiver || filterStatus)
              ? 'Try adjusting your filters'
              : 'Start transferring treats to see transaction history'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">📤</span>
                <span className="font-medium text-gray-900">{transaction.sender_name}</span>
                <span className="text-gray-400">→</span>
                <span className="text-lg">📥</span>
                <span className="font-medium text-gray-900">{transaction.receiver_name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>ID: {transaction.id}</span>
                <span>•</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{transaction.amount}</p>
                <p className="text-xs text-gray-600">treats</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </div>
            </div>
          </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">💳</span>
          Transaction History
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{transactions.length} transactions</span>
          <button
            onClick={loadTransactions}
            className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Sender ID
              </label>
              <input
                type="text"
                value={filterSender}
                onChange={(e) => setFilterSender(e.target.value)}
                placeholder="Enter sender ID"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Receiver ID
              </label>
              <input
                type="text"
                value={filterReceiver}
                onChange={(e) => setFilterReceiver(e.target.value)}
                placeholder="Enter receiver ID"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleFilterChange}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilterSender('');
                setFilterReceiver('');
                setFilterStatus('');
                loadTransactions();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
