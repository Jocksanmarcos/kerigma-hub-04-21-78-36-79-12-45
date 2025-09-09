import React, { useState } from 'react';
import { QuizInterface } from './QuizInterface';
import { QuizResults } from './QuizResults';
import { useQuizSession } from '@/hooks/useQuizSession';

interface QuizQuestion {
  id: string;
  reference_id: string;
  texto_pergunta: string;
  opcoes: Array<{
    id: string;
    texto: string;
  }>;
  resposta_correta: string;
}

interface QuizContainerProps {
  questions: QuizQuestion[];
  onClose?: () => void;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({ 
  questions, 
  onClose 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  
  const { 
    isLoading, 
    quizResult, 
    showResults, 
    submitQuiz, 
    resetQuiz 
  } = useQuizSession();

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    await submitQuiz(userAnswers);
  };

  const handleCloseResults = () => {
    resetQuiz();
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    onClose?.();
  };

  // Mostrar resultados se disponível
  if (showResults && quizResult) {
    return <QuizResults result={quizResult} onClose={handleCloseResults} />;
  }

  // Mostrar interface do quiz
  return (
    <QuizInterface
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      userAnswers={userAnswers}
      onAnswerSelect={handleAnswerSelect}
      onNext={handleNext}
      onSubmitQuiz={handleSubmitQuiz}
      isLastQuestion={currentQuestionIndex === questions.length - 1}
      isLoading={isLoading}
    />
  );
};