import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPerson } from './useCurrentPerson';

interface Certificate {
  id: string;
  curso_id: string;
  certificado_url?: string;
  hash_verificacao: string;
  data_emissao: string;
  template_usado: string;
  metadata: any;
}

interface UseCertificatesReturn {
  certificates: Certificate[];
  count: number;
  loading: boolean;
  error: string | null;
  refreshCertificates: () => void;
  downloadCertificate: (certificateId: string) => Promise<void>;
  verifyCertificate: (hash: string) => Promise<Certificate | null>;
}

export const useCertificates = (): UseCertificatesReturn => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pessoa, loading: personLoading } = useCurrentPerson();

  const loadCertificates = async () => {
    if (personLoading || !pessoa) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: certError } = await supabase
        .from('certificados_automaticos')
        .select('*')
        .eq('pessoa_id', pessoa.id)
        .order('data_emissao', { ascending: false });

      if (certError) throw certError;

      setCertificates(data || []);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(cert => cert.id === certificateId);
      if (!certificate) throw new Error('Certificado não encontrado');

      // Se já tem URL, fazer download direto
      if (certificate.certificado_url) {
        const link = document.createElement('a');
        link.href = certificate.certificado_url;
        link.download = `certificado-${certificate.metadata.curso_nome?.replace(/\s+/g, '-') || 'curso'}.pdf`;
        link.click();
        return;
      }

      // Caso contrário, gerar certificado via API
      const { data, error } = await supabase.functions.invoke('gerar-certificado', {
        body: { certificateId }
      });

      if (error) throw error;

      if (data?.certificado_url) {
        const link = document.createElement('a');
        link.href = data.certificado_url;
        link.download = `certificado-${certificate.metadata.curso_nome?.replace(/\s+/g, '-') || 'curso'}.pdf`;
        link.click();

        // Atualizar o certificado com a URL
        await supabase
          .from('certificados_automaticos')
          .update({ certificado_url: data.certificado_url })
          .eq('id', certificateId);

        loadCertificates();
      }
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      throw error;
    }
  };

  const verifyCertificate = async (hash: string): Promise<Certificate | null> => {
    try {
      const { data, error } = await supabase
        .from('certificados_automaticos')
        .select('*')
        .eq('hash_verificacao', hash)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      return null;
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [pessoa, personLoading]);

  return {
    certificates,
    count: certificates.length,
    loading,
    error,
    refreshCertificates: loadCertificates,
    downloadCertificate,
    verifyCertificate
  };
};