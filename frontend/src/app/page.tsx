'use client';

import CatAccounts from '@/components/CatAccounts';
import TransactionHistory from '@/components/TransactionHistory';
import TransferForm from '@/components/TransferForm';

export default function Home() {
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
          <TransactionHistory limit={10} />
        </div>

        {/* Transfer Section */}
        <TransferForm />
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
