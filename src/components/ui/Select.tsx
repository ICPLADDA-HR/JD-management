import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-sm font-medium text-primary-600 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-primary-200 focus:border-accent-500 focus:ring-accent-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-primary-50 disabled:text-primary-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {options ? (
            <>
              <option value="">Select...</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          ) : (
            children
          )}
        </select>
        {error && <p className="mt-1 text-caption text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-caption text-primary-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
