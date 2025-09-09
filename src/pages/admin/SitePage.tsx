import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreativeStudio from "@/components/creative-studio/CreativeStudio";

const SitePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Studio Digital</h1>
        <p className="text-muted-foreground">
          Gerencie o site da igreja e crie conteúdo visual
        </p>
      </div>
      
      <CreativeStudio />
    </div>
  );
};

export default SitePage;