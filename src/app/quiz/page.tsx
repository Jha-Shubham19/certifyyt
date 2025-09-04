"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { MCQ } from '@/lib/types';
import { getQuizData } from '@/lib/data';
import { QuizSession } from '@/components/quiz/quiz-session';
import { QuizResults } from '@/components/quiz/quiz-results';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

type QuizState = 'loading' | 'unauthenticated' | 'ready' | 'finished' | 'error';

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  const url = searchParams.get('url');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
        setQuizState('unauthenticated');
        return;
    }

    if (!url) {
      setQuizState('error');
      return;
    }

    const fetchQuiz = async () => {
      setQuizState('loading');
      const data = await getQuizData(url);
      if (data && data.mcqs.length > 0) {
        setMcqs(data.mcqs);
        setVideoTitle(data.title);
        setQuizState('ready');
      } else {
        setQuizState('error');
      }
    };

    fetchQuiz();
  }, [url, user, authLoading]);

  const handleFinishQuiz = (answers: { [key: number]: string }) => {
    setUserAnswers(answers);
    setQuizState('finished');
  };

  const handleRetry = () => {
      // Re-fetch to get a potentially new set of questions if logic supports it
      // or simply reset state for the same questions.
      setUserAnswers({});
      setQuizState('ready');
  }

  const renderContent = () => {
    switch (quizState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Generating Your Quiz...</h2>
            <p className="text-muted-foreground">Our AI is crafting questions based on the video content. Please wait a moment.</p>
          </div>
        );
      case 'unauthenticated':
        return (
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You must be signed in to take a quiz. Please return to the homepage to sign in.
              </AlertDescription>
              <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
            </Alert>
        )
      case 'ready':
        return <QuizSession mcqs={mcqs} onFinish={handleFinishQuiz} />;
      case 'finished':
        return <QuizResults mcqs={mcqs} userAnswers={userAnswers} videoTitle={videoTitle} onRetry={handleRetry} />;
      case 'error':
        return (
          <Alert variant="destructive" className="max-w-md mx-auto bg-white" >
            <AlertTriangle className="h-4 w-4 bg-white" />
            <AlertTitle>Failed to Create Quiz</AlertTitle>
            <AlertDescription>
              We couldn't generate a quiz for the provided URL. Please check the link and try again.
            </AlertDescription>
            <Button onClick={() => router.push('/')} className="mt-4">Try another URL</Button>
          </Alert>
        );
    }
  };

  return (
    <div className="container py-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {renderContent()}
    </div>
  );
}

export default function QuizPage() {
    return (
        <Suspense fallback={
            <div className="container py-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <QuizPageContent />
        </Suspense>
    )
}
