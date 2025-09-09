import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, DollarSign, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DonationStats {
  total_doacoes_mes: number;
  total_doacoes_ano: number;
  quantidade_doacoes: number;
  integracao_ativa: boolean;
  ultima_atualizacao: string;
}

interface RecentDonation {
  id: string;
  valor: number;
  descricao: string;
  data_lancamento: string;
  forma_pagamento: string;
  status: string;
  numero_documento: string;
  created_at: string;
}

export const DonationsIntegrationStatus: React.FC = () => {
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const { data: statsData, error: statsError } = await supabase.functions.invoke('api-financeiro/estatisticas-doacoes');
      
      if (statsError) {
        throw new Error(statsError.message);
      }

      if (statsData?.success) {
        setStats(statsData.data);
      }

      // Buscar doações recentes
      const { data: donationsData, error: donationsError } = await supabase.functions.invoke('api-financeiro/doacoes-recentes');
      
      if (donationsError) {
        throw new Error(donationsError.message);
      }

      if (donationsData?.success) {
        setRecentDonations(donationsData.data || []);
      }

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Verifique sua conexão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Status da Integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Integração Doações → Central Financeira
          </CardTitle>
          <CardDescription>
            Status da integração automática entre "Semear & Transformar" e a Central Financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stats?.integracao_ativa ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Integração Ativa</p>
                    <p className="text-sm text-muted-foreground">
                      Doações são registradas automaticamente
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-700">Status Desconhecido</p>
                    <p className="text-sm text-muted-foreground">
                      Verificando conexão...
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          
          {stats?.ultima_atualizacao && (
            <p className="text-xs text-muted-foreground mt-2">
              Última atualização: {formatDate(stats.ultima_atualizacao)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Doações */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doações do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(stats.total_doacoes_mes)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doações do Ano</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(stats.total_doacoes_ano)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Doações</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.quantidade_doacoes}
              </div>
              <p className="text-xs text-muted-foreground">
                doações online registradas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Doações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Doações Online Recentes</CardTitle>
          <CardDescription>
            Últimas doações processadas automaticamente via Mercado Pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentDonations.length > 0 ? (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{donation.descricao}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(donation.data_lancamento)}</span>
                      <Badge variant="outline" className="text-xs">
                        {donation.forma_pagamento}
                      </Badge>
                      {donation.status === 'confirmado' ? (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          Confirmado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {donation.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(donation.valor)}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {donation.numero_documento}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma doação online encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                As doações aparecerão aqui quando processadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};