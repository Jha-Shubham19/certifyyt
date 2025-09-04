"use client";

import type { MCQ } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type QuizSessionProps = {
  mcqs: MCQ[];
  onFinish: (answers: { [key: number]: string }) => void;
};

export function QuizSession({ mcqs, onFinish }: QuizSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});

  const progress = ((currentQuestionIndex + 1) / mcqs.length) * 100;
  const currentMCQ = mcqs[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto glass-effect shadow-2xl border border-white/10 overflow-hidden select-none">
      <CardHeader className="pb-2 sm:pb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">
              Quiz Session
            </CardTitle>
            <div className="text-sm text-muted-foreground font-medium">
              {currentQuestionIndex + 1} of {mcqs.length}
            </div>
          </div>
          <Progress 
            value={progress} 
            className="w-full h-2 sm:h-3 bg-background/20" 
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 sm:space-y-8 min-h-[280px] sm:min-h-[300px]">
        <div className="space-y-4">
          <h2 className="text-sm sm:text-xl font-semibold text-foreground leading-relaxed">
            {currentMCQ.question}
          </h2>
        </div>
        
        <RadioGroup
          value={selectedAnswers[currentQuestionIndex]}
          onValueChange={handleSelectAnswer}
          className="yb-1 sm:space-y-3"
        >
          {currentMCQ.options.map((option: string, i: number) => (
            <div 
              key={i} 
              className="group flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl border-2 border-muted-foreground/20 hover:border-purple-500/50 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-500/10 transition-all duration-300 cursor-pointer"
            >
              <RadioGroupItem 
                value={option} 
                id={`option-${i}`} 
                className="border-2 border-muted-foreground/40 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500"
              />
              <Label 
                htmlFor={`option-${i}`} 
                className="text-xs sm:text-base font-medium flex-1 cursor-pointer group-hover:text-foreground transition-colors duration-300"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 sm:pt-6">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
          className="px-3 sm:px-6 py-1 sm:py-3 text-xs sm:text-base border-2 border-muted-foreground/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Previous
        </Button>
        
        {currentQuestionIndex === mcqs.length - 1 ? (
          <Button 
            onClick={() => onFinish(selectedAnswers)} 
            disabled={!selectedAnswers[currentQuestionIndex]}
            className="px-3 sm:px-6 py-1 sm:py-3 text-xs sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Submit Quiz
          </Button>
        ) : (
          <Button 
            onClick={goToNext} 
            disabled={!selectedAnswers[currentQuestionIndex]}
            className="px-5 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
