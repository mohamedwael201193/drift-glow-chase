"use client";

import { useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import GameOver from "@/components/GameOver";
import Leaderboard from "@/components/Leaderboard";

type GameScreen = 'game' | 'gameOver' | 'leaderboard';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('game');
  const [lastScore, setLastScore] = useState(0);

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setCurrentScreen('gameOver');
  };

  const handleRestart = () => {
    setCurrentScreen('game');
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBackToGame = () => {
    setCurrentScreen('game');
  };

  return (
    <>
      {currentScreen === 'game' && (
        <GameCanvas onGameOver={handleGameOver} />
      )}
      
      {currentScreen === 'gameOver' && (
        <GameOver 
          score={lastScore}
          onRestart={handleRestart}
          onViewLeaderboard={handleViewLeaderboard}
        />
      )}
      
      {currentScreen === 'leaderboard' && (
        <Leaderboard onBackToGame={handleBackToGame} />
      )}
    </>
  );
};

export default Index;
