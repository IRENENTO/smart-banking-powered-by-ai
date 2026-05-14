import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends HTMLMotionProps<"button"> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className, 
  disabled,
  leftIcon,
  rightIcon,
  ...props 
}) => {
  const baseClasses = "relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden";
  
  const variants = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 dark:bg-[#0A9396] dark:hover:bg-[#087F82] focus:ring-blue-500 shadow-blue-500/30",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 focus:ring-blue-500",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30",
  };

  const classes = twMerge(clsx(
    baseClasses,
    variants[variant],
    (isLoading || disabled) && "opacity-70 cursor-not-allowed",
    className
  ));

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={classes}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* @ts-ignore: react-i18next type conflict with React 18 children */}
      <span className="flex items-center justify-center pointer-events-none">
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {!isLoading && leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
      </span>
    </motion.button>
  );
};
