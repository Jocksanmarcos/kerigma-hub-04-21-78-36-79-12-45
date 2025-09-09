import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export const useKerigmaToast = () => {
  const { toast } = useToast();

  const showToast = (type: ToastType, options: ToastOptions) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info
    };

    const Icon = icons[type];

    return toast({
      title: options.title,
      description: options.description,
      duration: options.duration || 5000,
      className: `toast-${type}`,
      action: options.action ? (
        <Button
          variant="outline"
          size="sm"
          onClick={options.action.onClick}
          className="bg-transparent border-current text-current hover:bg-current/10"
        >
          {options.action.text}
        </Button>
      ) : undefined
    });
  };

  return {
    success: (options: ToastOptions) => showToast('success', options),
    error: (options: ToastOptions) => showToast('error', options),
    warning: (options: ToastOptions) => showToast('warning', options),
    info: (options: ToastOptions) => showToast('info', options)
  };
};

// Pre-configured toast messages for common scenarios
export const useCommonToasts = () => {
  const kerigmaToast = useKerigmaToast();

  return {
    saveSuccess: () => kerigmaToast.success({
      title: 'Salvo com sucesso!',
      description: 'As informações foram atualizadas.'
    }),
    saveError: () => kerigmaToast.error({
      title: 'Erro ao salvar',
      description: 'Tente novamente em alguns instantes.'
    }),
    deleteSuccess: () => kerigmaToast.success({
      title: 'Excluído com sucesso!',
      description: 'O item foi removido permanentemente.'
    }),
    deleteError: () => kerigmaToast.error({
      title: 'Erro ao excluir',
      description: 'Não foi possível remover o item.'
    }),
    loading: () => kerigmaToast.info({
      title: 'Carregando...',
      description: 'Aguarde enquanto processamos sua solicitação.'
    }),
    networkError: () => kerigmaToast.error({
      title: 'Erro de conexão',
      description: 'Verifique sua internet e tente novamente.',
      action: {
        text: 'Tentar novamente',
        onClick: () => window.location.reload()
      }
    })
  };
};