import React, { useState } from 'react';
import { Wallet, LogOut, ChevronDown, Copy, Check, AlertCircle } from 'lucide-react';
import { useWallet, truncateAddress, formatChainId } from '../../hooks/useWallet';
import WalletSelector from './WalletSelector';
import WalletIcon from './WalletIcon';

export default function WalletConnect() {
  const { provider, address, chainId, blockchain, isConnecting, isConnected, error, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const pickWallet = (p: string) => {
    connect(p as any);
    setShowSelector(false);
  };

  if (error && !isConnecting && !isConnected) {
    return (
      <button
        onClick={() => setShowSelector(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors text-sm font-medium"
        title={error}
      >
        <AlertCircle className="h-4 w-4" />
        <span>Retry</span>
      </button>
    );
  }

  if (isConnected && address) {
    const providerName = provider?.charAt(0).toUpperCase() + (provider?.slice(1) || '');

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors text-sm font-medium"
        >
          <div className="w-5 h-5">
            <WalletIcon provider={provider || 'metamask'} size={20} />
          </div>
          <span>{truncateAddress(address)}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden="true"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <WalletIcon provider={provider || 'metamask'} size={32} />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">{providerName}</p>
                    <p className="text-xs text-gray-500">{formatChainId(chainId, blockchain)}</p>
                  </div>
                </div>
                <p className="font-mono text-sm text-gray-900 mt-1">{truncateAddress(address, 10)}</p>
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy address'}
              </button>
              <button
                onClick={async () => {
                  await disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? 'Connecting…' : 'Connect wallet'}
      </button>

      {showSelector && (
        <WalletSelector
          onSelect={pickWallet}
          onClose={() => setShowSelector(false)}
          isConnecting={isConnecting}
          error={error}
        />
      )}
    </>
  );
}
