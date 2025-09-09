import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verificarProgressoDesafios } from '../_shared/challenge-checker.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const PONTOS_POR_ACERTO = 50;

type V2Answer = { perguntaId: string; resposta: string };
interface V1Payload {
  reference_id: string;
  respostas: Record<string, string>; // { [pergunta_id]: resposta }
  pessoa_id?: string; // legado
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não suportado. Use POST." }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: "Configuração do servidor ausente." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Autenticação via JWT
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const user = userData.user;

    // Parse do corpo com suporte a dois formatos (legado e novo)
    const body = await req.json().catch(() => null);

    // v2 (novo): array direto ou body.answers
    const v2Answers: V2Answer[] | null = Array.isArray(body)
      ? body
      : Array.isArray(body?.answers)
      ? body.answers
      : null;

    // v1 (legado): { reference_id, respostas: { [id]: resposta }, pessoa_id? }
    const v1Payload: V1Payload | null = !v2Answers && body?.reference_id && body?.respostas
      ? (body as V1Payload)
      : null;

    if (!v2Answers && !v1Payload) {
      return new Response(JSON.stringify({ error: "Formato do payload inválido." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Buscar alternativas corretas
    let correctMap = new Map<string, string>();
    let answered: { pergunta_id: string; resposta: string }[] = [];

    if (v2Answers) {
      const ids = v2Answers.map((a) => a.perguntaId);
      const { data: qs, error: qsErr } = await supabase
        .from("biblia_quiz_perguntas")
        .select("id, resposta_correta")
        .in("id", ids);
      if (qsErr) throw qsErr;
      correctMap = new Map((qs ?? []).map((q: any) => [q.id, q.resposta_correta]));
      answered = v2Answers.map((a) => ({ pergunta_id: a.perguntaId, resposta: a.resposta }));
    } else if (v1Payload) {
      const { reference_id, respostas } = v1Payload;
      const { data: qs, error: qsErr } = await supabase
        .from("biblia_quiz_perguntas")
        .select("id, resposta_correta")
        .eq("reference_id", reference_id);
      if (qsErr) throw qsErr;
      correctMap = new Map((qs ?? []).map((q: any) => [q.id, q.resposta_correta]));
      answered = Object.entries(respostas).map(([pergunta_id, resposta]) => ({ pergunta_id, resposta: String(resposta) }));
    }

    if (answered.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhuma resposta foi fornecida." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Calcula pontuação
    let acertos = 0;
    const respostasParaInserir = answered.map((ans) => {
      const isCorrect = correctMap.get(ans.pergunta_id) === ans.resposta;
      if (isCorrect) acertos++;
      return {
        user_id: user.id,
        pergunta_id: ans.pergunta_id,
        resposta_dada: ans.resposta,
        acertou: isCorrect,
        respondido_em: new Date().toISOString(),
      };
    });

    const pontos_ganhos = acertos * PONTOS_POR_ACERTO;

    // Persiste respostas (ignora erros de duplicidade)
    const { error: insertAnsErr } = await supabase
      .from("biblia_quiz_respostas_usuarios")
      .insert(respostasParaInserir);
    if (insertAnsErr) {
      console.warn("Aviso ao inserir respostas (ignorado)", insertAnsErr.message);
    }

    // Garante perfil do usuário
    const { data: perfil, error: perfilErr } = await supabase
      .from("jornada_perfis_usuarios")
      .select("pontos_sabedoria, nivel")
      .eq("user_id", user.id)
      .maybeSingle();

    if (perfilErr) {
      console.error("Erro ao buscar perfil:", perfilErr);
      return new Response(JSON.stringify({ error: "Falha ao carregar perfil." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!perfil) {
      const { error: createProfileErr } = await supabase
        .from("jornada_perfis_usuarios")
        .insert({ user_id: user.id, pontos_sabedoria: 0, nivel: "Aprendiz" });
      if (createProfileErr) {
        console.error("Erro ao criar perfil:", createProfileErr);
        return new Response(JSON.stringify({ error: "Falha ao criar perfil." }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    const pontosAntigos = perfil?.pontos_sabedoria ?? 0;
    const nivelAntigo = perfil?.nivel ?? "Aprendiz";
    const novosPontos = pontosAntigos + pontos_ganhos;

    // Calcula novo nível
    const { data: niveis, error: niveisErr } = await supabase
      .from("jornada_niveis")
      .select("nome_nivel, pontos_necessarios")
      .lte("pontos_necessarios", novosPontos)
      .order("pontos_necessarios", { ascending: false })
      .limit(1);

    if (niveisErr) {
      console.error("Erro ao buscar níveis:", niveisErr);
      return new Response(JSON.stringify({ error: "Falha ao calcular nível." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const novoNivel = niveis?.[0]?.nome_nivel ?? nivelAntigo;
    const subiu_de_nivel = novoNivel !== nivelAntigo;

    // Atualiza perfil
    const { error: updErr } = await supabase
      .from("jornada_perfis_usuarios")
      .update({ pontos_sabedoria: novosPontos, nivel: novoNivel, ultima_atividade_em: new Date().toISOString() })
      .eq("user_id", user.id);
    if (updErr) {
      console.error("Erro ao atualizar perfil:", updErr);
      return new Response(JSON.stringify({ error: "Falha ao atualizar perfil." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // (Opcional) Registrar resultado agregado em quiz_resultados para compatibilidade
    try {
      // Encontrar pessoa_id a partir do usuário autenticado
      const { data: pessoa, error: pessoaErr } = await supabase
        .from("pessoas")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!pessoaErr && pessoa?.id) {
        const total_perguntas = answered.length;
        const percentual = total_perguntas > 0 ? (acertos / total_perguntas) * 100 : 0;
        const reference_id = v1Payload?.reference_id ?? null;

        await supabase.from("quiz_resultados").insert({
          pessoa_id: pessoa.id,
          reference_id: reference_id ?? "",
          total_perguntas,
          acertos,
          pontos_ganhos,
          respostas_detalhadas: v1Payload?.respostas ?? answered.reduce((acc, a) => ({ ...acc, [a.pergunta_id]: a.resposta }), {} as Record<string, string>),
          percentual,
        });
      }
    } catch (logErr) {
      console.warn("Falha ao registrar quiz_resultados (opcional):", (logErr as Error).message);
    }

    // Verifica progresso de desafios e concede recompensas se aplicável
    try {
      // Obtém o reference_id do quiz para verificar desafios
      const quizReferenceId = v1Payload?.reference_id || null;
      if (quizReferenceId) {
        await verificarProgressoDesafios(supabase, user.id, { type: 'quiz', id: quizReferenceId });
      }
    } catch (challengeError) {
      console.error('Erro ao verificar desafios de quiz:', challengeError);
      // Não quebra a função principal se a verificação de desafio falhar
    }

    return new Response(
      JSON.stringify({
        acertos,
        total_perguntas: answered.length,
        pontos_ganhos,
        novo_total_pontos: novosPontos,
        subiu_de_nivel,
        novo_nivel: novoNivel,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("Erro na função processar-quiz:", err);
    return new Response(
      JSON.stringify({ error: (err as Error)?.message ?? "Erro interno" }),
      { status: 500, headers: corsHeaders },
    );
  }
});