'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePreviewAction, type PreviewData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LinkPreviewCard } from '@/components/link-preview-card';
import { LinkPreviewCardSkeleton } from '@/components/link-preview-card-skeleton';
import { AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Spinner } from './ui/spinner';

const formSchema = z.object({
  url: z.string().url({ message: 'Please provide a valid URL.' }),
});

export function LinkPreviewForm() {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setPreview(null);

    const result = await generatePreviewAction(values.url);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setPreview(result.data);
    }

    setIsLoading(false);
  }

  return (
    <div className="w-full space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="https://example.com" 
                    {...field} 
                    className="pl-10 h-12 text-base"
                    aria-label="URL Input"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Generate Preview'}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && <LinkPreviewCardSkeleton />}
      {preview && <LinkPreviewCard {...preview} />}
    </div>
  );
}
