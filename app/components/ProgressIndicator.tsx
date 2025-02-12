"use client";

import React from "react";

interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  message,
  className = "",
  showPercentage = true,
  color = "blue"
}) => {
  const getProgressColor = () => {
    switch (color) {
      case "blue":
        return "from-blue-500 to-blue-600";
      case "green":
        return "from-green-500 to-green-600";
      case "yellow":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-blue-500 to-blue-600";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <div className="text-sm text-gray-300 font-medium">
          {message}
          {showPercentage && ` (${Math.round(progress)}%)`}
        </div>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-300 ease-out transform origin-left`}
          style={{ 
            width: `${progress}%`,
            transition: "width 0.3s ease-out"
          }}
        />
      </div>
    </div>
  );
};
