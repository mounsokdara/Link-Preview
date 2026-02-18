"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState, useRef, ClipboardEvent } from "react";
import { fetchMetadata, ActionState, LinkPreviewData } from "@/app/actions";
import { MetadataDisplay } from "@/components/metadata-display";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Command } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const emptyState: ActionState = { data: undefined, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Previewing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Preview
        </>
      )}
    </Button>
  );
}

function LoadingSkeleton() {
    return (
        <Card className="w-full bg-card">
            <CardContent>
                <div className="flex flex-col gap-4">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </CardContent>
        </Card>
  );
}

function PageContent({ platformUrls, state, onPaste, onPlatformClick, inputRef }: { 
    platformUrls: Record<string, string>, 
    state: ActionState,
    onPaste: (e: ClipboardEvent<HTMLInputElement>) => void,
    onPlatformClick: (url: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
}) {
    const { pending } = useFormStatus();
    const [results, setResults] = useState<LinkPreviewData[]>([]);
    const { toast } = useToast();
    const isFirstRender = useRef(true);
    const initialDataProcessed = useRef(false);

    useEffect(() => {
        if(state.data && !initialDataProcessed.current) {
            setResults(prev => [state.data, ...prev.filter(p => p.url !== state.data.url)]);
            initialDataProcessed.current = true;
        }
    }, [state.data])

    useEffect(() => {
        if(isFirstRender.current){
            isFirstRender.current = false;
            return;
        }
        if (state.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: state.error,
          });
        }
        if (state.data) {
            setResults(prev => [state.data, ...prev.filter(p => p.url !== state.data.url)]);
            toast({
                title: "Preview generated!",
                description: `Successfully fetched preview for ${state.data.siteName || 'your link'}.`,
            });
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
      }, [state, toast, inputRef]);

    return (
        <div className="w-full flex flex-col items-center gap-8">
            <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(platformUrls).map(([name, url]) => (
                    <Button key={name} type="button" variant="secondary" onClick={() => onPlatformClick(url)}>{name}</Button>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full bg-card/50 p-2 rounded-lg border">
                <div className="relative w-full">
                    <Command className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        inputMode="url"
                        name="url"
                        ref={inputRef}
                        placeholder="Paste a YouTube, TikTok, Twitter link..."
                        required
                        className="h-14 text-base pl-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        defaultValue={state.data?.url ?? ''}
                        onPaste={onPaste}
                    />
                </div>
                <SubmitButton />
            </div>

            <div className="w-full mt-8">
                {pending && <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2"><LoadingSkeleton /></div>}
                {results.length > 0 && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in-0">
                        {results.map((data) => <MetadataDisplay key={data.url} data={data} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

export function MetaGrabber({ serverState, platformUrls }: { serverState?: ActionState, platformUrls: Record<string, string> }) {
  const [state, formAction] = useActionState(fetchMetadata, serverState ?? emptyState);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && (pastedText.startsWith('http') || (pastedText.includes('.') && !pastedText.includes(' ')))) {
        setTimeout(() => {
            formRef.current?.requestSubmit();
        }, 100);
    }
  }

  const handlePlatformClick = (url: string) => {
    if (inputRef.current) {
        inputRef.current.value = url;
        formRef.current?.requestSubmit();
    }
  }

  return (
    <form action={formAction} ref={formRef} className="w-full">
        <PageContent 
            platformUrls={platformUrls} 
            state={state} 
            onPaste={handlePaste} 
            onPlatformClick={handlePlatformClick}
            inputRef={inputRef}
        />
    </form>
  );
}
