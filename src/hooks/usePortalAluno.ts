import { useState, useEffect } from 'react';
import { offlineDB } from '@/lib/pwa/offline-db';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePWA } from './usePWA';

export interface CourseProgress {
  id: string;
  curso_id: string;
  licao_id: string;
  progress_percent: number;
  completed_at?: string;
  last_video_position?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}

export const usePortalAluno = () => {
  const { toast } = useToast();
  const { isOnline, currentChurchId } = usePWA();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Inicializar IndexedDB
  useEffect(() => {
    offlineDB.init().catch(console.error);
  }, []);

  // Carregar dados ao mudar igreja ou conectar
  useEffect(() => {
    if (currentChurchId) {
      loadAlunoData();
    }
  }, [currentChurchId, isOnline]);

  const loadAlunoData = async () => {
    setLoading(true);
    
    try {
      if (isOnline) {
        // Tentar carregar do servidor
        await loadFromServer();
      } else {
        // Carregar do cache offline
        await loadFromCache();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      // Fallback para cache se online falhar
      if (isOnline) {
        await loadFromCache();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromServer = async () => {
    if (!currentChurchId) return;

    try {
      // Carregar cursos
      const { data: coursesData, error: coursesError } = await supabase
        .from('cursos')
        .select(`
          id,
          nome as title,
          descricao as description,
          imagem_url as image_url,
          total_licoes as total_lessons
        `)
        .eq('church_id', currentChurchId);

      if (coursesError) throw coursesError;

      // Carregar progresso do usuário  
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use existing table - adjust based on your actual schema
      const { data: progressData, error: progressError } = await supabase
        .from('atividades_estudo')
        .select('curso_id, licao_id, pessoa_id')
        .eq('pessoa_id', user.id);

      if (progressError) throw progressError;

      // Transform to match CourseProgress interface
      const transformedProgress = progressData?.map(item => ({
        id: `${item.curso_id}-${item.licao_id}`,
        curso_id: item.curso_id,
        licao_id: item.licao_id,
        progress_percent: 100, // Assume completed if in atividades_estudo
        completed_at: new Date().toISOString()
      })) || [];

      // Processar dados
      const processedCourses = await processCourses(coursesData || [], transformedProgress);
      const processedProgress = transformedProgress;

      // Atualizar estados
      setCourses(processedCourses);
      setProgress(processedProgress);

      // Cachear dados
      await offlineDB.cacheCourses(processedCourses, currentChurchId);
      
      console.log('✅ Dados do aluno carregados do servidor e cacheados');
    } catch (error) {
      console.error('❌ Erro ao carregar do servidor:', error);
      throw error;
    }
  };

  const loadFromCache = async () => {
    if (!currentChurchId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar do cache
      const cachedCourses = await offlineDB.getCachedCourses(currentChurchId);
      const cachedProgress = await offlineDB.getAlunoProgressByUser(user.id, currentChurchId);

      setCourses(cachedCourses);
      setProgress(cachedProgress.map(p => ({
        id: p.id?.toString() || '',
        curso_id: p.curso_id,
        licao_id: p.licao_id,
        progress_percent: p.progress_percent,
        completed_at: p.completed_at,
        last_video_position: undefined
      })));

      console.log('✅ Dados do aluno carregados do cache offline');
    } catch (error) {
      console.error('❌ Erro ao carregar do cache:', error);
    }
  };

  const processCourses = async (coursesData: any[], progressData: CourseProgress[]) => {
    return coursesData.map(course => {
      const courseProgress = progressData.filter(p => p.curso_id === course.id);
      const completedLessons = courseProgress.filter(p => p.progress_percent === 100).length;
      const totalProgress = courseProgress.length > 0
        ? courseProgress.reduce((sum, p) => sum + p.progress_percent, 0) / courseProgress.length
        : 0;

      return {
        ...course,
        completed_lessons: completedLessons,
        progress_percent: Math.round(totalProgress)
      };
    });
  };

  const updateProgress = async (
    courseId: string, 
    lessonId: string, 
    progressPercent: number,
    completed?: boolean
  ) => {
    if (!currentChurchId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const progressData = {
      user_id: user.id,
      curso_id: courseId,
      licao_id: lessonId,
      progress_percent: progressPercent,
      completed_at: completed ? new Date().toISOString() : undefined,
      church_id: currentChurchId,
      timestamp: Date.now(),
      synced: false
    };

    try {
      if (isOnline) {
        // Save to atividades_estudo table instead
        const { error } = await supabase
          .from('atividades_estudo')
          .insert({
            pessoa_id: user.id,
            curso_id: courseId,
            licao_id: lessonId,
            tipo_atividade: 'video_completo',
            duracao_minutos: 0,
            data_atividade: new Date().toISOString().split('T')[0]
          });

        if (error) throw error;
        
        console.log('✅ Progresso salvo no servidor');
      } else {
        // Salvar no cache offline para sincronização posterior
        await offlineDB.saveAlunoProgress(progressData);
        
        toast({
          title: "Progresso salvo offline",
          description: "Será sincronizado quando a conexão for restaurada.",
          duration: 3000
        });
      }

      // Atualizar estado local
      setProgress(prev => {
        const filtered = prev.filter(p => !(p.curso_id === courseId && p.licao_id === lessonId));
        return [...filtered, {
          id: Date.now().toString(),
          curso_id: courseId,
          licao_id: lessonId,
          progress_percent: progressPercent,
          completed_at: progressData.completed_at
        }];
      });

      // Reprocessar cursos
      const updatedCourses = await processCourses(courses, progress);
      setCourses(updatedCourses);

    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      
      // Fallback para cache mesmo se online
      await offlineDB.saveAlunoProgress(progressData);
      
      toast({
        title: "Erro ao salvar",
        description: "Progresso salvo offline para sincronização posterior.",
        variant: "destructive"
      });
    }
  };

  const syncOfflineProgress = async () => {
    if (!isOnline || !currentChurchId) return;

    setSyncing(true);
    
    try {
      const pendingProgress = await offlineDB.getPendingAlunoProgress(currentChurchId);
      
      for (const progress of pendingProgress) {
        try {
          const { error } = await supabase
            .from('atividades_estudo')
            .insert({
              pessoa_id: progress.user_id,
              curso_id: progress.curso_id,
              licao_id: progress.licao_id,
              tipo_atividade: 'video_completo',
              duracao_minutos: 0,
              data_atividade: new Date().toISOString().split('T')[0]
            });

          if (!error && progress.id) {
            await offlineDB.markProgressAsSynced(progress.id);
          }
        } catch (error) {
          console.error('❌ Erro ao sincronizar progresso:', progress, error);
        }
      }

      if (pendingProgress.length > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${pendingProgress.length} progresso(s) sincronizado(s).`,
          duration: 3000
        });

        // Recarregar dados do servidor
        await loadFromServer();
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync quando voltar online
  useEffect(() => {
    if (isOnline && currentChurchId) {
      syncOfflineProgress();
    }
  }, [isOnline, currentChurchId]);

  return {
    courses,
    progress,
    loading,
    syncing,
    isOnline,
    updateProgress,
    syncOfflineProgress,
    reloadData: loadAlunoData
  };
};