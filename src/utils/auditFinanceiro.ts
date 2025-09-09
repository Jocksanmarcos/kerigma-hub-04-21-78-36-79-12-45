import { supabase } from "@/integrations/supabase/client";
import { captureMessage } from "./errorReporting";

interface AuditLogData {
  usuario_id?: string;
  tipo_operacao: 'CREATE' | 'UPDATE' | 'DELETE';
  tabela: string;
  registro_id: string;
  dados_anteriores?: any;
  dados_novos?: any;
  ip_address?: string;
  user_agent?: string;
  detalhes_adicionais?: any;
}

export const logAuditoria = async (data: AuditLogData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const auditData = {
      usuario_id: user?.id || data.usuario_id,
      tipo_acao: 'audit_transaction',
      acao: `${data.tipo_operacao.toLowerCase()}_${data.tabela}`,
      detalhes: {
        tabela: data.tabela,
        registro_id: data.registro_id,
        dados_anteriores: data.dados_anteriores,
        dados_novos: data.dados_novos,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        ...data.detalhes_adicionais
      },
      nivel_log: data.tipo_operacao === 'DELETE' ? 'warning' : 'info',
      ip_address: data.ip_address || 'unknown'
    };

    const { error } = await supabase
      .from('logs_sistema')
      .insert([auditData]);

    if (error) {
      console.error('Erro ao salvar log de auditoria:', error);
      captureMessage('Falha no log de auditoria', 'warning', { error: error.message, data: auditData });
    }
  } catch (error) {
    console.error('Erro inesperado no log de auditoria:', error);
    captureMessage('Erro inesperado no log de auditoria', 'error', { error });
  }
};

export const logTransacaoFinanceira = async (operacao: 'CREATE' | 'UPDATE' | 'DELETE', lancamentoId: string, dadosAnteriores?: any, dadosNovos?: any) => {
  await logAuditoria({
    tipo_operacao: operacao,
    tabela: 'lancamentos_financeiros_v2',
    registro_id: lancamentoId,
    dados_anteriores: dadosAnteriores,
    dados_novos: dadosNovos,
    detalhes_adicionais: {
      modulo: 'financeiro',
      categoria: 'transacao',
      timestamp: new Date().toISOString()
    }
  });
};