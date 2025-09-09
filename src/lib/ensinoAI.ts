import { supabase } from '@/integrations/supabase/client';

export type EnsinoAIType = 'recommendations' | 'qna' | 'summary';

export async function ensinoAI(params: {
  type: EnsinoAIType;
  question?: string;
  trilhas?: unknown;
  cursos?: unknown;
  matriculas?: unknown;
}): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ensino-ai', {
      body: params,
    });

    if (error) {
      console.error('EnsinoAI Error:', error);
      throw new Error(`AI function failed: ${error.message}`);
    }
    
    return (data as any)?.content ?? '';
  } catch (error) {
    console.error('EnsinoAI invocation failed:', error);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
}
