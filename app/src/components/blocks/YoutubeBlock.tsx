import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import type { YoutubeBlockContent } from '@/types';

interface YoutubeBlockProps {
  content: YoutubeBlockContent;
}

export function YoutubeBlock({ content }: YoutubeBlockProps) {
  const videoId = content.videoId;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0`;

  return (
    <Card className="shadow-md overflow-hidden">
      <CardContent className="p-0">
        {content.title && (
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <Play className="h-4 w-4 fill-red-600" />
              <span className="text-sm font-medium">YouTube Video</span>
            </div>
            <h3 className="font-semibold text-gray-900">{content.title}</h3>
          </div>
        )}
        <div className="aspect-video bg-gray-900">
          <iframe
            src={embedUrl}
            title={content.title || 'YouTube video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}