"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { submitOnchainScore, fetchMonadUsername } from "@/lib/monad";

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onViewLeaderboard: () => void;
}

export default function GameOver({ score, onRestart, onViewLeaderboard }: GameOverProps) {
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const { toast } = useToast();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    if (authenticated && user && wallets.length > 0) {
      const wallet = wallets[0];
      setWalletAddress(wallet.address);
      
      // Fetch username from Monad Games ID
      fetchMonadUsername(wallet.address).then((monadUsername) => {
        if (monadUsername) {
          setUsername(monadUsername);
        } else {
          setNeedsRegistration(true);
          // Fallback to shortened wallet address
          setUsername(`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`);
        }
      });
    }
  }, [authenticated, user, wallets]);

  const handleSubmit = async () => {
    if (!username.trim() || !walletAddress) {
      toast({
        title: "Authentication Required",
        description: "Please connect your Monad Games ID to submit your score.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user exists and has a better score
      const { data: existingScore } = await supabase
        .from('scores')
        .select('score')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingScore && existingScore.score >= score) {
        toast({
          title: "Score Not Improved",
          description: `Your best score is ${existingScore.score}m. Beat it to update the leaderboard!`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Submit to Supabase
      const { error: supabaseError } = await supabase
        .from('scores')
        .upsert({
          username: username.trim(),
          wallet_address: walletAddress,
          score: score
        }, {
          onConflict: 'wallet_address'
        });

      if (supabaseError) throw supabaseError;

      // Submit onchain
      if (wallets.length > 0) {
        const wallet = wallets[0];
        const walletClient = createWalletClient({
          chain: sepolia,
          transport: http('https://testnet-rpc.monad.xyz'),
          account: wallet.address as `0x${string}`,
        });

        const onchainResult = await submitOnchainScore(walletClient, walletAddress, score);
        
        if (onchainResult.success) {
          toast({
            title: "Score Submitted!",
            description: `Your distance of ${score}m has been recorded onchain and locally.`,
          });
        } else {
          toast({
            title: "Partial Success",
            description: "Score saved locally but onchain submission failed. You can try again later.",
            variant: "destructive"
          });
        }
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-red to-transparent animate-track-scroll"
            style={{ 
              top: `${i * 5}%`, 
              animationDelay: `${i * 0.1}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 bg-card/90 backdrop-blur-lg border border-neon-pink/30 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-5xl font-bold neon-text text-neon-pink mb-2">
            CRASHED!
          </h1>
          <div className="text-6xl font-mono font-bold text-neon-cyan neon-text mb-4">
            {score}m
          </div>
          <p className="text-neon-yellow text-lg">
            Distance Traveled
          </p>
        </div>

        {!authenticated ? (
          <div className="space-y-4">
            <div className="text-neon-yellow text-center mb-4">
              Connect your Monad Games ID to submit your score
            </div>
            <Button
              onClick={() => window.open('https://monad-games-id-site.vercel.app/', '_blank')}
              className="w-full btn-neon-cyan"
            >
              Sign in with Monad Games ID
            </Button>
          </div>
        ) : needsRegistration ? (
          <div className="space-y-4">
            <div className="text-neon-yellow text-center mb-4">
              Complete your Monad Games ID registration to submit scores
            </div>
            <Button
              onClick={() => window.open('https://monad-games-id-site.vercel.app/', '_blank')}
              className="w-full btn-neon-cyan"
            >
              Complete Registration
            </Button>
          </div>
        ) : !submitted ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-neon-green font-mono text-sm">
                Username
              </label>
              <Input
                type="text"
                value={username}
                disabled
                className="bg-background/50 border-neon-cyan/50 text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-neon-purple font-mono text-sm">
                Wallet Address
              </label>
              <Input
                type="text"
                value={walletAddress}
                disabled
                className="bg-background/50 border-neon-purple/50 text-foreground"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-neon-cyan"
            >
              {loading ? "SUBMITTING..." : "SUBMIT SCORE"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-neon-green text-lg font-mono">
              ✓ Score Submitted Successfully!
            </div>
            
            <Button
              onClick={onViewLeaderboard}
              className="w-full btn-neon-green"
            >
              VIEW LEADERBOARD
            </Button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={onRestart}
            variant="outline"
            className="flex-1 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-background"
          >
            PLAY AGAIN
          </Button>
          
          <Button
            onClick={onViewLeaderboard}
            variant="outline"
            className="flex-1 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background"
          >
            LEADERBOARD
          </Button>
        </div>
      </div>
    </div>
  );
}