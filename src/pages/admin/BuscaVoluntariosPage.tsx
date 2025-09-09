import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, X } from 'lucide-react';
import { useVolunteerSearch } from '@/hooks/useVolunteerSearch';

const BuscaVoluntariosPage: React.FC = () => {
  const { 
    searchResults, 
    isLoading, 
    filters, 
    setFilters, 
    searchVolunteers, 
    clearSearch 
  } = useVolunteerSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchVolunteers();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Busca de Talentos</h1>
          <p className="text-muted-foreground">
            Encontre voluntários por suas habilidades e interesses
          </p>
        </div>

        {/* Formulário de Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Critérios de Busca
            </CardTitle>
            <CardDescription>
              Digite habilidades ou interesses para encontrar voluntários compatíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skill">Buscar por Habilidade</Label>
                  <Input
                    id="skill"
                    type="text"
                    placeholder="Ex: música, tecnologia, comunicação..."
                    value={filters.skillQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, skillQuery: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interest">Buscar por Interesse</Label>
                  <Input
                    id="interest"
                    type="text"
                    placeholder="Ex: crianças, jovens, eventos..."
                    value={filters.interestQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, interestQuery: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearSearch}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resultados */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
              <CardDescription>
                {searchResults.length} voluntário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((volunteer) => (
                  <div 
                    key={volunteer.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{volunteer.name}</h3>
                          {volunteer.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {volunteer.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {volunteer.volunteer_skills && volunteer.volunteer_skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Habilidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {volunteer.volunteer_skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {volunteer.volunteer_interests && volunteer.volunteer_interests.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Interesses:</p>
                          <div className="flex flex-wrap gap-1">
                            {volunteer.volunteer_interests.map((interest, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {!isLoading && searchResults.length === 0 && (filters.skillQuery || filters.interestQuery) && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os critérios de busca ou use termos diferentes
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default BuscaVoluntariosPage;