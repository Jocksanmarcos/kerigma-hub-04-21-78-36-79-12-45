export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      abac_rules: {
        Row: {
          action: string
          active: boolean
          condition: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          profile_id: string | null
          resource_type: string | null
          scope: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action: string
          active?: boolean
          condition?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          profile_id?: string | null
          resource_type?: string | null
          scope?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          active?: boolean
          condition?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          resource_type?: string | null
          scope?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abac_rules_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acompanhamento_visitantes: {
        Row: {
          created_at: string | null
          data_primeira_visita: string
          data_proxima_acao: string | null
          id: string
          observacoes: string | null
          proxima_acao: string | null
          responsavel_id: string | null
          status_acompanhamento: string | null
          updated_at: string | null
          visitante_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_primeira_visita: string
          data_proxima_acao?: string | null
          id?: string
          observacoes?: string | null
          proxima_acao?: string | null
          responsavel_id?: string | null
          status_acompanhamento?: string | null
          updated_at?: string | null
          visitante_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_primeira_visita?: string
          data_proxima_acao?: string | null
          id?: string
          observacoes?: string | null
          proxima_acao?: string | null
          responsavel_id?: string | null
          status_acompanhamento?: string | null
          updated_at?: string | null
          visitante_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acompanhamento_visitantes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acompanhamento_visitantes_visitante_id_fkey"
            columns: ["visitante_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamento_participantes: {
        Row: {
          agendamento_id: string
          created_at: string
          id: string
          papel: string | null
          pessoa_id: string
          status: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          id?: string
          papel?: string | null
          pessoa_id: string
          status?: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          id?: string
          papel?: string | null
          pessoa_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_participantes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_participantes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamento_recursos: {
        Row: {
          agendamento_id: string
          created_at: string
          id: string
          observacoes: string | null
          quantidade: number
          recurso_id: string
          status: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          recurso_id: string
          status?: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          recurso_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_recursos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_recursos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          agendamento_pastoral_id: string | null
          calendario_id: string
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          descricao: string | null
          id: string
          local: string | null
          recorrencia_config: Json | null
          recorrente: boolean
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
          visitante_email: string | null
          visitante_nome: string | null
          visitante_telefone: string | null
        }
        Insert: {
          agendamento_pastoral_id?: string | null
          calendario_id: string
          created_at?: string
          data_hora_fim: string
          data_hora_inicio: string
          descricao?: string | null
          id?: string
          local?: string | null
          recorrencia_config?: Json | null
          recorrente?: boolean
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
          visitante_email?: string | null
          visitante_nome?: string | null
          visitante_telefone?: string | null
        }
        Update: {
          agendamento_pastoral_id?: string | null
          calendario_id?: string
          created_at?: string
          data_hora_fim?: string
          data_hora_inicio?: string
          descricao?: string | null
          id?: string
          local?: string | null
          recorrencia_config?: Json | null
          recorrente?: boolean
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          visitante_email?: string | null
          visitante_nome?: string | null
          visitante_telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_agendamento_pastoral_id_fkey"
            columns: ["agendamento_pastoral_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_pastorais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_calendario_id_fkey"
            columns: ["calendario_id"]
            isOneToOne: false
            referencedRelation: "calendarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos_pastorais: {
        Row: {
          agendamento_id: string | null
          confidencial: boolean
          created_at: string
          data_agendamento: string | null
          data_conclusao: string | null
          data_solicitacao: string
          detalhes_pedido: string | null
          email_contato: string | null
          id: string
          motivo_contato: string
          observacoes_pastor: string | null
          pastor_responsavel_id: string | null
          preferencia_horario: string | null
          solicitante_id: string | null
          status: Database["public"]["Enums"]["status_agendamento_pastoral"]
          telefone_contato: string | null
          updated_at: string
          urgencia: string | null
        }
        Insert: {
          agendamento_id?: string | null
          confidencial?: boolean
          created_at?: string
          data_agendamento?: string | null
          data_conclusao?: string | null
          data_solicitacao?: string
          detalhes_pedido?: string | null
          email_contato?: string | null
          id?: string
          motivo_contato: string
          observacoes_pastor?: string | null
          pastor_responsavel_id?: string | null
          preferencia_horario?: string | null
          solicitante_id?: string | null
          status?: Database["public"]["Enums"]["status_agendamento_pastoral"]
          telefone_contato?: string | null
          updated_at?: string
          urgencia?: string | null
        }
        Update: {
          agendamento_id?: string | null
          confidencial?: boolean
          created_at?: string
          data_agendamento?: string | null
          data_conclusao?: string | null
          data_solicitacao?: string
          detalhes_pedido?: string | null
          email_contato?: string | null
          id?: string
          motivo_contato?: string
          observacoes_pastor?: string | null
          pastor_responsavel_id?: string | null
          preferencia_horario?: string | null
          solicitante_id?: string | null
          status?: Database["public"]["Enums"]["status_agendamento_pastoral"]
          telefone_contato?: string | null
          updated_at?: string
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_pastorais_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pastorais_pastor_responsavel_id_fkey"
            columns: ["pastor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pastorais_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      aluno_stats: {
        Row: {
          badge_atual: string | null
          created_at: string | null
          id: string
          next_level_xp: number | null
          nivel: string | null
          pessoa_id: string
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          badge_atual?: string | null
          created_at?: string | null
          id?: string
          next_level_xp?: number | null
          nivel?: string | null
          pessoa_id: string
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          badge_atual?: string | null
          created_at?: string | null
          id?: string
          next_level_xp?: number | null
          nivel?: string | null
          pessoa_id?: string
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aluno_stats_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_ia_pastoral: {
        Row: {
          created_at: string
          dados_contexto: Json | null
          id: string
          pessoa_id: string
          resultado: string
          tipo_analise: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dados_contexto?: Json | null
          id?: string
          pessoa_id: string
          resultado: string
          tipo_analise: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dados_contexto?: Json | null
          id?: string
          pessoa_id?: string
          resultado?: string
          tipo_analise?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_ia_pastoral_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      atividades_estudo: {
        Row: {
          created_at: string
          curso_id: string | null
          data_atividade: string
          duracao_minutos: number | null
          id: string
          licao_id: string | null
          pessoa_id: string
          tipo_atividade: string
        }
        Insert: {
          created_at?: string
          curso_id?: string | null
          data_atividade?: string
          duracao_minutos?: number | null
          id?: string
          licao_id?: string | null
          pessoa_id: string
          tipo_atividade: string
        }
        Update: {
          created_at?: string
          curso_id?: string | null
          data_atividade?: string
          duracao_minutos?: number | null
          id?: string
          licao_id?: string | null
          pessoa_id?: string
          tipo_atividade?: string
        }
        Relationships: []
      }
      aulas: {
        Row: {
          conteudo_principal: string | null
          created_at: string
          curso_id: string
          disponivel_apos_data: string | null
          duracao_minutos: number | null
          id: string
          material_extra_url: string | null
          ordem: number
          tipo_conteudo: string
          titulo_aula: string
          updated_at: string
        }
        Insert: {
          conteudo_principal?: string | null
          created_at?: string
          curso_id: string
          disponivel_apos_data?: string | null
          duracao_minutos?: number | null
          id?: string
          material_extra_url?: string | null
          ordem?: number
          tipo_conteudo?: string
          titulo_aula: string
          updated_at?: string
        }
        Update: {
          conteudo_principal?: string | null
          created_at?: string
          curso_id?: string
          disponivel_apos_data?: string | null
          duracao_minutos?: number | null
          id?: string
          material_extra_url?: string | null
          ordem?: number
          tipo_conteudo?: string
          titulo_aula?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_jobs: {
        Row: {
          backup_location: string | null
          backup_size_mb: number | null
          completed_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          job_type: string
          metadata: Json | null
          started_at: string | null
          status: string
          tables_included: string[] | null
        }
        Insert: {
          backup_location?: string | null
          backup_size_mb?: number | null
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
        }
        Update: {
          backup_location?: string | null
          backup_size_mb?: number | null
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
        }
        Relationships: []
      }
      badges_ensino: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          criterio: Json
          descricao: string | null
          icone_url: string | null
          id: string
          nome: string
          pontos_bonus: number | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          criterio: Json
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nome: string
          pontos_bonus?: number | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          criterio?: Json
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nome?: string
          pontos_bonus?: number | null
        }
        Relationships: []
      }
      banners_home: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          imagem_url: string
          link_texto: string | null
          link_url: string | null
          ordem: number
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url: string
          link_texto?: string | null
          link_url?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url?: string
          link_texto?: string | null
          link_url?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      biblia_capitulos: {
        Row: {
          created_at: string | null
          id: string
          livro_id: string
          numero: number
          titulo: string | null
          updated_at: string | null
          versao_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          livro_id: string
          numero: number
          titulo?: string | null
          updated_at?: string | null
          versao_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          livro_id?: string
          numero?: number
          titulo?: string | null
          updated_at?: string | null
          versao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblia_capitulos_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblia_livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblia_capitulos_versao_id_fkey"
            columns: ["versao_id"]
            isOneToOne: false
            referencedRelation: "biblia_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      biblia_historico_leitura: {
        Row: {
          capitulo: number
          created_at: string | null
          data_leitura: string | null
          dispositivo: string | null
          id: string
          livro_id: string
          tempo_leitura_segundos: number | null
          user_id: string | null
          versao_id: string | null
        }
        Insert: {
          capitulo: number
          created_at?: string | null
          data_leitura?: string | null
          dispositivo?: string | null
          id?: string
          livro_id: string
          tempo_leitura_segundos?: number | null
          user_id?: string | null
          versao_id?: string | null
        }
        Update: {
          capitulo?: number
          created_at?: string | null
          data_leitura?: string | null
          dispositivo?: string | null
          id?: string
          livro_id?: string
          tempo_leitura_segundos?: number | null
          user_id?: string | null
          versao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biblia_historico_leitura_versao_id_fkey"
            columns: ["versao_id"]
            isOneToOne: false
            referencedRelation: "biblia_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      biblia_livros: {
        Row: {
          abreviacao: string | null
          codigo_osis: string | null
          genero_literario: string | null
          id: string
          nome: string
          nome_original: string | null
          nome_portugues: string | null
          ordinal: number
          testamento: string | null
          total_capitulos: number | null
          versao_id: string
        }
        Insert: {
          abreviacao?: string | null
          codigo_osis?: string | null
          genero_literario?: string | null
          id: string
          nome: string
          nome_original?: string | null
          nome_portugues?: string | null
          ordinal: number
          testamento?: string | null
          total_capitulos?: number | null
          versao_id: string
        }
        Update: {
          abreviacao?: string | null
          codigo_osis?: string | null
          genero_literario?: string | null
          id?: string
          nome?: string
          nome_original?: string | null
          nome_portugues?: string | null
          ordinal?: number
          testamento?: string | null
          total_capitulos?: number | null
          versao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblia_livros_versao_fk"
            columns: ["versao_id"]
            isOneToOne: false
            referencedRelation: "biblia_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      biblia_preferencias_usuario: {
        Row: {
          created_at: string | null
          id: string
          mostrar_numeros_versiculos: boolean | null
          tamanho_fonte: string | null
          tema_leitura: string | null
          updated_at: string | null
          user_id: string | null
          versao_preferida: string | null
          versoes_paralelas: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mostrar_numeros_versiculos?: boolean | null
          tamanho_fonte?: string | null
          tema_leitura?: string | null
          updated_at?: string | null
          user_id?: string | null
          versao_preferida?: string | null
          versoes_paralelas?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mostrar_numeros_versiculos?: boolean | null
          tamanho_fonte?: string | null
          tema_leitura?: string | null
          updated_at?: string | null
          user_id?: string | null
          versao_preferida?: string | null
          versoes_paralelas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "biblia_preferencias_usuario_versao_preferida_fkey"
            columns: ["versao_preferida"]
            isOneToOne: false
            referencedRelation: "biblia_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      biblia_quiz_perguntas: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          id: string
          opcoes: Json
          reference_id: string
          resposta_correta: string
          texto_pergunta: string
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          opcoes: Json
          reference_id: string
          resposta_correta: string
          texto_pergunta: string
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          opcoes?: Json
          reference_id?: string
          resposta_correta?: string
          texto_pergunta?: string
        }
        Relationships: []
      }
      biblia_quiz_respostas_usuarios: {
        Row: {
          acertou: boolean
          pergunta_id: string
          respondido_em: string | null
          resposta_dada: string
          user_id: string
        }
        Insert: {
          acertou: boolean
          pergunta_id: string
          respondido_em?: string | null
          resposta_dada: string
          user_id: string
        }
        Update: {
          acertou?: boolean
          pergunta_id?: string
          respondido_em?: string | null
          resposta_dada?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblia_quiz_respostas_usuarios_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "biblia_quiz_perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      biblia_versiculos: {
        Row: {
          capitulo: number
          livro_id: string
          texto: string
          versao_id: string
          versiculo: number
        }
        Insert: {
          capitulo: number
          livro_id: string
          texto: string
          versao_id: string
          versiculo: number
        }
        Update: {
          capitulo?: number
          livro_id?: string
          texto?: string
          versao_id?: string
          versiculo?: number
        }
        Relationships: [
          {
            foreignKeyName: "biblia_versiculos_livro_fk"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblia_livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblia_versiculos_versao_fk"
            columns: ["versao_id"]
            isOneToOne: false
            referencedRelation: "biblia_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      biblia_versoes: {
        Row: {
          abreviacao: string | null
          ano_publicacao: number | null
          ativa: boolean | null
          codigo_versao: string | null
          copyright_info: string | null
          descricao: string | null
          editora: string | null
          id: string
          idioma: string
          nome: string
          ordem_exibicao: number | null
        }
        Insert: {
          abreviacao?: string | null
          ano_publicacao?: number | null
          ativa?: boolean | null
          codigo_versao?: string | null
          copyright_info?: string | null
          descricao?: string | null
          editora?: string | null
          id: string
          idioma?: string
          nome: string
          ordem_exibicao?: number | null
        }
        Update: {
          abreviacao?: string | null
          ano_publicacao?: number | null
          ativa?: boolean | null
          codigo_versao?: string | null
          copyright_info?: string | null
          descricao?: string | null
          editora?: string | null
          id?: string
          idioma?: string
          nome?: string
          ordem_exibicao?: number | null
        }
        Relationships: []
      }
      biblioteca_categorias: {
        Row: {
          ativa: boolean | null
          cor: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      biblioteca_emprestimos: {
        Row: {
          created_at: string | null
          data_devolucao_prevista: string
          data_devolucao_real: string | null
          data_emprestimo: string | null
          id: string
          livro_id: string
          observacoes: string | null
          pessoa_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_devolucao_prevista: string
          data_devolucao_real?: string | null
          data_emprestimo?: string | null
          id?: string
          livro_id: string
          observacoes?: string | null
          pessoa_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_devolucao_prevista?: string
          data_devolucao_real?: string | null
          data_emprestimo?: string | null
          id?: string
          livro_id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_emprestimos_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_emprestimos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_estatisticas: {
        Row: {
          created_at: string
          id: string
          livro_id: string
          media_avaliacao: number | null
          total_emprestimos: number | null
          total_leituras_digitais: number | null
          total_resenhas: number | null
          total_reservas: number | null
          ultima_atualizacao: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          livro_id: string
          media_avaliacao?: number | null
          total_emprestimos?: number | null
          total_leituras_digitais?: number | null
          total_resenhas?: number | null
          total_reservas?: number | null
          ultima_atualizacao?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          livro_id?: string
          media_avaliacao?: number | null
          total_emprestimos?: number | null
          total_leituras_digitais?: number | null
          total_resenhas?: number | null
          total_reservas?: number | null
          ultima_atualizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_estatisticas_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_livros"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_leituras: {
        Row: {
          concluida: boolean | null
          created_at: string
          data_acesso: string | null
          id: string
          livro_id: string
          pessoa_id: string
          progresso_percentual: number | null
          tempo_leitura_minutos: number | null
          updated_at: string
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string
          data_acesso?: string | null
          id?: string
          livro_id: string
          pessoa_id: string
          progresso_percentual?: number | null
          tempo_leitura_minutos?: number | null
          updated_at?: string
        }
        Update: {
          concluida?: boolean | null
          created_at?: string
          data_acesso?: string | null
          id?: string
          livro_id?: string
          pessoa_id?: string
          progresso_percentual?: number | null
          tempo_leitura_minutos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_leituras_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_leituras_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_livros: {
        Row: {
          ano_publicacao: number | null
          ativo: boolean | null
          autor: string | null
          categoria: string | null
          created_at: string | null
          editora: string | null
          id: string
          imagem_capa_url: string | null
          isbn: string | null
          localizacao_fisica: string | null
          numero_copias: number | null
          numero_paginas: number | null
          qr_code_interno: string | null
          sinopse: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ano_publicacao?: number | null
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          created_at?: string | null
          editora?: string | null
          id?: string
          imagem_capa_url?: string | null
          isbn?: string | null
          localizacao_fisica?: string | null
          numero_copias?: number | null
          numero_paginas?: number | null
          qr_code_interno?: string | null
          sinopse?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ano_publicacao?: number | null
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          created_at?: string | null
          editora?: string | null
          id?: string
          imagem_capa_url?: string | null
          isbn?: string | null
          localizacao_fisica?: string | null
          numero_copias?: number | null
          numero_paginas?: number | null
          qr_code_interno?: string | null
          sinopse?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      biblioteca_notificacoes_log: {
        Row: {
          created_at: string
          data_envio: string | null
          email_destinatario: string
          erro_detalhes: string | null
          id: string
          metadata: Json | null
          motivo_recusa: string | null
          reserva_id: string | null
          status_envio: string
          tipo_notificacao: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_envio?: string | null
          email_destinatario: string
          erro_detalhes?: string | null
          id?: string
          metadata?: Json | null
          motivo_recusa?: string | null
          reserva_id?: string | null
          status_envio?: string
          tipo_notificacao: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_envio?: string | null
          email_destinatario?: string
          erro_detalhes?: string | null
          id?: string
          metadata?: Json | null
          motivo_recusa?: string | null
          reserva_id?: string | null
          status_envio?: string
          tipo_notificacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_notificacoes_log_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_recursos_celulas: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          arquivo_nome: string | null
          arquivo_tamanho: string | null
          arquivo_url: string | null
          ativo: boolean | null
          categoria: string | null
          created_at: string
          criado_por: string | null
          descricao: string | null
          downloads: number | null
          id: string
          publico_alvo: string[] | null
          tags: string[] | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: string | null
          arquivo_url?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          downloads?: number | null
          id?: string
          publico_alvo?: string[] | null
          tags?: string[] | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: string | null
          arquivo_url?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          downloads?: number | null
          id?: string
          publico_alvo?: string[] | null
          tags?: string[] | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_recursos_celulas_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_recursos_celulas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_resenhas: {
        Row: {
          aprovada: boolean | null
          conteudo: string
          created_at: string
          id: string
          livro_id: string
          moderada_por: string | null
          nota: number | null
          pessoa_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aprovada?: boolean | null
          conteudo: string
          created_at?: string
          id?: string
          livro_id: string
          moderada_por?: string | null
          nota?: number | null
          pessoa_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          aprovada?: boolean | null
          conteudo?: string
          created_at?: string
          id?: string
          livro_id?: string
          moderada_por?: string | null
          nota?: number | null
          pessoa_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_resenhas_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_resenhas_moderada_por_fkey"
            columns: ["moderada_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_resenhas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      biblioteca_reservas: {
        Row: {
          created_at: string | null
          data_expiracao: string | null
          data_processamento: string | null
          data_reserva: string | null
          id: string
          livro_id: string
          motivo_recusa: string | null
          pessoa_id: string
          processado_por: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data_expiracao?: string | null
          data_processamento?: string | null
          data_reserva?: string | null
          id?: string
          livro_id: string
          motivo_recusa?: string | null
          pessoa_id: string
          processado_por?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data_expiracao?: string | null
          data_processamento?: string | null
          data_reserva?: string | null
          id?: string
          livro_id?: string
          motivo_recusa?: string | null
          pessoa_id?: string
          processado_por?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_reservas_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_reservas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      birthday_notification_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_content: string | null
          notification_config_id: string
          notification_type: string
          pessoa_id: string
          recipient: string
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string | null
          notification_config_id: string
          notification_type: string
          pessoa_id: string
          recipient: string
          sent_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string | null
          notification_config_id?: string
          notification_type?: string
          pessoa_id?: string
          recipient?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthday_notification_logs_notification_config_id_fkey"
            columns: ["notification_config_id"]
            isOneToOne: false
            referencedRelation: "birthday_notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birthday_notification_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      birthday_notifications: {
        Row: {
          church_id: string | null
          created_at: string
          days_before: number
          id: string
          is_active: boolean
          message_template: string
          notification_type: string
          send_time: string
          subject_template: string | null
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          days_before?: number
          id?: string
          is_active?: boolean
          message_template?: string
          notification_type?: string
          send_time?: string
          subject_template?: string | null
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          days_before?: number
          id?: string
          is_active?: boolean
          message_template?: string
          notification_type?: string
          send_time?: string
          subject_template?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthday_notifications_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      blocos_conteudo: {
        Row: {
          atualizado_em: string | null
          conteudo_json: Json | null
          criado_em: string | null
          id: string
          ordem: number
          secao_id: string
          tipo_bloco: string
        }
        Insert: {
          atualizado_em?: string | null
          conteudo_json?: Json | null
          criado_em?: string | null
          id?: string
          ordem?: number
          secao_id: string
          tipo_bloco: string
        }
        Update: {
          atualizado_em?: string | null
          conteudo_json?: Json | null
          criado_em?: string | null
          id?: string
          ordem?: number
          secao_id?: string
          tipo_bloco?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocos_conteudo_secao_id_fkey"
            columns: ["secao_id"]
            isOneToOne: false
            referencedRelation: "secoes_pagina"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          category: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          format: string
          id: string
          publication_year: number | null
          publisher: string | null
          status: string
          title: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          format?: string
          id?: string
          publication_year?: number | null
          publisher?: string | null
          status?: string
          title: string
        }
        Update: {
          author?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          format?: string
          id?: string
          publication_year?: number | null
          publisher?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      cache_localizacoes: {
        Row: {
          atualizado_em: string
          endereco: string | null
          id: string
          latitude: number | null
          longitude: number | null
          recurso_id: string
          tipo: string
        }
        Insert: {
          atualizado_em?: string
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          recurso_id: string
          tipo: string
        }
        Update: {
          atualizado_em?: string
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          recurso_id?: string
          tipo?: string
        }
        Relationships: []
      }
      cache_relatorios: {
        Row: {
          atualizado_em: string
          created_at: string
          dados: Json
          expira_em: string | null
          id: string
          periodo: string
          tipo: string
        }
        Insert: {
          atualizado_em?: string
          created_at?: string
          dados: Json
          expira_em?: string | null
          id?: string
          periodo: string
          tipo: string
        }
        Update: {
          atualizado_em?: string
          created_at?: string
          dados?: Json
          expira_em?: string | null
          id?: string
          periodo?: string
          tipo?: string
        }
        Relationships: []
      }
      calendarios: {
        Row: {
          configuracoes: Json | null
          cor: string
          created_at: string
          descricao: string | null
          fusos_horario: string | null
          id: string
          nome: string
          proprietario_id: string | null
          tipo: string
          updated_at: string
          visivel_para_todos: boolean
        }
        Insert: {
          configuracoes?: Json | null
          cor?: string
          created_at?: string
          descricao?: string | null
          fusos_horario?: string | null
          id?: string
          nome: string
          proprietario_id?: string | null
          tipo?: string
          updated_at?: string
          visivel_para_todos?: boolean
        }
        Update: {
          configuracoes?: Json | null
          cor?: string
          created_at?: string
          descricao?: string | null
          fusos_horario?: string | null
          id?: string
          nome?: string
          proprietario_id?: string | null
          tipo?: string
          updated_at?: string
          visivel_para_todos?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "calendarios_proprietario_id_fkey"
            columns: ["proprietario_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas_financeiras: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          imagem_url: string | null
          meta_valor: number
          nome: string
          updated_at: string | null
          valor_arrecadado: number | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          meta_valor: number
          nome: string
          updated_at?: string | null
          valor_arrecadado?: number | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          meta_valor?: number
          nome?: string
          updated_at?: string | null
          valor_arrecadado?: number | null
        }
        Relationships: []
      }
      categorias_financeiras: {
        Row: {
          ativa: boolean | null
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          parent_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          parent_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          parent_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_financeiras_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_patrimonio: {
        Row: {
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      celulas: {
        Row: {
          anfitriao_id: string | null
          arvore_genealogica: string | null
          ativa: boolean | null
          auxiliar_id: string | null
          bairro: string
          celula_mae_id: string | null
          cep: string | null
          cidade: string | null
          congregacao_id: string | null
          coordenador_id: string | null
          created_at: string
          data_multiplicacao: string | null
          descricao: string | null
          dia_semana: string
          endereco: string
          frequencia: string | null
          geracao: number | null
          horario: string
          id: string
          latitude: number | null
          lider_id: string | null
          longitude: number | null
          meta_decisoes_mes: number | null
          meta_membros: number | null
          meta_visitantes_mes: number | null
          nome: string
          observacoes: string | null
          pastor_rede_id: string | null
          rede_id: string | null
          saude_celula: string | null
          status: string | null
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          anfitriao_id?: string | null
          arvore_genealogica?: string | null
          ativa?: boolean | null
          auxiliar_id?: string | null
          bairro: string
          celula_mae_id?: string | null
          cep?: string | null
          cidade?: string | null
          congregacao_id?: string | null
          coordenador_id?: string | null
          created_at?: string
          data_multiplicacao?: string | null
          descricao?: string | null
          dia_semana: string
          endereco: string
          frequencia?: string | null
          geracao?: number | null
          horario: string
          id?: string
          latitude?: number | null
          lider_id?: string | null
          longitude?: number | null
          meta_decisoes_mes?: number | null
          meta_membros?: number | null
          meta_visitantes_mes?: number | null
          nome: string
          observacoes?: string | null
          pastor_rede_id?: string | null
          rede_id?: string | null
          saude_celula?: string | null
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          anfitriao_id?: string | null
          arvore_genealogica?: string | null
          ativa?: boolean | null
          auxiliar_id?: string | null
          bairro?: string
          celula_mae_id?: string | null
          cep?: string | null
          cidade?: string | null
          congregacao_id?: string | null
          coordenador_id?: string | null
          created_at?: string
          data_multiplicacao?: string | null
          descricao?: string | null
          dia_semana?: string
          endereco?: string
          frequencia?: string | null
          geracao?: number | null
          horario?: string
          id?: string
          latitude?: number | null
          lider_id?: string | null
          longitude?: number | null
          meta_decisoes_mes?: number | null
          meta_membros?: number | null
          meta_visitantes_mes?: number | null
          nome?: string
          observacoes?: string | null
          pastor_rede_id?: string | null
          rede_id?: string | null
          saude_celula?: string | null
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "celulas_anfitriao_id_fkey"
            columns: ["anfitriao_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_auxiliar_id_fkey"
            columns: ["auxiliar_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_celula_mae_id_fkey"
            columns: ["celula_mae_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_coordenador_id_fkey"
            columns: ["coordenador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_pastor_rede_id_fkey"
            columns: ["pastor_rede_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados_automaticos: {
        Row: {
          certificado_url: string | null
          created_at: string
          curso_id: string
          data_emissao: string
          hash_verificacao: string | null
          id: string
          metadata: Json | null
          pessoa_id: string
          template_usado: string | null
        }
        Insert: {
          certificado_url?: string | null
          created_at?: string
          curso_id: string
          data_emissao?: string
          hash_verificacao?: string | null
          id?: string
          metadata?: Json | null
          pessoa_id: string
          template_usado?: string | null
        }
        Update: {
          certificado_url?: string | null
          created_at?: string
          curso_id?: string
          data_emissao?: string
          hash_verificacao?: string | null
          id?: string
          metadata?: Json | null
          pessoa_id?: string
          template_usado?: string | null
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          bot_response: string
          context_data: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          user_message: string
        }
        Insert: {
          bot_response: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          user_message: string
        }
        Update: {
          bot_response?: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      chatbot_knowledge: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          id: string
          keywords: string[] | null
          source_type: string
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          source_type: string
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          source_type?: string
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_learning_patterns: {
        Row: {
          created_at: string | null
          feedback_score: number | null
          id: string
          interaction_timestamp: string | null
          question_pattern: string
          response_category: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          interaction_timestamp?: string | null
          question_pattern: string
          response_category?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          interaction_timestamp?: string | null
          question_pattern?: string
          response_category?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      chatbot_training: {
        Row: {
          active: boolean | null
          answer: string
          confidence_score: number | null
          created_at: string
          created_by: string | null
          id: string
          question: string
          source_type: string
          user_feedback: number | null
        }
        Insert: {
          active?: boolean | null
          answer: string
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          question: string
          source_type: string
          user_feedback?: number | null
        }
        Update: {
          active?: boolean | null
          answer?: string
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          question?: string
          source_type?: string
          user_feedback?: number | null
        }
        Relationships: []
      }
      churches: {
        Row: {
          address: string | null
          ativa: boolean
          cidade: string | null
          cnpj: string | null
          created_at: string
          data_fundacao: string | null
          email: string | null
          estado: string | null
          id: string
          name: string
          parent_church_id: string | null
          pastor_responsavel: string | null
          telefone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          ativa?: boolean
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          data_fundacao?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          name: string
          parent_church_id?: string | null
          pastor_responsavel?: string | null
          telefone?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          ativa?: boolean
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          data_fundacao?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          name?: string
          parent_church_id?: string | null
          pastor_responsavel?: string | null
          telefone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "churches_parent_church_id_fkey"
            columns: ["parent_church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicados: {
        Row: {
          ativo: boolean
          conteudo: string
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          destacar: boolean
          id: string
          imagem_url: string | null
          prioridade: string
          titulo: string
          updated_at: string
          visibilidade: string
        }
        Insert: {
          ativo?: boolean
          conteudo: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          destacar?: boolean
          id?: string
          imagem_url?: string | null
          prioridade?: string
          titulo: string
          updated_at?: string
          visibilidade?: string
        }
        Update: {
          ativo?: boolean
          conteudo?: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          destacar?: boolean
          id?: string
          imagem_url?: string | null
          prioridade?: string
          titulo?: string
          updated_at?: string
          visibilidade?: string
        }
        Relationships: []
      }
      conciliacao_bancaria: {
        Row: {
          arquivo_extrato_url: string | null
          conciliado: boolean | null
          conta_id: string
          created_at: string | null
          data_conciliacao: string
          diferenca: number | null
          id: string
          observacoes: string | null
          saldo_extrato: number
          saldo_sistema: number
          updated_at: string | null
        }
        Insert: {
          arquivo_extrato_url?: string | null
          conciliado?: boolean | null
          conta_id: string
          created_at?: string | null
          data_conciliacao: string
          diferenca?: number | null
          id?: string
          observacoes?: string | null
          saldo_extrato: number
          saldo_sistema: number
          updated_at?: string | null
        }
        Update: {
          arquivo_extrato_url?: string | null
          conciliado?: boolean | null
          conta_id?: string
          created_at?: string | null
          data_conciliacao?: string
          diferenca?: number | null
          id?: string
          observacoes?: string | null
          saldo_extrato?: number
          saldo_sistema?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conciliacao_bancaria_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      conquistas_ensino: {
        Row: {
          badge_id: string | null
          conquistada_em: string | null
          created_at: string | null
          curso_id: string | null
          detalhes: Json | null
          id: string
          pessoa_id: string
          pontos_ganhos: number | null
          tipo_conquista: string | null
        }
        Insert: {
          badge_id?: string | null
          conquistada_em?: string | null
          created_at?: string | null
          curso_id?: string | null
          detalhes?: Json | null
          id?: string
          pessoa_id: string
          pontos_ganhos?: number | null
          tipo_conquista?: string | null
        }
        Update: {
          badge_id?: string | null
          conquistada_em?: string | null
          created_at?: string | null
          curso_id?: string | null
          detalhes?: Json | null
          id?: string
          pessoa_id?: string
          pontos_ganhos?: number | null
          tipo_conquista?: string | null
        }
        Relationships: []
      }
      contas_bancarias: {
        Row: {
          agencia: string | null
          ativa: boolean | null
          banco: string | null
          conta: string | null
          created_at: string | null
          id: string
          nome: string
          observacoes: string | null
          saldo_atual: number | null
          saldo_inicial: number | null
          tipo_conta: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo_conta?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo_conta?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          content_json: Json
          created_at: string
          id: string
          order_position: number
          page_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          id?: string
          order_position?: number
          page_id: string
          type: string
          updated_at?: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          id?: string
          order_position?: number
          page_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "paginas_site"
            referencedColumns: ["id"]
          },
        ]
      }
      convites_ministerio: {
        Row: {
          created_at: string
          data_convite: string
          data_expiracao: string
          email_convidado: string
          enviado_por: string
          funcoes_sugeridas: string[] | null
          id: string
          mensagem_personalizada: string | null
          ministerio_id: string
          token_convite: string
          usado: boolean | null
          usado_em: string | null
        }
        Insert: {
          created_at?: string
          data_convite?: string
          data_expiracao?: string
          email_convidado: string
          enviado_por: string
          funcoes_sugeridas?: string[] | null
          id?: string
          mensagem_personalizada?: string | null
          ministerio_id: string
          token_convite: string
          usado?: boolean | null
          usado_em?: string | null
        }
        Update: {
          created_at?: string
          data_convite?: string
          data_expiracao?: string
          email_convidado?: string
          enviado_por?: string
          funcoes_sugeridas?: string[] | null
          id?: string
          mensagem_personalizada?: string | null
          ministerio_id?: string
          token_convite?: string
          usado?: boolean | null
          usado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_ministerio_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_ministerio_ministerio_id_fkey"
            columns: ["ministerio_id"]
            isOneToOne: false
            referencedRelation: "ministerios"
            referencedColumns: ["id"]
          },
        ]
      }
      convites_servico: {
        Row: {
          created_at: string
          data_expiracao: string | null
          escala_id: string
          id: string
          lido: boolean
          mensagem: string | null
          pessoa_id: string
          titulo: string
        }
        Insert: {
          created_at?: string
          data_expiracao?: string | null
          escala_id: string
          id?: string
          lido?: boolean
          mensagem?: string | null
          pessoa_id: string
          titulo: string
        }
        Update: {
          created_at?: string
          data_expiracao?: string | null
          escala_id?: string
          id?: string
          lido?: boolean
          mensagem?: string | null
          pessoa_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_servico_escala_id_fkey"
            columns: ["escala_id"]
            isOneToOne: false
            referencedRelation: "escalas_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_servico_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      culto_ordem_itens: {
        Row: {
          created_at: string
          detalhes: string | null
          duracao_estimada_min: number | null
          id: string
          observacoes: string | null
          ordem: number
          plano_id: string
          responsavel_id: string | null
          tipo_item: string | null
          titulo_item: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detalhes?: string | null
          duracao_estimada_min?: number | null
          id?: string
          observacoes?: string | null
          ordem: number
          plano_id: string
          responsavel_id?: string | null
          tipo_item?: string | null
          titulo_item: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detalhes?: string | null
          duracao_estimada_min?: number | null
          id?: string
          observacoes?: string | null
          ordem?: number
          plano_id?: string
          responsavel_id?: string | null
          tipo_item?: string | null
          titulo_item?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "culto_ordem_itens_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "culto_planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_ordem_itens_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      culto_planos: {
        Row: {
          agendamento_id: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          dirigente_id: string | null
          id: string
          igreja_id: string | null
          is_template: boolean
          pregador_id: string | null
          status: string
          tema_culto: string
          updated_at: string
          versao: number
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dirigente_id?: string | null
          id?: string
          igreja_id?: string | null
          is_template?: boolean
          pregador_id?: string | null
          status?: string
          tema_culto: string
          updated_at?: string
          versao?: number
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dirigente_id?: string | null
          id?: string
          igreja_id?: string | null
          is_template?: boolean
          pregador_id?: string | null
          status?: string
          tema_culto?: string
          updated_at?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "culto_planos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_planos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_planos_dirigente_id_fkey"
            columns: ["dirigente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_planos_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_planos_pregador_id_fkey"
            columns: ["pregador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      culto_setlist: {
        Row: {
          created_at: string
          id: string
          musica_id: string
          observacoes: string | null
          ordem: number
          plano_id: string
          tonalidade_escolhida: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          musica_id: string
          observacoes?: string | null
          ordem: number
          plano_id: string
          tonalidade_escolhida?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          musica_id?: string
          observacoes?: string | null
          ordem?: number
          plano_id?: string
          tonalidade_escolhida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culto_setlist_musica_id_fkey"
            columns: ["musica_id"]
            isOneToOne: false
            referencedRelation: "louvor_musicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_setlist_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "culto_planos"
            referencedColumns: ["id"]
          },
        ]
      }
      culto_setlist_presets: {
        Row: {
          created_at: string
          preset_id: string
          setlist_item_id: string
        }
        Insert: {
          created_at?: string
          preset_id: string
          setlist_item_id: string
        }
        Update: {
          created_at?: string
          preset_id?: string
          setlist_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "culto_setlist_presets_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "louvor_presets_ambiente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culto_setlist_presets_setlist_item_id_fkey"
            columns: ["setlist_item_id"]
            isOneToOne: true
            referencedRelation: "culto_setlist"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          ativo: boolean | null
          carga_horaria: number | null
          categoria: string | null
          church_id: string | null
          created_at: string
          descricao: string | null
          destaque: boolean
          emite_certificado: boolean | null
          id: string
          imagem_capa_url: string | null
          instrutor_id: string | null
          material_didatico: Json | null
          medalha_id_recompensa: string | null
          nivel: string | null
          nome: string
          ordem: number | null
          pontos_xp_recompensa: number | null
          pre_requisito_curso_id: string | null
          pre_requisitos: string[] | null
          publico_alvo: string[] | null
          slug: string | null
          status: string | null
          trilha_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria?: number | null
          categoria?: string | null
          church_id?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          emite_certificado?: boolean | null
          id?: string
          imagem_capa_url?: string | null
          instrutor_id?: string | null
          material_didatico?: Json | null
          medalha_id_recompensa?: string | null
          nivel?: string | null
          nome: string
          ordem?: number | null
          pontos_xp_recompensa?: number | null
          pre_requisito_curso_id?: string | null
          pre_requisitos?: string[] | null
          publico_alvo?: string[] | null
          slug?: string | null
          status?: string | null
          trilha_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          carga_horaria?: number | null
          categoria?: string | null
          church_id?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          emite_certificado?: boolean | null
          id?: string
          imagem_capa_url?: string | null
          instrutor_id?: string | null
          material_didatico?: Json | null
          medalha_id_recompensa?: string | null
          nivel?: string | null
          nome?: string
          ordem?: number | null
          pontos_xp_recompensa?: number | null
          pre_requisito_curso_id?: string | null
          pre_requisitos?: string[] | null
          publico_alvo?: string[] | null
          slug?: string | null
          status?: string | null
          trilha_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursos_medalha_id_recompensa_fkey"
            columns: ["medalha_id_recompensa"]
            isOneToOne: false
            referencedRelation: "jornada_medalhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursos_pre_requisito_curso_id_fkey"
            columns: ["pre_requisito_curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_formacao"
            referencedColumns: ["id"]
          },
        ]
      }
      data_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          request_data: Json | null
          request_type: string
          response_data: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json | null
          request_type: string
          response_data?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json | null
          request_type?: string
          response_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disponibilidade_voluntarios: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          disponivel: boolean | null
          id: string
          motivo: string | null
          pessoa_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          disponivel?: boolean | null
          id?: string
          motivo?: string | null
          pessoa_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          disponivel?: boolean | null
          id?: string
          motivo?: string | null
          pessoa_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidade_voluntarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      doacoes: {
        Row: {
          created_at: string
          email_doador: string
          fundo_id: string | null
          id: string
          mensagem: string | null
          metodo_pagamento: string | null
          moeda: string | null
          nome_doador: string
          nome_fundo: string
          payment_id: string | null
          payment_status: string | null
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          email_doador: string
          fundo_id?: string | null
          id?: string
          mensagem?: string | null
          metodo_pagamento?: string | null
          moeda?: string | null
          nome_doador: string
          nome_fundo: string
          payment_id?: string | null
          payment_status?: string | null
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          email_doador?: string
          fundo_id?: string | null
          id?: string
          mensagem?: string | null
          metodo_pagamento?: string | null
          moeda?: string | null
          nome_doador?: string
          nome_fundo?: string
          payment_id?: string | null
          payment_status?: string | null
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "doacoes_fundo_id_fkey"
            columns: ["fundo_id"]
            isOneToOne: false
            referencedRelation: "fundos_contabeis"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_modelos: {
        Row: {
          conteudo_template: string
          created_at: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo_template: string
          created_at?: string
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo_template?: string
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      emails_queue: {
        Row: {
          assunto: string
          created_at: string
          dados: Json | null
          destinatario: string
          enviado_em: string | null
          erro: string | null
          id: string
          prioridade: string | null
          status: string | null
          template: string
          tentativas: number | null
        }
        Insert: {
          assunto: string
          created_at?: string
          dados?: Json | null
          destinatario: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          prioridade?: string | null
          status?: string | null
          template: string
          tentativas?: number | null
        }
        Update: {
          assunto?: string
          created_at?: string
          dados?: Json | null
          destinatario?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          prioridade?: string | null
          status?: string | null
          template?: string
          tentativas?: number | null
        }
        Relationships: []
      }
      emprestimos_patrimonio: {
        Row: {
          created_at: string
          data_devolucao: string | null
          data_prevista_devolucao: string
          data_retirada: string
          id: string
          local_uso: string | null
          observacoes: string | null
          patrimonio_id: string
          responsavel_devolucao_id: string | null
          responsavel_liberacao_id: string | null
          situacao_devolucao: string | null
          solicitante_id: string
          status: string
          termo_pdf_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_devolucao?: string | null
          data_prevista_devolucao: string
          data_retirada: string
          id?: string
          local_uso?: string | null
          observacoes?: string | null
          patrimonio_id: string
          responsavel_devolucao_id?: string | null
          responsavel_liberacao_id?: string | null
          situacao_devolucao?: string | null
          solicitante_id: string
          status?: string
          termo_pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_devolucao?: string | null
          data_prevista_devolucao?: string
          data_retirada?: string
          id?: string
          local_uso?: string | null
          observacoes?: string | null
          patrimonio_id?: string
          responsavel_devolucao_id?: string | null
          responsavel_liberacao_id?: string | null
          situacao_devolucao?: string | null
          solicitante_id?: string
          status?: string
          termo_pdf_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_patrimonio_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
        ]
      }
      ensaios_ministerio: {
        Row: {
          ativo: boolean
          created_at: string
          data_ensaio: string
          duracao_estimada: number | null
          id: string
          lista_musicas_id: string | null
          local: string
          obrigatorio: boolean
          observacoes: string | null
          programacao_culto_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_ensaio: string
          duracao_estimada?: number | null
          id?: string
          lista_musicas_id?: string | null
          local: string
          obrigatorio?: boolean
          observacoes?: string | null
          programacao_culto_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_ensaio?: string
          duracao_estimada?: number | null
          id?: string
          lista_musicas_id?: string | null
          local?: string
          obrigatorio?: boolean
          observacoes?: string | null
          programacao_culto_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ensaios_ministerio_lista_musicas_id_fkey"
            columns: ["lista_musicas_id"]
            isOneToOne: false
            referencedRelation: "listas_musicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ensaios_ministerio_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
        ]
      }
      equipas_ministeriais: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          lider_id: string | null
          ministerio_id: string | null
          nome_equipa: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          lider_id?: string | null
          ministerio_id?: string | null
          nome_equipa: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          lider_id?: string | null
          ministerio_id?: string | null
          nome_equipa?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipas_ministeriais_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipas_ministeriais_ministerio_id_fkey"
            columns: ["ministerio_id"]
            isOneToOne: false
            referencedRelation: "ministerios"
            referencedColumns: ["id"]
          },
        ]
      }
      escala_participantes: {
        Row: {
          created_at: string
          data_convite: string | null
          data_resposta: string | null
          escala_id: string
          funcao_escalada_id: string | null
          id: string
          membro_id: string
          observacoes: string | null
          status_confirmacao:
            | Database["public"]["Enums"]["status_confirmacao_escala"]
            | null
          substituido_por: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_convite?: string | null
          data_resposta?: string | null
          escala_id: string
          funcao_escalada_id?: string | null
          id?: string
          membro_id: string
          observacoes?: string | null
          status_confirmacao?:
            | Database["public"]["Enums"]["status_confirmacao_escala"]
            | null
          substituido_por?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_convite?: string | null
          data_resposta?: string | null
          escala_id?: string
          funcao_escalada_id?: string | null
          id?: string
          membro_id?: string
          observacoes?: string | null
          status_confirmacao?:
            | Database["public"]["Enums"]["status_confirmacao_escala"]
            | null
          substituido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escala_participantes_escala_id_fkey"
            columns: ["escala_id"]
            isOneToOne: false
            referencedRelation: "escalas_ministerio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_participantes_funcao_escalada_id_fkey"
            columns: ["funcao_escalada_id"]
            isOneToOne: false
            referencedRelation: "ministerio_funcoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_participantes_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "ministerio_membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_participantes_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "ministerio_membros"
            referencedColumns: ["id"]
          },
        ]
      }
      escala_voluntarios: {
        Row: {
          confirmado_em: string | null
          created_at: string
          escala_id: string
          id: string
          membro_id: string
          observacoes: string | null
          status: string
          substituido_por: string | null
          updated_at: string
        }
        Insert: {
          confirmado_em?: string | null
          created_at?: string
          escala_id: string
          id?: string
          membro_id: string
          observacoes?: string | null
          status?: string
          substituido_por?: string | null
          updated_at?: string
        }
        Update: {
          confirmado_em?: string | null
          created_at?: string
          escala_id?: string
          id?: string
          membro_id?: string
          observacoes?: string | null
          status?: string
          substituido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escala_voluntarios_escala_id_fkey"
            columns: ["escala_id"]
            isOneToOne: false
            referencedRelation: "escalas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_voluntarios_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_voluntarios_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      escalas: {
        Row: {
          created_at: string
          criado_por: string
          data_evento: string
          descricao: string | null
          id: string
          nome: string
          numero_voluntarios_necessarios: number
          status: string
          tipo_escala: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por: string
          data_evento: string
          descricao?: string | null
          id?: string
          nome: string
          numero_voluntarios_necessarios?: number
          status?: string
          tipo_escala: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string
          data_evento?: string
          descricao?: string | null
          id?: string
          nome?: string
          numero_voluntarios_necessarios?: number
          status?: string
          tipo_escala?: string
          updated_at?: string
        }
        Relationships: []
      }
      escalas_eventos: {
        Row: {
          created_at: string
          created_by: string | null
          data_evento: string
          id: string
          local_evento: string | null
          nome_evento: string
          observacoes: string | null
          setlist: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_evento: string
          id?: string
          local_evento?: string | null
          nome_evento: string
          observacoes?: string | null
          setlist?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_evento?: string
          id?: string
          local_evento?: string | null
          nome_evento?: string
          observacoes?: string | null
          setlist?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      escalas_membros: {
        Row: {
          cargo_id: string
          created_at: string
          data_resposta: string | null
          evento_id: string
          id: string
          membro_id: string
          observacoes: string | null
          status: string | null
        }
        Insert: {
          cargo_id: string
          created_at?: string
          data_resposta?: string | null
          evento_id: string
          id?: string
          membro_id: string
          observacoes?: string | null
          status?: string | null
        }
        Update: {
          cargo_id?: string
          created_at?: string
          data_resposta?: string | null
          evento_id?: string
          id?: string
          membro_id?: string
          observacoes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalas_membros_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "louvor_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_membros_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "escalas_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_membros_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      escalas_ministerio: {
        Row: {
          ativo: boolean
          created_at: string
          data_limite_confirmacao: string | null
          descricao: string | null
          id: string
          instrucoes_especiais: string | null
          materiais_necessarios: Json | null
          nome: string
          programacao_culto_id: string
          tipo_escala: Database["public"]["Enums"]["tipo_escala"]
          updated_at: string
          vagas_necessarias: number
          vagas_preenchidas: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_limite_confirmacao?: string | null
          descricao?: string | null
          id?: string
          instrucoes_especiais?: string | null
          materiais_necessarios?: Json | null
          nome: string
          programacao_culto_id: string
          tipo_escala: Database["public"]["Enums"]["tipo_escala"]
          updated_at?: string
          vagas_necessarias?: number
          vagas_preenchidas?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_limite_confirmacao?: string | null
          descricao?: string | null
          id?: string
          instrucoes_especiais?: string | null
          materiais_necessarios?: Json | null
          nome?: string
          programacao_culto_id?: string
          tipo_escala?: Database["public"]["Enums"]["tipo_escala"]
          updated_at?: string
          vagas_necessarias?: number
          vagas_preenchidas?: number
        }
        Relationships: [
          {
            foreignKeyName: "escalas_ministerio_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
        ]
      }
      escalas_servico: {
        Row: {
          created_at: string
          created_by: string | null
          data_convite: string | null
          data_resposta: string | null
          funcao: string
          funcao_id: string | null
          id: string
          observacoes: string | null
          pessoa_id: string
          plano_id: string
          presenca_registrada_em: string | null
          resultado_presenca:
            | Database["public"]["Enums"]["presence_status"]
            | null
          status_confirmacao: Database["public"]["Enums"]["confirmation_status"]
          substituido_por: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_convite?: string | null
          data_resposta?: string | null
          funcao: string
          funcao_id?: string | null
          id?: string
          observacoes?: string | null
          pessoa_id: string
          plano_id: string
          presenca_registrada_em?: string | null
          resultado_presenca?:
            | Database["public"]["Enums"]["presence_status"]
            | null
          status_confirmacao?: Database["public"]["Enums"]["confirmation_status"]
          substituido_por?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_convite?: string | null
          data_resposta?: string | null
          funcao?: string
          funcao_id?: string | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          plano_id?: string
          presenca_registrada_em?: string | null
          resultado_presenca?:
            | Database["public"]["Enums"]["presence_status"]
            | null
          status_confirmacao?: Database["public"]["Enums"]["confirmation_status"]
          substituido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalas_servico_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_servico_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "funcoes_equipa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_servico_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_servico_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "culto_planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_servico_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      espacos: {
        Row: {
          capacidade: number
          created_at: string
          descricao: string | null
          disponivel: boolean
          id: string
          nome: string
          recursos: string[] | null
          updated_at: string
        }
        Insert: {
          capacidade?: number
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          nome: string
          recursos?: string[] | null
          updated_at?: string
        }
        Update: {
          capacidade?: number
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          nome?: string
          recursos?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      estatisticas_site: {
        Row: {
          chave: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      estudo_biblico_progresso: {
        Row: {
          created_at: string
          id: string
          pessoa_id: string
          pontos_xp: number
          preferencias: Json
          sequencia_dias: number
          total_versiculos_lidos: number
          ultimo_versiculo_lido_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pessoa_id: string
          pontos_xp?: number
          preferencias?: Json
          sequencia_dias?: number
          total_versiculos_lidos?: number
          ultimo_versiculo_lido_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pessoa_id?: string
          pontos_xp?: number
          preferencias?: Json
          sequencia_dias?: number
          total_versiculos_lidos?: number
          ultimo_versiculo_lido_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_biblico_progresso_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      estudos_biblicos: {
        Row: {
          arquivo_nome: string | null
          arquivo_tamanho: string | null
          arquivo_url: string | null
          ativo: boolean | null
          created_at: string
          descricao: string | null
          downloads: number | null
          id: string
          semana_fim: string
          semana_inicio: string
          titulo: string
          updated_at: string
          versiculo_chave: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_tamanho?: string | null
          arquivo_url?: string | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          id?: string
          semana_fim: string
          semana_inicio: string
          titulo: string
          updated_at?: string
          versiculo_chave?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_tamanho?: string | null
          arquivo_url?: string | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          id?: string
          semana_fim?: string
          semana_inicio?: string
          titulo?: string
          updated_at?: string
          versiculo_chave?: string | null
        }
        Relationships: []
      }
      evento_confirmacoes: {
        Row: {
          confirmado: boolean
          created_at: string
          evento_id: string
          id: string
          observacoes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmado?: boolean
          created_at?: string
          evento_id: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmado?: boolean
          created_at?: string
          evento_id?: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evento_cupons: {
        Row: {
          codigo: string
          id: string
          percentual_desconto: number
        }
        Insert: {
          codigo: string
          id?: string
          percentual_desconto: number
        }
        Update: {
          codigo?: string
          id?: string
          percentual_desconto?: number
        }
        Relationships: []
      }
      evento_doacoes: {
        Row: {
          comprovante_url: string | null
          created_at: string
          descricao: string | null
          email_doador: string | null
          evento_id: string
          id: string
          metodo_pagamento: string | null
          nome_doador: string | null
          status: string
          tipo_doacao: string
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string
          descricao?: string | null
          email_doador?: string | null
          evento_id: string
          id?: string
          metodo_pagamento?: string | null
          nome_doador?: string | null
          status?: string
          tipo_doacao?: string
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string
          descricao?: string | null
          email_doador?: string | null
          evento_id?: string
          id?: string
          metodo_pagamento?: string | null
          nome_doador?: string | null
          status?: string
          tipo_doacao?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      evento_inscricoes: {
        Row: {
          check_in_status: boolean
          created_at: string
          dados_formulario_json: Json
          evento_id: string
          id: string
          pagamento_moeda: string | null
          pagamento_valor: number | null
          pessoa_id: string | null
          qr_code_hash: string
          status_pagamento: Database["public"]["Enums"]["status_pagamento_evento"]
          ticket_id: string
          updated_at: string
        }
        Insert: {
          check_in_status?: boolean
          created_at?: string
          dados_formulario_json?: Json
          evento_id: string
          id?: string
          pagamento_moeda?: string | null
          pagamento_valor?: number | null
          pessoa_id?: string | null
          qr_code_hash: string
          status_pagamento?: Database["public"]["Enums"]["status_pagamento_evento"]
          ticket_id: string
          updated_at?: string
        }
        Update: {
          check_in_status?: boolean
          created_at?: string
          dados_formulario_json?: Json
          evento_id?: string
          id?: string
          pagamento_moeda?: string | null
          pagamento_valor?: number | null
          pessoa_id?: string | null
          qr_code_hash?: string
          status_pagamento?: Database["public"]["Enums"]["status_pagamento_evento"]
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_inscricoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_inscricoes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_inscricoes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "evento_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_pedidos_oracao: {
        Row: {
          created_at: string
          email_solicitante: string | null
          evento_id: string
          id: string
          nome_solicitante: string
          pedido: string
          publico: boolean
          status: string
          telefone_solicitante: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_solicitante?: string | null
          evento_id: string
          id?: string
          nome_solicitante: string
          pedido: string
          publico?: boolean
          status?: string
          telefone_solicitante?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_solicitante?: string | null
          evento_id?: string
          id?: string
          nome_solicitante?: string
          pedido?: string
          publico?: boolean
          status?: string
          telefone_solicitante?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      evento_tickets: {
        Row: {
          ativo: boolean
          created_at: string
          data_fim_vendas: string | null
          data_inicio_vendas: string | null
          evento_id: string
          id: string
          nome: string
          preco: number
          quantidade_total: number
          quantidade_vendida: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_fim_vendas?: string | null
          data_inicio_vendas?: string | null
          evento_id: string
          id?: string
          nome: string
          preco?: number
          quantidade_total: number
          quantidade_vendida?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_fim_vendas?: string | null
          data_inicio_vendas?: string | null
          evento_id?: string
          id?: string
          nome?: string
          preco?: number
          quantidade_total?: number
          quantidade_vendida?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_tickets_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          capacidade: number | null
          cover_image_url: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          endereco: string | null
          form_structure_json: Json
          id: string
          igreja_id: string
          inscricoes_abertas: boolean | null
          is_paid_event: boolean
          local: string
          publico: boolean | null
          recorrencia_tipo: string | null
          recorrente: boolean | null
          registration_deadline: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          capacidade?: number | null
          cover_image_url?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          endereco?: string | null
          form_structure_json?: Json
          id?: string
          igreja_id: string
          inscricoes_abertas?: boolean | null
          is_paid_event?: boolean
          local: string
          publico?: boolean | null
          recorrencia_tipo?: string | null
          recorrente?: boolean | null
          registration_deadline?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          capacidade?: number | null
          cover_image_url?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          endereco?: string | null
          form_structure_json?: Json
          id?: string
          igreja_id?: string
          inscricoes_abertas?: boolean | null
          is_paid_event?: boolean
          local?: string
          publico?: boolean | null
          recorrencia_tipo?: string | null
          recorrente?: boolean | null
          registration_deadline?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      familias: {
        Row: {
          created_at: string
          endereco: string | null
          id: string
          nome_familia: string
          observacoes: string | null
          telefone_principal: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          id?: string
          nome_familia: string
          observacoes?: string | null
          telefone_principal?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          endereco?: string | null
          id?: string
          nome_familia?: string
          observacoes?: string | null
          telefone_principal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      formularios: {
        Row: {
          acao_pos_submissao: Json
          created_at: string
          estrutura_json: Json
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          acao_pos_submissao?: Json
          created_at?: string
          estrutura_json?: Json
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          acao_pos_submissao?: Json
          created_at?: string
          estrutura_json?: Json
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      formularios_recepcao: {
        Row: {
          como_conheceu: string | null
          created_at: string | null
          data_visita: string | null
          email: string | null
          endereco: string | null
          id: string
          idade: number | null
          interessado_em: string[] | null
          nome_completo: string
          observacoes: string | null
          pessoa_id: string | null
          primeira_visita: boolean | null
          recepcionista_nome: string | null
          status_processamento: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          como_conheceu?: string | null
          created_at?: string | null
          data_visita?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          idade?: number | null
          interessado_em?: string[] | null
          nome_completo: string
          observacoes?: string | null
          pessoa_id?: string | null
          primeira_visita?: boolean | null
          recepcionista_nome?: string | null
          status_processamento?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          como_conheceu?: string | null
          created_at?: string | null
          data_visita?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          idade?: number | null
          interessado_em?: string[] | null
          nome_completo?: string
          observacoes?: string | null
          pessoa_id?: string | null
          primeira_visita?: boolean | null
          recepcionista_nome?: string | null
          status_processamento?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formularios_recepcao_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      formularios_submissoes: {
        Row: {
          created_at: string
          dados_json: Json
          formulario_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dados_json?: Json
          formulario_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dados_json?: Json
          formulario_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formularios_submissoes_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "formularios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionalidades_modulo: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          modulo_id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          modulo_id: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          modulo_id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionalidades_modulo_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
      funcoes_equipa: {
        Row: {
          ativo: boolean | null
          competencias_requeridas: Json | null
          created_at: string | null
          descricao: string | null
          equipa_id: string | null
          id: string
          nivel_experiencia: string | null
          nome_funcao: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          competencias_requeridas?: Json | null
          created_at?: string | null
          descricao?: string | null
          equipa_id?: string | null
          id?: string
          nivel_experiencia?: string | null
          nome_funcao: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          competencias_requeridas?: Json | null
          created_at?: string | null
          descricao?: string | null
          equipa_id?: string | null
          id?: string
          nivel_experiencia?: string | null
          nome_funcao?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcoes_equipa_equipa_id_fkey"
            columns: ["equipa_id"]
            isOneToOne: false
            referencedRelation: "equipas_ministeriais"
            referencedColumns: ["id"]
          },
        ]
      }
      funcoes_ministerio: {
        Row: {
          ativa: boolean
          categoria: string
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          categoria: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          categoria?: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      fundos_contabeis: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          meta_anual: number | null
          meta_mensal: number | null
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta_anual?: number | null
          meta_mensal?: number | null
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta_anual?: number | null
          meta_mensal?: number | null
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      galeria_albuns: {
        Row: {
          ativo: boolean | null
          capa_url: string | null
          categoria: string | null
          created_at: string
          data_evento: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          capa_url?: string | null
          categoria?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          capa_url?: string | null
          categoria?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      galeria_fotos: {
        Row: {
          categoria: string | null
          created_at: string
          data_evento: string | null
          descricao: string | null
          destaque: boolean | null
          evento_id: string | null
          id: string
          ordem: number | null
          titulo: string
          url_imagem: string
          url_thumbnail: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          evento_id?: string | null
          id?: string
          ordem?: number | null
          titulo: string
          url_imagem: string
          url_thumbnail?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          evento_id?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
          url_imagem?: string
          url_thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "galeria_fotos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      galeria_midia: {
        Row: {
          arquivo_url: string
          created_at: string
          id: string
          tags: string[]
          tipo: Database["public"]["Enums"]["tipo_midia"]
          updated_at: string
        }
        Insert: {
          arquivo_url: string
          created_at?: string
          id?: string
          tags?: string[]
          tipo: Database["public"]["Enums"]["tipo_midia"]
          updated_at?: string
        }
        Update: {
          arquivo_url?: string
          created_at?: string
          id?: string
          tags?: string[]
          tipo?: Database["public"]["Enums"]["tipo_midia"]
          updated_at?: string
        }
        Relationships: []
      }
      gamificacao_recompensas: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          pessoa_id: string
          pontos: number
          referencia: Json
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          pessoa_id: string
          pontos?: number
          referencia?: Json
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          pessoa_id?: string
          pontos?: number
          referencia?: Json
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamificacao_recompensas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_celulas: {
        Row: {
          celula_id: string
          created_at: string
          dados_antigos: Json | null
          dados_novos: Json | null
          descricao: string
          id: string
          tipo_evento: string
          usuario_responsavel: string | null
        }
        Insert: {
          celula_id: string
          created_at?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          descricao: string
          id?: string
          tipo_evento: string
          usuario_responsavel?: string | null
        }
        Update: {
          celula_id?: string
          created_at?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          descricao?: string
          id?: string
          tipo_evento?: string
          usuario_responsavel?: string | null
        }
        Relationships: []
      }
      historico_celulas_pessoas: {
        Row: {
          celula_id: string
          created_at: string
          data_entrada: string
          data_saida: string | null
          id: string
          observacoes: string | null
          papel: string | null
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          celula_id: string
          created_at?: string
          data_entrada: string
          data_saida?: string | null
          id?: string
          observacoes?: string | null
          papel?: string | null
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          celula_id?: string
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          id?: string
          observacoes?: string | null
          papel?: string | null
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_patrimonio: {
        Row: {
          created_at: string
          descricao: string
          id: string
          patrimonio_id: string
          tipo_evento: string
          usuario_responsavel: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          patrimonio_id: string
          tipo_evento: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          patrimonio_id?: string
          tipo_evento?: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_patrimonio_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_pessoas: {
        Row: {
          created_at: string
          descricao: string
          id: string
          pessoa_id: string
          tipo_evento: string
          usuario_responsavel: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          pessoa_id: string
          tipo_evento: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          pessoa_id?: string
          tipo_evento?: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: []
      }
      historico_servicos: {
        Row: {
          avaliacao: number | null
          created_at: string | null
          data_servico: string
          funcao_id: string | null
          id: string
          observacoes: string | null
          pessoa_id: string | null
        }
        Insert: {
          avaliacao?: number | null
          created_at?: string | null
          data_servico: string
          funcao_id?: string | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string | null
        }
        Update: {
          avaliacao?: number | null
          created_at?: string | null
          data_servico?: string
          funcao_id?: string | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_servicos_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "funcoes_equipa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_servicos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      igrejas: {
        Row: {
          ativa: boolean | null
          cidade: string | null
          created_at: string | null
          data_fundacao: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          parent_church_id: string | null
          pastor_responsavel: string | null
          telefone: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          cidade?: string | null
          created_at?: string | null
          data_fundacao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          parent_church_id?: string | null
          pastor_responsavel?: string | null
          telefone?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          cidade?: string | null
          created_at?: string | null
          data_fundacao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          parent_church_id?: string | null
          pastor_responsavel?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "igrejas_parent_church_id_fkey"
            columns: ["parent_church_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_cursos: {
        Row: {
          created_at: string
          curso_id: string
          data_inscricao: string
          id: string
          origem_inscricao: string | null
          pessoa_id: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          data_inscricao?: string
          id?: string
          origem_inscricao?: string | null
          pessoa_id: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          data_inscricao?: string
          id?: string
          origem_inscricao?: string | null
          pessoa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_cursos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      insights_celulas: {
        Row: {
          ativo: boolean | null
          created_at: string
          data_analise: string
          descricao: string
          entidade_id: string
          id: string
          metrica_principal: Json | null
          nivel_hierarquia: string
          prioridade: string | null
          tipo_insight: string
          titulo: string
          visualizado_por: string[] | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          data_analise: string
          descricao: string
          entidade_id: string
          id?: string
          metrica_principal?: Json | null
          nivel_hierarquia: string
          prioridade?: string | null
          tipo_insight: string
          titulo: string
          visualizado_por?: string[] | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          data_analise?: string
          descricao?: string
          entidade_id?: string
          id?: string
          metrica_principal?: Json | null
          nivel_hierarquia?: string
          prioridade?: string | null
          tipo_insight?: string
          titulo?: string
          visualizado_por?: string[] | null
        }
        Relationships: []
      }
      insights_pastorais: {
        Row: {
          categoria: string
          created_at: string | null
          dados_contexto: Json | null
          descricao: string
          expires_at: string | null
          id: string
          prioridade: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          dados_contexto?: Json | null
          descricao: string
          expires_at?: string | null
          id?: string
          prioridade?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          dados_contexto?: Json | null
          descricao?: string
          expires_at?: string | null
          id?: string
          prioridade?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: []
      }
      jornada_desafios: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          id: string
          medalha_id_recompensa: string | null
          meta_json: Json
          pontos_bonus: number
          tipo_desafio: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          id?: string
          medalha_id_recompensa?: string | null
          meta_json: Json
          pontos_bonus?: number
          tipo_desafio: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          id?: string
          medalha_id_recompensa?: string | null
          meta_json?: Json
          pontos_bonus?: number
          tipo_desafio?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornada_desafios_medalha_id_recompensa_fkey"
            columns: ["medalha_id_recompensa"]
            isOneToOne: false
            referencedRelation: "jornada_medalhas"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_desafios_usuarios: {
        Row: {
          concluido_em: string | null
          created_at: string
          desafio_id: string
          id: string
          iniciado_em: string
          pessoa_id: string
          progresso_json: Json
          status: string
          updated_at: string
        }
        Insert: {
          concluido_em?: string | null
          created_at?: string
          desafio_id: string
          id?: string
          iniciado_em?: string
          pessoa_id: string
          progresso_json?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          concluido_em?: string | null
          created_at?: string
          desafio_id?: string
          id?: string
          iniciado_em?: string
          pessoa_id?: string
          progresso_json?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornada_desafios_usuarios_desafio_id_fkey"
            columns: ["desafio_id"]
            isOneToOne: false
            referencedRelation: "jornada_desafios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_desafios_usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_medalhas: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          id: string
          imagem_url: string | null
          nome_medalha: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          id?: string
          imagem_url?: string | null
          nome_medalha: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          id?: string
          imagem_url?: string | null
          nome_medalha?: string
          updated_at?: string
        }
        Relationships: []
      }
      jornada_medalhas_usuarios: {
        Row: {
          created_at: string
          data_conquista: string
          medalha_id: string
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conquista?: string
          medalha_id: string
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conquista?: string
          medalha_id?: string
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornada_medalhas_usuarios_medalha_id_fkey"
            columns: ["medalha_id"]
            isOneToOne: false
            referencedRelation: "jornada_medalhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_medalhas_usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_niveis: {
        Row: {
          created_at: string | null
          id: number
          imagem_url: string | null
          nome_nivel: string
          pontos_necessarios: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          imagem_url?: string | null
          nome_nivel: string
          pontos_necessarios: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          imagem_url?: string | null
          nome_nivel?: string
          pontos_necessarios?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      jornada_perfis_usuarios: {
        Row: {
          capitulos_lidos_ids: string[]
          created_at: string
          id: string
          next_level_xp: number
          nivel: string
          pontos_sabedoria: number
          ultima_atividade_em: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          capitulos_lidos_ids?: string[]
          created_at?: string
          id?: string
          next_level_xp?: number
          nivel?: string
          pontos_sabedoria?: number
          ultima_atividade_em?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          capitulos_lidos_ids?: string[]
          created_at?: string
          id?: string
          next_level_xp?: number
          nivel?: string
          pontos_sabedoria?: number
          ultima_atividade_em?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lancamentos_financeiros: {
        Row: {
          categoria_id: string
          comprovante_url: string | null
          congregacao_id: string | null
          conta_id: string
          created_at: string
          data_lancamento: string
          descricao: string
          forma_pagamento: string
          id: string
          igreja_id: string
          observacoes: string | null
          repeticao_mensal: boolean | null
          responsavel_id: string | null
          status: string | null
          subcategoria_id: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria_id: string
          comprovante_url?: string | null
          congregacao_id?: string | null
          conta_id: string
          created_at?: string
          data_lancamento?: string
          descricao: string
          forma_pagamento: string
          id?: string
          igreja_id: string
          observacoes?: string | null
          repeticao_mensal?: boolean | null
          responsavel_id?: string | null
          status?: string | null
          subcategoria_id?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria_id?: string
          comprovante_url?: string | null
          congregacao_id?: string | null
          conta_id?: string
          created_at?: string
          data_lancamento?: string
          descricao?: string
          forma_pagamento?: string
          id?: string
          igreja_id?: string
          observacoes?: string | null
          repeticao_mensal?: boolean | null
          responsavel_id?: string | null
          status?: string | null
          subcategoria_id?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_financeiros_v2: {
        Row: {
          campanha_id: string | null
          categoria_id: string
          church_id: string | null
          comprovante_url: string | null
          conta_id: string
          created_at: string | null
          created_by: string | null
          data_lancamento: string
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          fundo_id: string | null
          id: string
          numero_documento: string | null
          observacoes: string | null
          pessoa_id: string | null
          recorrencia_tipo: string | null
          recorrente: boolean | null
          status: string | null
          status_conciliacao: boolean | null
          tags: string[] | null
          tipo: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          campanha_id?: string | null
          categoria_id: string
          church_id?: string | null
          comprovante_url?: string | null
          conta_id: string
          created_at?: string | null
          created_by?: string | null
          data_lancamento?: string
          data_vencimento?: string | null
          descricao: string
          forma_pagamento?: string | null
          fundo_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          recorrencia_tipo?: string | null
          recorrente?: boolean | null
          status?: string | null
          status_conciliacao?: boolean | null
          tags?: string[] | null
          tipo: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          campanha_id?: string | null
          categoria_id?: string
          church_id?: string | null
          comprovante_url?: string | null
          conta_id?: string
          created_at?: string | null
          created_by?: string | null
          data_lancamento?: string
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          fundo_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          recorrencia_tipo?: string | null
          recorrente?: boolean | null
          status?: string | null
          status_conciliacao?: boolean | null
          tags?: string[] | null
          tipo?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_v2_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_v2_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_v2_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_v2_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_v2_fundo_id_fkey"
            columns: ["fundo_id"]
            isOneToOne: false
            referencedRelation: "fundos_contabeis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_v2_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          analytics: Json | null
          ativa: boolean | null
          configuracoes: Json | null
          created_at: string
          data_publicacao: string | null
          descricao: string | null
          id: string
          seo_meta: Json | null
          slug: string
          status: string | null
          template_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          analytics?: Json | null
          ativa?: boolean | null
          configuracoes?: Json | null
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          seo_meta?: Json | null
          slug: string
          status?: string | null
          template_id?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          analytics?: Json | null
          ativa?: boolean | null
          configuracoes?: Json | null
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          seo_meta?: Json | null
          slug?: string
          status?: string | null
          template_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_site"
            referencedColumns: ["id"]
          },
        ]
      }
      licao_anexos: {
        Row: {
          created_at: string
          id: string
          licao_id: string
          mime_type: string | null
          nome_arquivo: string
          tamanho_bytes: number | null
          updated_at: string
          url_storage: string
        }
        Insert: {
          created_at?: string
          id?: string
          licao_id: string
          mime_type?: string | null
          nome_arquivo: string
          tamanho_bytes?: number | null
          updated_at?: string
          url_storage: string
        }
        Update: {
          created_at?: string
          id?: string
          licao_id?: string
          mime_type?: string | null
          nome_arquivo?: string
          tamanho_bytes?: number | null
          updated_at?: string
          url_storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "licao_anexos_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
        ]
      }
      licoes: {
        Row: {
          ativo: boolean | null
          conteudo_texto: string | null
          created_at: string
          curso_id: string
          id: string
          modulo_id: string | null
          ordem: number | null
          slug: string | null
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo_texto?: string | null
          created_at?: string
          curso_id: string
          id?: string
          modulo_id?: string | null
          ordem?: number | null
          slug?: string | null
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo_texto?: string | null
          created_at?: string
          curso_id?: string
          id?: string
          modulo_id?: string | null
          ordem?: number | null
          slug?: string | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_licoes_modulo"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_curso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licoes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licoes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_curso"
            referencedColumns: ["id"]
          },
        ]
      }
      licoes_modulo: {
        Row: {
          ativo: boolean | null
          conteudo: Json | null
          created_at: string
          duracao_estimada: number | null
          id: string
          modulo_id: string
          ordem: number
          pontos: number | null
          recursos_extras: Json | null
          tarefas: Json | null
          tipo: string
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo?: Json | null
          created_at?: string
          duracao_estimada?: number | null
          id?: string
          modulo_id: string
          ordem?: number
          pontos?: number | null
          recursos_extras?: Json | null
          tarefas?: Json | null
          tipo?: string
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo?: Json | null
          created_at?: string
          duracao_estimada?: number | null
          id?: string
          modulo_id?: string
          ordem?: number
          pontos?: number | null
          recursos_extras?: Json | null
          tarefas?: Json | null
          tipo?: string
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licoes_modulo_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_curso"
            referencedColumns: ["id"]
          },
        ]
      }
      lideranca: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string
          descricao: string | null
          foto_url: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      listas_musicas: {
        Row: {
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          ordem_execucao: number
          programacao_culto_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          ordem_execucao?: number
          programacao_culto_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          ordem_execucao?: number
          programacao_culto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listas_musicas_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          book_id: string
          due_date: string | null
          id: string
          loan_date: string | null
          managed_by: string | null
          return_date: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          due_date?: string | null
          id?: string
          loan_date?: string | null
          managed_by?: string | null
          return_date?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          due_date?: string | null
          id?: string
          loan_date?: string | null
          managed_by?: string | null
          return_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_sincronizacao: {
        Row: {
          acao: string
          dados: Json | null
          erro: string | null
          id: string
          recurso_id: string | null
          status: string | null
          timestamp: string
          tipo: string
        }
        Insert: {
          acao: string
          dados?: Json | null
          erro?: string | null
          id?: string
          recurso_id?: string | null
          status?: string | null
          timestamp?: string
          tipo: string
        }
        Update: {
          acao?: string
          dados?: Json | null
          erro?: string | null
          id?: string
          recurso_id?: string | null
          status?: string | null
          timestamp?: string
          tipo?: string
        }
        Relationships: []
      }
      logs_sistema: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          id: string
          ip_address: string | null
          nivel_log: string | null
          timestamp: string
          tipo_acao: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          ip_address?: string | null
          nivel_log?: string | null
          timestamp?: string
          tipo_acao: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          ip_address?: string | null
          nivel_log?: string | null
          timestamp?: string
          tipo_acao?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      louvor_cargos: {
        Row: {
          ativo: boolean
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome_cargo: string
        }
        Insert: {
          ativo?: boolean
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome_cargo: string
        }
        Update: {
          ativo?: boolean
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome_cargo?: string
        }
        Relationships: []
      }
      louvor_membros_cargos: {
        Row: {
          ativo: boolean
          cargo_id: string
          created_at: string
          id: string
          membro_id: string
          nivel_habilidade: string | null
        }
        Insert: {
          ativo?: boolean
          cargo_id: string
          created_at?: string
          id?: string
          membro_id: string
          nivel_habilidade?: string | null
        }
        Update: {
          ativo?: boolean
          cargo_id?: string
          created_at?: string
          id?: string
          membro_id?: string
          nivel_habilidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "louvor_membros_cargos_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "louvor_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "louvor_membros_cargos_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      louvor_musicas: {
        Row: {
          artista: string | null
          ativa: boolean
          bpm: number | null
          categoria: string | null
          compositor: string | null
          created_at: string
          created_by: string | null
          id: string
          letra: string | null
          link_audio_youtube: string | null
          link_cifra_pdf: string | null
          link_spotify: string | null
          tags: string[] | null
          titulo: string
          tonalidade: string | null
          updated_at: string
        }
        Insert: {
          artista?: string | null
          ativa?: boolean
          bpm?: number | null
          categoria?: string | null
          compositor?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          letra?: string | null
          link_audio_youtube?: string | null
          link_cifra_pdf?: string | null
          link_spotify?: string | null
          tags?: string[] | null
          titulo: string
          tonalidade?: string | null
          updated_at?: string
        }
        Update: {
          artista?: string | null
          ativa?: boolean
          bpm?: number | null
          categoria?: string | null
          compositor?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          letra?: string | null
          link_audio_youtube?: string | null
          link_cifra_pdf?: string | null
          link_spotify?: string | null
          tags?: string[] | null
          titulo?: string
          tonalidade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "louvor_musicas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      louvor_presets_ambiente: {
        Row: {
          bpm: number | null
          created_at: string
          id: string
          nome_preset: string
          tonalidade_base: string | null
          updated_at: string
          volume_bumbo: number
          volume_pad: number
          volume_pratos: number
          volume_vocoder: number
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          id?: string
          nome_preset: string
          tonalidade_base?: string | null
          updated_at?: string
          volume_bumbo?: number
          volume_pad?: number
          volume_pratos?: number
          volume_vocoder?: number
        }
        Update: {
          bpm?: number | null
          created_at?: string
          id?: string
          nome_preset?: string
          tonalidade_base?: string | null
          updated_at?: string
          volume_bumbo?: number
          volume_pad?: number
          volume_pratos?: number
          volume_vocoder?: number
        }
        Relationships: []
      }
      louvor_repertorio: {
        Row: {
          artista: string | null
          ativo: boolean
          bpm: number | null
          cifra: string | null
          created_at: string
          created_by: string | null
          id: string
          letra: string | null
          link_referencia: string | null
          tags: string[] | null
          titulo: string
          tom: string | null
          updated_at: string
        }
        Insert: {
          artista?: string | null
          ativo?: boolean
          bpm?: number | null
          cifra?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          letra?: string | null
          link_referencia?: string | null
          tags?: string[] | null
          titulo: string
          tom?: string | null
          updated_at?: string
        }
        Update: {
          artista?: string | null
          ativo?: boolean
          bpm?: number | null
          cifra?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          letra?: string | null
          link_referencia?: string | null
          tags?: string[] | null
          titulo?: string
          tom?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      manutencoes_patrimonio: {
        Row: {
          comprovante_url: string | null
          created_at: string
          data_manutencao: string
          descricao: string
          empresa_responsavel: string | null
          id: string
          observacoes: string | null
          patrimonio_id: string
          responsavel_id: string | null
          tipo_manutencao: string
          updated_at: string
          valor_gasto: number | null
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string
          data_manutencao: string
          descricao: string
          empresa_responsavel?: string | null
          id?: string
          observacoes?: string | null
          patrimonio_id: string
          responsavel_id?: string | null
          tipo_manutencao: string
          updated_at?: string
          valor_gasto?: number | null
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string
          data_manutencao?: string
          descricao?: string
          empresa_responsavel?: string | null
          id?: string
          observacoes?: string | null
          patrimonio_id?: string
          responsavel_id?: string | null
          tipo_manutencao?: string
          updated_at?: string
          valor_gasto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_patrimonio_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          certificado_emitido: boolean | null
          certificado_url: string | null
          created_at: string
          curso_id: string
          data_conclusao: string | null
          data_inicio: string | null
          data_matricula: string | null
          frequencia_percentual: number | null
          id: string
          nota_final: number | null
          observacoes: string | null
          pessoa_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          curso_id: string
          data_conclusao?: string | null
          data_inicio?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          curso_id?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas_ensino: {
        Row: {
          certificado_emitido: boolean | null
          certificado_url: string | null
          created_at: string
          data_conclusao: string | null
          data_matricula: string | null
          frequencia_percentual: number | null
          id: string
          nota_final: number | null
          observacoes: string | null
          pessoa_id: string
          status: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id: string
          status?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_ensino_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      membros: {
        Row: {
          atualizado_em: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          criado_em: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          estado_civil: string | null
          foto: string | null
          funcao: string | null
          id: string
          membro_desde: string | null
          nome: string
          perfil_permissao_id: string | null
          sexo: string | null
          status: string | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto?: string | null
          funcao?: string | null
          id?: string
          membro_desde?: string | null
          nome: string
          perfil_permissao_id?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto?: string | null
          funcao?: string | null
          id?: string
          membro_desde?: string | null
          nome?: string
          perfil_permissao_id?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membros_perfil_permissao_id_fkey"
            columns: ["perfil_permissao_id"]
            isOneToOne: false
            referencedRelation: "perfis_permissao"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_equipa: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_ingresso: string | null
          disponibilidade_semanal: string[] | null
          funcao_id: string | null
          id: string
          nivel_competencia: string | null
          observacoes: string | null
          pessoa_id: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_ingresso?: string | null
          disponibilidade_semanal?: string[] | null
          funcao_id?: string | null
          id?: string
          nivel_competencia?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_ingresso?: string | null
          disponibilidade_semanal?: string[] | null
          funcao_id?: string | null
          id?: string
          nivel_competencia?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membros_equipa_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "funcoes_equipa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_equipa_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_indisponibilidade: {
        Row: {
          ativo: boolean
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          membro_id: string
          motivo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          membro_id: string
          motivo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          membro_id?: string
          motivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_indisponibilidade_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      ministerio_funcoes: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          ministerio_id: string
          nivel_experiencia: string | null
          nome_funcao: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ministerio_id: string
          nivel_experiencia?: string | null
          nome_funcao: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ministerio_id?: string
          nivel_experiencia?: string | null
          nome_funcao?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministerio_funcoes_ministerio_id_fkey"
            columns: ["ministerio_id"]
            isOneToOne: false
            referencedRelation: "ministerios"
            referencedColumns: ["id"]
          },
        ]
      }
      ministerio_membros: {
        Row: {
          ativo: boolean
          created_at: string
          data_ingresso: string | null
          funcoes: string[] | null
          id: string
          ministerio_id: string
          nivel_competencia: string | null
          observacoes: string | null
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_ingresso?: string | null
          funcoes?: string[] | null
          id?: string
          ministerio_id: string
          nivel_competencia?: string | null
          observacoes?: string | null
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_ingresso?: string | null
          funcoes?: string[] | null
          id?: string
          ministerio_id?: string
          nivel_competencia?: string | null
          observacoes?: string | null
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministerio_membros_ministerio_id_fkey"
            columns: ["ministerio_id"]
            isOneToOne: false
            referencedRelation: "ministerios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministerio_membros_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      ministerios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          lider_id: string | null
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          lider_id?: string | null
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          lider_id?: string | null
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ministerios_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          church_id: string | null
          color: string | null
          contact_info: Json | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          location: string | null
          meeting_day: string | null
          meeting_time: string | null
          name: string
          requirements: string[] | null
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          color?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name: string
          requirements?: string[] | null
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          color?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name?: string
          requirements?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      missoes: {
        Row: {
          ativa: boolean
          cidade: string | null
          contato_email: string | null
          contato_telefone: string | null
          created_at: string
          data_inicio: string | null
          descricao: string | null
          estado_provincia: string | null
          id: string
          igreja_responsavel_id: string | null
          membros_atual: number | null
          meta_membros: number | null
          nome: string
          observacoes: string | null
          orcamento_anual: number | null
          pais: string
          pastor_responsavel: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cidade?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          created_at?: string
          data_inicio?: string | null
          descricao?: string | null
          estado_provincia?: string | null
          id?: string
          igreja_responsavel_id?: string | null
          membros_atual?: number | null
          meta_membros?: number | null
          nome: string
          observacoes?: string | null
          orcamento_anual?: number | null
          pais: string
          pastor_responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cidade?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          created_at?: string
          data_inicio?: string | null
          descricao?: string | null
          estado_provincia?: string | null
          id?: string
          igreja_responsavel_id?: string | null
          membros_atual?: number | null
          meta_membros?: number | null
          nome?: string
          observacoes?: string | null
          orcamento_anual?: number | null
          pais?: string
          pastor_responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      modulos_curso: {
        Row: {
          ativo: boolean | null
          created_at: string
          curso_id: string
          descricao: string | null
          duracao_estimada: number | null
          id: string
          nome: string
          objetivos: string[] | null
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          curso_id: string
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          nome: string
          objetivos?: string[] | null
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          curso_id?: string
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          nome?: string
          objetivos?: string[] | null
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      modulos_sistema: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mural_doacoes: {
        Row: {
          categoria: string
          church_id: string | null
          created_at: string
          data_entrega: string | null
          descricao: string | null
          doador_id: string
          entregue_para_id: string | null
          fotos_urls: string[] | null
          id: string
          observacoes_entrega: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          church_id?: string | null
          created_at?: string
          data_entrega?: string | null
          descricao?: string | null
          doador_id: string
          entregue_para_id?: string | null
          fotos_urls?: string[] | null
          id?: string
          observacoes_entrega?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          church_id?: string | null
          created_at?: string
          data_entrega?: string | null
          descricao?: string | null
          doador_id?: string
          entregue_para_id?: string | null
          fotos_urls?: string[] | null
          id?: string
          observacoes_entrega?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      mural_interessados: {
        Row: {
          church_id: string | null
          created_at: string
          doacao_id: string
          id: string
          interessado_id: string
          mensagem: string | null
          status: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          doacao_id: string
          id?: string
          interessado_id: string
          mensagem?: string | null
          status?: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          doacao_id?: string
          id?: string
          interessado_id?: string
          mensagem?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mural_interessados_doacao_id_fkey"
            columns: ["doacao_id"]
            isOneToOne: false
            referencedRelation: "mural_doacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      mural_notificacoes_doador: {
        Row: {
          created_at: string
          data_leitura: string | null
          doacao_id: string
          doador_id: string
          id: string
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          tipo_notificacao: string
          titulo: string
        }
        Insert: {
          created_at?: string
          data_leitura?: string | null
          doacao_id: string
          doador_id: string
          id?: string
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          tipo_notificacao?: string
          titulo: string
        }
        Update: {
          created_at?: string
          data_leitura?: string | null
          doacao_id?: string
          doador_id?: string
          id?: string
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          tipo_notificacao?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "mural_notificacoes_doador_doacao_id_fkey"
            columns: ["doacao_id"]
            isOneToOne: false
            referencedRelation: "mural_doacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      mural_pedidos_ajuda: {
        Row: {
          atendido_por_diacono_id: string | null
          categoria: string
          church_id: string | null
          created_at: string
          descricao_necessidade: string
          id: string
          observacoes_diaconia: string | null
          publicado_anonimamente: boolean | null
          solicitante_id: string
          status: string
          updated_at: string
        }
        Insert: {
          atendido_por_diacono_id?: string | null
          categoria?: string
          church_id?: string | null
          created_at?: string
          descricao_necessidade: string
          id?: string
          observacoes_diaconia?: string | null
          publicado_anonimamente?: boolean | null
          solicitante_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          atendido_por_diacono_id?: string | null
          categoria?: string
          church_id?: string | null
          created_at?: string
          descricao_necessidade?: string
          id?: string
          observacoes_diaconia?: string | null
          publicado_anonimamente?: boolean | null
          solicitante_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      musicas_lista: {
        Row: {
          artista: string | null
          bpm: number | null
          cifra: string | null
          created_at: string
          id: string
          letra: string | null
          link_partitura: string | null
          link_playback: string | null
          link_video: string | null
          lista_id: string
          observacoes: string | null
          ordem: number
          tipo: string | null
          titulo: string
          tom_execucao: string | null
          tom_original: string | null
          updated_at: string
        }
        Insert: {
          artista?: string | null
          bpm?: number | null
          cifra?: string | null
          created_at?: string
          id?: string
          letra?: string | null
          link_partitura?: string | null
          link_playback?: string | null
          link_video?: string | null
          lista_id: string
          observacoes?: string | null
          ordem: number
          tipo?: string | null
          titulo: string
          tom_execucao?: string | null
          tom_original?: string | null
          updated_at?: string
        }
        Update: {
          artista?: string | null
          bpm?: number | null
          cifra?: string | null
          created_at?: string
          id?: string
          letra?: string | null
          link_partitura?: string | null
          link_playback?: string | null
          link_video?: string | null
          lista_id?: string
          observacoes?: string | null
          ordem?: number
          tipo?: string | null
          titulo?: string
          tom_execucao?: string | null
          tom_original?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "musicas_lista_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "listas_musicas"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_inscricoes: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          interesses: string | null
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          interesses?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          interesses?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notas_acompanhamento_visitantes: {
        Row: {
          created_at: string | null
          data_contato: string
          id: string
          observacoes: string | null
          pessoa_id: string
          proximo_contato: string | null
          resultado: string
          tipo_contato: string
          updated_at: string | null
          usuario_responsavel: string | null
        }
        Insert: {
          created_at?: string | null
          data_contato?: string
          id?: string
          observacoes?: string | null
          pessoa_id: string
          proximo_contato?: string | null
          resultado?: string
          tipo_contato?: string
          updated_at?: string | null
          usuario_responsavel?: string | null
        }
        Update: {
          created_at?: string | null
          data_contato?: string
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          proximo_contato?: string | null
          resultado?: string
          tipo_contato?: string
          updated_at?: string | null
          usuario_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_acompanhamento_visitantes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_pastorais: {
        Row: {
          categoria: string | null
          confidencial: boolean | null
          created_at: string | null
          id: string
          membro_id: string | null
          nota: string
          pastor_id: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          confidencial?: boolean | null
          created_at?: string | null
          id?: string
          membro_id?: string | null
          nota: string
          pastor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          confidencial?: boolean | null
          created_at?: string | null
          id?: string
          membro_id?: string | null
          nota?: string
          pastor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_pastorais_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_pastorais_pastor_id_fkey"
            columns: ["pastor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          acao_requerida: boolean
          categoria: string
          conteudo: string
          created_at: string
          dados_contexto: Json | null
          id: string
          lida: boolean
          link_acao: string | null
          prioridade: number
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acao_requerida?: boolean
          categoria?: string
          conteudo: string
          created_at?: string
          dados_contexto?: Json | null
          id?: string
          lida?: boolean
          link_acao?: string | null
          prioridade?: number
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acao_requerida?: boolean
          categoria?: string
          conteudo?: string
          created_at?: string
          dados_contexto?: Json | null
          id?: string
          lida?: boolean
          link_acao?: string | null
          prioridade?: number
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notificacoes_ensino: {
        Row: {
          created_at: string
          data_leitura: string | null
          destinatario_id: string | null
          id: string
          lida: boolean
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_leitura?: string | null
          destinatario_id?: string | null
          id?: string
          lida?: boolean
          mensagem: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_leitura?: string | null
          destinatario_id?: string | null
          id?: string
          lida?: boolean
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      notificacoes_escala: {
        Row: {
          created_at: string
          escala_membro_id: string
          id: string
          lida_em: string | null
          mensagem: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escala_membro_id: string
          id?: string
          lida_em?: string | null
          mensagem: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escala_membro_id?: string
          id?: string
          lida_em?: string | null
          mensagem?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notificacoes_escala_membro"
            columns: ["escala_membro_id"]
            isOneToOne: false
            referencedRelation: "escalas_membros"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_usuarios: {
        Row: {
          acao_texto: string | null
          acao_url: string | null
          categoria: string
          created_at: string | null
          dados_extras: Json | null
          data_criacao: string | null
          data_leitura: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acao_texto?: string | null
          acao_url?: string | null
          categoria?: string
          created_at?: string | null
          dados_extras?: Json | null
          data_criacao?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo?: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acao_texto?: string | null
          acao_url?: string | null
          categoria?: string
          created_at?: string | null
          dados_extras?: Json | null
          data_criacao?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          celula_updates: boolean
          created_at: string
          ensino_updates: boolean
          evento_confirmations: boolean
          evento_reminders: boolean
          general_announcements: boolean
          id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sound_enabled: boolean
          updated_at: string
          user_id: string
          vibration_enabled: boolean
        }
        Insert: {
          celula_updates?: boolean
          created_at?: string
          ensino_updates?: boolean
          evento_confirmations?: boolean
          evento_reminders?: boolean
          general_announcements?: boolean
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
          vibration_enabled?: boolean
        }
        Update: {
          celula_updates?: boolean
          created_at?: string
          ensino_updates?: boolean
          evento_confirmations?: boolean
          evento_reminders?: boolean
          general_announcements?: boolean
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
          vibration_enabled?: boolean
        }
        Relationships: []
      }
      notifications_log: {
        Row: {
          body: string
          data: Json | null
          delivery_attempt: number | null
          error_message: string | null
          id: string
          sent_at: string | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          data?: Json | null
          delivery_attempt?: number | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          data?: Json | null
          delivery_attempt?: number | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orcamento_itens: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          meta_valor: number
          orcamento_id: string
          updated_at: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          meta_valor?: number
          orcamento_id: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          meta_valor?: number
          orcamento_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          ano: number
          categoria_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          igreja_id: string | null
          mes: number | null
          nome: string | null
          observacoes: string | null
          status: string
          updated_at: string | null
          valor_orcado: number
          valor_realizado: number | null
        }
        Insert: {
          ano: number
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          igreja_id?: string | null
          mes?: number | null
          nome?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string | null
          valor_orcado: number
          valor_realizado?: number | null
        }
        Update: {
          ano?: number
          categoria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          igreja_id?: string | null
          mes?: number | null
          nome?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string | null
          valor_orcado?: number
          valor_realizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          page_path: string
          referrer: string | null
          user_agent: string | null
          user_session: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          user_session: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          user_session?: string
        }
        Relationships: []
      }
      paginas_editaveis: {
        Row: {
          ativa: boolean | null
          backup_elementos: Json | null
          created_at: string
          elementos: Json | null
          estilos: Json | null
          id: string
          nome: string
          rota: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          backup_elementos?: Json | null
          created_at?: string
          elementos?: Json | null
          estilos?: Json | null
          id?: string
          nome: string
          rota: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          backup_elementos?: Json | null
          created_at?: string
          elementos?: Json | null
          estilos?: Json | null
          id?: string
          nome?: string
          rota?: string
          updated_at?: string
        }
        Relationships: []
      }
      paginas_site: {
        Row: {
          created_at: string
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          published: boolean
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          published?: boolean
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          published?: boolean
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      palavra_semana: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          id: string
          referencia: string
          reflexao: string | null
          updated_at: string
          versiculo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          referencia: string
          reflexao?: string | null
          updated_at?: string
          versiculo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          referencia?: string
          reflexao?: string | null
          updated_at?: string
          versiculo?: string
        }
        Relationships: []
      }
      papeis_igreja: {
        Row: {
          ativo: boolean
          codigo: Database["public"]["Enums"]["papel_igreja"]
          created_at: string
          descricao: string | null
          id: string
          nivel_hierarquia: number
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: Database["public"]["Enums"]["papel_igreja"]
          created_at?: string
          descricao?: string | null
          id?: string
          nivel_hierarquia?: number
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: Database["public"]["Enums"]["papel_igreja"]
          created_at?: string
          descricao?: string | null
          id?: string
          nivel_hierarquia?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      participacao_eventos: {
        Row: {
          check_in_at: string | null
          created_at: string
          email: string
          evento_id: string
          id: string
          nome: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          check_in_at?: string | null
          created_at?: string
          email: string
          evento_id: string
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          check_in_at?: string | null
          created_at?: string
          email?: string
          evento_id?: string
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participacao_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_celulas: {
        Row: {
          ativo: boolean | null
          celula_id: string
          created_at: string
          data_entrada: string | null
          email: string | null
          id: string
          nome: string
          status_espiritual: Json | null
          telefone: string | null
          tipo_participante: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          celula_id: string
          created_at?: string
          data_entrada?: string | null
          email?: string | null
          id?: string
          nome: string
          status_espiritual?: Json | null
          telefone?: string | null
          tipo_participante?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          celula_id?: string
          created_at?: string
          data_entrada?: string | null
          email?: string | null
          id?: string
          nome?: string
          status_espiritual?: Json | null
          telefone?: string | null
          tipo_participante?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      participantes_ensaio: {
        Row: {
          created_at: string
          data_confirmacao: string | null
          ensaio_id: string
          id: string
          observacoes: string | null
          pessoa_id: string
          status_participacao: Database["public"]["Enums"]["status_participacao"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_confirmacao?: string | null
          ensaio_id: string
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_confirmacao?: string | null
          ensaio_id?: string
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_ensaio_ensaio_id_fkey"
            columns: ["ensaio_id"]
            isOneToOne: false
            referencedRelation: "ensaios_ministerio"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_escala: {
        Row: {
          created_at: string
          data_confirmacao: string | null
          data_convocacao: string
          data_presenca: string | null
          escala_id: string
          funcao: string
          id: string
          lembrete_enviado: boolean
          notificado: boolean
          observacoes: string | null
          pessoa_id: string
          status_participacao: Database["public"]["Enums"]["status_participacao"]
          substituido_por: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_confirmacao?: string | null
          data_convocacao?: string
          data_presenca?: string | null
          escala_id: string
          funcao: string
          id?: string
          lembrete_enviado?: boolean
          notificado?: boolean
          observacoes?: string | null
          pessoa_id: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          substituido_por?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_confirmacao?: string | null
          data_convocacao?: string
          data_presenca?: string | null
          escala_id?: string
          funcao?: string
          id?: string
          lembrete_enviado?: boolean
          notificado?: boolean
          observacoes?: string | null
          pessoa_id?: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          substituido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_escala_escala_id_fkey"
            columns: ["escala_id"]
            isOneToOne: false
            referencedRelation: "escalas_ministerio"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey_credentials: {
        Row: {
          backup_eligible: boolean | null
          backup_state: boolean | null
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          device_type: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backup_eligible?: boolean | null
          backup_state?: boolean | null
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backup_eligible?: boolean | null
          backup_state?: boolean | null
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      pastores_missoes: {
        Row: {
          ativo: boolean
          created_at: string
          data_ordenacao: string | null
          email: string
          id: string
          missao_id: string
          nome: string
          papel: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_ordenacao?: string | null
          email: string
          id?: string
          missao_id: string
          nome: string
          papel?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_ordenacao?: string | null
          email?: string
          id?: string
          missao_id?: string
          nome?: string
          papel?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastores_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_categorias: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      patrimonio_manutencoes: {
        Row: {
          created_at: string
          custo: number | null
          data_agendada: string | null
          data_execucao: string | null
          descricao: string | null
          id: string
          patrimonio_id: string
          recorrencia_meses: number | null
          status: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo?: number | null
          data_agendada?: string | null
          data_execucao?: string | null
          descricao?: string | null
          id?: string
          patrimonio_id: string
          recorrencia_meses?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo?: number | null
          data_agendada?: string | null
          data_execucao?: string | null
          descricao?: string | null
          id?: string
          patrimonio_id?: string
          recorrencia_meses?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_manutencoes_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_reservas: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          created_at: string
          fim: string
          id: string
          inicio: string
          motivo: string | null
          patrimonio_id: string
          solicitante_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          fim: string
          id?: string
          inicio: string
          motivo?: string | null
          patrimonio_id: string
          solicitante_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          fim?: string
          id?: string
          inicio?: string
          motivo?: string | null
          patrimonio_id?: string
          solicitante_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_reservas_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_reservas_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_reservas_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_subcategorias: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonios: {
        Row: {
          ativo: boolean
          categoria_id: string
          codigo_patrimonio: string | null
          created_at: string
          data_aquisicao: string | null
          data_proxima_manutencao: string | null
          data_ultima_manutencao: string | null
          descricao: string | null
          documentos: Json | null
          estado_conservacao: string
          fotos: Json | null
          id: string
          link_externo: string | null
          localizacao_atual: string | null
          ministerio_relacionado: string | null
          nome: string
          nota_fiscal_url: string | null
          observacoes: string | null
          quantidade: number
          responsavel_id: string | null
          status: string
          subcategoria_id: string | null
          updated_at: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          ativo?: boolean
          categoria_id: string
          codigo_patrimonio?: string | null
          created_at?: string
          data_aquisicao?: string | null
          data_proxima_manutencao?: string | null
          data_ultima_manutencao?: string | null
          descricao?: string | null
          documentos?: Json | null
          estado_conservacao?: string
          fotos?: Json | null
          id?: string
          link_externo?: string | null
          localizacao_atual?: string | null
          ministerio_relacionado?: string | null
          nome: string
          nota_fiscal_url?: string | null
          observacoes?: string | null
          quantidade?: number
          responsavel_id?: string | null
          status?: string
          subcategoria_id?: string | null
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          ativo?: boolean
          categoria_id?: string
          codigo_patrimonio?: string | null
          created_at?: string
          data_aquisicao?: string | null
          data_proxima_manutencao?: string | null
          data_ultima_manutencao?: string | null
          descricao?: string | null
          documentos?: Json | null
          estado_conservacao?: string
          fotos?: Json | null
          id?: string
          link_externo?: string | null
          localizacao_atual?: string | null
          ministerio_relacionado?: string | null
          nome?: string
          nota_fiscal_url?: string | null
          observacoes?: string | null
          quantidade?: number
          responsavel_id?: string | null
          status?: string
          subcategoria_id?: string | null
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonios_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias_patrimonio"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_oracao: {
        Row: {
          categoria: string
          created_at: string
          email: string | null
          id: string
          nome: string
          pedido: string
          publico: boolean
          status: string
          telefone: string | null
          updated_at: string
          urgencia: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          pedido: string
          publico?: boolean
          status?: string
          telefone?: string | null
          updated_at?: string
          urgencia?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          pedido?: string
          publico?: boolean
          status?: string
          telefone?: string | null
          updated_at?: string
          urgencia?: string
        }
        Relationships: []
      }
      perfil_permissoes: {
        Row: {
          concedida: boolean | null
          created_at: string
          id: string
          perfil_id: string
          permissao_id: string
        }
        Insert: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          perfil_id: string
          permissao_id: string
        }
        Update: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          perfil_id?: string
          permissao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_permissoes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_permissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_permissao: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          is_super_admin: boolean | null
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_super_admin?: boolean | null
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_super_admin?: boolean | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          conditions: Json | null
          created_at: string
          id: string
          resource_type: string | null
          subject: string
        }
        Insert: {
          action: string
          conditions?: Json | null
          created_at?: string
          id?: string
          resource_type?: string | null
          subject: string
        }
        Update: {
          action?: string
          conditions?: Json | null
          created_at?: string
          id?: string
          resource_type?: string | null
          subject?: string
        }
        Relationships: []
      }
      permissoes: {
        Row: {
          acao_id: string
          codigo: string
          created_at: string
          descricao: string | null
          funcionalidade_id: string
          id: string
          nome: string
        }
        Insert: {
          acao_id: string
          codigo: string
          created_at?: string
          descricao?: string | null
          funcionalidade_id: string
          id?: string
          nome: string
        }
        Update: {
          acao_id?: string
          codigo?: string
          created_at?: string
          descricao?: string | null
          funcionalidade_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_funcionalidade_id_fkey"
            columns: ["funcionalidade_id"]
            isOneToOne: false
            referencedRelation: "funcionalidades_modulo"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_sistema: {
        Row: {
          acao: Database["public"]["Enums"]["acao_permissao"]
          ativo: boolean
          condicoes: Json | null
          created_at: string
          id: string
          modulo_id: string | null
          papel_id: string | null
        }
        Insert: {
          acao: Database["public"]["Enums"]["acao_permissao"]
          ativo?: boolean
          condicoes?: Json | null
          created_at?: string
          id?: string
          modulo_id?: string | null
          papel_id?: string | null
        }
        Update: {
          acao?: Database["public"]["Enums"]["acao_permissao"]
          ativo?: boolean
          condicoes?: Json | null
          created_at?: string
          id?: string
          modulo_id?: string | null
          papel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_sistema_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissoes_sistema_papel_id_fkey"
            columns: ["papel_id"]
            isOneToOne: false
            referencedRelation: "papeis_igreja"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          celula_id: string | null
          cep: string | null
          church_id: string | null
          cidade: string | null
          congregacao_id: string | null
          created_at: string
          data_batismo: string | null
          data_conversao: string | null
          data_membresia: string | null
          data_nascimento: string | null
          dons_talentos: string[] | null
          email: string
          endereco: string | null
          escolaridade: string | null
          estado: string | null
          estado_civil: string | null
          estado_espiritual: string | null
          familia_id: string | null
          foto_url: string | null
          genero: string | null
          id: string
          lider_direto_id: string | null
          mae_id: string | null
          ministerios: string[] | null
          nome_completo: string
          observacoes: string | null
          pai_id: string | null
          papel_lideranca: string | null
          profile_id: string | null
          responsavel_principal_familia: boolean | null
          situacao: string | null
          status_acompanhamento: string | null
          status_discipulado: string | null
          status_membro: string | null
          telefone: string | null
          tipo_pessoa: string | null
          tipo_responsabilidade_familiar:
            | Database["public"]["Enums"]["tipo_responsabilidade_enum"]
            | null
          ultima_presenca: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          celula_id?: string | null
          cep?: string | null
          church_id?: string | null
          cidade?: string | null
          congregacao_id?: string | null
          created_at?: string
          data_batismo?: string | null
          data_conversao?: string | null
          data_membresia?: string | null
          data_nascimento?: string | null
          dons_talentos?: string[] | null
          email: string
          endereco?: string | null
          escolaridade?: string | null
          estado?: string | null
          estado_civil?: string | null
          estado_espiritual?: string | null
          familia_id?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          lider_direto_id?: string | null
          mae_id?: string | null
          ministerios?: string[] | null
          nome_completo: string
          observacoes?: string | null
          pai_id?: string | null
          papel_lideranca?: string | null
          profile_id?: string | null
          responsavel_principal_familia?: boolean | null
          situacao?: string | null
          status_acompanhamento?: string | null
          status_discipulado?: string | null
          status_membro?: string | null
          telefone?: string | null
          tipo_pessoa?: string | null
          tipo_responsabilidade_familiar?:
            | Database["public"]["Enums"]["tipo_responsabilidade_enum"]
            | null
          ultima_presenca?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          celula_id?: string | null
          cep?: string | null
          church_id?: string | null
          cidade?: string | null
          congregacao_id?: string | null
          created_at?: string
          data_batismo?: string | null
          data_conversao?: string | null
          data_membresia?: string | null
          data_nascimento?: string | null
          dons_talentos?: string[] | null
          email?: string
          endereco?: string | null
          escolaridade?: string | null
          estado?: string | null
          estado_civil?: string | null
          estado_espiritual?: string | null
          familia_id?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          lider_direto_id?: string | null
          mae_id?: string | null
          ministerios?: string[] | null
          nome_completo?: string
          observacoes?: string | null
          pai_id?: string | null
          papel_lideranca?: string | null
          profile_id?: string | null
          responsavel_principal_familia?: boolean | null
          situacao?: string | null
          status_acompanhamento?: string | null
          status_discipulado?: string | null
          status_membro?: string | null
          telefone?: string | null
          tipo_pessoa?: string | null
          tipo_responsabilidade_familiar?:
            | Database["public"]["Enums"]["tipo_responsabilidade_enum"]
            | null
          ultima_presenca?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pessoas_celula"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pessoas_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_lider_direto_id_fkey"
            columns: ["lider_direto_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_mae_id_fkey"
            columns: ["mae_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas_certificados: {
        Row: {
          certificado_id: string
          created_at: string
          data_emissao: string
          id: string
          pessoa_id: string
          url_certificado: string | null
        }
        Insert: {
          certificado_id: string
          created_at?: string
          data_emissao?: string
          id?: string
          pessoa_id: string
          url_certificado?: string | null
        }
        Update: {
          certificado_id?: string
          created_at?: string
          data_emissao?: string
          id?: string
          pessoa_id?: string
          url_certificado?: string | null
        }
        Relationships: []
      }
      planos_de_leitura: {
        Row: {
          ativo: boolean
          categoria: string
          church_id: string | null
          cor: string
          created_at: string
          descricao: string | null
          duracao_dias: number
          id: string
          imagem_url: string | null
          lista_de_capitulos: Json
          nivel: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          church_id?: string | null
          cor?: string
          created_at?: string
          descricao?: string | null
          duracao_dias?: number
          id?: string
          imagem_url?: string | null
          lista_de_capitulos?: Json
          nivel?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          church_id?: string | null
          cor?: string
          created_at?: string
          descricao?: string | null
          duracao_dias?: number
          id?: string
          imagem_url?: string | null
          lista_de_capitulos?: Json
          nivel?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      presencas: {
        Row: {
          aula_id: string
          created_at: string
          id: string
          justificativa: string | null
          matricula_id: string
          presente: boolean
        }
        Insert: {
          aula_id: string
          created_at?: string
          id?: string
          justificativa?: string | null
          matricula_id: string
          presente?: boolean
        }
        Update: {
          aula_id?: string
          created_at?: string
          id?: string
          justificativa?: string | null
          matricula_id?: string
          presente?: boolean
        }
        Relationships: []
      }
      presencas_aula: {
        Row: {
          created_at: string
          data_aula: string
          id: string
          justificativa: string | null
          matricula_id: string
          presente: boolean
        }
        Insert: {
          created_at?: string
          data_aula: string
          id?: string
          justificativa?: string | null
          matricula_id: string
          presente?: boolean
        }
        Update: {
          created_at?: string
          data_aula?: string
          id?: string
          justificativa?: string | null
          matricula_id?: string
          presente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aula_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas_celula: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          pessoa_id: string
          presente: boolean
          relatorio_id: string
          tipo_participacao: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pessoa_id: string
          presente?: boolean
          relatorio_id: string
          tipo_participacao?: string
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          presente?: boolean
          relatorio_id?: string
          tipo_participacao?: string
        }
        Relationships: []
      }
      privacy_consents: {
        Row: {
          consent_type: string
          consent_version: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: unknown | null
          revoked_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version?: string
          created_at?: string
          granted: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professor_disponibilidade: {
        Row: {
          created_at: string
          dia_semana: string
          disponivel: boolean
          horario_fim: string
          horario_inicio: string
          id: string
          observacoes: string | null
          professor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dia_semana: string
          disponivel?: boolean
          horario_fim: string
          horario_inicio: string
          id?: string
          observacoes?: string | null
          professor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dia_semana?: string
          disponivel?: boolean
          horario_fim?: string
          horario_inicio?: string
          id?: string
          observacoes?: string | null
          professor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_permissions: {
        Row: {
          created_at: string
          granted: boolean | null
          id: string
          permission_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          granted?: boolean | null
          id?: string
          permission_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean | null
          id?: string
          permission_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          created_at: string
          data_batismo: string | null
          data_membresia: string | null
          data_nascimento: string | null
          description: string | null
          dons_talentos: string[] | null
          id: string
          level: number | null
          name: string
          updated_at: string
          volunteer_interests: string[] | null
          volunteer_skills: string[] | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          data_batismo?: string | null
          data_membresia?: string | null
          data_nascimento?: string | null
          description?: string | null
          dons_talentos?: string[] | null
          id?: string
          level?: number | null
          name: string
          updated_at?: string
          volunteer_interests?: string[] | null
          volunteer_skills?: string[] | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          data_batismo?: string | null
          data_membresia?: string | null
          data_nascimento?: string | null
          description?: string | null
          dons_talentos?: string[] | null
          id?: string
          level?: number | null
          name?: string
          updated_at?: string
          volunteer_interests?: string[] | null
          volunteer_skills?: string[] | null
        }
        Relationships: []
      }
      programacao_cultos: {
        Row: {
          ativo: boolean
          cor_tema: string | null
          created_at: string
          criado_por: string
          data_culto: string
          id: string
          igreja_id: string
          local: string | null
          observacoes: string | null
          tema_culto: string | null
          tipo_culto: Database["public"]["Enums"]["tipo_culto"]
          titulo: string
          updated_at: string
          versiculo_base: string | null
        }
        Insert: {
          ativo?: boolean
          cor_tema?: string | null
          created_at?: string
          criado_por: string
          data_culto: string
          id?: string
          igreja_id: string
          local?: string | null
          observacoes?: string | null
          tema_culto?: string | null
          tipo_culto: Database["public"]["Enums"]["tipo_culto"]
          titulo: string
          updated_at?: string
          versiculo_base?: string | null
        }
        Update: {
          ativo?: boolean
          cor_tema?: string | null
          created_at?: string
          criado_por?: string
          data_culto?: string
          id?: string
          igreja_id?: string
          local?: string | null
          observacoes?: string | null
          tema_culto?: string | null
          tipo_culto?: Database["public"]["Enums"]["tipo_culto"]
          titulo?: string
          updated_at?: string
          versiculo_base?: string | null
        }
        Relationships: []
      }
      progresso_alunos: {
        Row: {
          aula_id: string
          created_at: string
          data_conclusao: string | null
          id: string
          pessoa_id: string
          pontuacao_quiz: number | null
          status: string
          tempo_assistido_minutos: number | null
          tentativas_quiz: number | null
          updated_at: string
        }
        Insert: {
          aula_id: string
          created_at?: string
          data_conclusao?: string | null
          id?: string
          pessoa_id: string
          pontuacao_quiz?: number | null
          status?: string
          tempo_assistido_minutos?: number | null
          tentativas_quiz?: number | null
          updated_at?: string
        }
        Update: {
          aula_id?: string
          created_at?: string
          data_conclusao?: string | null
          id?: string
          pessoa_id?: string
          pontuacao_quiz?: number | null
          status?: string
          tempo_assistido_minutos?: number | null
          tentativas_quiz?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_alunos_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_curso: {
        Row: {
          created_at: string
          curso_id: string
          data_inicio: string | null
          data_ultima_atividade: string | null
          id: string
          licao_atual_id: string | null
          licoes_concluidas: number | null
          modulo_atual_id: string | null
          percentual_conclusao: number | null
          pessoa_id: string
          pontos_totais: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          data_inicio?: string | null
          data_ultima_atividade?: string | null
          id?: string
          licao_atual_id?: string | null
          licoes_concluidas?: number | null
          modulo_atual_id?: string | null
          percentual_conclusao?: number | null
          pessoa_id: string
          pontos_totais?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          data_inicio?: string | null
          data_ultima_atividade?: string | null
          id?: string
          licao_atual_id?: string | null
          licoes_concluidas?: number | null
          modulo_atual_id?: string | null
          percentual_conclusao?: number | null
          pessoa_id?: string
          pontos_totais?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_curso_licao_atual_id_fkey"
            columns: ["licao_atual_id"]
            isOneToOne: false
            referencedRelation: "licoes_modulo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_curso_modulo_atual_id_fkey"
            columns: ["modulo_atual_id"]
            isOneToOne: false
            referencedRelation: "modulos_curso"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_licoes: {
        Row: {
          concluida_em: string | null
          created_at: string
          id: string
          licao_id: string
          matricula_id: string
          progresso_percent: number
          status: string
          updated_at: string
        }
        Insert: {
          concluida_em?: string | null
          created_at?: string
          id?: string
          licao_id: string
          matricula_id: string
          progresso_percent?: number
          status?: string
          updated_at?: string
        }
        Update: {
          concluida_em?: string | null
          created_at?: string
          id?: string
          licao_id?: string
          matricula_id?: string
          progresso_percent?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_licoes_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_licoes_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_planos_leitura: {
        Row: {
          concluido: boolean
          created_at: string
          data_inicio: string
          data_ultima_leitura: string | null
          dia_atual: number
          id: string
          pessoa_id: string
          plano_id: string
          updated_at: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          data_inicio?: string
          data_ultima_leitura?: string | null
          dia_atual?: number
          id?: string
          pessoa_id: string
          plano_id: string
          updated_at?: string
        }
        Update: {
          concluido?: boolean
          created_at?: string
          data_inicio?: string
          data_ultima_leitura?: string | null
          dia_atual?: number
          id?: string
          pessoa_id?: string
          plano_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_planos_leitura_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_de_leitura"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_trilha_formacao: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          etapa_atual: number | null
          id: string
          observacoes: string | null
          pessoa_id: string
          status: string
          trilha_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status?: string
          trilha_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          trilha_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_trilha_formacao_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_formacao"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_trilhas: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          etapa_atual: number | null
          id: string
          observacoes: string | null
          pessoa_id: string
          status: string | null
          trilha_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status?: string | null
          trilha_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string | null
          trilha_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_trilhas_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_formacao"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_trilhas_dna: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string
          discipulador_id: string | null
          etapa_atual: number
          etapas_concluidas: Json
          id: string
          observacoes: string | null
          pessoa_id: string
          status: string
          trilha_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          discipulador_id?: string | null
          etapa_atual?: number
          etapas_concluidas?: Json
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status?: string
          trilha_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          discipulador_id?: string | null
          etapa_atual?: number
          etapas_concluidas?: Json
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          trilha_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_trilhas_dna_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_dna"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_tokens: {
        Row: {
          active: boolean | null
          created_at: string | null
          device_info: Json | null
          device_type: string
          id: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          device_type?: string
          id?: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          device_type?: string
          id?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_resultados: {
        Row: {
          acertos: number
          created_at: string | null
          id: string
          percentual: number
          pessoa_id: string
          pontos_ganhos: number
          reference_id: string
          respostas_detalhadas: Json | null
          total_perguntas: number
          updated_at: string | null
        }
        Insert: {
          acertos?: number
          created_at?: string | null
          id?: string
          percentual?: number
          pessoa_id: string
          pontos_ganhos?: number
          reference_id: string
          respostas_detalhadas?: Json | null
          total_perguntas?: number
          updated_at?: string | null
        }
        Update: {
          acertos?: number
          created_at?: string | null
          id?: string
          percentual?: number
          pessoa_id?: string
          pontos_ganhos?: number
          reference_id?: string
          respostas_detalhadas?: Json | null
          total_perguntas?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_submissoes: {
        Row: {
          concluida_em: string | null
          created_at: string | null
          id: string
          nota_obtida: number
          pessoa_id: string
          quiz_id: string
          respostas: Json
          tempo_gasto: number | null
          tentativa_numero: number | null
        }
        Insert: {
          concluida_em?: string | null
          created_at?: string | null
          id?: string
          nota_obtida?: number
          pessoa_id: string
          quiz_id: string
          respostas?: Json
          tempo_gasto?: number | null
          tentativa_numero?: number | null
        }
        Update: {
          concluida_em?: string | null
          created_at?: string | null
          id?: string
          nota_obtida?: number
          pessoa_id?: string
          quiz_id?: string
          respostas?: Json
          tempo_gasto?: number | null
          tentativa_numero?: number | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          licao_id: string | null
          nota_minima_aprovacao: number | null
          perguntas: Json
          tempo_limite: number | null
          tentativas_permitidas: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          licao_id?: string | null
          nota_minima_aprovacao?: number | null
          perguntas?: Json
          tempo_limite?: number | null
          tentativas_permitidas?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          licao_id?: string | null
          nota_minima_aprovacao?: number | null
          perguntas?: Json
          tempo_limite?: number | null
          tentativas_permitidas?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quizzes_licao"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_ministerio: {
        Row: {
          created_at: string
          descricao: string | null
          disponivel: boolean
          id: string
          localizacao: string | null
          nome: string
          observacoes: string | null
          responsavel_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          localizacao?: string | null
          nome: string
          observacoes?: string | null
          responsavel_id?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          localizacao?: string | null
          nome?: string
          observacoes?: string | null
          responsavel_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      redes_celulas: {
        Row: {
          ativa: boolean | null
          coordenador_id: string | null
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          coordenador_id?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          coordenador_id?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      redes_ministerios: {
        Row: {
          ativa: boolean
          cor: string
          created_at: string
          descricao: string | null
          id: string
          lider_responsavel: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          lider_responsavel?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          lider_responsavel?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      relacionamentos_familiares: {
        Row: {
          created_at: string
          id: string
          parente_id: string
          pessoa_id: string
          tipo_relacionamento: string
        }
        Insert: {
          created_at?: string
          id?: string
          parente_id: string
          pessoa_id: string
          tipo_relacionamento: string
        }
        Update: {
          created_at?: string
          id?: string
          parente_id?: string
          pessoa_id?: string
          tipo_relacionamento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_relacionamentos_parente"
            columns: ["parente_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_relacionamentos_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios: {
        Row: {
          celula_id: string | null
          created_at: string | null
          criancas: number | null
          data_reuniao: string
          decisoes: number | null
          discipulados_iniciados: number | null
          id: string
          observacoes: string | null
          palavra_chave: string | null
          preenchido_por: string | null
          total_presentes: number | null
          updated_at: string | null
          visitantes: number | null
        }
        Insert: {
          celula_id?: string | null
          created_at?: string | null
          criancas?: number | null
          data_reuniao: string
          decisoes?: number | null
          discipulados_iniciados?: number | null
          id?: string
          observacoes?: string | null
          palavra_chave?: string | null
          preenchido_por?: string | null
          total_presentes?: number | null
          updated_at?: string | null
          visitantes?: number | null
        }
        Update: {
          celula_id?: string | null
          created_at?: string | null
          criancas?: number | null
          data_reuniao?: string
          decisoes?: number | null
          discipulados_iniciados?: number | null
          id?: string
          observacoes?: string | null
          palavra_chave?: string | null
          preenchido_por?: string | null
          total_presentes?: number | null
          updated_at?: string | null
          visitantes?: number | null
        }
        Relationships: []
      }
      relatorios_celula: {
        Row: {
          celula_id: string
          created_at: string
          created_by: string | null
          data_relatorio: string
          decisoes: number | null
          id: string
          motivos_oracoes: string | null
          observacoes: string | null
          ofertas: number | null
          presentes_membros: number | null
          presentes_visitantes: number | null
          status: string | null
          testemunhos: string | null
          total_presentes: number | null
          updated_at: string
        }
        Insert: {
          celula_id: string
          created_at?: string
          created_by?: string | null
          data_relatorio: string
          decisoes?: number | null
          id?: string
          motivos_oracoes?: string | null
          observacoes?: string | null
          ofertas?: number | null
          presentes_membros?: number | null
          presentes_visitantes?: number | null
          status?: string | null
          testemunhos?: string | null
          total_presentes?: number | null
          updated_at?: string
        }
        Update: {
          celula_id?: string
          created_at?: string
          created_by?: string | null
          data_relatorio?: string
          decisoes?: number | null
          id?: string
          motivos_oracoes?: string | null
          observacoes?: string | null
          ofertas?: number | null
          presentes_membros?: number | null
          presentes_visitantes?: number | null
          status?: string | null
          testemunhos?: string | null
          total_presentes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_celula_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_celula_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_celulas: {
        Row: {
          aprovado_por: string | null
          celula_id: string
          clima_reuniao: string | null
          created_at: string
          criado_por: string | null
          data_reuniao: string
          decisoes: number
          id: string
          lider_relatorio_id: string | null
          metadata: Json | null
          observacoes: string | null
          oferta: number | null
          pontos_fortes: string[] | null
          pontos_melhoria: string[] | null
          presentes: number
          proximos_passos: string[] | null
          status: string | null
          updated_at: string
          visitantes: number
        }
        Insert: {
          aprovado_por?: string | null
          celula_id: string
          clima_reuniao?: string | null
          created_at?: string
          criado_por?: string | null
          data_reuniao: string
          decisoes?: number
          id?: string
          lider_relatorio_id?: string | null
          metadata?: Json | null
          observacoes?: string | null
          oferta?: number | null
          pontos_fortes?: string[] | null
          pontos_melhoria?: string[] | null
          presentes?: number
          proximos_passos?: string[] | null
          status?: string | null
          updated_at?: string
          visitantes?: number
        }
        Update: {
          aprovado_por?: string | null
          celula_id?: string
          clima_reuniao?: string | null
          created_at?: string
          criado_por?: string | null
          data_reuniao?: string
          decisoes?: number
          id?: string
          lider_relatorio_id?: string | null
          metadata?: Json | null
          observacoes?: string | null
          oferta?: number | null
          pontos_fortes?: string[] | null
          pontos_melhoria?: string[] | null
          presentes?: number
          proximos_passos?: string[] | null
          status?: string | null
          updated_at?: string
          visitantes?: number
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_celulas_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_celulas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_celulas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_celulas_lider_relatorio_id_fkey"
            columns: ["lider_relatorio_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_semanais_celulas: {
        Row: {
          batismos_agendados: number | null
          celula_id: string
          created_at: string
          data_reuniao: string
          decisoes_cristo: number | null
          foto_url: string | null
          id: string
          motivos_oracao: string | null
          oferta_arrecadada: number | null
          palavra_ministrada: string | null
          presencas: Json | null
          status: string | null
          updated_at: string
          visitantes: Json | null
        }
        Insert: {
          batismos_agendados?: number | null
          celula_id: string
          created_at?: string
          data_reuniao: string
          decisoes_cristo?: number | null
          foto_url?: string | null
          id?: string
          motivos_oracao?: string | null
          oferta_arrecadada?: number | null
          palavra_ministrada?: string | null
          presencas?: Json | null
          status?: string | null
          updated_at?: string
          visitantes?: Json | null
        }
        Update: {
          batismos_agendados?: number | null
          celula_id?: string
          created_at?: string
          data_reuniao?: string
          decisoes_cristo?: number | null
          foto_url?: string | null
          id?: string
          motivos_oracao?: string | null
          oferta_arrecadada?: number | null
          palavra_ministrada?: string | null
          presencas?: Json | null
          status?: string | null
          updated_at?: string
          visitantes?: Json | null
        }
        Relationships: []
      }
      reservas_espacos: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          email_responsavel: string
          espaco_id: string
          evento_titulo: string
          id: string
          nome_responsavel: string
          observacoes: string | null
          status: string
          telefone_responsavel: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          email_responsavel: string
          espaco_id: string
          evento_titulo: string
          id?: string
          nome_responsavel: string
          observacoes?: string | null
          status?: string
          telefone_responsavel?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          email_responsavel?: string
          espaco_id?: string
          evento_titulo?: string
          id?: string
          nome_responsavel?: string
          observacoes?: string | null
          status?: string
          telefone_responsavel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_espacos_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: false
            referencedRelation: "espacos"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_recursos: {
        Row: {
          created_at: string
          data_reserva: string
          id: string
          observacoes: string | null
          programacao_culto_id: string
          recurso_id: string
          reservado_por: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_reserva?: string
          id?: string
          observacoes?: string | null
          programacao_culto_id: string
          recurso_id: string
          reservado_por: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_reserva?: string
          id?: string
          observacoes?: string | null
          programacao_culto_id?: string
          recurso_id?: string
          reservado_por?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_recursos_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_recursos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos_ministerio"
            referencedColumns: ["id"]
          },
        ]
      }
      secoes_pagina: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          ordem: number
          pagina_id: string
          status: string
          tipo_secao: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          ordem?: number
          pagina_id: string
          status?: string
          tipo_secao: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          ordem?: number
          pagina_id?: string
          status?: string
          tipo_secao?: string
        }
        Relationships: [
          {
            foreignKeyName: "secoes_pagina_pagina_id_fkey"
            columns: ["pagina_id"]
            isOneToOne: false
            referencedRelation: "paginas_site"
            referencedColumns: ["id"]
          },
        ]
      }
      security_active_sessions: {
        Row: {
          created_at: string
          device_type: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          location: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity: string
          success: boolean
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_notifications: {
        Row: {
          created_at: string
          id: string
          notification_type: string
          recipient: string
          security_event_id: string | null
          sent_at: string | null
          status: string
          template_used: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_type: string
          recipient: string
          security_event_id?: string | null
          sent_at?: string | null
          status?: string
          template_used: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_type?: string
          recipient?: string
          security_event_id?: string | null
          sent_at?: string | null
          status?: string
          template_used?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_notifications_security_event_id_fkey"
            columns: ["security_event_id"]
            isOneToOne: false
            referencedRelation: "security_events"
            referencedColumns: ["id"]
          },
        ]
      }
      security_permissions: {
        Row: {
          action_name: string
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          module_name: string
          resource_type: string | null
        }
        Insert: {
          action_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          module_name: string
          resource_type?: string | null
        }
        Update: {
          action_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          module_name?: string
          resource_type?: string | null
        }
        Relationships: []
      }
      security_profile_permissions: {
        Row: {
          conditions: Json | null
          granted: boolean
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          profile_id: string
        }
        Insert: {
          conditions?: Json | null
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          profile_id: string
        }
        Update: {
          conditions?: Json | null
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_profile_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "security_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_profile_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "security_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_profiles: {
        Row: {
          active: boolean
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          icon: string
          id: string
          is_system: boolean
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          icon?: string
          id?: string
          is_system?: boolean
          level?: number
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          icon?: string
          id?: string
          is_system?: boolean
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_user_profiles: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_user_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "security_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_cache: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          result: Json
          slug: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          result: Json
          slug: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          result?: Json
          slug?: string
        }
        Relationships: []
      }
      seo_logs: {
        Row: {
          error_message: string | null
          id: string
          slug: string
          success: boolean | null
          timestamp: string | null
          uid: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          slug: string
          success?: boolean | null
          timestamp?: string | null
          uid?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          slug?: string
          success?: boolean | null
          timestamp?: string | null
          uid?: string | null
        }
        Relationships: []
      }
      service_opportunities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_urgent: boolean | null
          ministry_id: string
          preferred_skills: string[] | null
          required_skills: string[] | null
          schedule_details: string | null
          slots_filled: number | null
          slots_needed: number | null
          time_commitment: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_urgent?: boolean | null
          ministry_id: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          schedule_details?: string | null
          slots_filled?: number | null
          slots_needed?: number | null
          time_commitment?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_urgent?: boolean | null
          ministry_id?: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          schedule_details?: string | null
          slots_filled?: number | null
          slots_needed?: number | null
          time_commitment?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_opportunities_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      service_schedule_volunteers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          notes: string | null
          role: string
          schedule_id: string
          status: string | null
          substitute_for: string | null
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          role: string
          schedule_id: string
          status?: string | null
          substitute_for?: string | null
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          role?: string
          schedule_id?: string
          status?: string | null
          substitute_for?: string | null
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_schedule_volunteers_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "service_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      service_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          ministry_id: string
          notes: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          ministry_id: string
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          ministry_id?: string
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_schedules_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_estudo: {
        Row: {
          created_at: string | null
          data_ultima_interacao: string | null
          id: string
          licao_id: string
          marcadores: Json | null
          pessoa_id: string
          tempo_assistido: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_ultima_interacao?: string | null
          id?: string
          licao_id: string
          marcadores?: Json | null
          pessoa_id: string
          tempo_assistido?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_ultima_interacao?: string | null
          id?: string
          licao_id?: string
          marcadores?: Json | null
          pessoa_id?: string
          tempo_assistido?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subcategorias_financeiras: {
        Row: {
          ativa: boolean | null
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategorias_patrimonio: {
        Row: {
          ativa: boolean
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_dispositivos: {
        Row: {
          created_at: string
          dispositivo_id: string
          id: string
          status: string | null
          tipos_sincronizados: string[] | null
          ultima_sincronizacao: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dispositivo_id: string
          id?: string
          status?: string | null
          tipos_sincronizados?: string[] | null
          ultima_sincronizacao?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dispositivo_id?: string
          id?: string
          status?: string | null
          tipos_sincronizados?: string[] | null
          ultima_sincronizacao?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          created_at: string
          dados: Json
          erro: string | null
          id: string
          processado_em: string | null
          status: string | null
          tentativas: number | null
          tipo: string
        }
        Insert: {
          created_at?: string
          dados: Json
          erro?: string | null
          id?: string
          processado_em?: string | null
          status?: string | null
          tentativas?: number | null
          tipo: string
        }
        Update: {
          created_at?: string
          dados?: Json
          erro?: string | null
          id?: string
          processado_em?: string | null
          status?: string | null
          tentativas?: number | null
          tipo?: string
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_data: Json | null
          created_at: string
          id: string
          name: string
          size: number
          status: string
          tables_count: number
          type: string
          updated_at: string
        }
        Insert: {
          backup_data?: Json | null
          created_at?: string
          id?: string
          name: string
          size?: number
          status?: string
          tables_count?: number
          type?: string
          updated_at?: string
        }
        Update: {
          backup_data?: Json | null
          created_at?: string
          id?: string
          name?: string
          size?: number
          status?: string
          tables_count?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates_licao: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          estrutura_conteudo: Json
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          estrutura_conteudo: Json
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          estrutura_conteudo?: Json
          id?: string
          nome?: string
        }
        Relationships: []
      }
      templates_site: {
        Row: {
          ai_gerado: boolean | null
          ativo: boolean | null
          categoria: string
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preview: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ai_gerado?: boolean | null
          ativo?: boolean | null
          categoria?: string
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preview?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_gerado?: boolean | null
          ativo?: boolean | null
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preview?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      trilhas_dna: {
        Row: {
          ativa: boolean
          certificado_template: string | null
          created_at: string
          descricao: string | null
          etapas: Json
          id: string
          nome: string
          ordem: number
          pre_requisitos: string[] | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          certificado_template?: string | null
          created_at?: string
          descricao?: string | null
          etapas?: Json
          id?: string
          nome: string
          ordem?: number
          pre_requisitos?: string[] | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          certificado_template?: string | null
          created_at?: string
          descricao?: string | null
          etapas?: Json
          id?: string
          nome?: string
          ordem?: number
          pre_requisitos?: string[] | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      trilhas_formacao: {
        Row: {
          ativa: boolean | null
          ativo: boolean | null
          created_at: string
          cursos_sequencia: Json
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          publico_alvo: string[] | null
          slug: string | null
          titulo: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          ativo?: boolean | null
          created_at?: string
          cursos_sequencia?: Json
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          publico_alvo?: string[] | null
          slug?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          ativo?: boolean | null
          created_at?: string
          cursos_sequencia?: Json
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          publico_alvo?: string[] | null
          slug?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          capacidade_maxima: number | null
          created_at: string
          curso_id: string
          data_fim: string
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id: string
          link_online: string | null
          local: string | null
          nome: string
          observacoes: string | null
          professor_responsavel: string
          status: string | null
          updated_at: string
        }
        Insert: {
          capacidade_maxima?: number | null
          created_at?: string
          curso_id: string
          data_fim: string
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id?: string
          link_online?: string | null
          local?: string | null
          nome: string
          observacoes?: string | null
          professor_responsavel: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          capacidade_maxima?: number | null
          created_at?: string
          curso_id?: string
          data_fim?: string
          data_inicio?: string
          dias_semana?: string[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          link_online?: string | null
          local?: string | null
          nome?: string
          observacoes?: string | null
          professor_responsavel?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      turmas_ensino: {
        Row: {
          capacidade_maxima: number | null
          congregacao_id: string | null
          created_at: string
          curso_id: string
          data_fim: string | null
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id: string
          link_online: string | null
          lista_espera: boolean | null
          local_endereco: string | null
          local_tipo: string
          nome_turma: string
          observacoes: string | null
          professor_responsavel: string
          status: string
          updated_at: string
        }
        Insert: {
          capacidade_maxima?: number | null
          congregacao_id?: string | null
          created_at?: string
          curso_id: string
          data_fim?: string | null
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id?: string
          link_online?: string | null
          lista_espera?: boolean | null
          local_endereco?: string | null
          local_tipo?: string
          nome_turma: string
          observacoes?: string | null
          professor_responsavel: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacidade_maxima?: number | null
          congregacao_id?: string | null
          created_at?: string
          curso_id?: string
          data_fim?: string | null
          data_inicio?: string
          dias_semana?: string[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          link_online?: string | null
          lista_espera?: boolean | null
          local_endereco?: string | null
          local_tipo?: string
          nome_turma?: string
          observacoes?: string | null
          professor_responsavel?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_church_roles: {
        Row: {
          active: boolean
          church_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["church_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          church_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["church_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          church_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["church_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_church_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          mfa_enabled: boolean | null
          phone_number: string | null
          preferred_method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          mfa_enabled?: boolean | null
          phone_number?: string | null
          preferred_method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          mfa_enabled?: boolean | null
          phone_number?: string | null
          preferred_method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          cell_messages: boolean
          created_at: string
          email: boolean
          events: boolean
          id: string
          push: boolean
          teaching_content: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          cell_messages?: boolean
          created_at?: string
          email?: boolean
          events?: boolean
          id?: string
          push?: boolean
          teaching_content?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          cell_messages?: boolean
          created_at?: string
          email?: boolean
          events?: boolean
          id?: string
          push?: boolean
          teaching_content?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          granted: boolean
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          monthly_reports: boolean
          phone_number: string | null
          push_notifications: boolean
          sms_notifications: boolean
          updated_at: string
          user_id: string
          weekly_reports: boolean
          whatsapp_notifications: boolean
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          monthly_reports?: boolean
          phone_number?: string | null
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
          weekly_reports?: boolean
          whatsapp_notifications?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          monthly_reports?: boolean
          phone_number?: string | null
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean
          whatsapp_notifications?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          active: boolean
          created_at: string
          device_id: string | null
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_id?: string | null
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_id?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          active: boolean | null
          assigned_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skills_profile: {
        Row: {
          availability: Json | null
          background_check_date: string | null
          created_at: string
          emergency_contact: Json | null
          experience_areas: string[] | null
          id: string
          is_available: boolean | null
          notes: string | null
          preferred_ministries: string[] | null
          spiritual_gifts: string[] | null
          talents_interests: string[] | null
          training_completed: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          background_check_date?: string | null
          created_at?: string
          emergency_contact?: Json | null
          experience_areas?: string[] | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          preferred_ministries?: string[] | null
          spiritual_gifts?: string[] | null
          talents_interests?: string[] | null
          training_completed?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          background_check_date?: string | null
          created_at?: string
          emergency_contact?: Json | null
          experience_areas?: string[] | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          preferred_ministries?: string[] | null
          spiritual_gifts?: string[] | null
          talents_interests?: string[] | null
          training_completed?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usuario_permissoes: {
        Row: {
          concedida: boolean | null
          created_at: string
          id: string
          permissao_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          permissao_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          permissao_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_admin: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          igreja_id: string
          mfa_ativo: boolean | null
          nome: string
          papel: string
          perfil_ministerial: string | null
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          igreja_id: string
          mfa_ativo?: boolean | null
          nome: string
          papel?: string
          perfil_ministerial?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          igreja_id?: string
          mfa_ativo?: boolean | null
          nome?: string
          papel?: string
          perfil_ministerial?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_admin_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      vinculos_familiares: {
        Row: {
          confirmado: boolean | null
          created_at: string
          data_confirmacao: string | null
          familia_id: string
          id: string
          observacoes_parentesco: string | null
          pessoa_id: string
          pessoa_relacionada_id: string | null
          responsavel_familiar: boolean
          tipo_vinculo: Database["public"]["Enums"]["tipo_parentesco"]
          updated_at: string
        }
        Insert: {
          confirmado?: boolean | null
          created_at?: string
          data_confirmacao?: string | null
          familia_id: string
          id?: string
          observacoes_parentesco?: string | null
          pessoa_id: string
          pessoa_relacionada_id?: string | null
          responsavel_familiar?: boolean
          tipo_vinculo?: Database["public"]["Enums"]["tipo_parentesco"]
          updated_at?: string
        }
        Update: {
          confirmado?: boolean | null
          created_at?: string
          data_confirmacao?: string | null
          familia_id?: string
          id?: string
          observacoes_parentesco?: string | null
          pessoa_id?: string
          pessoa_relacionada_id?: string | null
          responsavel_familiar?: boolean
          tipo_vinculo?: Database["public"]["Enums"]["tipo_parentesco"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_familiares_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_familiares_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_familiares_pessoa_relacionada_id_fkey"
            columns: ["pessoa_relacionada_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      visitantes_celulas: {
        Row: {
          celula_id: string
          como_conheceu: string | null
          created_at: string
          data_proximo_contato: string | null
          data_retorno: string | null
          data_visita: string
          email: string | null
          endereco: string | null
          id: string
          idade: number | null
          nome: string
          observacoes: string | null
          responsavel_acompanhamento: string | null
          retornou: boolean | null
          status_acompanhamento: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          celula_id: string
          como_conheceu?: string | null
          created_at?: string
          data_proximo_contato?: string | null
          data_retorno?: string | null
          data_visita?: string
          email?: string | null
          endereco?: string | null
          id?: string
          idade?: number | null
          nome: string
          observacoes?: string | null
          responsavel_acompanhamento?: string | null
          retornou?: boolean | null
          status_acompanhamento?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          celula_id?: string
          como_conheceu?: string | null
          created_at?: string
          data_proximo_contato?: string | null
          data_retorno?: string | null
          data_visita?: string
          email?: string | null
          endereco?: string | null
          id?: string
          idade?: number | null
          nome?: string
          observacoes?: string | null
          responsavel_acompanhamento?: string | null
          retornou?: boolean | null
          status_acompanhamento?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitantes_celulas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitantes_celulas_responsavel_acompanhamento_fkey"
            columns: ["responsavel_acompanhamento"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      voluntarios: {
        Row: {
          areas_interesse: string[]
          created_at: string
          disponibilidade: string
          email: string
          experiencia: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          areas_interesse: string[]
          created_at?: string
          disponibilidade: string
          email: string
          experiencia?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          areas_interesse?: string[]
          created_at?: string
          disponibilidade?: string
          email?: string
          experiencia?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          message: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_opportunity_id: string
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          message?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_opportunity_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          message?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_opportunity_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_service_opportunity_id_fkey"
            columns: ["service_opportunity_id"]
            isOneToOne: false
            referencedRelation: "service_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_opportunities: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          event_id: string | null
          filled_slots: number | null
          id: string
          is_active: boolean | null
          location: string | null
          ministry_id: string | null
          required_slots: number | null
          requirements: string[] | null
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string | null
          filled_slots?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          ministry_id?: string | null
          required_slots?: number | null
          requirements?: string[] | null
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string | null
          filled_slots?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          ministry_id?: string | null
          required_slots?: number | null
          requirements?: string[] | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      volunteer_signups: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string | null
          id: string
          message: string | null
          opportunity_id: string
          signed_up_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          opportunity_id: string
          signed_up_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          opportunity_id?: string
          signed_up_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_signups_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "volunteer_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          contact_name: string | null
          created_at: string
          id: string
          last_message_at: string
          metadata: Json | null
          phone_number: string
          status: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          metadata?: Json | null
          phone_number: string
          status?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          metadata?: Json | null
          phone_number?: string
          status?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          campaign_id: string | null
          content: string | null
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          error_message: string | null
          external_id: string | null
          id: string
          media_url: string | null
          message: string
          message_id: string | null
          message_type: string | null
          phone: string
          phone_number: string | null
          priority: string | null
          response_to: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          media_url?: string | null
          message: string
          message_id?: string | null
          message_type?: string | null
          phone: string
          phone_number?: string | null
          priority?: string | null
          response_to?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          media_url?: string | null
          message?: string
          message_id?: string | null
          message_type?: string | null
          phone?: string
          phone_number?: string | null
          priority?: string | null
          response_to?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analisar_genealogia_com_ia: {
        Args: { p_pessoa_id?: string; p_tipo_analise?: string }
        Returns: Json
      }
      aplicar_vinculo_familiar: {
        Args: {
          p_parente_id: string
          p_pessoa_id: string
          p_tipo_vinculo: string
        }
        Returns: Json
      }
      atualizar_emprestimos_atrasados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      atualizar_estatisticas_livro: {
        Args: { livro_uuid: string }
        Returns: undefined
      }
      buscar_pessoas_importadas_recentemente: {
        Args: { p_dias?: number }
        Returns: {
          created_at: string
          email: string
          familia_id: string
          id: string
          nome_completo: string
          tem_vinculos: boolean
        }[]
      }
      calcular_grupo_etario: {
        Args: { data_nascimento: string }
        Returns: string
      }
      calcular_grupo_etario_texto: {
        Args: { data_nascimento: string }
        Returns: string
      }
      calcular_progresso_curso: {
        Args: { p_curso_id: string; p_pessoa_id: string }
        Returns: {
          aulas_concluidas: number
          percentual_progresso: number
          total_aulas: number
        }[]
      }
      calcular_saude_celula: {
        Args: { celula_uuid: string }
        Returns: number
      }
      calcular_sequencia_estudos: {
        Args: { p_pessoa_id: string }
        Returns: {
          atividades_esta_semana: number
          dias_este_mes: number
          melhor_sequencia: number
          sequencia_atual: number
        }[]
      }
      can_access_admin_user: {
        Args: { user_record_user_id: string }
        Returns: boolean
      }
      can_access_church: {
        Args: { target_church_id: string }
        Returns: boolean
      }
      can_access_own_admin_record: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      check_suspicious_login: {
        Args: { p_ip_address: unknown; p_user_agent: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_seo_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      converter_visitante_em_membro: {
        Args: { p_pessoa_id: string }
        Returns: Json
      }
      create_automatic_invitations: {
        Args: { p_funcao_id: string; p_plano_id: string; p_quantidade?: number }
        Returns: {
          convite_id: string
          nome_pessoa: string
          pessoa_id: string
        }[]
      }
      criar_permissoes_automaticas: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      evaluate_abac_condition: {
        Args: { cond: Json }
        Returns: boolean
      }
      execute_query: {
        Args: { query_text: string }
        Returns: Json
      }
      export_user_data: {
        Args: { user_uuid: string }
        Returns: Json
      }
      generate_backup_codes: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_aniversariantes_da_semana: {
        Args: Record<PropertyKey, never>
        Returns: {
          data_nascimento: string
          id: string
          nome_completo: string
        }[]
      }
      get_aniversariantes_mes: {
        Args: { mes_param?: number }
        Returns: {
          data_nascimento: string
          dias_para_aniversario: number
          email: string
          id: string
          idade: number
          nome_completo: string
          telefone: string
        }[]
      }
      get_celulas_responsabilidade: {
        Args: Record<PropertyKey, never>
        Returns: {
          celula_id: string
          papel: string
        }[]
      }
      get_combined_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_complete_family: {
        Args: { p_pessoa_id: string }
        Returns: {
          eh_responsavel: boolean
          familiar_email: string
          familiar_id: string
          familiar_nome: string
          familiar_telefone: string
          tipo_vinculo: string
        }[]
      }
      get_current_person_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_metricas_pastorais: {
        Args: Record<PropertyKey, never>
        Returns: {
          aniversariantes_semana: number
          membros_sem_celula: number
          novos_membros_30d: number
          total_membros: number
          visitantes_acompanhar: number
        }[]
      }
      get_papel_lideranca: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_pastor_missao_id: {
        Args: { uid?: string }
        Returns: string
      }
      get_pastor_missao_igreja_id: {
        Args: { uid?: string }
        Returns: string
      }
      get_pending_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          conteudo_mensagem: string
          escala_id: string
          metodo_envio: string
          notification_id: string
          pessoa_email: string
          pessoa_id: string
          pessoa_nome: string
          tipo_notificacao: string
        }[]
      }
      get_pessoas_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          crescimento_mensal: number
          engagement_score: number
          faixa_etaria_predominante: string
          insights: Json
          total_lideres: number
          total_membros: number
          total_pessoas: number
          total_visitantes: number
        }[]
      }
      get_ranking_celula: {
        Args: { id_da_celula: string }
        Returns: {
          foto_url: string
          nome_completo: string
          pessoa_id: string
          pontos_total: number
          posicao: number
        }[]
      }
      get_ranking_disputa_celulas: {
        Args: Record<PropertyKey, never>
        Returns: {
          nome_celula: string
          posicao: number
          total_membros: number
          total_pontos: number
        }[]
      }
      get_ranking_geral: {
        Args: { limite?: number; offset_val?: number }
        Returns: {
          foto_url: string
          nome_completo: string
          pessoa_id: string
          pontos_total: number
          posicao: number
        }[]
      }
      get_reset_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_site_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_church_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_congregacao_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_igreja_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_igreja_id_with_missao: {
        Args: { uid?: string }
        Returns: string
      }
      get_user_pending_actions: {
        Args: Record<PropertyKey, never>
        Returns: {
          data_criacao: string
          descricao: string
          link_acao: string
          tipo_tarefa: string
        }[]
      }
      get_user_security_level: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_volunteer_suggestions: {
        Args: { p_data_servico: string; p_funcao_id: string; p_limit?: number }
        Returns: {
          dias_desde_ultimo_servico: number
          disponivel: boolean
          nivel_competencia: string
          nome: string
          pessoa_id: string
          pontuacao: number
          ultima_vez_serviu: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_security_permission: {
        Args: {
          action_name: string
          module_name: string
          resource_type?: string
          user_uuid: string
        }
        Returns: boolean
      }
      import_pessoas_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_any_admin: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_lider_celula: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_lider_ministerio: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_pastor_missao: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_security_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_sede_admin: {
        Args: Record<PropertyKey, never> | { uid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_volunteer_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      limpar_genealogia_pessoas: {
        Args: { p_pessoa_ids?: string[]; p_resetar_todas?: boolean }
        Returns: {
          familias_removidas: number
          pessoas_processadas: number
          vinculos_removidos: number
        }[]
      }
      log_security_audit: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_location_data?: Json
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      marcar_capitulo_lido: {
        Args: { p_capitulo: number; p_livro_id: string; p_versao_id?: string }
        Returns: boolean
      }
      mark_notification_as_sent: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      obter_estatisticas_biblia: {
        Args: { p_pessoa_id?: string }
        Returns: {
          ranking_posicao: number
          sequencia_atual: number
          total_pontos: number
          versiculos_lidos: number
        }[]
      }
      obter_estatisticas_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          aniversariantes_hoje: number
          novos_membros_30_dias: number
          total_lideres: number
          total_membros_ativos: number
        }[]
      }
      obter_estatisticas_ensino: {
        Args: Record<PropertyKey, never>
        Returns: {
          alunos_por_status: Json
          cursos_por_categoria: Json
          taxa_conclusao: number
          total_alunos_concluidos: number
          total_alunos_matriculados: number
          total_cursos: number
          total_turmas_ativas: number
        }[]
      }
      obter_estatisticas_familias: {
        Args: Record<PropertyKey, never>
        Returns: {
          familias_com_criancas: number
          familias_monoparentais: number
          media_membros_por_familia: number
          total_familias: number
        }[]
      }
      obter_estatisticas_financeiras: {
        Args: Record<PropertyKey, never>
        Returns: {
          campanhas_ativas: number
          despesas_mes: number
          receitas_mes: number
          saldo_total: number
        }[]
      }
      obter_estatisticas_multiplicacao: {
        Args: Record<PropertyKey, never>
        Returns: {
          celulas_por_geracao: Json
          geracao_maxima: number
          total_celulas_multiplicadas: number
          total_celulas_originais: number
        }[]
      }
      obter_estatisticas_pessoas: {
        Args: Record<PropertyKey, never>
        Returns: {
          crescimento_mes_atual: number
          pessoas_por_estado_espiritual: Json
          pessoas_por_grupo_etario: Json
          total_batizados: number
          total_em_discipulado: number
          total_lideres: number
          total_membros: number
          total_pessoas: number
          total_visitantes: number
        }[]
      }
      obter_papel_usuario: {
        Args: { user_email: string }
        Returns: Database["public"]["Enums"]["papel_igreja"]
      }
      obter_ranking_ensino: {
        Args: Record<PropertyKey, never>
        Returns: {
          badges_count: number
          cursos_concluidos: number
          nome: string
          pessoa_id: string
          total_pontos: number
        }[]
      }
      process_data_deletion: {
        Args: { request_id: string }
        Returns: boolean
      }
      respond_to_invitation: {
        Args: {
          p_escala_id: string
          p_observacoes?: string
          p_status: Database["public"]["Enums"]["confirmation_status"]
        }
        Returns: boolean
      }
      user_has_permission: {
        Args:
          | {
              action_name: string
              resource_type_param?: string
              subject_name: string
            }
          | {
              action_name: string
              resource_type_param?: string
              subject_name: string
              user_uuid: string
            }
        Returns: boolean
      }
      verificar_conflitos_turma: {
        Args: {
          p_data_fim: string
          p_data_inicio: string
          p_dias_semana: string[]
          p_horario_fim: string
          p_horario_inicio: string
          p_professor_responsavel: string
          p_turma_id?: string
        }
        Returns: {
          descricao: string
          gravidade: number
          tipo_conflito: string
        }[]
      }
      verificar_permissao: {
        Args: {
          acao_desejada: Database["public"]["Enums"]["acao_permissao"]
          modulo_codigo: Database["public"]["Enums"]["modulo_sistema"]
          user_email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      acao_permissao:
        | "visualizar"
        | "criar"
        | "editar"
        | "excluir"
        | "aprovar"
        | "exportar"
        | "gerenciar"
        | "administrar"
      app_role: "admin" | "moderator" | "user" | "pastor" | "lider" | "membro"
      church_role:
        | "super_admin"
        | "pastor"
        | "tesoureiro"
        | "lider_celula"
        | "secretario"
        | "membro"
      confirmation_status: "Convidado" | "Confirmado" | "Recusado"
      modulo_sistema:
        | "pessoas"
        | "ensino"
        | "celulas"
        | "financas"
        | "agenda"
        | "comunicacao"
        | "portal_aluno"
        | "dashboard_estrategico"
        | "escalas"
        | "galeria"
        | "patrimonio"
        | "missoes"
      papel_igreja:
        | "membro_comum"
        | "novo_convertido"
        | "aluno"
        | "discipulador"
        | "lider_celula"
        | "supervisor_regional"
        | "coordenador_ensino"
        | "tesoureiro"
        | "secretario"
        | "coordenador_agenda"
        | "comunicacao"
        | "administrador_geral"
        | "visitante_externo"
      patrimonio_status: "Disponível" | "Em Uso" | "Em Manutenção" | "Baixado"
      presence_status: "presente" | "falta" | "justificado"
      status_agendamento_pastoral:
        | "solicitado"
        | "agendado"
        | "concluido"
        | "cancelado"
      status_confirmacao_escala: "Convidado" | "Confirmado" | "Recusado"
      status_evento_agenda:
        | "agendado"
        | "confirmado"
        | "concluido"
        | "cancelado"
      status_pagamento_evento: "Pendente" | "Pago" | "Cancelado" | "Gratuito"
      status_participacao:
        | "convocado"
        | "confirmado"
        | "negado"
        | "substituido"
        | "presente"
        | "faltou"
      tipo_culto:
        | "domingo_manha"
        | "domingo_noite"
        | "quarta_oracao"
        | "sexta_jovens"
        | "especial"
        | "ensaio"
      tipo_escala:
        | "voluntarios"
        | "pregadores"
        | "ministerio_louvor"
        | "dancarinos"
        | "sonorizacao"
        | "multimidia"
        | "intercessao"
        | "recepcao"
        | "criancas"
        | "seguranca"
      tipo_evento_agenda:
        | "publico"
        | "celula"
        | "ensino"
        | "reuniao_interna"
        | "pastoral"
      tipo_midia: "imagem" | "video"
      tipo_parentesco:
        | "pai"
        | "mae"
        | "filho"
        | "filha"
        | "irmao"
        | "irma"
        | "avo"
        | "ava"
        | "neto"
        | "neta"
        | "tio"
        | "tia"
        | "sobrinho"
        | "sobrinha"
        | "primo"
        | "prima"
        | "genro"
        | "nora"
        | "sogro"
        | "sogra"
        | "cunhado"
        | "cunhada"
        | "padrasto"
        | "madrasta"
        | "enteado"
        | "enteada"
        | "responsavel"
        | "membro"
        | "outro"
        | "esposo"
        | "esposa"
        | "conjuge"
      tipo_responsabilidade_enum:
        | "pai_biologico"
        | "mae_biologica"
        | "pai_adotivo"
        | "mae_adotiva"
        | "responsavel_legal"
        | "tutor"
        | "avo"
        | "ava"
        | "tio"
        | "tia"
        | "outro_parente"
        | "responsavel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acao_permissao: [
        "visualizar",
        "criar",
        "editar",
        "excluir",
        "aprovar",
        "exportar",
        "gerenciar",
        "administrar",
      ],
      app_role: ["admin", "moderator", "user", "pastor", "lider", "membro"],
      church_role: [
        "super_admin",
        "pastor",
        "tesoureiro",
        "lider_celula",
        "secretario",
        "membro",
      ],
      confirmation_status: ["Convidado", "Confirmado", "Recusado"],
      modulo_sistema: [
        "pessoas",
        "ensino",
        "celulas",
        "financas",
        "agenda",
        "comunicacao",
        "portal_aluno",
        "dashboard_estrategico",
        "escalas",
        "galeria",
        "patrimonio",
        "missoes",
      ],
      papel_igreja: [
        "membro_comum",
        "novo_convertido",
        "aluno",
        "discipulador",
        "lider_celula",
        "supervisor_regional",
        "coordenador_ensino",
        "tesoureiro",
        "secretario",
        "coordenador_agenda",
        "comunicacao",
        "administrador_geral",
        "visitante_externo",
      ],
      patrimonio_status: ["Disponível", "Em Uso", "Em Manutenção", "Baixado"],
      presence_status: ["presente", "falta", "justificado"],
      status_agendamento_pastoral: [
        "solicitado",
        "agendado",
        "concluido",
        "cancelado",
      ],
      status_confirmacao_escala: ["Convidado", "Confirmado", "Recusado"],
      status_evento_agenda: [
        "agendado",
        "confirmado",
        "concluido",
        "cancelado",
      ],
      status_pagamento_evento: ["Pendente", "Pago", "Cancelado", "Gratuito"],
      status_participacao: [
        "convocado",
        "confirmado",
        "negado",
        "substituido",
        "presente",
        "faltou",
      ],
      tipo_culto: [
        "domingo_manha",
        "domingo_noite",
        "quarta_oracao",
        "sexta_jovens",
        "especial",
        "ensaio",
      ],
      tipo_escala: [
        "voluntarios",
        "pregadores",
        "ministerio_louvor",
        "dancarinos",
        "sonorizacao",
        "multimidia",
        "intercessao",
        "recepcao",
        "criancas",
        "seguranca",
      ],
      tipo_evento_agenda: [
        "publico",
        "celula",
        "ensino",
        "reuniao_interna",
        "pastoral",
      ],
      tipo_midia: ["imagem", "video"],
      tipo_parentesco: [
        "pai",
        "mae",
        "filho",
        "filha",
        "irmao",
        "irma",
        "avo",
        "ava",
        "neto",
        "neta",
        "tio",
        "tia",
        "sobrinho",
        "sobrinha",
        "primo",
        "prima",
        "genro",
        "nora",
        "sogro",
        "sogra",
        "cunhado",
        "cunhada",
        "padrasto",
        "madrasta",
        "enteado",
        "enteada",
        "responsavel",
        "membro",
        "outro",
        "esposo",
        "esposa",
        "conjuge",
      ],
      tipo_responsabilidade_enum: [
        "pai_biologico",
        "mae_biologica",
        "pai_adotivo",
        "mae_adotiva",
        "responsavel_legal",
        "tutor",
        "avo",
        "ava",
        "tio",
        "tia",
        "outro_parente",
        "responsavel",
      ],
    },
  },
} as const
