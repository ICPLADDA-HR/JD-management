import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl backdrop-blur-sm';

  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 shadow-apple hover:shadow-apple-lg active:scale-[0.98]',
    secondary: 'bg-white/80 text-primary-600 hover:bg-white focus:ring-primary-200 border border-primary-200 hover:border-primary-300 backdrop-blur-md',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-apple active:scale-[0.98]',
    ghost: 'text-primary-600 hover:bg-primary-50/50 focus:ring-primary-200 backdrop-blur-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-body-sm',
    md: 'px-6 py-2.5 text-body',
    lg: 'px-8 py-3.5 text-body-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
