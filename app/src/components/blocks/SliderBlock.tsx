import { useState } from 'react';
import type { SliderBlockContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Gauge, Check, X } from 'lucide-react';

interface SliderBlockProps {
  content: SliderBlockContent;
}

export function SliderBlock({ content }: SliderBlockProps) {
  const [value, setValue] = useState(content.min);
  const [isRevealed, setIsRevealed] = useState(false);

  const correct = value >= content.correctMin && value <= content.correctMax;

  return (
    <Card className="border-l-4 border-l-cyan-500 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Gauge className="h-4 w-4 text-cyan-600" />
          </div>
          <h3 className="font-semibold text-gray-900"><h3 className="font-semibold text-gray-900">Estimate the Range</h3></h3>
        </div>

        <p className="text-lg text-gray-800 mb-6 font-medium">{content.question}</p>

        <div className="space-y-6">
          <div className="px-2">
            <Slider
              value={[value]}
              onValueChange={(vals) => { setValue(vals[0]); setIsRevealed(false); }}
              min={content.min}
              max={content.max}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{content.min} {content.unit}</span>
            <span className="text-2xl font-bold text-indigo-600">{value} {content.unit}</span>
            <span>{content.max} {content.unit}</span>
          </div>

          {!isRevealed ? (
            <Button onClick={() => setIsRevealed(true)} className="bg-indigo-600 hover:bg-indigo-700">
              Reveal Answer
            </Button>
          ) : (
            <div className={`p-5 rounded-xl ${correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {correct ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-emerald-800">In the right range!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-amber-600" />
                    <span className="font-bold text-amber-700">Not in the correct range</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Correct range:</span> {content.correctMin}-{content.correctMax} {content.unit}
              </p>
              <p className="text-sm text-gray-600 mt-2">{content.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
