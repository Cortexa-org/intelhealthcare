import { useState, useEffect, useCallback } from 'react';
import { WalletProvider } from '../types';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
    };
    rabby?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
    phantom?: {
      solana?: {
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
        disconnect: () => Promise<void>;
        on?: (event: string, handler: (...args: unknown[]) => void) => void;
        publicKey?: { toString: () => string };
        isConnected?: boolean;
      };
    };
    tronWeb?: {
      ready: boolean;
      defaultAddress?: {
        base58?: string;
      };
      request?: (args: { method: string; params?: unknown }) => Promise<unknown>;
    };
    coinbaseWalletExtension?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export interface WalletState {
  provider: WalletProvider | null;
  address: string | null;
  chainId: number | string | null;
  blockchain: 'evm' | 'solana' | 'tron' | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

const STORAGE_KEY = 'intellihealth_wallet_connected';
const PROVIDER_KEY = 'intellihealth_wallet_provider';

function getCachedData(): { address: string; provider: WalletProvider } | null {
  try {
    const address = localStorage.getItem(STORAGE_KEY);
    const provider = localStorage.getItem(PROVIDER_KEY) as WalletProvider;
    return address && provider ? { address, provider } : null;
  } catch {
    return null;
  }
}

function setCachedData(address: string | null, provider: WalletProvider | null) {
  try {
    if (address && provider) {
      localStorage.setItem(STORAGE_KEY, address);
      localStorage.setItem(PROVIDER_KEY, provider);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROVIDER_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function useWallet() {
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | string | null>(null);
  const [blockchain, setBlockchain] = useState<'evm' | 'solana' | 'tron' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address && !!provider;

  const connectEVM = useCallback(async (selectedProvider: WalletProvider) => {
    let providerObj: typeof window.ethereum | typeof window.rabby;

    switch (selectedProvider) {
      case 'metamask':
        if (!window.ethereum?.isMetaMask) {
          setError('MetaMask not found. Install the extension first.');
          return;
        }
        providerObj = window.ethereum;
        break;
      case 'rabby':
        if (!window.rabby) {
          setError('Rabby not found. Install it first.');
          return;
        }
        providerObj = window.rabby;
        break;
      case 'coinbase':
        if (!window.ethereum?.isCoinbaseWallet && !window.coinbaseWalletExtension) {
          setError('Coinbase Wallet not found.');
          return;
        }
        providerObj = window.coinbaseWalletExtension || window.ethereum;
        break;
      case 'trust':
        if (!window.ethereum?.isTrust) {
          setError('Trust Wallet not found.');
          return;
        }
        providerObj = window.ethereum;
        break;
      default:
        if (!window.ethereum) {
          setError('No EVM wallet found.');
          return;
        }
        providerObj = window.ethereum;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const accounts = (await providerObj.request({
        method: 'eth_requestAccounts',
        params: [],
      })) as string[];
      const rawChainId = (await providerObj.request({
        method: 'eth_chainId',
        params: [],
      })) as string;
      const acc = accounts[0] ?? null;
      const cid = rawChainId ? parseInt(rawChainId, 16) : null;
      setProvider(selectedProvider);
      setAddress(acc);
      setChainId(cid);
      setBlockchain('evm');
      if (acc) setCachedData(acc, selectedProvider);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to connect wallet';
      setError(msg);
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setBlockchain(null);
      setCachedData(null, null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectPhantom = useCallback(async () => {
    if (!window.phantom?.solana) {
      setError('Phantom not found. Install it first.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const resp = await window.phantom.solana.connect();
      const addr = resp.publicKey.toString();
      setProvider('phantom');
      setAddress(addr);
      setChainId('solana-mainnet');
      setBlockchain('solana');
      setCachedData(addr, 'phantom');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Phantom connect failed';
      setError(msg);
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setBlockchain(null);
      setCachedData(null, null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectTron = useCallback(async () => {
    if (!window.tronWeb) {
      setError('TronLink not found.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      if (!window.tronWeb.ready) await new Promise((r) => setTimeout(r, 1000));

      if (window.tronWeb.ready && window.tronWeb.defaultAddress?.base58) {
        const addr = window.tronWeb.defaultAddress.base58;
        setProvider('tron');
        setAddress(addr);
        setChainId('tron-mainnet');
        setBlockchain('tron');
        setCachedData(addr, 'tron');
      } else {
        setError('Unlock TronLink and try again.');
        setProvider(null);
        setAddress(null);
        setChainId(null);
        setBlockchain(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to connect TronLink';
      setError(msg);
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setBlockchain(null);
      setCachedData(null, null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connect = useCallback(async (selectedProvider: WalletProvider) => {
    setError(null);
    if (selectedProvider === 'phantom') await connectPhantom();
    else if (selectedProvider === 'tron') await connectTron();
    else await connectEVM(selectedProvider);
  }, [connectEVM, connectPhantom, connectTron]);

  const disconnect = useCallback(async () => {
    if (provider === 'phantom' && window.phantom?.solana?.isConnected) {
      try {
        await window.phantom.solana.disconnect();
      } catch {
        /* ignore */
      }
    }

    setProvider(null);
    setAddress(null);
    setChainId(null);
    setBlockchain(null);
    setError(null);
    setCachedData(null, null);
  }, [provider]);

  useEffect(() => {
    if (blockchain !== 'evm') return;

    const providerObj = provider === 'rabby' ? window.rabby : window.ethereum;
    if (!providerObj?.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : [];
      const acc = (list[0] as string) ?? null;
      setAddress(acc);
      if (acc && provider) setCachedData(acc, provider);
      else setCachedData(null, null);
    };

    const handleChainChanged = (rawChainId: unknown) => {
      const hex = typeof rawChainId === 'string' ? rawChainId : String(rawChainId);
      setChainId(hex ? parseInt(hex, 16) : null);
    };

    providerObj.on('accountsChanged', handleAccountsChanged);
    providerObj.on('chainChanged', handleChainChanged);

    return () => {
      const p = providerObj as { removeListener?: (e: string, h: (...args: unknown[]) => void) => void } | undefined;
      if (p?.removeListener) {
        p.removeListener('accountsChanged', handleAccountsChanged);
        p.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [blockchain, provider]);

  useEffect(() => {
    if (provider !== 'phantom' || !window.phantom?.solana?.on) return;

    const handleDisconnect = () => {
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setBlockchain(null);
      setCachedData(null, null);
    };

    window.phantom.solana.on('disconnect', handleDisconnect);

    return () => {};
  }, [provider]);

  useEffect(() => {
    if (address || isConnecting) return;
    const cached = getCachedData();
    if (!cached) return;

    (async () => {
      try {
        if (cached.provider === 'phantom') {
          if (window.phantom?.solana?.isConnected && window.phantom.solana.publicKey) {
            const addr = window.phantom.solana.publicKey.toString();
            if (addr.toLowerCase() === cached.address.toLowerCase()) {
              setProvider('phantom');
              setAddress(addr);
              setChainId('solana-mainnet');
              setBlockchain('solana');
            } else {
              setCachedData(null, null);
            }
          }
        } else if (cached.provider === 'tron') {
          if (window.tronWeb?.ready && window.tronWeb.defaultAddress?.base58) {
            const addr = window.tronWeb.defaultAddress.base58;
            if (addr.toLowerCase() === cached.address.toLowerCase()) {
              setProvider('tron');
              setAddress(addr);
              setChainId('tron-mainnet');
              setBlockchain('tron');
            } else {
              setCachedData(null, null);
            }
          }
        } else {
          const providerObj = cached.provider === 'rabby' ? window.rabby : window.ethereum;
          if (providerObj) {
            const accounts = (await providerObj.request({
              method: 'eth_accounts',
              params: [],
            })) as string[];
            const rawChainId = (await providerObj.request({
              method: 'eth_chainId',
              params: [],
            })) as string;
            const acc = accounts[0] ?? null;
            const cid = rawChainId ? parseInt(rawChainId, 16) : null;
            if (acc && acc.toLowerCase() === cached.address.toLowerCase()) {
              setProvider(cached.provider);
              setAddress(acc);
              setChainId(cid);
              setBlockchain('evm');
            } else {
              setCachedData(null, null);
            }
          }
        }
      } catch {
        setCachedData(null, null);
      }
    })();
  }, [address, isConnecting]);

  return {
    provider,
    address,
    chainId,
    blockchain,
    isConnecting,
    isConnected,
    error,
    connect,
    disconnect,
  };
}

export function truncateAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function formatChainId(chainId: number | string | null, blockchain: string | null): string {
  if (chainId == null) return '—';
  
  if (blockchain === 'solana') return 'Solana';
  if (blockchain === 'tron') return 'Tron';
  
  if (typeof chainId === 'string') return chainId;
  
  const names: Record<number, string> = {
    1: 'Ethereum',
    5: 'Goerli',
    11155111: 'Sepolia',
    137: 'Polygon',
    56: 'BSC',
    43114: 'Avalanche',
    250: 'Fantom',
    42161: 'Arbitrum',
    10: 'Optimism',
    8453: 'Base',
  };
  return names[chainId] ?? `Chain ${chainId}`;
}
