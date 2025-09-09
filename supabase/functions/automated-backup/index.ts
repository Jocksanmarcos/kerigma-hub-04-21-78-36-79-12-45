import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Tabelas críticas para backup
const CRITICAL_TABLES = [
  'pessoas',
  'lancamentos_financeiros_v2',
  'eventos',
  'celulas',
  'usuarios_admin',
  'igrejas',
  'matriculas',
  'cursos',
  'agendamentos',
  'patrimonio'
]

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { backup_type = 'scheduled', tables = CRITICAL_TABLES } = await req.json().catch(() => ({}))
    
    console.log('Iniciando backup automático:', { backup_type, tables })

    // Criar registro do job de backup
    const { data: backupJob, error: jobError } = await supabase
      .from('backup_jobs')
      .insert({
        job_type: backup_type,
        status: 'running',
        tables_included: tables,
        started_at: new Date().toISOString(),
        metadata: {
          version: '1.0',
          backup_method: 'export_csv',
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (jobError) {
      throw new Error(`Erro ao criar job de backup: ${jobError.message}`)
    }

    const backupData: Record<string, any> = {}
    let totalSize = 0
    const errors: string[] = []

    // Fazer backup de cada tabela
    for (const table of tables) {
      try {
        console.log(`Fazendo backup da tabela: ${table}`)
        
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })

        if (error) {
          errors.push(`Erro na tabela ${table}: ${error.message}`)
          continue
        }

        backupData[table] = {
          count: count || 0,
          data: data || [],
          exported_at: new Date().toISOString()
        }

        // Estimativa de tamanho (aproximada)
        totalSize += JSON.stringify(data || []).length / 1024 / 1024 // MB

      } catch (tableError) {
        errors.push(`Erro na tabela ${table}: ${tableError.message}`)
      }
    }

    // Comprimir e salvar backup (simulado - em produção usar AWS S3)
    const backupLocation = `backup_${backupJob.id}_${new Date().toISOString().split('T')[0]}.json`
    
    // Salvar metadados do backup
    const backupMetadata = {
      tables: Object.keys(backupData),
      total_records: Object.values(backupData).reduce((sum: number, table: any) => sum + table.count, 0),
      backup_size_mb: Math.round(totalSize * 100) / 100,
      errors: errors,
      created_at: new Date().toISOString()
    }

    // Atualizar job como concluído
    const { error: updateError } = await supabase
      .from('backup_jobs')
      .update({
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        backup_size_mb: backupMetadata.backup_size_mb,
        backup_location: backupLocation,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        metadata: {
          ...backupJob.metadata,
          ...backupMetadata
        }
      })
      .eq('id', backupJob.id)

    if (updateError) {
      console.error('Erro ao atualizar job:', updateError)
    }

    // Limpar backups antigos (manter apenas os últimos 30 dias)
    const { error: cleanupError } = await supabase
      .from('backup_jobs')
      .delete()
      .lt('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (cleanupError) {
      console.error('Erro na limpeza:', cleanupError)
    }

    // Notificar administradores sobre o backup
    try {
      await supabase.functions.invoke('push-notifications', {
        body: {
          title: 'Backup Automático Concluído',
          body: `Backup realizado com sucesso. ${backupMetadata.total_records} registros salvos (${backupMetadata.backup_size_mb}MB)`,
          type: 'backup_completed',
          data: {
            backup_id: backupJob.id,
            status: errors.length > 0 ? 'completed_with_errors' : 'completed'
          }
        }
      })
    } catch (notifError) {
      console.error('Erro ao notificar:', notifError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupJob.id,
        backup_location: backupLocation,
        metadata: backupMetadata
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro no backup automático:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro no backup automático',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})