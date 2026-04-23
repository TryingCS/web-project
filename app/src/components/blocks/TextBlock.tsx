import { marked } from 'marked';
import type { TextBlockContent } from '@/types';

interface TextBlockProps {
  content: TextBlockContent;
}

export function TextBlock({ content }: TextBlockProps) {
  const html = marked.parse(content.markdown || '', { async: false }) as string;

  return (
    <div 
      className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
