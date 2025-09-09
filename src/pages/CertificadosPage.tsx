import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Award, 
  Download, 
  Search, 
  Eye, 
  Shield,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CertificadosPage: React.FC = () => {
  const { 
    certificates, 
    count, 
    loading, 
    error, 
    downloadCertificate,
    verifyCertificate 
  } = useCertificates();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const filteredCertificates = certificates.filter(cert =>
    cert.metadata.curso_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.metadata.pessoa_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleVerify = async () => {
    if (!verifyHash.trim()) return;
    
    try {
      setVerifying(true);
      const result = await verifyCertificate(verifyHash);
      setVerifyResult(result);
      
      if (result) {
        toast({
          title: "Certificado Válido!",
          description: "O certificado foi verificado com sucesso.",
        });
      } else {
        toast({
          title: "Certificado Inválido",
          description: "Não foi possível verificar este certificado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar certificado.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  React.useEffect(() => {
    document.title = 'Meus Certificados | Kerigma Hub';
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Award className="h-8 w-8 text-warning" />
            Meus Certificados
          </h1>
          <p className="text-muted-foreground">
            Gerencie e visualize seus certificados de conclusão de cursos.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Certificados</p>
                  <p className="text-2xl font-bold">{loading ? '-' : count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold">
                    {loading ? '-' : certificates.filter(cert => {
                      const certDate = new Date(cert.data_emissao);
                      const now = new Date();
                      return certDate.getMonth() === now.getMonth() && 
                             certDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verificados</p>
                  <p className="text-2xl font-bold">{loading ? '-' : count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verificador de Certificados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verificar Certificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o hash de verificação do certificado..."
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleVerify} disabled={verifying || !verifyHash.trim()}>
                {verifying ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verificar
                  </>
                )}
              </Button>
            </div>

            {verifyResult && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-semibold text-success mb-2">✓ Certificado Válido</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Curso:</strong> {verifyResult.metadata.curso_nome}</p>
                  <p><strong>Aluno:</strong> {verifyResult.metadata.pessoa_nome}</p>
                  <p><strong>Data de Emissão:</strong> {format(new Date(verifyResult.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Certificados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Meus Certificados</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar certificados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'Nenhum certificado encontrado' : 'Nenhum certificado ainda'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente buscar com outros termos.' 
                    : 'Complete cursos para obter certificados automaticamente.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCertificates.map((certificate) => (
                  <div key={certificate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{certificate.metadata.curso_nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              Emitido em {format(new Date(certificate.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <Badge variant="secondary">
                            Hash: {certificate.hash_verificacao.substring(0, 8)}...
                          </Badge>
                          <span>Template: {certificate.template_usado}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(certificate.hash_verificacao);
                            toast({
                              title: "Hash copiado!",
                              description: "Hash de verificação copiado para a área de transferência.",
                            });
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Verificar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleDownload(certificate.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CertificadosPage;