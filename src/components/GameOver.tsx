"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to submit your score.",
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
        .eq('username', username.trim())
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

      // Submit or update score
      const { error } = await supabase
        .from('scores')
        .upsert({
          username: username.trim(),
          wallet_address: walletAddress.trim() || username.trim(),
          score: score
        }, {
          onConflict: 'username'
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Score Submitted!",
        description: `Your distance of ${score}m has been recorded.`,
      });
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

        {!submitted ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-neon-green font-mono text-sm">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50 border-neon-cyan/50 text-foreground placeholder:text-muted-foreground"
                maxLength={20}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-neon-purple font-mono text-sm">
                Wallet Address (Optional)
              </label>
              <Input
                type="text"
                placeholder="0x... (optional)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="bg-background/50 border-neon-purple/50 text-foreground placeholder:text-muted-foreground"
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