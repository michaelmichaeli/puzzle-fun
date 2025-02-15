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
          border-blue-400/20
          border-t-blue-400
          border-r-yellow-400
          shadow-lg
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-blue-400 to-yellow-400 opacity-20 rounded-full"></div>
      </div>
    </div>
  )
}
