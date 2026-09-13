'use client';

import { useState, useEffect } from 'react';
import { catApi } from '@/lib/api';
import type { Cat } from '@/types/api';
import CatCard from './CatCard';

interface CatAccountsProps {
  onCatSelect?: (cat: Cat) => void;
  selectedCatId?: number;
  showId?: boolean;
  refreshTrigger?: number;
}

export default function CatAccounts({ 
  onCatSelect, 
  selectedCatId, 
  showId = true,
  refreshTrigger 
}: CatAccountsProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await catApi.getAllCats();
      
      if (response.success) {
        setCats(response.data);
      } else {
        throw new Error('Failed to load cats');
      }
    } catch (err) {
      setError('Failed to load cat accounts');
      console.error('Error loading cats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, [refreshTrigger]);

  const handleCatSelect = (cat: Cat) => {
    if (onCatSelect) {
      onCatSelect(cat);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-gray-600">Loading cat accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={loadCats}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (cats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-3">🐱</div>
          <p className="text-gray-600 font-medium mb-3">No cat accounts found</p>
          <p className="text-sm text-gray-500">
            Initialize the database to create sample cat accounts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🐱</span>
          Cat Accounts
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{cats.length} cats</span>
          <button
            onClick={loadCats}
            className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((cat) => (
          <CatCard
            key={cat.id}
            cat={cat}
            onSelect={handleCatSelect}
            isSelected={selectedCatId === cat.id}
            showId={showId}
          />
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {cats.reduce((sum, cat) => sum + cat.balance, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Treats</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(cats.reduce((sum, cat) => sum + cat.balance, 0) / cats.length).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Average Balance</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(...cats.map(cat => cat.balance)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Highest Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
