import { SubscriptionTier } from '../types';

const API_BASE = '/api';

async function fakeTxHash() {
  await new Promise((r) => setTimeout(r, 2000));
  return `0x${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
}

export async function subscribeToPlan(tier: SubscriptionTier['id']) {
  const token = localStorage.getItem('auth_token');
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    let txHash: string | undefined;
    if (tier !== 'free') txHash = await fakeTxHash();

    const res = await fetch(`${API_BASE}/auth/wallet/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tier, transactionHash: txHash }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Subscription failed');
    }

    const data = await res.json();
    const saved = localStorage.getItem('intellihealth_user');
    if (saved) {
      const u = JSON.parse(saved);
      u.subscription = data.subscription;
      localStorage.setItem('intellihealth_user', JSON.stringify(u));
    }

    return { success: true, subscription: data.subscription };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Subscription failed',
    };
  }
}

export async function getSubscription() {
  const token = localStorage.getItem('auth_token');
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return { success: true, subscription: data.subscription };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to fetch subscription',
    };
  }
}

export async function cancelSubscription() {
  const token = localStorage.getItem('auth_token');
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch(`${API_BASE}/auth/wallet/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tier: 'free' }),
    });
    if (!res.ok) throw new Error('Failed to cancel');

    const saved = localStorage.getItem('intellihealth_user');
    if (saved) {
      const u = JSON.parse(saved);
      u.subscription = { tier: 'free', status: 'active', startDate: new Date().toISOString(), autoRenew: false };
      localStorage.setItem('intellihealth_user', JSON.stringify(u));
    }
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to cancel subscription',
    };
  }
}
