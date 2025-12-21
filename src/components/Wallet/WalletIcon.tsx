import React from 'react';

interface WalletIconProps {
  provider: string;
  size?: number;
  className?: string;
}

export default function WalletIcon({ provider, size = 24, className = '' }: WalletIconProps) {
  const logo = () => {
    switch (provider) {
      case 'metamask':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="metamask-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F6851B', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#E2761B', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#metamask-grad)" />
            <path d="M30 12l-8 6 1.5-3.5L30 12z" fill="#E17726" />
            <path d="M10 12l7.9 6.1L16.5 14.5 10 12z" fill="#E27625" />
            <path d="M27 26l-2 3 4.3 1.2L30 26h-3z" fill="#D5BFB2" />
            <path d="M10.7 26L11 30.2 15.3 29l-2-3h-2.6z" fill="#D5BFB2" />
            <path d="M15 21l-1.4 2.1 4.3.2-.1-4.6L15 21z" fill="#233447" />
            <path d="M25 21l-2.9-2.4-.1 4.7 4.3-.2L25 21z" fill="#233447" />
            <path d="M15.3 29l2.5-1.2-.2-1.6-2.3 2.8z" fill="#CC6228" />
            <path d="M22.2 27.8l2.5 1.2-2.3-2.8-.2 1.6z" fill="#CC6228" />
          </svg>
        );

      case 'phantom':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="phantom-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#AB9FF2', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#7C6FD8', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#phantom-grad)" />
            <path d="M20 10c-5.5 0-10 4.5-10 10v7c0 1.7 1.3 3 3 3h2c.6 0 1-.4 1-1v-3c0-.6.4-1 1-1s1 .4 1 1v3c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-3c0-.6.4-1 1-1s1 .4 1 1v3c0 .6.4 1 1 1h2c1.7 0 3-1.3 3-3v-7c0-5.5-4.5-10-10-10z" fill="white" />
            <circle cx="16" cy="19" r="1.5" fill="#7C6FD8" />
            <circle cx="24" cy="19" r="1.5" fill="#7C6FD8" />
          </svg>
        );

      case 'rabby':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="rabby-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8697FF', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#6077FF', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#rabby-grad)" />
            <path d="M14 12c-2 0-3 1.5-3 3v3c0 1 .5 2 1.5 2.5L11 24c-.5.8-.5 2 0 2.8l1 1.5c.5.8 1.5 1.2 2.5.9l3-1c1.5-.5 2.5-2 2.5-3.5v-8c0-2-1.5-4-3.5-4H14z" fill="white" opacity="0.9" />
            <path d="M26 12c2 0 3 1.5 3 3v3c0 1-.5 2-1.5 2.5l1.5 3.5c.5.8.5 2 0 2.8l-1 1.5c-.5.8-1.5 1.2-2.5.9l-3-1c-1.5-.5-2.5-2-2.5-3.5v-8c0-2 1.5-4 3.5-4H26z" fill="white" opacity="0.9" />
            <circle cx="17" cy="18" r="1.5" fill="#6077FF" />
            <circle cx="23" cy="18" r="1.5" fill="#6077FF" />
          </svg>
        );

      case 'coinbase':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="coinbase-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2E66F8', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#1652F0', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#coinbase-grad)" />
            <rect x="13" y="13" width="14" height="14" rx="2" fill="white" />
            <rect x="16" y="18" width="8" height="4" rx="1" fill="#1652F0" />
          </svg>
        );

      case 'trust':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="trust-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3375BB', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2A5C94', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#trust-grad)" />
            <path d="M20 10l-8 4v8c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5v-8l-8-4z" fill="white" />
            <path d="M20 14l-5 2.5v5c0 3.1 2.2 5.9 5 6.5V14z" fill="#3375BB" opacity="0.3" />
          </svg>
        );

      case 'tron':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="tron-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#EB0029', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#C4001F', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#tron-grad)" />
            <path d="M12 12l16 2-10 14 8-10-14-6z" fill="white" />
            <path d="M18 18l10-4-10 14z" fill="white" opacity="0.6" />
          </svg>
        );

      case 'walletconnect':
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="wc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#5B97F5', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#3B77D5', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#wc-grad)" />
            <path d="M13 17.5c3.3-3.3 8.7-3.3 12 0l.4.4c.2.2.2.4 0 .6l-1.4 1.4c-.1.1-.3.1-.4 0l-.5-.5c-2.3-2.3-6.1-2.3-8.4 0l-.6.6c-.1.1-.3.1-.4 0l-1.4-1.4c-.2-.2-.2-.4 0-.6l.7-.5zm14.8 2.9l1.2 1.2c.2.2.2.4 0 .6l-5.4 5.4c-.2.2-.6.2-.8 0l-3.8-3.8c-.1-.1-.2-.1-.2 0l-3.8 3.8c-.2.2-.6.2-.8 0L9.2 22c-.2-.2-.2-.4 0-.6l1.2-1.2c.2-.2.6-.2.8 0l3.8 3.8c.1.1.2.1.2 0l3.8-3.8c.2-.2.6-.2.8 0l3.8 3.8c.1.1.2.1.2 0l3.8-3.8c.2-.2.6-.2.8 0z" fill="white" />
          </svg>
        );

      default:
        return (
          <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
            <defs>
              <linearGradient id="default-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="url(#default-grad)" />
            <path d="M20 12c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 13c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="white" />
            <rect x="17" y="17" width="6" height="6" rx="1" fill="white" />
          </svg>
        );
    }
  };

  return <>{logo()}</>;
}
