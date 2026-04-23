import { useState, useCallback } from 'react';
import type { FillBlankBlockContent } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, X, Edit3 } from 'lucide-react';

interface FillBlankBlockProps {
  content: FillBlankBlockContent;
}

export function FillBlankBlock({ content }: FillBlankBlockProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(content.answers.length).fill(''));
  const [checked, setChecked] = useState<Record<number, boolean | null>>({});

  const checkAnswer = useCallback((index: number, value: string) => {
    if (!value.trim()) {
      setChecked(prev => ({ ...prev, [index]: null }));
      return;
    }
    const correct = value.trim().toLowerCase() === content.answers[index].toLowerCase();
    setChecked(prev => ({ ...prev, [index]: correct }));
  }, [content.answers]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    checkAnswer(index, value);
  };

  const parts = content.text.split('___');

  return (
    <Card className="border-l-4 border-l-purple-500 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Edit3 className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Fill in the Blanks</h3>
        </div>

        <div className="text-lg leading-loose text-gray-800">
          {parts.map((part, index) => (
            <span key={index}>
              <span dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              {index < parts.length - 1 && (
                <span className="inline-flex items-center mx-1">
                  <span className="relative inline-flex items-center">
                    <Input
                      type="text"
                      value={answers[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className={`w-32 text-center inline-block mx-1 h-9 text-sm font-medium ${
                        checked[index] === true
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : checked[index] === false
                          ? 'border-red-400 bg-red-50 text-red-800'
                          : 'border-gray-300'
                      }`}
                      placeholder="..."
                    />
                    <span className="absolute -right-5 top-1/2 -translate-y-1/2">
                      {checked[index] === true && <Check className="h-4 w-4 text-emerald-500" />}
                      {checked[index] === false && <X className="h-4 w-4 text-red-400" />}
                    </span>
                  </span>
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Type your answers above. Correct answers will show a green check, incorrect a red X.
        </div>
      </CardContent>
    </Card>
  );
}
