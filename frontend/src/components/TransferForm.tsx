'use client';

import { useState, useEffect } from 'react';
import { catApi, transferApi } from '@/lib/api';
import { useRefresh } from '@/contexts/RefreshContext';
import type { Cat, TransferRequest, TransferValidationResponse, TransferResponse } from '@/types/api';
import TransactionReceipt from './TransactionReceipt';

interface TransferFormProps {
  onSuccess?: () => void;
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [senderId, setSenderId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<TransferValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransferResponse | null>(null);
  const { triggerRefresh } = useRefresh();

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = async () => {
    try {
      const response = await catApi.getAllCats();
      if (response.success) {
        setCats(response.data);
      }
    } catch (err) {
      console.error('Error loading cats:', err);
      setError('Failed to load cats');
    }
  };

  const handleSenderChange = (value: string) => {
    const id = parseInt(value);
    setSenderId(id);
    setValidation(null);
    setError(null);
    setSuccess(null);
  };

  const handleReceiverChange = (value: string) => {
    const id = parseInt(value);
    setReceiverId(id);
    setValidation(null);
    setError(null);
    setSuccess(null);
  };

  const handleAmountChange = (value: string) => {
    // Only allow positive numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setValidation(null);
    setError(null);
    setSuccess(null);
  };

  const validateTransfer = async () => {
    if (!senderId || !receiverId || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (senderId === receiverId) {
      setError('Sender and receiver must be different');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    if (amountNum > 10000) {
      setError('Maximum transfer amount is 10,000 treats');
      return;
    }

    try {
      setValidating(true);
      setError(null);
      
      const response = await transferApi.validateTransfer({
        senderId,
        receiverId,
        amount: amountNum
      });

      if (response.success && response.valid) {
        setValidation(response);
      } else {
        setError('Transfer is not possible - check balance and try again');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate transfer. Please check your connection and try again.');
    } finally {
      setValidating(false);
    }
  };

  const executeTransfer = async () => {
    if (!senderId || !receiverId || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!validation || !validation.data.transfer.feasible) {
      setError('Please validate the transfer first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await transferApi.executeTransfer({
        senderId,
        receiverId,
        amount: parseInt(amount)
      });

      if (response.success) {
        setReceipt(response.data);
        triggerRefresh();
        setTimeout(() => {
          onSuccess?.();
          resetForm();
        }, 5000);
      } else {
        setError('Transfer failed. Please try again or contact support if the problem persists.');
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError('Failed to execute transfer. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSenderId(null);
    setReceiverId(null);
    setAmount('');
    setValidation(null);
    setError(null);
    setReceipt(null);
  };

  const selectedSender = cats.find(cat => cat.id === senderId);
  const selectedReceiver = cats.find(cat => cat.id === receiverId);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <span className="mr-2">💸</span>
        Send Treats
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Transfer Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {receipt && (
        <div className="mb-6">
          <TransactionReceipt 
            receipt={receipt} 
            onClose={() => setReceipt(null)} 
          />
        </div>
      )}

      <div className="space-y-6">
        {/* Sender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From (Sender)
          </label>
          <select
            value={senderId || ''}
            onChange={(e) => handleSenderChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a cat</option>
            {cats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.balance} treats)
              </option>
            ))}
          </select>
          {selectedSender && (
            <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{selectedSender.name}</span>
                <span className="text-lg font-bold text-orange-600">{selectedSender.balance}</span>
              </div>
            </div>
          )}
        </div>

        {/* Receiver Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To (Receiver)
          </label>
          <select
            value={receiverId || ''}
            onChange={(e) => handleReceiverChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a cat</option>
            {cats.map((cat) => (
              <option key={cat.id} value={cat.id} disabled={cat.id === senderId}>
                {cat.name} ({cat.balance} treats) {cat.id === senderId ? '(cannot send to yourself)' : ''}
              </option>
            ))}
          </select>
          {selectedReceiver && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{selectedReceiver.name}</span>
                <span className="text-lg font-bold text-blue-600">{selectedReceiver.balance}</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loading}
            max={10000}
          />
          <p className="text-xs text-gray-500 mt-1">Maximum: 10,000 treats per transfer</p>
        </div>

        {/* Validation Preview */}
        {validation && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Transfer Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sender new balance:</span>
                <span className="font-medium text-gray-900">{validation.data.transfer.newSenderBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receiver new balance:</span>
                <span className="font-medium text-gray-900">{validation.data.transfer.newReceiverBalance}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${validation.data.transfer.feasible ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.data.transfer.feasible ? '✓ Feasible' : '✗ Not feasible'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={resetForm}
            disabled={loading}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            onClick={validateTransfer}
            disabled={!senderId || !receiverId || !amount || validating || loading}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {validating ? 'Validating...' : 'Validate Transfer'}
          </button>
          <button
            onClick={executeTransfer}
            disabled={!validation || !validation.data.transfer.feasible || loading}
            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Send Treats'}
          </button>
        </div>
      </div>
    </div>
  );
}
