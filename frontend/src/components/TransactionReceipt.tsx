import type { TransferResponse } from '@/types/api';

interface TransactionReceiptProps {
  receipt: TransferResponse;
  onClose?: () => void;
}

export default function TransactionReceipt({ receipt, onClose }: TransactionReceiptProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🎉</span>
          Transfer Successful!
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Confirmation Code */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-center">
            <p className="text-sm text-green-700 mb-1">Confirmation Code</p>
            <p className="text-lg font-mono font-bold text-green-900 tracking-wider">
              {receipt.confirmationCode}
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="font-mono text-gray-900">#{receipt.transactionId}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Processing Time</p>
            <p className="font-mono text-gray-900">{receipt.processingTimeMs}ms</p>
          </div>
        </div>

        {/* Sender Details */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📤</span>
              <span className="font-medium text-gray-900">From: {receipt.from.name}</span>
            </div>
            <span className="text-lg font-bold text-orange-600">{receipt.amount}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-600">Previous Balance</p>
              <p className="font-mono text-gray-900">{receipt.from.previousBalance}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">New Balance</p>
              <p className="font-mono text-green-600 font-bold">{receipt.from.newBalance}</p>
            </div>
          </div>
        </div>

        {/* Receiver Details */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📥</span>
              <span className="font-medium text-gray-900">To: {receipt.to.name}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-600">Previous Balance</p>
              <p className="font-mono text-gray-900">{receipt.to.previousBalance}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">New Balance</p>
              <p className="font-mono text-green-600 font-bold">{receipt.to.newBalance}</p>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Transaction Time</p>
            <p className="font-mono text-gray-900">{formatDate(receipt.timestamp)}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center p-3 bg-green-100 rounded-lg border border-green-300">
          <span className="text-green-800 font-medium flex items-center">
            <span className="mr-2">✓</span>
            Transfer completed successfully
          </span>
        </div>
      </div>
    </div>
  );
}
