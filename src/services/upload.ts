import { supabase } from "@/integrations/supabase/client";
import { logAuditoria } from "@/utils/auditFinanceiro";

export interface UploadOptions {
  maxSize?: number; // em bytes
  allowedTypes?: string[];
  folder?: string;
}

export interface UploadResult {
  path: string;
  url: string;
  fullPath: string;
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'],
  folder: ''
};

export async function uploadArquivo(
  file: File, 
  bucket: string, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Merge options with defaults
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    // Validações
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    const extensao = file.name.split('.').pop()?.toLowerCase();
    if (!extensao) {
      throw new Error('Arquivo sem extensão válida');
    }

    if (!config.allowedTypes?.includes(extensao)) {
      throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes?.join(', ')}`);
    }

    if (file.size > (config.maxSize || DEFAULT_OPTIONS.maxSize!)) {
      const maxSizeMB = Math.round((config.maxSize || DEFAULT_OPTIONS.maxSize!) / (1024 * 1024));
      throw new Error(`Arquivo muito grande (máximo: ${maxSizeMB}MB)`);
    }

    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const userId = user.id.substring(0, 8);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folderPath = config.folder ? `${config.folder}/` : '';
    const fileName = `${folderPath}${userId}/${timestamp}-${sanitizedFileName}`;

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload do Supabase:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    // Obter URL pública (se o bucket for público)
    const { data: urlData } = await supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Log de auditoria para uploads importantes
    if (['financeiro', 'patrimonio'].includes(bucket)) {
      await logAuditoria({
        tipo_operacao: 'CREATE',
        tabela: 'storage_uploads',
        registro_id: data.path,
        dados_novos: {
          bucket,
          fileName: file.name,
          fileSize: file.size,
          uploadPath: data.path
        },
        detalhes_adicionais: {
          modulo: bucket,
          categoria: 'upload_arquivo'
        }
      });
    }

    return {
      path: data.path,
      url: urlData.publicUrl,
      fullPath: data.fullPath
    };

  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

export async function uploadMultiplosArquivos(
  files: FileList | File[], 
  bucket: string, 
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const fileArray = Array.from(files);
  const resultados: UploadResult[] = [];
  const erros: Error[] = [];

  for (const file of fileArray) {
    try {
      const resultado = await uploadArquivo(file, bucket, options);
      resultados.push(resultado);
    } catch (error) {
      erros.push(error as Error);
    }
  }

  if (erros.length > 0 && resultados.length === 0) {
    throw new Error(`Falha em todos os uploads: ${erros.map(e => e.message).join(', ')}`);
  }

  if (erros.length > 0) {
    console.warn(`${erros.length} arquivo(s) falharam no upload:`, erros);
  }

  return resultados;
}

export async function deletarArquivo(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Falha ao deletar arquivo: ${error.message}`);
    }

    // Log de auditoria para deleções importantes
    if (['financeiro', 'patrimonio'].includes(bucket)) {
      await logAuditoria({
        tipo_operacao: 'DELETE',
        tabela: 'storage_uploads',
        registro_id: path,
        dados_anteriores: { bucket, path },
        detalhes_adicionais: {
          modulo: bucket,
          categoria: 'delete_arquivo'
        }
      });
    }

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}

export async function obterUrlDownload(bucket: string, path: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hora de validade

    if (error) {
      throw new Error(`Falha ao gerar URL de download: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Erro ao obter URL de download:', error);
    throw error;
  }
}

export async function listarArquivos(bucket: string, folder?: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Falha ao listar arquivos: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
}

// Utility para validar tipo de arquivo por MIME type
export function validarTipoArquivo(file: File, tiposPermitidos: string[]): boolean {
  const extensao = file.name.split('.').pop()?.toLowerCase();
  const mimeTypesMap: Record<string, string[]> = {
    'pdf': ['application/pdf'],
    'doc': ['application/msword'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'ppt': ['application/vnd.ms-powerpoint'],
    'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'xls': ['application/vnd.ms-excel'],
    'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'txt': ['text/plain']
  };

  if (!extensao || !tiposPermitidos.includes(extensao)) {
    return false;
  }

  const mimeTypesValidos = mimeTypesMap[extensao];
  return mimeTypesValidos ? mimeTypesValidos.includes(file.type) : true;
}