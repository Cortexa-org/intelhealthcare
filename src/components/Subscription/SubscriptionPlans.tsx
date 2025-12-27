import React, { useState } from 'react';
import { Check, Zap, Star, Building, Wallet, Loader } from 'lucide-react';
import { SubscriptionTier } from '../../types';

const SUBSCRIPTION_PLANS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    priceUSD: 0,
    interval: 'month',
    features: [
      'Basic triage (5/month)',
      'View care timeline',
      'Messaging',
      'Up to 2 appointments',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '0.01 ETH/mo',
    priceUSD: 29,
    interval: 'month',
    features: [
      'Unlimited triage',
      'Full care timeline',
      'Priority messaging',
      'Unlimited appointments',
      'RPM monitoring (1 device)',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '0.03 ETH/mo',
    priceUSD: 79,
    interval: 'month',
    recommended: true,
    features: [
      'All Basic features',
      'AI-powered SOAP notes',
      'Multi-device RPM',
      'Labs & medication tracking',
      'Consent management',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    interval: 'year',
    features: [
      'All Premium features',
      'Governance dashboard',
      'Custom integrations (FHIR, HL7)',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
  },
];

interface SubscriptionPlansProps {
  currentTier?: SubscriptionTier['id'];
  onSelect: (tier: SubscriptionTier) => Promise<void>;
  walletConnected?: boolean;
}

export default function SubscriptionPlans({ currentTier, onSelect, walletConnected = false }: SubscriptionPlansProps) {
  const [busy, setBusy] = useState<string | null>(null);

  async function pick(plan: SubscriptionTier) {
    if (busy || !walletConnected) return;
    setBusy(plan.id);
    try {
      await onSelect(plan);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose your plan</h2>
        <p className="mt-2 text-gray-600">
          Subscribe with crypto. No email required.
        </p>
      </div>

      {!walletConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Wallet className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Connect wallet to subscribe</p>
            <p className="text-sm text-amber-700">
              Use the "Connect wallet" button in the header to get started.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const Icon = plan.id === 'free' ? Zap : plan.id === 'premium' ? Star : plan.id === 'enterprise' ? Building : Check;
          const active = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 bg-white hover:shadow-lg transition-all ${
                plan.recommended ? 'border-indigo-500 shadow-md' : active ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full">
                  Recommended
                </div>
              )}
              {active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  Current plan
                </div>
              )}
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  plan.recommended ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${plan.recommended ? 'text-indigo-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    {plan.priceUSD !== undefined && plan.priceUSD > 0 && (
                      <p className="text-sm text-gray-500 mt-1">~${plan.priceUSD}/mo</p>
                    )}
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => pick(plan)}
                  disabled={!walletConnected || active || !!busy}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    active ? 'bg-gray-100 text-gray-500 cursor-default' :
                    plan.recommended ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50' :
                    'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                  }`}
                >
                  {busy === plan.id ? (
                    <><Loader className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : active ? 'Current plan' : plan.id === 'free' ? 'Get started' : 'Subscribe'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
