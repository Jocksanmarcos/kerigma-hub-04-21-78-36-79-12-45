import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportResult {
  success: number;
  errors: number;
  details: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

// Utilities
const canonicalHeaders = [
  'nome_completo', 'email', 'telefone', 'tipo_pessoa', 'situacao',
  'estado_espiritual', 'data_nascimento', 'endereco', 'estado_civil',
  'escolaridade', 'observacoes'
] as const;

const headerSynonyms: Record<string, typeof canonicalHeaders[number]> = {
  // nome completo
  'nome': 'nome_completo',
  'nomecompleto': 'nome_completo',
  'nome_completo': 'nome_completo',
  'nome completo': 'nome_completo',

  // email
  'email': 'email',
  'e-mail': 'email',
  'mail': 'email',

  // telefone
  'telefone': 'telefone',
  'celular': 'telefone',
  'whatsapp': 'telefone',
  'telefone1': 'telefone',

  // tipo_pessoa
  'tipo': 'tipo_pessoa',
  'tipo_pessoa': 'tipo_pessoa',

  // situacao
  'situacao': 'situacao',
  'situação': 'situacao',
  'status': 'situacao',

  // estado espiritual
  'estado_espiritual': 'estado_espiritual',
  'estado espiritual': 'estado_espiritual',

  // data_nascimento
  'data_nascimento': 'data_nascimento',
  'data nascimento': 'data_nascimento',
  'nascimento': 'data_nascimento',
  'dt_nascimento': 'data_nascimento',
  'data de nascimento': 'data_nascimento',

  // endereco
  'endereco': 'endereco',
  'endereço': 'endereco',
  'rua': 'endereco',
  'logradouro': 'endereco',

  // estado civil
  'estado_civil': 'estado_civil',
  'estado civil': 'estado_civil',

  // escolaridade
  'escolaridade': 'escolaridade',
  'nivel_escolar': 'escolaridade',
  'nível escolar': 'escolaridade',

  // observacoes
  'observacoes': 'observacoes',
  'observações': 'observacoes',
  'obs': 'observacoes',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9_\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectDelimiter(sampleLines: string[]): string {
  const candidates = [',', ';', '\t'];
  let best = ',';
  let bestScore = -1;
  for (const d of candidates) {
    const cols = sampleLines
      .map(l => splitCSVLine(l, d).length)
      .filter(c => c > 1);
    if (cols.length === 0) continue;
    const avg = cols.reduce((a, b) => a + b, 0) / cols.length;
    const variance = cols.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / cols.length;
    const score = cols.length * (1 / (1 + variance));
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

// Split a CSV line respecting quotes and double-quotes escaping
function splitCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(v => v.trim());
}

function toISODate(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
  const m = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    let y = m[3];
    if (y.length === 2) y = (Number(y) > 50 ? '19' : '20') + y; // naive century
    return `${y}-${mo}-${d}`;
  }
  // try parseable by Date
  const dt = new Date(v);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }
  return null;
}

function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /.+@.+\..+/.test(email);
}

function makePlaceholderEmail(nome: string): string {
  const slug = normalize(nome).replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '').slice(0, 40) || 'pessoa';
  const uid = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 8);
  return `${slug}+${uid}@noemail.cbnkerigma.local`;
}

function mapSituacao(value: string | null): string | undefined {
  if (!value) return undefined;
  const n = normalize(value);
  // Para evitar violar o check constraint desconhecido, só aceitamos valores comuns e seguros.
  if (['ativo', 'inativo'].includes(n)) return n;
  return undefined; // deixa o default do banco ('ativo') assumir
}

function mapTipoPessoa(value: string | null): string | undefined {
  if (!value) return undefined;
  const n = normalize(value);

  // Mapear sinônimos comuns para tipos aceitos
  const membro = new Set(['membro', 'membroa', 'membra', 'membro batizado', 'batizado', 'membro_batizado']);
  const visitante = new Set(['visitante', 'visita', 'novo convertido', 'novoconvertido', 'novo', 'convidado']);
  const pastor = new Set(['pastor', 'pr', 'pr.', 'pr ', 'reverendo', 'rev']);
  const lider = new Set(['lider', 'coordenador', 'supervisor']);

  if (membro.has(n)) return 'membro';
  if (visitante.has(n)) return 'visitante';
  if (pastor.has(n)) return 'pastor';
  if (lider.has(n)) return 'lider';

  // Valor desconhecido: não retornar nada para deixar o DEFAULT do BD assumir
  return undefined;
}

