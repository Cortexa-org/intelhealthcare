import React, { useState } from 'react';
import { Shield, Wallet, ArrowRight } from 'lucide-react';
import { User as UserType, SubscriptionTier } from '../../types';
import { useWallet } from '../../hooks/useWallet';
import SubscriptionPlans from '../Subscription/SubscriptionPlans';
import WalletSelector from '../Wallet/WalletSelector';
import WalletIcon from '../Wallet/WalletIcon';
import { subscribeToPlan } from '../../services/subscriptionService';

interface AuthModalProps {
  onLoginWithWallet: (walletAddress: string) => Promise<UserType>;
}

export default function AuthModal({ onLoginWithWallet }: AuthModalProps) {
  const [mode, setMode] = useState<'wallet' | 'subscribe'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const { provider, address, isConnected, isConnecting, connect, error: walletError } = useWallet();

  const handleWalletLogin = async () => {
    if (!address || !onLoginWithWallet) return;
    setIsLoading(true);
    try {
      await onLoginWithWallet(address);
    } catch (error) {
      console.error('Wallet login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!address || !onLoginWithWallet) return;
    setIsLoading(true);
    try {
      await onLoginWithWallet(address);
      if (tier.id !== 'free') {
        const res = await subscribeToPlan(tier.id);
        if (!res.success) alert(`Subscription failed: ${res.error}`);
      }
    } catch (e) {
      alert('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const onPickWallet = (p: string) => {
    connect(p as any);
    setShowWalletSelector(false);
  };

  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Wallet';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-red-700 mb-2">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">PROTOTYPE ONLY</span>
          </div>
          <p className="text-sm text-red-600">
            This is a demonstration system. Do not enter real PHI or medical data.
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">IntelliHealth</h2>
          <p className="mt-2 text-gray-600">Web3 Healthcare Platform • No Email Required</p>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setMode('wallet')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              mode === 'wallet' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Wallet className="inline h-4 w-4 mr-1.5" />
            Connect Wallet
          </button>
          <button
            onClick={() => setMode('subscribe')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              mode === 'subscribe' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View Plans
          </button>
        </div>

        {mode === 'wallet' && (
          <div className="bg-white shadow-lg rounded-lg p-8 space-y-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-indigo-50">
                {isConnected && provider ? (
                  <WalletIcon provider={provider} size={40} />
                ) : (
                  <Wallet className="h-8 w-8 text-indigo-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">Connect Your Wallet</h3>
              <p className="text-gray-600 mt-2">Sign in with your wallet—no email needed</p>
            </div>

            {isConnected && address ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <WalletIcon provider={provider || 'metamask'} size={32} />
                    <div>
                      <p className="text-sm font-medium text-green-800">{providerName} connected</p>
                      <p className="text-xs font-mono text-green-700 mt-1">{address}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleWalletLogin}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Signing in...' : (
                    <>
                      Continue with {providerName} <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Free tier • Upgrade anytime
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                  <p className="text-sm text-indigo-800 mb-3 font-medium">Why use a wallet?</p>
                  <ul className="text-xs text-indigo-700 space-y-2">
                    <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">✓</span> No email or password</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">✓</span> Your data stays private</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">✓</span> Blockchain-verified consent</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">✓</span> MetaMask, Phantom, Rabby, and more</li>
                  </ul>
                </div>
                {walletError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{walletError}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowWalletSelector(true)}
                  disabled={isConnecting}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet className="h-5 w-5" />
                  {isConnecting ? 'Connecting...' : 'Choose wallet'}
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'subscribe' && (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <SubscriptionPlans
              currentTier={undefined}
              onSelect={handleSubscribe}
              walletConnected={isConnected}
            />
          </div>
        )}

        {showWalletSelector && (
          <WalletSelector
            onSelect={onPickWallet}
            onClose={() => setShowWalletSelector(false)}
            isConnecting={isConnecting}
            error={walletError}
          />
        )}
      </div>
    </div>
  );
}