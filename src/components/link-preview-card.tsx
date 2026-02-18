import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { type PreviewData } from '@/app/actions';
import { ActionButtons } from './action-buttons';
import { Globe } from 'lucide-react';

export function LinkPreviewCard({ url, title, description, imageUrl, domain }: PreviewData) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block group transition-transform hover:scale-[1.01]">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {imageUrl ? (
          <div className="aspect-video relative w-full overflow-hidden border-b">
            <Image
              src={imageUrl}
              alt={title || 'Link preview image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 672px"
              data-ai-hint="website screenshot"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted border-b">
            <Globe className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        <CardContent className="p-6 space-y-3">
          <h2 className="font-headline text-2xl font-bold leading-tight line-clamp-2">
            {title || 'Untitled Page'}
          </h2>
          <p className="text-muted-foreground line-clamp-3">
            {description || 'No description available for this page.'}
          </p>
          <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{domain}</span>
            </div>
            <div onClick={(e) => e.preventDefault()}>
                <ActionButtons url={url} />
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
