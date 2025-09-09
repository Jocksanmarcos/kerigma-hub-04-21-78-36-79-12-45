import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Users, BookOpen, Music, HandHeart, UserPlus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { RecepcaoHeader } from '@/components/recepcao/RecepcaoHeader';

const RecepcaoPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    idade: '',
    endereco: '',
    como_conheceu: '',
    primeira_visita: true,
    interessado_em: [] as string[],
    observacoes: '',
    recepcionista_nome: ''
  });

  const interessesDisponiveis = [
    { id: 'celula', label: 'Célula/Pequeno Grupo', icon: Users },
    { id: 'cursos', label: 'Cursos e Estudos', icon: BookOpen },
    { id: 'ministerio', label: 'Servir na Igreja', icon: HandHeart },
    { id: 'louvor', label: 'Ministério de Louvor', icon: Music },
    { id: 'criancas', label: 'Ministério Infantil', icon: Heart },
    { id: 'jovens', label: 'Ministério de Jovens', icon: UserPlus }
  ];

  const formasConhecimento = [
    'Indicação de amigo/familiar',
    'Redes sociais',
    'Site da igreja',
    'Passando na rua',
    'Evento da igreja',
    'Outro'
  ];

  const handleInteresseChange = (interesse: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interessado_em: checked 
        ? [...prev.interessado_em, interesse]
        : prev.interessado_em.filter(i => i !== interesse)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('formularios_recepcao')
        .insert({
          nome_completo: formData.nome_completo,
          telefone: formData.telefone || null,
          email: formData.email || null,
          idade: formData.idade ? parseInt(formData.idade) : null,
          endereco: formData.endereco || null,
          como_conheceu: formData.como_conheceu || null,
          primeira_visita: formData.primeira_visita,
          interessado_em: formData.interessado_em,
          observacoes: formData.observacoes || null,
          recepcionista_nome: formData.recepcionista_nome || null,
          data_visita: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Visitante cadastrado com sucesso!",
        description: `${formData.nome_completo} foi registrado em nosso sistema.`,
      });

      // Limpar formulário
      setFormData({
        nome_completo: '',
        telefone: '',
        email: '',
        idade: '',
        endereco: '',
        como_conheceu: '',
        primeira_visita: true,
        interessado_em: [],
        observacoes: '',
        recepcionista_nome: ''
      });

    } catch (error) {
      console.error('Erro ao cadastrar visitante:', error);
      toast({
        title: "Erro ao cadastrar visitante",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recepção - Cadastro de Visitantes | CBN Kerigma</title>
        <meta name="description" content="Sistema de cadastro rápido para visitantes da igreja" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <RecepcaoHeader />
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Heart className="h-6 w-6" />
                Bem-vindo à CBN Kerigma!
              </CardTitle>
              <CardDescription className="text-white/90">
                Estamos muito felizes em ter você conosco hoje
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Informações Básicas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="nome_completo">Nome Completo *</Label>
                      <Input
                        id="nome_completo"
                        value={formData.nome_completo}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                        required
                        className="text-lg"
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="idade">Idade</Label>
                      <Input
                        id="idade"
                        type="number"
                        value={formData.idade}
                        onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))}
                        placeholder="Sua idade"
                        min="1"
                        max="120"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Como nos conheceu */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Como nos conheceu?</h3>
                  <Select 
                    value={formData.como_conheceu} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, como_conheceu: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasConhecimento.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Primeira visita */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="primeira_visita"
                    checked={formData.primeira_visita}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, primeira_visita: checked as boolean }))
                    }
                  />
                  <Label htmlFor="primeira_visita">Esta é minha primeira visita</Label>
                </div>

                {/* Interesses */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    No que você gostaria de se envolver?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {interessesDisponiveis.map((interesse) => {
                      const Icon = interesse.icon;
                      return (
                        <div key={interesse.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <Checkbox
                            id={interesse.id}
                            checked={formData.interessado_em.includes(interesse.id)}
                            onCheckedChange={(checked) => 
                              handleInteresseChange(interesse.id, checked as boolean)
                            }
                          />
                          <Icon className="h-4 w-4 text-primary" />
                          <Label htmlFor={interesse.id} className="text-sm">
                            {interesse.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Alguma informação adicional que gostaria de compartilhar?"
                    rows={3}
                  />
                </div>

                {/* Recepcionista */}
                <div className="space-y-2">
                  <Label htmlFor="recepcionista_nome">Recepcionista</Label>
                  <Input
                    id="recepcionista_nome"
                    value={formData.recepcionista_nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, recepcionista_nome: e.target.value }))}
                    placeholder="Nome do recepcionista"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg font-semibold"
                  disabled={loading || !formData.nome_completo.trim()}
                >
                  {loading ? "Cadastrando..." : "Cadastrar Visitante"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RecepcaoPage;