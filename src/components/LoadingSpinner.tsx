import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'pulse' | 'bounce' | 'glow';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full`} />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-blue-400 to-purple-500 rounded-full`}
          />
        </motion.div>
        <p className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>{text}</p>
      </div>
    );
  }

  if (variant === 'bounce') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [-10, 0, -10]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          ))}
        </div>
        <p className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>{text}</p>
      </div>
    );
  }

  if (variant === 'glow') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative"
        >
          <Zap className={`${sizeClasses[size]} text-blue-500`} />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute inset-0 ${sizeClasses[size]} text-blue-300 blur-sm`}
          >
            <Zap className="w-full h-full" />
          </motion.div>
        </motion.div>
        <p className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
