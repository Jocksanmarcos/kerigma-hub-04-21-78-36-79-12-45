import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, QrCode, Users, BookMarked, AlertTriangle } from 'lucide-react';
import BibliotecaLivros from '@/components/biblioteca/BibliotecaLivros';
import BibliotecaEmprestimos from '@/components/biblioteca/BibliotecaEmprestimos';
import { BibliotecaReservas } from '@/components/biblioteca/BibliotecaReservas';
import CadastroLivroDialog from '@/components/biblioteca/CadastroLivroDialog';
import { EmprestimoDialog } from '@/components/biblioteca/EmprestimoDialog';
import { QRCodeScanner } from '@/components/biblioteca/QRCodeScanner';
import BibliotecaStats from '@/components/biblioteca/BibliotecaStats';
import BibliotecaRelatorios from '@/components/biblioteca/BibliotecaRelatorios';
import { BibliotecaNotificacoesContainer } from '@/components/biblioteca/BibliotecaNotificacoesContainer';
import { BibliotecaMembroView } from '@/components/biblioteca/BibliotecaMembroView';
import { useNewUserRole } from '@/hooks/useNewRole';

const BibliotecaPage = () => {
  const { data: userRole } = useNewUserRole();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCadastroLivro, setShowCadastroLivro] = useState(false);
  const [showEmprestimo, setShowEmprestimo] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Dados agora vêm do hook de estatísticas em tempo real

  // Se não for pastor, mostrar visualização de membro
  if (userRole !== 'pastor') {
    return (
      <AppLayout>
        <BibliotecaMembroView />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Biblioteca da Sabedoria</h1>
            <p className="text-muted-foreground">
              Sistema completo de gestão da biblioteca da igreja
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowScanner(true)}
              variant="outline"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scanner QR
            </Button>
            <Button 
              onClick={() => setShowEmprestimo(true)}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Novo Empréstimo
            </Button>
            <Button onClick={() => setShowCadastroLivro(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Livro
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="livros">Acervo</TabsTrigger>
            <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BibliotecaStats />
          </TabsContent>

          <TabsContent value="livros">
            <BibliotecaLivros />
          </TabsContent>

          <TabsContent value="emprestimos">
            <BibliotecaEmprestimos />
          </TabsContent>

          <TabsContent value="reservas">
            <BibliotecaReservas />
          </TabsContent>

          <TabsContent value="notificacoes">
            <BibliotecaNotificacoesContainer />
          </TabsContent>

          <TabsContent value="relatorios">
            <BibliotecaRelatorios />
          </TabsContent>
        </Tabs>

        <CadastroLivroDialog 
          open={showCadastroLivro} 
          onOpenChange={setShowCadastroLivro}
        />
        
        <EmprestimoDialog 
          open={showEmprestimo} 
          onOpenChange={setShowEmprestimo}
        />

        <QRCodeScanner
          open={showScanner}
          onOpenChange={setShowScanner}
          onCodeScanned={(code) => {
            console.log('QR Code scanned:', code);
            setShowScanner(false);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default BibliotecaPage;