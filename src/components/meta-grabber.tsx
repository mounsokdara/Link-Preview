
"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { fetchMetadata, ActionState, MetadataResult } from "@/app/actions";
import { MetadataDisplay } from "@/components/metadata-display";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Link2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const emptyState: ActionState = { data: undefined, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Grabbing...
        </>
      ) : (
        <>
          Grab Metadata
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <Skeleton className="w-full lg:w-1/3 aspect-video rounded-lg" />
          <div className="w-full lg:w-2/3 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PageContent({ state }: { state: ActionState }) {
  const { pending } = useFormStatus();
  const [result, setResult] = useState<MetadataResult | undefined>();

  useEffect(() => {
    if (state.data) {
      setResult(state.data);
    }
  }, [state.data]);
  
  const displaySkeleton = pending;
  const displayData = !pending && result;

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                inputMode="url"
                name="url"
                placeholder="example.com"
                required
                className="h-14 text-base pl-12"
                defaultValue={state.data?.url ?? ''}
              />
            </div>
            <SubmitButton />
          </div>
        </CardContent>
      </Card>

      <div className="w-full mt-8">
        {displaySkeleton && <LoadingSkeleton />}
        {displayData && <MetadataDisplay data={result} />}
      </div>
    </>
  );
}

export function MetaGrabber({ serverState }: { serverState?: ActionState }) {
  const [state, formAction] = useActionState(fetchMetadata, serverState ?? emptyState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <PageContent state={state} />
    </form>
  );
}
