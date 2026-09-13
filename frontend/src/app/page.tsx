'use client';

import { useState, useEffect } from 'react';
import { transactionApi } from '@/lib/api';
import { useRefresh } from '@/contexts/RefreshContext';
import type { Transaction } from '@/types/api';
import CatAccounts from '@/components/CatAccounts';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger, triggerRefresh } = useRefresh();

  useEffect(() => {
    loadTransactions();
  }, [refreshTrigger]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionApi.getAllTransactions({ limit: 10 });

      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err) {
      setError('Failed to load data. Please make sure the backend is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    triggerRefresh();
    loadTransactions();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🐱</div>
          <p className="text-gray-600">Loading MeowPay...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🐱</span>
              <h1 className="text-2xl font-bold text-gray-900">MeowPay</h1>
            </div>
            <div className="text-sm text-gray-600">
              Digital Wallet for Cats
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cat Accounts Section */}
          <CatAccounts />

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2">💳</span>
                Recent Transactions
              </h2>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                title="Refresh"
              >
                �
              </button>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No transactions yet</p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📤</span>
                        <span className="font-medium text-gray-900">{transaction.sender_name}</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">{transaction.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📥</span>
                        <span className="font-medium text-gray-900">{transaction.receiver_name}</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(transaction.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Transfer Section Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💸</span>
            Send Treats
          </h2>
          <p className="text-gray-600 mb-4">
            Transfer treats between cats. Select a sender, receiver, and amount to complete the transfer.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-orange-800 font-medium">Transfer interface coming soon...</p>
            <p className="text-sm text-orange-600 mt-1">
              This will be implemented in the next phase
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>MeowPay - Digital Wallet for Cats 🐱</p>
            <p className="mt-1">Built with Next.js, Node.js, and SQLite</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
