import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { AccessibleTooltip } from './accessible-tooltip';

interface AccessibleFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select';
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  help?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  className?: string;
  'aria-describedby'?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  type = 'text',
  label,
  id,
  value,
  onChange,
  error,
  help,
  required = false,
  placeholder,
  options,
  className = '',
  'aria-describedby': ariaDescribedBy
}) => {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  const renderInput = () => {
    const commonProps = {
      id,
      value,
      'aria-describedby': describedBy,
      'aria-invalid': error ? 'true' as const : 'false' as const,
      'aria-required': required,
      placeholder,
      className: `${error ? 'border-error focus:ring-error' : ''} ${className}`,
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger
              id={id}
              aria-describedby={describedBy}
              aria-invalid={error ? 'true' as const : 'false' as const}
              aria-required={required}
              className={error ? 'border-error focus:ring-error' : ''}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={id}
          className={`text-sm font-medium ${error ? 'text-error' : 'text-foreground'}`}
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-label="obrigatório">
              *
            </span>
          )}
        </Label>
        
        {help && (
          <AccessibleTooltip content={help}>
            <HelpCircle 
              className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help"
              aria-label="Ajuda"
            />
          </AccessibleTooltip>
        )}
      </div>

      {renderInput()}

      {help && (
        <p
          id={helpId}
          className="text-sm text-muted-foreground"
          role="note"
        >
          {help}
        </p>
      )}

      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-sm text-error"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};