import React from 'react';
import { BookOpen, Users, TrendingUp } from 'lucide-react';
import { EditableCard } from '@/components/public/EditableCard';
import { EditableButton } from '@/components/public/EditableButton';
import { RichTextEditor } from '@/components/live-editor/RichTextEditor';

export const WelcomeCard: React.FC = () => {
  return (
    <EditableCard
      editableId="welcome-card"
      title="Bem-vindo ao Kerigma Hub"
      className="bg-kerigma-gradient text-white border-0 shadow-kerigma-xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative">
        <p className="text-white/90 text-lg mb-6">
          <RichTextEditor
            id="welcome-description"
            content="Sua plataforma de educação cristã integrada"
            placeholder="Descrição da plataforma..."
            className="text-white/90 text-lg"
            tag="span"
          />
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <EditableButton
            editableId="welcome-primary-cta"
            text="Explorar Cursos"
            variant="secondary"
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-kerigma-lg font-semibold"
            asChild
          >
            <a href="/ensino">
              <BookOpen className="mr-2 h-5 w-5" />
              Explorar Cursos
            </a>
          </EditableButton>
          <EditableButton
            editableId="welcome-secondary-cta"
            text="Comunidade"
            variant="outline"
            size="lg"
            className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <Users className="mr-2 h-5 w-5" />
            Comunidade
          </EditableButton>
        </div>
      </div>
    </EditableCard>
  );
};