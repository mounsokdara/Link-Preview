"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import type { MetadataResult } from "@/app/actions";
import { Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function MetadataDisplay({ data }: { data: MetadataResult }) {
  const { title, description, thumbnailUrl, iconUrl, url } = data;

  // The proxy endpoint will handle fetching and fallbacks.
  const proxyImageUrl = `/fetch/${encodeURIComponent(url)}`;
  
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // When the URL changes, reset the placeholder and generate the share link.
  useEffect(() => {
    setShowPlaceholder(false);
    if (url) {
        const origin = window.location.origin;
        setShareUrl(`${origin}/?fetch=${encodeURIComponent(url)}`);
    }
  }, [url]);

  const handleImageError = () => {
    // If the proxy returns an error (e.g., 404), it means no image could be found.
    // The Image component's onError is triggered, and we show the placeholder.
    setShowPlaceholder(true);
  };

  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-2">
            {!showPlaceholder ? (
              <Image
                key={url} // Force re-render if the original page url changes
                src={proxyImageUrl}
                alt={title || "Thumbnail"}
                width={400}
                height={225}
                className="rounded-lg object-cover aspect-video border bg-secondary"
                data-ai-hint="website thumbnail"
                unoptimized 
                onError={handleImageError}
              />
            ) : (
               <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center border">
                 <LinkIcon className="h-12 w-12 text-muted-foreground" />
               </div>
            )}
            <CopyButton textToCopy={thumbnailUrl || ""} buttonText="Copy Image URL" className="w-full" />
          </div>

          <div className="w-full lg:w-2/3 space-y-6">
            <div>
              <div className="flex justify-between items-start gap-2">
                  <h2 className="text-2xl font-bold font-headline leading-tight break-words">{title || 'No Title Found'}</h2>
                  <CopyButton textToCopy={title || ""} />
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline break-all">
                {url}
              </a>
            </div>

            <div>
                <div className="flex justify-between items-start gap-2">
                    <p className="text-foreground/80">{description || 'No Description Found'}</p>
                    <CopyButton textToCopy={description || ""} />
                </div>
            </div>

            <div className="pt-2">
                <CopyButton textToCopy={shareUrl} buttonText="Copy Share Link" className="w-full"/>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
