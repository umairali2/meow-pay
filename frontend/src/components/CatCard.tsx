import type { Cat } from '@/types/api';

interface CatCardProps {
  cat: Cat;
  onSelect?: (cat: Cat) => void;
  isSelected?: boolean;
  showId?: boolean;
}

export default function CatCard({ cat, onSelect, isSelected = false, showId = true }: CatCardProps) {
  const getBalanceColor = (balance: number) => {
    if (balance >= 100) return 'text-green-600';
    if (balance >= 50) return 'text-orange-600';
    if (balance >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceBackground = (balance: number) => {
    if (balance >= 100) return 'bg-green-50 border-green-200';
    if (balance >= 50) return 'bg-orange-50 border-orange-200';
    if (balance >= 20) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString();
  };

  return (
    <div
      onClick={() => onSelect?.(cat)}
      className={`
        relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}
        ${getBalanceBackground(cat.balance)}
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          ✓
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🐱</div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{cat.name}</h3>
            {showId && (
              <p className="text-xs text-gray-500">ID: {cat.id}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <p className={`text-3xl font-bold ${getBalanceColor(cat.balance)}`}>
              {formatBalance(cat.balance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">treats</p>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance indicator bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((cat.balance / 200) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {Math.min(Math.round((cat.balance / 200) * 100), 100)}% of max
        </p>
      </div>
    </div>
  );
}
