"use client";

import React from "react";

interface PuzzleGameStatusProps {
  isSolved: boolean;
  progress: number;
  onRestart: () => void;
}

export const PuzzleGameStatus: React.FC<PuzzleGameStatusProps> = ({ isSolved, progress, onRestart }) => {
  const getProgressColor = () => {
    if (progress <= 33) {
      return `from-red-500 via-red-400 to-yellow-500`;
    } else if (progress <= 66) {
      return `from-yellow-500 via-blue-400 to-blue-500`;
    }
    return `from-blue-500 via-green-400 to-green-500`;
  };

  return (
    <div className="space-y-4 select-none">
      <div className="text-center p-4">
        <div className="relative h-8">
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isSolved ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <p className="text-green-500 font-bold flex items-center gap-2">
              Puzzle Solved! 
              <span className="inline-block animate-[bounce_1s_ease-in-out_infinite]">🎉</span>
            </p>
          </div>
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              !isSolved ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <p className="text-white">Keep going, you&apos;re doing great!</p>
          </div>
        </div>
      </div>
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>
      <button
        onClick={onRestart}
        className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-lg transition-colors duration-200"
      >
        Restart Puzzle
      </button>
    </div>
  );
};
