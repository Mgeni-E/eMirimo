import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-primary-600`}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export const PageLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <Loading size="lg" text="Loading page..." />
  </div>
);

export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center p-4">
    <Loading size="sm" text={text} />
  </div>
);