serve(async (req) => {
  console.log('🚀 Import pessoas function called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { file, filename, mimetype } = await req.json()
    console.log(`📁 Processing file: ${filename} (${mimetype})`)

    if (!file) {
      throw new Error('Nenhum arquivo fornecido')
    }

    // Extrair dados do arquivo base64
    const base64Data = file.split(',')[1]
    const fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    let csvData: string

    if (mimetype === 'text/csv' || filename.endsWith('.csv')) {
      csvData = new TextDecoder('utf-8').decode(fileBuffer)
    } else if (mimetype.includes('sheet') || filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      throw new Error('Para importação Excel, por favor converta para CSV primeiro')
    } else {
      throw new Error('Formato de arquivo não suportado. Use CSV.')
    }

    // Normalizar quebras de linha
    csvData = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    console.log('📋 CSV data length:', csvData.length)

    const rawLines = csvData.split('\n').filter(l => l.trim().length > 0)
    if (rawLines.length === 0) {
      throw new Error('Arquivo vazio')
    }

    // Detectar delimitador com base nas primeiras 10 linhas
    const sample = rawLines.slice(0, Math.min(rawLines.length, 10))
    const delimiter = detectDelimiter(sample)
    console.log('🔎 Detected delimiter:', JSON.stringify(delimiter))

    // Ler cabeçalho
    const rawHeader = splitCSVLine(rawLines[0], delimiter)
    const headerMapping: Record<number, string> = {}

    // Mapear colunas para cabeçalhos canônicos (ignorando extras)
    rawHeader.forEach((h, idx) => {
      const key = normalize(h)
      const mapped = headerSynonyms[key] || (canonicalHeaders as readonly string[]).find(ch => ch === key)
      if (mapped) {
        headerMapping[idx] = mapped
      }
    })

    const foundHeaders = Object.values(headerMapping)
    console.log('📊 Headers mapped:', foundHeaders)
    if (!foundHeaders.includes('nome_completo')) {
      throw new Error('Campo obrigatório "nome_completo" não encontrado no cabeçalho')
    }

    const result: ImportResult = { success: 0, errors: 0, details: [] }

    // Processar linhas de dados
    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i]
      if (!line || !line.trim()) continue

      try {
        const values = splitCSVLine(line, delimiter)
        const pessoaData: Record<string, any> = {}

        // Preencher com base no headerMapping, ignorando colunas desconhecidas
        values.forEach((v, idx) => {
          const mapped = headerMapping[idx]
          if (mapped) {
            pessoaData[mapped] = v === '' ? null : v
          }
        })

        // Validação e normalização
        const nome = (pessoaData.nome_completo ?? '').toString().trim()
        if (!nome || nome.length < 2) {
          throw new Error('Nome completo é obrigatório e deve ter pelo menos 2 caracteres')
        }

        // E-mail: se ausente/ inválido, gerar placeholder para respeitar NOT NULL
        const emailRaw = (pessoaData.email ?? null) as string | null
        if (!isValidEmail(emailRaw)) {
          const placeholder = makePlaceholderEmail(nome)
          pessoaData.email = placeholder
          pessoaData.observacoes = [pessoaData.observacoes, 'Email ausente/inválido - gerado automaticamente'].filter(Boolean).join(' | ')
        }

        // Telefone - manter como está

        // Datas
        if (pessoaData.data_nascimento) {
          const iso = toISODate(pessoaData.data_nascimento)
          if (iso) pessoaData.data_nascimento = iso; else pessoaData.data_nascimento = null
        }

        // tipo_pessoa - normalizar/validar contra valores permitidos
        if (!pessoaData.tipo_pessoa) pessoaData.tipo_pessoa = 'membro'
        const tipo = mapTipoPessoa(pessoaData.tipo_pessoa ?? null)
        if (tipo) {
          pessoaData.tipo_pessoa = tipo
        } else {
          // Remover campo para deixar o DEFAULT do BD assumir
          delete pessoaData.tipo_pessoa
        }

        // situacao - só aplicar valores seguros, senão deixar default do BD
        const sit = mapSituacao(pessoaData.situacao ?? null)
        if (sit) pessoaData.situacao = sit; else delete pessoaData.situacao

        // estado_espiritual default
        if (!pessoaData.estado_espiritual) pessoaData.estado_espiritual = 'interessado'

        // Garantir apenas colunas válidas para a tabela
        const insertData: Record<string, any> = {}
        for (const key of canonicalHeaders) {
          if (key in pessoaData) insertData[key] = pessoaData[key]
        }

        // Inserir no banco
        console.log(`👤 Inserting person: ${nome}`)
        const { error: insertError } = await supabaseClient
          .from('pessoas')
          .insert([insertData])

        if (insertError) {
          console.error(`❌ Error inserting person ${nome}:`, insertError)
          throw new Error(insertError.message)
        }

        result.success++
        console.log(`✅ Successfully inserted: ${nome}`)

      } catch (error: any) {
        console.error(`❌ Error processing line ${i + 1}:`, error.message)
        result.errors++
        result.details.push({ row: i + 1, error: error.message, data: line })
      }
    }

    console.log(`📈 Import completed: ${result.success} success, ${result.errors} errors`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('💥 Import function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: 0,
        errors: 1,
        details: [{ row: 0, error: error.message }]
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})