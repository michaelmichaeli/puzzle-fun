import { FC } from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  return (
    <div className="flex justify-center items-center relative">
      <div 
        className={`
          ${sizeClasses[size]} 
          animate-spin 
          rounded-full 
          border-[#4DB2EC]/20
          border-t-[#4DB2EC]
          border-r-[#FFD800]
          shadow-lg
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#4DB2EC] to-[#FFD800] opacity-20 rounded-full"></div>
      </div>
    </div>
  )
}
