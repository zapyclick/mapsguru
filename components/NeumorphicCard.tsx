
import React, { ReactNode } from 'react';

// FIX: Update NeumorphicCardProps to allow passing standard HTML attributes like onClick.
interface NeumorphicCardProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  // FIX: Restrict `as` prop to HTML element tags to resolve a type conflict.
  // The original `keyof JSX.IntrinsicElements` type was too broad, including SVG elements
  // which are incompatible with this component's `React.HTMLAttributes<HTMLElement>` props.
  // FIX: Corrected the type for the 'as' prop. `React.ReactHTML` is not a valid type. `keyof HTMLElementTagNameMap` provides the correct types for HTML tag names and resolves the compilation errors.
  as?: keyof HTMLElementTagNameMap; // Allows specifying the element type, e.g., 'div', 'section'
}

// FIX: Update component to accept and pass through any additional props to the underlying element.
export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ children, className = '', as: Component = 'div', ...rest }) => {
  return (
    <Component className={`bg-slate-200 dark:bg-slate-900 rounded-lg shadow-light-neumorphic dark:shadow-dark-neumorphic transition-all duration-300 ${className}`} {...rest}>
      {children}
    </Component>
  );
};

// A variation for inset (pressed) elements
// FIX: Update component to accept and pass through any additional props to the underlying element.
export const NeumorphicCardInset: React.FC<NeumorphicCardProps> = ({ children, className = '', as: Component = 'div', ...rest }) => {
  return (
    <Component className={`bg-slate-200 dark:bg-slate-800 rounded-lg shadow-light-neumorphic-inset dark:shadow-dark-neumorphic-inset transition-all duration-300 ${className}`} {...rest}>
      {children}
    </Component>
  );
};
