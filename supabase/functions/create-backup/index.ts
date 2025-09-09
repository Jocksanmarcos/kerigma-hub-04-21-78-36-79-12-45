import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { type = 'manual' } = await req.json();

    // Tabelas críticas para backup
    const criticalTables = [
      'pessoas', 'usuarios_admin', 'celulas', 'eventos', 
      'lancamentos_financeiros_v2', 'matriculas', 'cursos'
    ];

    const backupData: any = {};
    let totalSize = 0;

    // Exportar dados de cada tabela
    for (const table of criticalTables) {
      const { data, error } = await supabaseClient
        .from(table)
        .select('*');
      
      if (!error && data) {
        backupData[table] = data;
        totalSize += JSON.stringify(data).length;
      }
    }

    // Salvar backup
    const backupName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
    
    const { error: insertError } = await supabaseClient
      .from('system_backups')
      .insert({
        name: backupName,
        type,
        size: totalSize,
        tables_count: criticalTables.length,
        status: 'completed',
        backup_data: backupData
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      success: true, 
      backupName,
      size: totalSize 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);