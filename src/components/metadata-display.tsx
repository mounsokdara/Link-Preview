"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LinkPreviewData } from "@/app/actions";
import { Link as LinkIcon, ExternalLink, Copy, Image as ImageIcon, Type, FileText, Database, Check } from "lucide-react";
import { useEffect, useState } from "react";

function ActionButton({ textToCopy, label, icon: Icon }: { textToCopy: string; label: string; icon: React.ElementType }) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) {
      toast({ variant: "destructive", description: "Nothing to copy." });
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({ description: "Copied to clipboard!" });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to copy to clipboard." });
    });
  };

  return (
    <Button variant="secondary" onClick={handleCopy} className="w-full justify-start h-12 text-base">
      <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
      <span className="text-secondary-foreground/80">{label}</span>
      {isCopied && <Check className="ml-auto h-5 w-5 text-green-500" />}
    </Button>
  );
}


export function MetadataDisplay({ data }: { data: LinkPreviewData }) {
  const { url, title, description, image, favicon, siteName, author, type } = data;

  const proxyImageUrl = `/fetchimage/${encodeURIComponent(url)}`;
  
  const [showPlaceholder, setShowPlaceholder] = useState(!image);
  const [textData, setTextData] = useState('');

  useEffect(() => {
      setShowPlaceholder(!image);
  }, [image, url]);

  useEffect(() => {
    if(url) {
        fetch(`/fetchdata/${encodeURIComponent(url)}`).then(res => res.text()).then(setTextData);
    }
  }, [url]);

  const handleImageError = () => {
    setShowPlaceholder(true);
  };
  
  const tag = type === 'video' ? 'VIDEO' : type === 'photo' ? 'IMAGE' : 'LINK';

  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 bg-card border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative w-full aspect-video">
            {!showPlaceholder ? (
              <Image
                key={url} 
                src={proxyImageUrl}
                alt={title || "Preview"}
                fill
                className="object-cover"
                data-ai-hint="website thumbnail"
                unoptimized 
                onError={handleImageError}
              />
            ) : (
               <div className="w-full h-full bg-secondary flex items-center justify-center">
                 <LinkIcon className="h-12 w-12 text-muted-foreground" />
               </div>
            )}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-md">{tag}</div>
        </div>
        <div className="p-4 space-y-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    {favicon && (
                      <Image
                        src={favicon}
                        alt={siteName ? `${siteName} favicon` : "Favicon"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">{siteName}</span>
                </div>
                
                <h2 className="text-xl font-bold leading-tight break-words mb-1">{title || 'No Title Found'}</h2>
                <p className="text-muted-foreground text-sm mb-2 h-10 overflow-hidden text-ellipsis">{description || 'No Description Found'}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all block">
                    {url}
                </a>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <a href={url} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="secondary" className="w-full justify-start h-12 text-base">
                        <ExternalLink className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="text-secondary-foreground/80">Open</span>
                    </Button>
                </a>
                <ActionButton icon={Copy} label="Copy Data" textToCopy={JSON.stringify(data, null, 2)} />
                <ActionButton icon={ImageIcon} label="Copy Image URL" textToCopy={image || ''} />
                <ActionButton icon={Type} label="Copy Title" textToCopy={title || ''} />
                <ActionButton icon={FileText} label="Copy Description" textToCopy={description || ''} />
                <ActionButton icon={Database} label="Copy All Data" textToCopy={textData} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
