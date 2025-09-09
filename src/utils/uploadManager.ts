import { supabase } from "@/integrations/supabase/client";
import { captureError, captureMessage } from "./errorReporting";

interface UploadOptions {
  bucket: string;
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (progress: number) => void;
  validateFile?: (file: File) => boolean;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export const uploadFileWithRetry = async (file: File, path: string, options: UploadOptions): Promise<UploadResult> => {
  const { bucket, maxRetries = DEFAULT_MAX_RETRIES, retryDelay = DEFAULT_RETRY_DELAY, onProgress, validateFile } = options;
  
  // Validação de arquivo
  if (validateFile && !validateFile(file)) {
    return { success: false, error: "Arquivo não atende aos critérios de validação" };
  }

  // Validação de tamanho (10MB máximo)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Arquivo muito grande. Máximo 10MB permitido." };
  }

  // Validação de tipo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'video/avi'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Tipo de arquivo não permitido." };
  }

  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      onProgress?.(0);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { 
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        throw error;
      }

      onProgress?.(100);

      // Obter URL pública
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      captureMessage('Upload realizado com sucesso', 'info', {
        bucket,
        path,
        fileSize: file.size,
        fileName: file.name,
        attempt
      });

      return {
        success: true,
        url: publicData.publicUrl,
        path
      };

    } catch (error: any) {
      lastError = error;
      
      captureMessage(`Falha no upload - tentativa ${attempt}/${maxRetries}`, 'warning', {
        bucket,
        path,
        error: error.message,
        attempt
      });

      if (attempt < maxRetries) {
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  captureError(lastError, {
    bucket,
    path,
    fileName: file.name,
    fileSize: file.size,
    maxRetries
  });

  return {
    success: false,
    error: `Upload falhou após ${maxRetries} tentativas: ${lastError?.message || 'Erro desconhecido'}`
  };
};

export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    captureMessage('Arquivo deletado com sucesso', 'info', { bucket, path });
    return true;
  } catch (error: any) {
    captureError(error, { bucket, path, action: 'delete' });
    return false;
  }
};