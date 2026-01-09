import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-sm font-medium text-primary-600 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 border ${
            error ? 'border-red-300 bg-red-50/30' : 'border-primary-200 bg-white/50'
          } rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-accent-500 transition-all duration-200 ease-out backdrop-blur-sm text-body placeholder:text-primary-300 ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-body-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-2 text-body-sm text-primary-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
