import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const data = url.searchParams.get('data');

    if (!data) {
      throw new Error('Parâmetro data é obrigatório');
    }

    // Validar formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data)) {
      throw new Error('Data deve estar no formato YYYY-MM-DD');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Buscar agendamentos para a data específica
    const startOfDay = new Date(data);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select('data_hora_inicio')
      .gte('data_hora_inicio', startOfDay.toISOString())
      .lt('data_hora_inicio', endOfDay.toISOString())
      .in('status', ['agendado', 'confirmado', 'solicitado']);

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw new Error('Erro ao consultar horários');
    }

    // Extrair apenas os horários (HH:MM)
    const horariosOcupados = agendamentos.map(agendamento => {
      const date = new Date(agendamento.data_hora_inicio);
      return date.toTimeString().slice(0, 5); // HH:MM
    });

    return new Response(JSON.stringify({ 
      horarios_ocupados: horariosOcupados 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função consultar-horarios-disponiveis:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});