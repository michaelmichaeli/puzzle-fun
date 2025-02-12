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
      return `from-red-500 to-yellow-500`;
    } else if (progress <= 66) {
      return `from-yellow-500 to-blue-500`;
    }
    return `from-blue-500 to-green-500`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-4">
        {isSolved ? (
          <p className="text-green-500 font-bold">Puzzle Solved! 🎉</p>
        ) : (
          <p className="text-white">Keep going, you&apos;re doing great!</p>
        )}
      </div>
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <button
        onClick={onRestart}
        className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
      >
        Restart Puzzle
      </button>
    </div>
  );
};
