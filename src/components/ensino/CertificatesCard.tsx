import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCertificates } from '@/hooks/useCertificates';
import { useToast } from '@/hooks/use-toast';

const CertificatesCard: React.FC = () => {
  const { certificates, count, loading, error, downloadCertificate } = useCertificates();
  const { toast } = useToast();

  const handleDownload = async (certificateId: string) => {
    try {
      await downloadCertificate(certificateId);
      toast({
        title: "Sucesso!",
        description: "Certificado baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível baixar o certificado.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Certificados</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-40 mb-3" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Certificados</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-sm text-muted-foreground">Certificados conquistados</p>
        
        {count > 0 && (
          <div className="mt-3 space-y-2">
            <div className="max-h-32 overflow-y-auto space-y-1">
              {certificates.slice(0, 3).map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                  <span className="truncate flex-1">
                    {cert.metadata.curso_nome || 'Certificado'}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleDownload(cert.id)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button asChild variant="outline" className="mt-3 w-full">
          <Link to="/certificados">
            {count > 0 ? 'Ver todos certificados' : 'Ver certificados'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CertificatesCard;
