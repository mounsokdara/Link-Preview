'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ActionButtons({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast({
            title: "Copied!",
            description: "The URL has been copied to your clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not copy the URL to your clipboard.",
        });
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link Preview',
          text: 'Check out this link!',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
        toast({
            variant: "destructive",
            title: "Not supported",
            description: "Web Share API is not supported in your browser.",
        });
    }
  };

  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy URL">
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share URL">
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
