import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  Heart,
  HelpCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackSystemProps {
  module: string;
  context?: string;
  onFeedbackSubmit?: (feedback: FeedbackData) => void;
  compact?: boolean;
}

export interface FeedbackData {
  module: string;
  context?: string;
  rating: number;
  type: 'rating' | 'suggestion' | 'bug' | 'praise';
  message: string;
  timestamp: Date;
  userAgent: string;
}

const feedbackTypes = [
  {
    id: 'rating',
    label: 'Avaliação',
    icon: Star,
    color: 'text-yellow-500',
    description: 'Avaliar esta funcionalidade'
  },
  {
    id: 'suggestion',
    label: 'Sugestão',
    icon: Lightbulb,
    color: 'text-blue-500',
    description: 'Propor melhorias'
  },
  {
    id: 'bug',
    label: 'Problema',
    icon: AlertCircle,
    color: 'text-red-500',
    description: 'Reportar um bug'
  },
  {
    id: 'praise',
    label: 'Elogio',
    icon: Heart,
    color: 'text-green-500',
    description: 'Compartilhar feedback positivo'
  }
];

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  module,
  context,
  onFeedbackSubmit,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('rating');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (selectedType === 'rating' && rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação com estrelas.",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim() && selectedType !== 'rating') {
      toast({
        title: "Mensagem necessária",
        description: "Por favor, descreva seu feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      module,
      context,
      rating,
      type: selectedType as any,
      message: message.trim(),
      timestamp: new Date(),
      userAgent: navigator.userAgent
    };

    try {
      // Save feedback locally
      const existingFeedback = JSON.parse(
        localStorage.getItem('kerigma-feedback') || '[]'
      );
      existingFeedback.push(feedbackData);
      localStorage.setItem('kerigma-feedback', JSON.stringify(existingFeedback));

      // Call callback if provided
      onFeedbackSubmit?.(feedbackData);

      toast({
        title: "Feedback enviado! 🙏",
        description: "Obrigado por nos ajudar a melhorar o Kerigma Hub."
      });

      // Reset form
      setRating(0);
      setMessage('');
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`transition-colors ${
            star <= rating ? 'text-yellow-500' : 'text-muted-foreground'
          } hover:text-yellow-500`}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
    </div>
  );

  const QuickFeedback = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Esta página foi útil?</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const feedbackData: FeedbackData = {
            module,
            context,
            rating: 5,
            type: 'rating',
            message: 'Feedback positivo rápido',
            timestamp: new Date(),
            userAgent: navigator.userAgent
          };
          onFeedbackSubmit?.(feedbackData);
          toast({ title: "Obrigado pelo feedback! 👍" });
        }}
        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <ThumbsUp className="h-4 w-4" />
        Sim
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <ThumbsDown className="h-4 w-4" />
        Não
      </Button>
    </div>
  );

  if (compact && !isOpen) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed">
        <QuickFeedback />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-1"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </div>
    );
  }

  if (!isOpen && !compact) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Dar Feedback
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback sobre: {module}
        </CardTitle>
        {context && (
          <p className="text-sm text-muted-foreground">{context}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tipo de Feedback */}
        <div className="space-y-3">
          <Label>Tipo de Feedback</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {feedbackTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${type.color}`} />
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Avaliação por Estrelas */}
        {selectedType === 'rating' && (
          <div className="space-y-3">
            <Label>Avaliação</Label>
            <div className="flex items-center gap-3">
              <StarRating />
              <span className="text-sm text-muted-foreground">
                {rating === 0 ? 'Selecione uma classificação' : 
                 rating === 1 ? 'Muito insatisfeito' :
                 rating === 2 ? 'Insatisfeito' :
                 rating === 3 ? 'Neutro' :
                 rating === 4 ? 'Satisfeito' : 'Muito satisfeito'}
              </span>
            </div>
          </div>
        )}

        {/* Mensagem */}
        <div className="space-y-3">
          <Label htmlFor="feedback-message">
            {selectedType === 'rating' ? 'Comentário (Opcional)' : 'Descreva seu feedback'}
          </Label>
          <Textarea
            id="feedback-message"
            placeholder={
              selectedType === 'suggestion' ? 'Como podemos melhorar esta funcionalidade?' :
              selectedType === 'bug' ? 'Descreva o problema que encontrou...' :
              selectedType === 'praise' ? 'O que você mais gostou?' :
              'Conte-nos sobre sua experiência...'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Ações */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};