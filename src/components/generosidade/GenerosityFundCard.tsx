import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Globe, Building, DollarSign, Gift } from "lucide-react";

interface GenerosityFundCardProps {
  fund: {
    id: string;
    nome: string;
    descricao: string;
    cor: string;
    meta_mensal?: number;
  };
  onDonate: (fundId: string, fundName: string) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'Missões': Globe,
  'Ação Social': Heart,
  'Construção': Building,
  'Dízimos': DollarSign,
  'Ofertas Especiais': Gift,
  'Geral': DollarSign,
  'Jovens': Heart
};

export const GenerosityFundCard: React.FC<GenerosityFundCardProps> = ({
  fund,
  onDonate
}) => {
  const IconComponent = iconMap[fund.nome] || DollarSign;

  return (
    <Card 
      className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${fund.cor}15, ${fund.cor}05)`,
        borderColor: `${fund.cor}30`
      }}
      onClick={() => onDonate(fund.id, fund.nome)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="p-3 rounded-full"
            style={{ backgroundColor: `${fund.cor}20` }}
          >
            <IconComponent 
              className="h-6 w-6" 
              style={{ color: fund.cor }}
            />
          </div>
          
          <div className="text-right">
            {fund.meta_mensal && (
              <p className="text-sm text-muted-foreground">
                Meta: R$ {fund.meta_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2" style={{ color: fund.cor }}>
          {fund.nome}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {fund.descricao}
        </p>

        <Button 
          className="w-full group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundColor: fund.cor }}
        >
          <Heart className="w-4 h-4 mr-2" />
          Semear Aqui
        </Button>

        {/* Animated background effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${fund.cor}, transparent)`
          }}
        />
      </CardContent>
    </Card>
  );
};