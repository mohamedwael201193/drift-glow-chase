"use client";

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';

export default function AuthButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  // Wait for Privy to be ready
  if (!ready) {
    return (
      <Button variant="outline" disabled className="border-neon-cyan text-neon-cyan">
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className="btn-neon-cyan"
      >
        Sign in with Monad Games ID
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-neon-green font-mono text-sm">
        Connected: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
      </div>
      <Button
        onClick={logout}
        variant="outline"
        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-background"
      >
        Disconnect
      </Button>
    </div>
  );
}