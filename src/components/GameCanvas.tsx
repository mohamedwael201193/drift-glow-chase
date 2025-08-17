"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface GameCanvasProps {
  onGameOver: (score: number) => void;
}

interface TrackSegment {
  id: number;
  x: number;
  y: number;
  width: number;
  curve: number;
}

export default function GameCanvas({ onGameOver }: GameCanvasProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');
  const [score, setScore] = useState(0);
  const [carPosition, setCarPosition] = useState(50); // percentage from left
  const [trackSegments, setTrackSegments] = useState<TrackSegment[]>([]);
  const [speed, setSpeed] = useState(1);
  const [driftDirection, setDriftDirection] = useState<'left' | 'right' | null>(null);
  
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const trackWidthRef = useRef(60); // percentage of screen width

  // Initialize track segments
  useEffect(() => {
    const initialSegments: TrackSegment[] = [];
    for (let i = 0; i < 20; i++) {
      initialSegments.push({
        id: i,
        x: 50, // center
        y: i * 50,
        width: trackWidthRef.current,
        curve: (Math.random() - 0.5) * 2 // -1 to 1
      });
    }
    setTrackSegments(initialSegments);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === 'waiting') {
        startGame();
        return;
      }
      keysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
      setDriftDirection(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCarPosition(50);
    setSpeed(1);
  }, []);

  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    onGameOver(score);
  }, [score, onGameOver]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      // Handle input
      let newCarPosition = carPosition;
      let newDriftDirection = null;

      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) {
        newCarPosition = Math.max(10, carPosition - 2);
        newDriftDirection = 'left';
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) {
        newCarPosition = Math.min(90, carPosition + 2);
        newDriftDirection = 'right';
      }

      setCarPosition(newCarPosition);
      setDriftDirection(newDriftDirection);

      // Update track segments (move them down)
      setTrackSegments(prev => {
        const updated = prev.map(segment => ({
          ...segment,
          y: segment.y + speed * 3
        }));

        // Remove segments that are off screen and add new ones
        const filtered = updated.filter(segment => segment.y < window.innerHeight + 100);
        
        // Add new segments at the top
        while (filtered.length < 20) {
          const lastSegment = filtered[filtered.length - 1];
          const newCurve = (Math.random() - 0.5) * 3; // More dramatic curves
          const newX = Math.max(20, Math.min(80, lastSegment.x + newCurve));
          
          filtered.push({
            id: lastSegment.id + 1,
            x: newX,
            y: lastSegment.y - 50,
            width: trackWidthRef.current + (Math.random() - 0.5) * 10,
            curve: newCurve
          });
        }

        return filtered;
      });

      // Check collision (simplified)
      const currentSegment = trackSegments.find(segment => 
        segment.y > window.innerHeight * 0.7 && segment.y < window.innerHeight * 0.8
      );

      if (currentSegment) {
        const trackLeft = currentSegment.x - currentSegment.width / 2;
        const trackRight = currentSegment.x + currentSegment.width / 2;
        
        if (newCarPosition < trackLeft + 5 || newCarPosition > trackRight - 5) {
          endGame();
          return;
        }
      }

      // Update score and speed
      setScore(prev => prev + Math.floor(speed));
      setSpeed(prev => Math.min(3, prev + 0.001)); // Gradually increase speed

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, carPosition, trackSegments, speed, endGame]);

  if (gameState === 'waiting') {
    return (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
        
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-track-scroll"
              style={{ top: `${i * 10}%`, animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <div className="text-center z-10">
          <h1 className="text-6xl md:text-8xl font-bold neon-text text-neon-cyan mb-6">
            NEON DRIFT
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold neon-text text-neon-pink mb-8">
            RUNNER
          </h2>
          <p className="text-xl text-neon-yellow mb-8 font-mono">
            Use ← → arrows or A/D to drift • Stay on track • Beat the distance record
          </p>
          <button
            onClick={startGame}
            className="btn-neon-cyan text-xl px-8 py-4"
          >
            Press SPACE to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-background to-card">
      {/* Score Display */}
      <div className="game-ui top-6 left-6">
        <div className="text-4xl font-bold text-neon-cyan">
          {Math.floor(score)}m
        </div>
        <div className="text-lg text-neon-yellow">
          Speed: {speed.toFixed(1)}x
        </div>
      </div>

      {/* Instructions */}
      <div className="game-ui top-6 right-6 text-right">
        <div className="text-lg text-neon-green">
          ← → Drift
        </div>
      </div>

      {/* Track */}
      <div className="absolute inset-0">
        {trackSegments.map((segment, index) => (
          <div
            key={segment.id}
            className="absolute track-segment"
            style={{
              left: `${segment.x - segment.width / 2}%`,
              top: `${segment.y}px`,
              width: `${segment.width}%`,
              height: '50px',
              opacity: Math.max(0.3, 1 - (index * 0.05))
            }}
          />
        ))}
      </div>

      {/* Car */}
      <div
        className={`absolute car-element ${driftDirection ? `animate-drift-${driftDirection}` : ''}`}
        style={{
          left: `${carPosition}%`,
          bottom: '25%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        <div className="car-trail"></div>
        <div className="w-8 h-16 bg-gradient-to-b from-neon-cyan to-neon-blue rounded-lg relative">
          {/* Car body */}
          <div className="absolute inset-1 bg-gradient-to-b from-neon-pink to-neon-purple rounded"></div>
          {/* Car lights */}
          <div className="absolute top-1 left-1 w-1 h-2 bg-neon-yellow rounded-full"></div>
          <div className="absolute top-1 right-1 w-1 h-2 bg-neon-yellow rounded-full"></div>
          {/* Exhaust trail */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-b from-neon-orange to-transparent rounded-full opacity-80"></div>
        </div>
      </div>

      {/* Side barriers for visual effect */}
      <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-neon-purple/50 to-transparent"></div>
      <div className="absolute right-0 top-0 w-4 h-full bg-gradient-to-l from-neon-purple/50 to-transparent"></div>
    </div>
  );
}