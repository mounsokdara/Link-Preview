
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import type { MetadataResult } from "@/app/actions";
import { Link as LinkIcon } from "lucide-react";

export function MetadataDisplay({ data }: { data: MetadataResult }) {
  const { title, description, thumbnailUrl, url } = data;

  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-2">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title || "Thumbnail"}
                width={400}
                height={225}
                className="rounded-lg object-cover aspect-video border bg-secondary"
                data-ai-hint="website thumbnail"
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
