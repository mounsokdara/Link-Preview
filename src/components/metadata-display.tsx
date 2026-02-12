"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LinkPreviewData } from "@/app/actions";
import { Link as LinkIcon, ExternalLink, Copy, Database, Check, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function ActionButton({ textToCopy, label, icon: Icon, disabled = false }: { textToCopy: string; label: string; icon: React.ElementType, disabled?: boolean }) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy || disabled) {
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
    <Button variant="secondary" onClick={handleCopy} className="w-full justify-start h-12 text-base" disabled={disabled}>
      <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
      <span className="text-secondary-foreground/80">{label}</span>
      {isCopied && <Check className="ml-auto h-5 w-5 text-green-500" />}
    </Button>
  );
}

const fieldLabels: Record<keyof Omit<LinkPreviewData, 'url'>, string> = {
    title: 'Title',
    description: 'Description',
    image: 'Image URL',
    favicon: 'Favicon URL',
    siteName: 'Site Name',
    author: 'Author',
    type: 'Type',
}

export function MetadataDisplay({ data }: { data: LinkPreviewData }) {
  const { url, title, description, image, favicon, siteName, type } = data;

  const proxyImageUrl = `/fetchimage/${encodeURIComponent(url)}`;
  
  const [showPlaceholder, setShowPlaceholder] = useState(!image);
  const [origin, setOrigin] = useState('');

  const [includedFields, setIncludedFields] = useState<Record<string, boolean>>({
    title: true,
    description: true,
    image: true,
    favicon: true,
    siteName: true,
    author: true,
    type: true,
  });

  const handleCheckboxChange = (field: string) => {
    setIncludedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
      setShowPlaceholder(!image);
  }, [image, url]);

  const handleImageError = () => {
    setShowPlaceholder(true);
  };
  
  const tag = type === 'video' ? 'VIDEO' : type === 'photo' ? 'IMAGE' : 'LINK';

  const fetchDataUrl = () => {
    if (!origin) return '';
    const selectedFields = Object.entries(includedFields)
      .filter(([, isChecked]) => isChecked)
      .map(([key]) => key);
    
    if (selectedFields.length === 0) {
      return '';
    }
    
    // If all fields are selected, don't add query params to return all data by default
    if (selectedFields.length === Object.keys(fieldLabels).length) {
      return `${origin}/fetchdata/${encodeURIComponent(url)}`;
    }

    const query = `?include=${selectedFields.join(',')}`;
    return `${origin}/fetchdata/${encodeURIComponent(url)}${query}`;
  };

  const fetchImageUrl = () => {
    if (!origin) return '';
    return `${origin}/fetchimage/${encodeURIComponent(url)}`;
  };

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
                <ActionButton icon={Copy} label="Copy Raw JSON" textToCopy={JSON.stringify(data, null, 2)} />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Fetch Data Options</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(fieldLabels).map(([field, label]) => (
                    <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${url}-${field}`}
                            checked={!!includedFields[field]}
                            onCheckedChange={() => handleCheckboxChange(field)}
                        />
                        <Label htmlFor={`${url}-${field}`} className="text-sm font-normal text-muted-foreground">
                            {label}
                        </Label>
                    </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
                <ActionButton 
                    icon={Database} 
                    label="Copy Data Route" 
                    textToCopy={fetchDataUrl()} 
                    disabled={!fetchDataUrl()}
                />
                <ActionButton 
                    icon={ImageIcon} 
                    label="Copy Image Route" 
                    textToCopy={fetchImageUrl()}
                    disabled={!image}
                />
            </div>

        </div>
      </CardContent>
    </Card>
  );
}
