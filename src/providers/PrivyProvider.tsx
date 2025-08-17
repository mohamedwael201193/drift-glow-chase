"use client";

import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmd8euall0037le0my79qpz42"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#00ffe0',
          logo: undefined
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}