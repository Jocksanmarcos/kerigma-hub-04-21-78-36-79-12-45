import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Search, Filter, Calendar, User } from 'lucide-react';

const CertificadosPage: React.FC = () => {
  const [filtro, setFiltro] = useState('');

  React.useEffect(() => {
    document.title = "Certificados – Kerigma Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Seus certificados de cursos e treinamentos");
  }, []);

  const certificados = [
    {
      id: 1,
      titulo: "Liderança Cristã Nível 1",
      curso: "Formação de Líderes",
      dataEmissao: "2024-01-15",
      dataExpiracao: null,
      status: "ativo",
      instrutor: "Pastor João Silva",
      cargaHoraria: 40,
      nota: 9.5
    },
    {
      id: 2,
      titulo: "Evangelismo Pessoal",
      curso: "Métodos Evangelísticos",
      dataEmissao: "2023-12-10",
      dataExpiracao: "2025-12-10",
      status: "ativo",
      instrutor: "Ev. Maria Santos",
      cargaHoraria: 20,
      nota: 8.8
    },
    {
      id: 3,
      titulo: "Discipulado Bíblico",
      curso: "Fundamentos do Discipulado",
      dataEmissao: "2023-11-05",
      dataExpiracao: null,
      status: "ativo",
      instrutor: "Pr. Carlos Lima",
      cargaHoraria: 30,
      nota: 9.2
    },
    {
      id: 4,
      titulo: "Gestão de Células",
      curso: "Liderança de Pequenos Grupos",
      dataEmissao: "2023-09-20",
      dataExpiracao: "2024-09-20",
      status: "expirado",
      instrutor: "Líder Ana Costa",
      cargaHoraria: 25,
      nota: 8.5
    }
  ];

  const getStatusBadge = (status: string, dataExpiracao?: string | null) => {
    if (status === "expirado" || (dataExpiracao && new Date(dataExpiracao) < new Date())) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  const certificadosFiltrados = certificados.filter(cert =>
    cert.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    cert.curso.toLowerCase().includes(filtro.toLowerCase()) ||
    cert.instrutor.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleDownload = (certificadoId: number) => {
    // Simular download do PDF
    const certificado = certificados.find(c => c.id === certificadoId);
    if (certificado) {
      // Criar um link de download simulado
      const element = document.createElement('a');
      const file = new Blob([`Certificado: ${certificado.titulo}\nCurso: ${certificado.curso}\nData: ${certificado.dataEmissao}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `certificado-${certificado.titulo.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleVerificarAutenticidade = (certificadoId: number) => {
    const certificado = certificados.find(c => c.id === certificadoId);
    if (certificado) {
      alert(`Certificado verificado com sucesso!\n\nCódigo: CERT-${certificado.id.toString().padStart(6, '0')}\nStatus: Válido\nEmitido em: ${new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}`);
    }
  };

  return (
    <AppLayout>
      <main className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Certificados</h1>
            <p className="text-muted-foreground">Seus certificados de cursos e treinamentos concluídos</p>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar certificados..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </header>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Certificados</p>
                  <p className="text-2xl font-bold text-foreground">{certificados.length}</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {certificados.filter(c => c.status === "ativo").length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Carga Horária Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {certificados.reduce((sum, c) => sum + c.cargaHoraria, 0)}h
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média de Notas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(certificados.reduce((sum, c) => sum + c.nota, 0) / certificados.length).toFixed(1)}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Certificados */}
        <div className="grid gap-4">
          {certificadosFiltrados.map((certificado) => (
            <Card key={certificado.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{certificado.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{certificado.curso}</p>
                      </div>
                      {getStatusBadge(certificado.status, certificado.dataExpiracao)}
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Instrutor</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {certificado.instrutor}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data de Emissão</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carga Horária</p>
                        <p className="text-sm font-medium">{certificado.cargaHoraria}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nota Final</p>
                        <p className="text-sm font-medium">{certificado.nota}/10</p>
                      </div>
                    </div>
                    
                    {certificado.dataExpiracao && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Válido até: {new Date(certificado.dataExpiracao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(certificado.id)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleVerificarAutenticidade(certificado.id)}>
                      Verificar Autenticidade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {certificadosFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum certificado encontrado
              </h3>
              <p className="text-muted-foreground">
                {filtro ? 'Tente ajustar os filtros de busca.' : 'Complete um curso para obter seu primeiro certificado.'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </AppLayout>
  );
};

export default CertificadosPage;