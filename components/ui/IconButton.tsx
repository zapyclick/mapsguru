
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`
        w-12 h-12 rounded-full flex items-center justify-center 
        bg-slate-200 dark:bg-slate-800 
        text-slate-600 dark:text-slate-300 
        shadow-light-neumorphic dark:shadow-dark-neumorphic 
        hover:shadow-light-neumorphic-inset dark:hover:shadow-dark-neumorphic-inset 
        active:shadow-light-neumorphic-inset dark:active:shadow-dark-neumorphic-inset
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
