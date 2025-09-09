import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  old_record?: any;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Supabase environment variables missing");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const payload: WebhookPayload = await req.json();

    console.log('Webhook received:', payload);

    // Processar webhook baseado no tipo e tabela
    switch (payload.table) {
      case 'eventos':
        await handleEventoWebhook(supabase, payload);
        break;
      
      case 'celulas':
        await handleCelulaWebhook(supabase, payload);
        break;
      
      case 'pessoas':
        await handlePessoaWebhook(supabase, payload);
        break;
      
      case 'lancamentos_financeiros_v2':
        await handleLancamentoWebhook(supabase, payload);
        break;
      
      case 'relatorios_semanais_celulas':
        await handleRelatorioWebhook(supabase, payload);
        break;
      
      default:
        console.log(`Webhook não tratado para tabela: ${payload.table}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Webhook para eventos
async function handleEventoWebhook(supabase: any, payload: WebhookPayload) {
  const { type, record } = payload;

  switch (type) {
    case 'INSERT':
      // Notificar sobre novo evento
      await notificarNovoEvento(supabase, record);
      
      // Sincronizar com sistemas externos se necessário
      await sincronizarEvento(supabase, record, 'create');
      break;
    
    case 'UPDATE':
      // Notificar sobre atualização do evento
      if (record.data_inicio !== payload.old_record?.data_inicio) {
        await notificarMudancaEvento(supabase, record, 'data_alterada');
      }
      
      if (record.inscricoes_abertas && !payload.old_record?.inscricoes_abertas) {
        await notificarInscricoesAbertas(supabase, record);
      }
      
      await sincronizarEvento(supabase, record, 'update');
      break;
    
    case 'DELETE':
      await notificarEventoCancelado(supabase, payload.old_record);
      await sincronizarEvento(supabase, payload.old_record, 'delete');
      break;
  }
}

// Webhook para células
async function handleCelulaWebhook(supabase: any, payload: WebhookPayload) {
  const { type, record } = payload;

  switch (type) {
    case 'INSERT':
      // Nova célula criada
      await notificarNovaCelula(supabase, record);
      
      // Atualizar permissões do líder
      if (record.lider_id) {
        await atualizarPermissoesLider(supabase, record.lider_id, record.id);
      }
      break;
    
    case 'UPDATE':
      // Mudança de liderança
      if (record.lider_id !== payload.old_record?.lider_id) {
        // Remover permissões do líder anterior
        if (payload.old_record?.lider_id) {
          await removerPermissoesLider(supabase, payload.old_record.lider_id, record.id);
        }
        
        // Adicionar permissões para novo líder
        if (record.lider_id) {
          await atualizarPermissoesLider(supabase, record.lider_id, record.id);
        }
        
        await notificarMudancaLideranca(supabase, record, payload.old_record);
      }
      
      // Multiplicação da célula
      if (record.data_multiplicacao && !payload.old_record?.data_multiplicacao) {
        await processarMultiplicacao(supabase, record);
      }
      break;
  }
}

// Webhook para pessoas
async function handlePessoaWebhook(supabase: any, payload: WebhookPayload) {
  const { type, record } = payload;

  switch (type) {
    case 'INSERT':
      // Nova pessoa cadastrada
      await processarNovaPessoa(supabase, record);
      break;
    
    case 'UPDATE':
      // Mudança de célula
      if (record.celula_id !== payload.old_record?.celula_id) {
        await notificarMudancaCelula(supabase, record, payload.old_record);
      }
      
      // Mudança de papel na igreja
      if (record.papel_igreja !== payload.old_record?.papel_igreja) {
        await atualizarPermissoesPessoa(supabase, record);
      }
      break;
  }
}

// Webhook para lançamentos financeiros
async function handleLancamentoWebhook(supabase: any, payload: WebhookPayload) {
  const { type, record } = payload;

  switch (type) {
    case 'INSERT':
      // Novo lançamento criado
      if (record.valor > 1000) { // Valores altos requerem notificação
        await notificarLancamentoAlto(supabase, record);
      }
      
      await atualizarCacheFinanceiro(supabase);
      break;
    
    case 'UPDATE':
      if (record.status !== payload.old_record?.status) {
        await notificarMudancaStatusLancamento(supabase, record);
      }
      
      await atualizarCacheFinanceiro(supabase);
      break;
  }
}

// Webhook para relatórios de células
async function handleRelatorioWebhook(supabase: any, payload: WebhookPayload) {
  const { type, record } = payload;

  switch (type) {
    case 'INSERT':
      // Novo relatório de célula
      await notificarRelatorioEnviado(supabase, record);
      
      // Atualizar estatísticas da célula
      await atualizarEstatisticasCelula(supabase, record.celula_id);
      break;
    
    case 'UPDATE':
      if (record.status !== payload.old_record?.status) {
        await notificarMudancaStatusRelatorio(supabase, record);
      }
      break;
  }
}

// Funções de notificação
async function notificarNovoEvento(supabase: any, evento: any) {
  // Notificar líderes sobre novo evento
  const { data: lideres } = await supabase
    .from('pessoas')
    .select('id, nome_completo, email')
    .in('papel_igreja', ['pastor', 'lider', 'coordenador']);

  for (const lider of lideres || []) {
    await supabase
      .from('notificacoes')
      .insert({
        pessoa_id: lider.id,
        titulo: 'Novo Evento Criado',
        mensagem: `O evento "${evento.titulo}" foi criado para ${new Date(evento.data_inicio).toLocaleDateString()}`,
        tipo: 'evento',
        lida: false
      });
  }
}

async function notificarInscricoesAbertas(supabase: any, evento: any) {
  // Notificar todos os membros sobre inscrições abertas
  const { data: membros } = await supabase
    .from('pessoas')
    .select('id')
    .eq('situacao', 'ativo');

  const notificacoes = membros?.map(membro => ({
    pessoa_id: membro.id,
    titulo: 'Inscrições Abertas!',
    mensagem: `As inscrições para "${evento.titulo}" estão abertas!`,
    tipo: 'evento',
    lida: false
  })) || [];

  if (notificacoes.length > 0) {
    await supabase
      .from('notificacoes')
      .insert(notificacoes);
  }
}

async function atualizarPermissoesLider(supabase: any, pessoa_id: string, celula_id: string) {
  // Adicionar permissões específicas para líder de célula
  const permissoes = [
    'gerenciar_celula',
    'criar_relatorio',
    'gerenciar_membros_celula',
    'agendar_reunioes'
  ];

  for (const permissao of permissoes) {
    await supabase
      .from('permissoes_pessoa')
      .upsert({
        pessoa_id,
        permissao,
        recurso_id: celula_id,
        recurso_tipo: 'celula',
        ativo: true
      });
  }
}

async function sincronizarEvento(supabase: any, evento: any, acao: 'create' | 'update' | 'delete') {
  // Sincronizar com sistemas externos (ex: calendário, app mobile)
  const syncData = {
    acao,
    evento,
    timestamp: new Date().toISOString()
  };

  await supabase
    .from('sync_queue')
    .insert({
      tipo: 'evento',
      dados: syncData,
      status: 'pendente',
      tentativas: 0
    });
}

async function atualizarCacheFinanceiro(supabase: any) {
  // Limpar cache de relatórios financeiros
  await supabase
    .from('cache_relatorios')
    .delete()
    .eq('tipo', 'financeiro');
  
  // Recalcular saldos
  const hoje = new Date().toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const { data: receitas } = await supabase
    .from('lancamentos_financeiros_v2')
    .select('valor')
    .eq('tipo', 'receita')
    .eq('status', 'confirmado')
    .gte('data_lancamento', inicioMes)
    .lte('data_lancamento', hoje);
  
  const { data: despesas } = await supabase
    .from('lancamentos_financeiros_v2')
    .select('valor')
    .eq('tipo', 'despesa')
    .eq('status', 'confirmado')
    .gte('data_lancamento', inicioMes)
    .lte('data_lancamento', hoje);
  
  const totalReceitas = receitas?.reduce((sum, r) => sum + Number(r.valor), 0) || 0;
  const totalDespesas = despesas?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;
  
  await supabase
    .from('cache_relatorios')
    .insert({
      tipo: 'financeiro',
      periodo: 'mes_atual',
      dados: {
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo: totalReceitas - totalDespesas
      },
      atualizado_em: new Date().toISOString()
    });
}

async function processarNovaPessoa(supabase: any, pessoa: any) {
  // Enviar email de boas-vindas
  await supabase
    .from('emails_queue')
    .insert({
      destinatario: pessoa.email,
      assunto: 'Bem-vindo à nossa comunidade!',
      template: 'boas_vindas',
      dados: {
        nome: pessoa.nome_completo
      },
      status: 'pendente'
    });
  
  // Criar perfil de ensino
  await supabase
    .from('progresso_ensino')
    .insert({
      pessoa_id: pessoa.id,
      pontos_xp: 0,
      nivel: 1
    });
}

async function notificarLancamentoAlto(supabase: any, lancamento: any) {
  // Notificar administradores sobre lançamentos altos
  const { data: admins } = await supabase
    .from('pessoas')
    .select('id')
    .eq('papel_igreja', 'admin');

  for (const admin of admins || []) {
    await supabase
      .from('notificacoes')
      .insert({
        pessoa_id: admin.id,
        titulo: 'Lançamento Alto Detectado',
        mensagem: `Lançamento de R$ ${lancamento.valor} foi registrado: ${lancamento.descricao}`,
        tipo: 'financeiro',
        lida: false,
        prioridade: 'alta'
      });
  }
}