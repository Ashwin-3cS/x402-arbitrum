"use client";

import React, { useState, useEffect } from 'react';

interface Streak {
  id: string;
  x: number;
  y: number;
  isVertical: boolean;
  direction: 'down' | 'up' | 'right' | 'left';
  length: number;
  delay: number;
  duration: number;
}

const AnimatedGridBackground: React.FC = () => {
  const [streaks, setStreaks] = useState<Streak[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const GRID_SIZE = 40;
    const MIN_LENGTH = 40;
    const MAX_LENGTH = 100;
    const MIN_DURATION = 8000; // Slower - 8 seconds
    const MAX_DURATION = 12000; // Slower - 12 seconds

    const createStreak = (
      isVertical: boolean,
      direction: 'down' | 'up' | 'right' | 'left',
      gridIndex: number
    ): Streak => {
      const length = MIN_LENGTH + Math.random() * (MAX_LENGTH - MIN_LENGTH);
      const duration = MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
      
      let x: number, y: number;

      if (isVertical) {
        // Vertical streak on a specific grid line
        x = gridIndex * GRID_SIZE;
        if (direction === 'down') {
          y = -length;
        } else {
          y = window.innerHeight + length;
        }
      } else {
        // Horizontal streak on a specific grid line
        y = gridIndex * GRID_SIZE;
        if (direction === 'right') {
          x = -length;
        } else {
          x = window.innerWidth + length;
        }
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        isVertical,
        direction,
        length,
        delay: Math.random() * 2000,
        duration,
      };
    };

    const generateStreaks = (): Streak[] => {
      const streaks: Streak[] = [];
      
      // Get available grid lines
      const maxVerticalLines = Math.floor(window.innerWidth / GRID_SIZE);
      const maxHorizontalLines = Math.floor(window.innerHeight / GRID_SIZE);
      
      // Ensure at least 1 from each direction
      // 1 from top (down)
      const topGridLine = Math.floor(Math.random() * maxVerticalLines);
      streaks.push(createStreak(true, 'down', topGridLine));
      
      // 1 from bottom (up)
      const bottomGridLine = Math.floor(Math.random() * maxVerticalLines);
      streaks.push(createStreak(true, 'up', bottomGridLine));
      
      // 1 from left (right)
      const leftGridLine = Math.floor(Math.random() * maxHorizontalLines);
      streaks.push(createStreak(false, 'right', leftGridLine));
      
      // 1 from right (left)
      const rightGridLine = Math.floor(Math.random() * maxHorizontalLines);
      streaks.push(createStreak(false, 'left', rightGridLine));
      
      // Add a couple more random ones for variety
      for (let i = 0; i < 2; i++) {
        const isVertical = Math.random() > 0.5;
        if (isVertical) {
          const gridIndex = Math.floor(Math.random() * maxVerticalLines);
          const direction = Math.random() > 0.5 ? 'down' : 'up';
          streaks.push(createStreak(true, direction, gridIndex));
        } else {
          const gridIndex = Math.floor(Math.random() * maxHorizontalLines);
          const direction = Math.random() > 0.5 ? 'right' : 'left';
          streaks.push(createStreak(false, direction, gridIndex));
        }
      }
      
      return streaks;
    };

    // Defer state update to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setStreaks(generateStreaks());
    }, 0);

    const handleResize = () => {
      setStreaks(generateStreaks());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="animated-grid-container">
      {streaks.map((streak) => (
        <div
          key={streak.id}
          className={`grid-streak ${streak.isVertical ? 'vertical' : 'horizontal'} ${streak.direction}`}
          style={{
            '--x': `${streak.x}px`,
            '--y': `${streak.y}px`,
            '--length': `${streak.length}px`,
            '--duration': `${streak.duration}ms`,
            '--delay': `${streak.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default AnimatedGridBackground;

