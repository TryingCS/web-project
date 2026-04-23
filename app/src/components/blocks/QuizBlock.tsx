import { useState } from 'react';
import type { QuizBlockContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X, HelpCircle } from 'lucide-react';

interface QuizBlockProps {
  content: QuizBlockContent;
}

export function QuizBlock({ content }: QuizBlockProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption !== null) setIsSubmitted(true);
  };

  const isCorrect = selectedOption === content.correct;

  return (
    <Card className="border-l-4 border-l-indigo-500 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Quiz Question</h3>
        </div>
        
        <p className="text-lg text-gray-800 mb-6 font-medium">{content.question}</p>
        
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => !isSubmitted && setSelectedOption(parseInt(value))}
          className="space-y-2"
        >
          {content.options.map((option, index) => (
            <div key={index}>
              <RadioGroupItem value={index.toString()} id={`quiz-${index}`} disabled={isSubmitted} className="sr-only" />
              <Label
                htmlFor={`quiz-${index}`}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSubmitted
                    ? index === content.correct
                      ? 'border-emerald-500 bg-emerald-50'
                      : selectedOption === index
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                    : selectedOption === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isSubmitted
                    ? index === content.correct
                      ? 'bg-emerald-500 text-white'
                      : selectedOption === index
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    : selectedOption === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isSubmitted && index === content.correct ? (
                    <Check className="h-4 w-4" />
                  ) : isSubmitted && selectedOption === index ? (
                    <X className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="text-gray-700">{option}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={selectedOption === null} className="mt-6 bg-indigo-600 hover:bg-indigo-700">
            Submit Answer
          </Button>
        ) : (
          <div className={`mt-6 p-5 rounded-xl ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-emerald-800">Correct!</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-500" />
                  <span className="font-bold text-red-700">Not quite right</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Explanation:</span> {content.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
