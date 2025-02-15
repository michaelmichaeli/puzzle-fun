import { FC } from "react";

interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  className?: string;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  progress,
  message,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <div className="text-white font-comic text-center">
          {message}... {Math.round(progress)}%
        </div>
      )}
      <div className="h-2 bg-blue-400/10 rounded-full overflow-hidden relative">
        <div
          className={`h-full absolute top-0 left-0 transition-all duration-300 ease-out rounded-full shadow-sm 
            ${
              progress < 33
                ? "bg-pink-500 w-[" + progress + "%]"
                : progress < 66
                  ? "bg-yellow-500 w-[" + progress + "%]"
                  : "bg-green-500 w-[" + progress + "%]"
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
