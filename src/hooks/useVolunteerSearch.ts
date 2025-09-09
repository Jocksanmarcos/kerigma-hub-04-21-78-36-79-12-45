import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchFilters {
  skillQuery: string;
  interestQuery: string;
}

interface VolunteerProfile {
  id: string;
  name: string;
  volunteer_skills: string[] | null;
  volunteer_interests: string[] | null;
  description: string | null;
}

export function useVolunteerSearch() {
  const [searchResults, setSearchResults] = useState<VolunteerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    skillQuery: '',
    interestQuery: ''
  });

  const searchVolunteers = async () => {
    if (!filters.skillQuery.trim() && !filters.interestQuery.trim()) {
      toast.error('Por favor, preencha pelo menos um campo de busca');
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      let query = supabase
        .from('profiles')
        .select('id, name, volunteer_skills, volunteer_interests, description')
        .not('name', 'is', null);

      // Filtro por habilidades - verifica se algum elemento do array contém a busca
      if (filters.skillQuery.trim()) {
        query = query.overlaps('volunteer_skills', [filters.skillQuery.trim()]);
      }

      // Filtro por interesses - verifica se algum elemento do array contém a busca  
      if (filters.interestQuery.trim()) {
        query = query.overlaps('volunteer_interests', [filters.interestQuery.trim()]);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info('Nenhum voluntário encontrado com os critérios especificados');
      } else {
        toast.success(`${data.length} voluntário(s) encontrado(s)`);
      }

    } catch (error: any) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar voluntários: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setFilters({ skillQuery: '', interestQuery: '' });
  };

  return {
    searchResults,
    isLoading,
    filters,
    setFilters,
    searchVolunteers,
    clearSearch
  };
}