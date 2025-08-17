"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Score {
  username: string;
  wallet_address: string;
  score: number;
  created_at: string;
}

interface LeaderboardProps {
  onBackToGame: () => void;
}

export default function Leaderboard({ onBackToGame }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast({
        title: "Failed to Load Leaderboard",
        description: "Could not fetch scores. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatWalletAddress = (address: string) => {
    if (address.startsWith('0x') && address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-neon-yellow';
      case 1: return 'text-neon-cyan';
      case 2: return 'text-neon-orange';
      default: return 'text-neon-green';
    }
  };

  return (
    <div className="relative min-h-screen p-6">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-track-scroll"
            style={{ 
              top: `${i * 7}%`, 
              animationDelay: `${i * 0.15}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold neon-text text-neon-cyan mb-4">
            LEADERBOARD
          </h1>
          <p className="text-neon-yellow text-xl font-mono">
            Top Drift Runners • Best Distances
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={onBackToGame}
            variant="outline"
            className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-background"
          >
            ← BACK TO GAME
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="bg-card/90 backdrop-blur-lg border border-neon-purple/30 rounded-2xl p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-neon-cyan text-xl font-mono animate-pulse">
                Loading leaderboard...
              </div>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neon-yellow text-xl font-mono mb-4">
                No scores yet!
              </div>
              <p className="text-muted-foreground">
                Be the first to set a record on the neon track.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, index) => (
                <div
                  key={`${score.username}-${score.created_at}`}
                  className={`leaderboard-entry ${getRankColor(index)} ${
                    index < 3 ? 'border-current' : 'border-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-12 text-center">
                        {getRankEmoji(index)}
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {score.username}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatWalletAddress(score.wallet_address)} • {formatDate(score.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold font-mono neon-text">
                        {score.score}m
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {scores.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/50 border border-neon-green/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-neon-green neon-text">
                {scores[0]?.score || 0}m
              </div>
              <div className="text-sm text-muted-foreground">Best Distance</div>
            </div>
            <div className="bg-card/50 border border-neon-cyan/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan neon-text">
                {scores.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
            <div className="bg-card/50 border border-neon-purple/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-neon-purple neon-text">
                {Math.round(scores.reduce((acc, score) => acc + score.score, 0) / scores.length) || 0}m
              </div>
              <div className="text-sm text-muted-foreground">Average Distance</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}