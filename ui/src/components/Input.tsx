import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Reusable Input component with consistent styling
 */
const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  name,
  id,
  className = '',
  required = false,
  disabled = false,
  autoFocus = false,
  maxLength,
  onKeyPress
}) => {
  const baseClasses = 'input-field';
  const combinedClasses = `${baseClasses} ${className}`.trim();
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      id={id}
      className={combinedClasses}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      maxLength={maxLength}
      onKeyPress={onKeyPress}
    />
  );
};

export default Input;
