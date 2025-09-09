import React from 'react';
import { Button } from '@/components/ui/button';
import { BlogoConteudo } from '@/hooks/useHomePageContent';
import { useEditMode } from '@/contexts/EditModeContext';
import { Edit } from 'lucide-react';
import { InlineParagraph } from './InlineParagraph';
import { InlineHeading } from './InlineHeading';

// Safe hook para casos onde o LiveEditorProvider não está disponível
const useSafeLiveEditor = () => {
  try {
    const { useLiveEditor } = require('@/components/live-editor/LiveEditorProvider');
    return useLiveEditor();
  } catch {
    return { isAdmin: false };
  }
};

interface EditableContentBlockProps {
  bloco: BlogoConteudo;
}

export const EditableContentBlock: React.FC<EditableContentBlockProps> = ({ bloco }) => {
  const { isEditMode, setEditingBlock, setEditModalOpen } = useEditMode();
  const { isAdmin } = useSafeLiveEditor();
  const { tipo_bloco, conteudo_json } = bloco;

  const handleEdit = () => {
    setEditingBlock(bloco);
    setEditModalOpen(true);
  };

  const renderContent = () => {
    switch (tipo_bloco) {
      case 'titulo':
        return (
          <InlineHeading
            blockId={bloco.id}
            content={conteudo_json}
            level={2}
            className="text-3xl md:text-4xl font-bold text-center mb-6"
          >
            {conteudo_json?.texto || 'Título'}
          </InlineHeading>
        );

      case 'subtitulo':
        return (
          <InlineHeading
            blockId={bloco.id}
            content={conteudo_json}
            level={3}
            className="text-xl md:text-2xl font-semibold text-center mb-4"
          >
            {conteudo_json?.texto || 'Subtítulo'}
          </InlineHeading>
        );

      case 'paragrafo':
        return (
          <InlineParagraph
            blockId={bloco.id}
            content={conteudo_json}
            className="text-lg text-muted-foreground text-center mb-6 max-w-3xl mx-auto"
          >
            {conteudo_json?.texto || 'Parágrafo de exemplo'}
          </InlineParagraph>
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

  return (
    <div className="relative group">
      {renderContent()}
      
      {/* Botão de edição contextual apenas para blocos não-textuais */}
      {isEditMode && isAdmin && !['titulo', 'subtitulo', 'paragrafo'].includes(tipo_bloco) && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-background/80 backdrop-blur-sm border-primary/50 hover:border-primary shadow-lg"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4 text-primary" />
        </Button>
      )}
    </div>
  );
};