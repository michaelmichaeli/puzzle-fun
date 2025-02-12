import { FC } from 'react';

interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  className?: string;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  progress,
  message,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <div className="text-[#4DB2EC] font-comic text-center">
          {message}... {Math.round(progress)}%
        </div>
      )}
      <div className="h-2 bg-[#4DB2EC]/10 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-[#4DB2EC] via-[#FFD800] to-[#4DB2EC] absolute top-0 left-0 transition-all duration-300 ease-out rounded-full shadow-sm"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
