import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';

interface EnhancedFormFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  mask?: 'phone' | 'cpf' | 'cnpj' | 'date';
  className?: string;
}

export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  value,
  onChange,
  required = false,
  mask,
  className
}) => {
  const applyMask = (value: string, maskType?: string) => {
    if (!maskType) return value;
    
    switch (maskType) {
      case 'phone':
        return value
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
          .substring(0, 15);
      case 'cpf':
        return value
          .replace(/\D/g, '')
          .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          .substring(0, 14);
      case 'cnpj':
        return value
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
          .substring(0, 18);
      case 'date':
        return value
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
          .substring(0, 10);
      default:
        return value;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyMask(e.target.value, mask);
    if (onChange) {
      e.target.value = maskedValue;
      onChange(e);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={id} 
        className="text-responsive-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && <span className="text-accent">*</span>}
      </Label>
      
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full transition-all duration-200',
          error && 'border-error focus:ring-error'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      
      {error && (
        <p id={`${id}-error`} className="text-responsive-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
};

interface EnhancedFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  title?: string;
  description?: string;
}

export const EnhancedForm: React.FC<EnhancedFormProps> = ({
  children,
  onSubmit,
  className,
  title,
  description
}) => {
  return (
    <form 
      onSubmit={onSubmit}
      className={cn(
        'space-y-6 bg-card p-6 rounded-kerigma shadow-kerigma border border-border',
        className
      )}
      noValidate
    >
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-responsive-lg font-semibold text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-responsive-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </form>
  );
};