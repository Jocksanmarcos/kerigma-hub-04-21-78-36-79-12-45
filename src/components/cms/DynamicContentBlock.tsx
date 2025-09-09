import React from 'react';
import { Button } from '@/components/ui/button';
import { BlogoConteudo } from '@/hooks/useHomePageContent';

interface DynamicContentBlockProps {
  bloco: BlogoConteudo;
}

export const DynamicContentBlock: React.FC<DynamicContentBlockProps> = ({ bloco }) => {
  const { tipo_bloco, conteudo_json } = bloco;

  switch (tipo_bloco) {
    case 'titulo':
      return (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          {conteudo_json?.texto || 'Título'}
        </h2>
      );

    case 'subtitulo':
      return (
        <h3 className="text-xl md:text-2xl font-semibold text-center mb-4">
          {conteudo_json?.texto || 'Subtítulo'}
        </h3>
      );

    case 'paragrafo':
      return (
        <p className="text-lg text-muted-foreground text-center mb-6 max-w-3xl mx-auto">
          {conteudo_json?.texto || 'Parágrafo de exemplo'}
        </p>
      );

    case 'imagem':
      return (
        <div className="mb-6">
          <img
            src={conteudo_json?.url || '/placeholder.svg'}
            alt={conteudo_json?.alt || 'Imagem'}
            className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
          />
          {conteudo_json?.legenda && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              {conteudo_json.legenda}
            </p>
          )}
        </div>
      );

    case 'botao':
      return (
        <div className="text-center mb-6">
          <Button
            size="lg"
            onClick={() => {
              if (conteudo_json?.url) {
                if (conteudo_json.url.startsWith('http')) {
                  window.open(conteudo_json.url, '_blank');
                } else {
                  window.location.href = conteudo_json.url;
                }
              }
            }}
          >
            {conteudo_json?.texto || 'Clique aqui'}
          </Button>
        </div>
      );

    case 'video':
      return (
        <div className="mb-6">
          <div className="aspect-video">
            <iframe
              src={conteudo_json?.url || ''}
              title={conteudo_json?.titulo || 'Vídeo'}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
          {conteudo_json?.descricao && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              {conteudo_json.descricao}
            </p>
          )}
        </div>
      );

    case 'espacador':
      return (
        <div 
          className="w-full" 
          style={{ height: `${conteudo_json?.altura || 20}px` }}
        />
      );

    case 'divisor':
      return (
        <div className="my-8">
          <hr className="border-t border-muted-foreground/20 max-w-xs mx-auto" />
        </div>
      );

    default:
      // Bloco desconhecido - exibe JSON como texto para debug
      return (
        <div className="p-4 bg-muted/50 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">
            Tipo de bloco desconhecido: <strong>{tipo_bloco}</strong>
          </p>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(conteudo_json, null, 2)}
          </pre>
        </div>
      );
  }
};