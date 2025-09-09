import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ConfiguracoesState {
  // Geral
  nomeIgreja: string;
  timezone: string;
  idioma: string;
  // Perfil
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  // Notificações
  emailNotif: boolean;
  pushNotif: boolean;
  smsNotif: boolean;
  // Segurança
  twoFactor: boolean;
  sessaoExpira: string;
  // Aparência
  tema: string;
  corPrimaria: string;
  // Sistema
  backup: boolean;
  manutencao: boolean;
}

export const useSystemConfigurations = () => {
  const { toast } = useToast();
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesState>({
    // Valores padrão
    nomeIgreja: 'Igreja Evangélica Kerigma',
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR',
    nome: 'João Silva',
    email: 'joao@igreja.com',
    telefone: '(11) 99999-9999',
    cargo: 'Pastor',
    emailNotif: true,
    pushNotif: true,
    smsNotif: false,
    twoFactor: false,
    sessaoExpira: '24h',
    tema: 'auto',
    corPrimaria: '#3b82f6',
    backup: true,
    manutencao: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar configurações do banco
  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_configurations')
        .select('config_key, config_value');

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações',
          variant: 'destructive'
        });
        return;
      }

      if (data && data.length > 0) {
        // Mesclar todas as configurações em um objeto único
        const configMerged: Partial<ConfiguracoesState> = {};
        
        data.forEach((item) => {
          const value = item.config_value;
          Object.assign(configMerged, value);
        });

        // Atualizar estado com as configurações carregadas
        setConfiguracoes(prev => ({ ...prev, ...configMerged }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao conectar com o banco de dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações no banco
  const salvarConfiguracoes = async () => {
    try {
      setSaving(true);

      // Organizar configurações por categoria
      const churchSettings = {
        nomeIgreja: configuracoes.nomeIgreja,
        timezone: configuracoes.timezone,
        idioma: configuracoes.idioma
      };

      const adminProfile = {
        nome: configuracoes.nome,
        email: configuracoes.email,
        telefone: configuracoes.telefone,
        cargo: configuracoes.cargo
      };

      const notifications = {
        emailNotif: configuracoes.emailNotif,
        pushNotif: configuracoes.pushNotif,
        smsNotif: configuracoes.smsNotif
      };

      const security = {
        twoFactor: configuracoes.twoFactor,
        sessaoExpira: configuracoes.sessaoExpira
      };

      const appearance = {
        tema: configuracoes.tema,
        corPrimaria: configuracoes.corPrimaria
      };

      const system = {
        backup: configuracoes.backup,
        manutencao: configuracoes.manutencao
      };

      // Upsert para cada categoria
      const updates = [
        { config_key: 'church_settings', config_value: churchSettings },
        { config_key: 'admin_profile', config_value: adminProfile },
        { config_key: 'notifications', config_value: notifications },
        { config_key: 'security', config_value: security },
        { config_key: 'appearance', config_value: appearance },
        { config_key: 'system', config_value: system }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_configurations')
          .upsert(update, { onConflict: 'config_key' });

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!',
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Carregar configurações na inicialização
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  return {
    configuracoes,
    setConfiguracoes,
    loading,
    saving,
    salvarConfiguracoes,
    carregarConfiguracoes
  };
};