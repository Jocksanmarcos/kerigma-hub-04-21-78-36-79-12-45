import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'process-queue':
        return await processarFilaSincronizacao(supabase);
      
      case 'sync-mobile':
        return await sincronizarComMobile(supabase, req);
      
      case 'sync-status':
        return await obterStatusSincronizacao(supabase);
      
      case 'force-sync':
        return await forceSyncAll(supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: "Action not specified" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("Sync Service Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function processarFilaSincronizacao(supabase: any) {
  console.log('Processando fila de sincronização...');
  
  // Buscar itens pendentes na fila
  const { data: filaItens, error } = await supabase
    .from('sync_queue')
    .select('*')
    .eq('status', 'pendente')
    .lt('tentativas', 3)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) throw error;

  const resultados = {
    processados: 0,
    sucessos: 0,
    falhas: 0,
    detalhes: []
  };

  for (const item of filaItens || []) {
    try {
      await processarItemSync(supabase, item);
      
      // Marcar como processado
      await supabase
        .from('sync_queue')
        .update({ 
          status: 'processado',
          processado_em: new Date().toISOString(),
          erro: null
        })
        .eq('id', item.id);

      resultados.sucessos++;
      resultados.detalhes.push({
        id: item.id,
        tipo: item.tipo,
        status: 'sucesso'
      });

    } catch (erro: any) {
      console.error(`Erro ao processar item ${item.id}:`, erro);
      
      // Incrementar tentativas
      await supabase
        .from('sync_queue')
        .update({ 
          tentativas: item.tentativas + 1,
          erro: erro.message,
          status: item.tentativas >= 2 ? 'falhado' : 'pendente'
        })
        .eq('id', item.id);

      resultados.falhas++;
      resultados.detalhes.push({
        id: item.id,
        tipo: item.tipo,
        status: 'falha',
        erro: erro.message
      });
    }
    
    resultados.processados++;
  }

  console.log('Processamento concluído:', resultados);

  return new Response(
    JSON.stringify(resultados),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function processarItemSync(supabase: any, item: any) {
  switch (item.tipo) {
    case 'evento':
      await sincronizarEvento(supabase, item);
      break;
    
    case 'celula':
      await sincronizarCelula(supabase, item);
      break;
    
    case 'pessoa':
      await sincronizarPessoa(supabase, item);
      break;
    
    case 'financeiro':
      await sincronizarFinanceiro(supabase, item);
      break;
    
    default:
      throw new Error(`Tipo de sincronização não suportado: ${item.tipo}`);
  }
}

async function sincronizarEvento(supabase: any, item: any) {
  const { dados } = item;
  const { acao, evento } = dados;

  // Simular sincronização com app mobile
  console.log(`Sincronizando evento ${evento.id} - Ação: ${acao}`);
  
  // Aqui você faria a sincronização real com:
  // - Firebase/FCM para notificações push
  // - API do app mobile
  // - Calendários externos (Google Calendar, Outlook)
  // - Sistemas de terceiros

  // Exemplo de notificação push
  if (acao === 'create' && evento.publico) {
    await enviarNotificacaoPush(supabase, {
      titulo: 'Novo Evento!',
      corpo: `${evento.titulo} - ${new Date(evento.data_inicio).toLocaleDateString()}`,
      dados: {
        tipo: 'evento',
        evento_id: evento.id
      }
    });
  }

  // Log da sincronização
  await supabase
    .from('logs_sincronizacao')
    .insert({
      tipo: 'evento',
      acao,
      recurso_id: evento.id,
      dados: dados,
      status: 'sucesso',
      timestamp: new Date().toISOString()
    });
}

async function sincronizarCelula(supabase: any, item: any) {
  const { dados } = item;
  const { acao, celula } = dados;

  console.log(`Sincronizando célula ${celula.id} - Ação: ${acao}`);

  // Atualizar cache de localizações se mudou endereço
  if (acao === 'update' && celula.endereco) {
    await atualizarCacheLocalizacoes(supabase, celula);
  }

  // Sincronizar com app de mapa das células
  await sincronizarMapaCelulas(supabase, celula, acao);

  await supabase
    .from('logs_sincronizacao')
    .insert({
      tipo: 'celula',
      acao,
      recurso_id: celula.id,
      dados: dados,
      status: 'sucesso',
      timestamp: new Date().toISOString()
    });
}

async function sincronizarComMobile(supabase: any, req: Request) {
  const body = await req.json();
  const { dispositivo_id, ultima_sincronizacao, tipos } = body;

  if (!dispositivo_id) {
    throw new Error("dispositivo_id é obrigatório");
  }

  const dataUltimaSync = ultima_sincronizacao ? new Date(ultima_sincronizacao) : new Date(0);
  const agora = new Date();

  const dadosSync = {
    timestamp: agora.toISOString(),
    dispositivo_id,
    dados: {}
  };

  // Sincronizar dados por tipo solicitado
  for (const tipo of tipos || ['eventos', 'celulas', 'pessoas']) {
    switch (tipo) {
      case 'eventos':
        dadosSync.dados.eventos = await buscarEventosAtualizados(supabase, dataUltimaSync);
        break;
      
      case 'celulas':
        dadosSync.dados.celulas = await buscarCelulasAtualizadas(supabase, dataUltimaSync);
        break;
      
      case 'pessoas':
        dadosSync.dados.pessoas = await buscarPessoasAtualizadas(supabase, dataUltimaSync);
        break;
    }
  }

  // Registrar sincronização
  await supabase
    .from('sync_dispositivos')
    .upsert({
      dispositivo_id,
      ultima_sincronizacao: agora.toISOString(),
      tipos_sincronizados: tipos,
      status: 'ativo'
    });

  return new Response(
    JSON.stringify(dadosSync),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function buscarEventosAtualizados(supabase: any, desde: Date) {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      id, titulo, descricao, data_inicio, data_fim, 
      local, endereco, publico, created_at, updated_at
    `)
    .eq('publico', true)
    .gte('updated_at', desde.toISOString())
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function buscarCelulasAtualizadas(supabase: any, desde: Date) {
  const { data, error } = await supabase
    .from('celulas')
    .select(`
      id, nome, endereco, horario, latitude, longitude,
      lider:pessoas!lider_id(nome_completo),
      created_at, updated_at
    `)
    .eq('ativa', true)
    .gte('updated_at', desde.toISOString())
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function buscarPessoasAtualizadas(supabase: any, desde: Date) {
  const { data, error } = await supabase
    .from('pessoas')
    .select(`
      id, nome_completo, email, telefone, tipo_pessoa,
      celula:celulas(nome),
      created_at, updated_at
    `)
    .eq('situacao', 'ativo')
    .gte('updated_at', desde.toISOString())
    .order('updated_at', { ascending: false })
    .limit(100); // Limitar para não sobrecarregar

  if (error) throw error;
  return data || [];
}

async function obterStatusSincronizacao(supabase: any) {
  // Status da fila de sincronização
  const { data: filaStatus } = await supabase
    .from('sync_queue')
    .select('status')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Últimas 24h

  const statusCounts = {
    pendente: 0,
    processado: 0,
    falhado: 0
  };

  filaStatus?.forEach(item => {
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
  });

  // Dispositivos ativos
  const { data: dispositivos } = await supabase
    .from('sync_dispositivos')
    .select('dispositivo_id, ultima_sincronizacao')
    .eq('status', 'ativo')
    .gte('ultima_sincronizacao', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Última semana

  // Logs de sincronização recentes
  const { data: logsRecentes } = await supabase
    .from('logs_sincronizacao')
    .select('tipo, status')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false })
    .limit(100);

  return new Response(
    JSON.stringify({
      fila: statusCounts,
      dispositivos_ativos: dispositivos?.length || 0,
      dispositivos,
      logs_recentes: logsRecentes || [],
      ultima_verificacao: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function forceSyncAll(supabase: any) {
  console.log('Iniciando sincronização forçada de todos os dados...');
  
  // Marcar todos os registros como necessitando sincronização
  const tabelas = ['eventos', 'celulas', 'pessoas', 'lancamentos_financeiros_v2'];
  const resultados = [];

  for (const tabela of tabelas) {
    try {
      // Buscar registros atualizados nas últimas 24h
      const { data } = await supabase
        .from(tabela)
        .select('id, updated_at')
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Adicionar à fila de sincronização
      for (const registro of data || []) {
        await supabase
          .from('sync_queue')
          .insert({
            tipo: tabela.replace('lancamentos_financeiros_v2', 'financeiro'),
            dados: { acao: 'force_sync', [tabela]: registro },
            status: 'pendente',
            tentativas: 0
          });
      }

      resultados.push({
        tabela,
        registros: data?.length || 0,
        status: 'sucesso'
      });

    } catch (error: any) {
      resultados.push({
        tabela,
        status: 'erro',
        erro: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({
      message: 'Sincronização forçada iniciada',
      resultados
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function enviarNotificacaoPush(supabase: any, notificacao: any) {
  // Buscar tokens de dispositivos ativos
  const { data: tokens } = await supabase
    .from('user_push_tokens')
    .select('token, user_id')
    .eq('ativo', true);

  if (!tokens || tokens.length === 0) {
    console.log('Nenhum token de push encontrado');
    return;
  }

  // Aqui você enviaria as notificações usando FCM, APNS, etc.
  console.log(`Enviando notificação push para ${tokens.length} dispositivos:`, notificacao);
  
  // Simular envio
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function atualizarCacheLocalizacoes(supabase: any, celula: any) {
  // Atualizar cache de coordenadas das células para o mapa
  await supabase
    .from('cache_localizacoes')
    .upsert({
      tipo: 'celula',
      recurso_id: celula.id,
      endereco: celula.endereco,
      latitude: celula.latitude,
      longitude: celula.longitude,
      atualizado_em: new Date().toISOString()
    });
}

async function sincronizarMapaCelulas(supabase: any, celula: any, acao: string) {
  // Sincronizar com serviço de mapas (ex: Google Maps, Mapbox)
  console.log(`Sincronizando mapa - Célula ${celula.id}, Ação: ${acao}`);
  
  // Aqui você faria a integração real com APIs de mapa
}