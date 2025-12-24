import React, { useState } from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { WalletProvider } from '../../types';
import WalletIcon from './WalletIcon';

interface WalletOption {
  id: WalletProvider;
  name: string;
  description: string;
  blockchain: 'EVM' | 'Solana' | 'Tron';
  installUrl: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Most popular EVM wallet',
    blockchain: 'EVM',
    installUrl: 'https://metamask.io/download/',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Best for Solana',
    blockchain: 'Solana',
    installUrl: 'https://phantom.app/download',
  },
  {
    id: 'rabby',
    name: 'Rabby',
    description: 'Multi-chain EVM wallet',
    blockchain: 'EVM',
    installUrl: 'https://rabby.io/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Simple & secure',
    blockchain: 'EVM',
    installUrl: 'https://www.coinbase.com/wallet',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Mobile-first wallet',
    blockchain: 'EVM',
    installUrl: 'https://trustwallet.com/download',
  },
  {
    id: 'tron',
    name: 'TronLink',
    description: 'Official Tron wallet',
    blockchain: 'Tron',
    installUrl: 'https://www.tronlink.org/',
  },
];

interface WalletSelectorProps {
  onSelect: (provider: WalletProvider) => void;
  onClose: () => void;
  isConnecting?: boolean;
  error?: string | null;
}

export default function WalletSelector({ onSelect, onClose, isConnecting, error }: WalletSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'EVM' | 'Solana' | 'Tron'>('all');

  const filteredWallets = filter === 'all' 
    ? WALLET_OPTIONS 
    : WALLET_OPTIONS.filter(w => w.blockchain === filter);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
            <p className="text-sm text-gray-600 mt-1">Choose your preferred wallet provider</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Connection Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex gap-2">
            {(['all', 'EVM', 'Solana', 'Tron'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Wallets' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onSelect(wallet.id)}
                disabled={isConnecting}
                className="group relative p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <WalletIcon provider={wallet.id} size={56} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {wallet.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{wallet.description}</p>
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {wallet.blockchain}
                    </span>
                  </div>
                </div>
                <a
                  href={wallet.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
                  title="Install wallet"
                >
                  <ExternalLink className="h-4 w-4 text-gray-600" />
                </a>
              </button>
            ))}
          </div>

          {filteredWallets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No wallets found for this blockchain.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">New to wallets?</p>
              <p className="mt-1">
                Use the link icon on a wallet to install it. MetaMask works well to start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
