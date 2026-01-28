'use server';

/**
 * @fileOverview Selects the most relevant thumbnail from a webpage.
 *
 * - selectThumbnail - A function that handles the selection of the most relevant thumbnail.
 * - SelectThumbnailInput - The input type for the selectThumbnail function.
 * - SelectThumbnailOutput - The return type for the selectThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SelectThumbnailInputSchema = z.object({
  imageUrls: z
    .array(z.string())
    .describe('An array of image URLs to choose from.'),
  url: z.string().describe('The URL of the webpage.'),
});
export type SelectThumbnailInput = z.infer<typeof SelectThumbnailInputSchema>;

const SelectThumbnailOutputSchema = z.object({
  selectedThumbnail: z.string().describe('The most relevant thumbnail URL.'),
});
export type SelectThumbnailOutput = z.infer<typeof SelectThumbnailOutputSchema>;

export async function selectThumbnail(input: SelectThumbnailInput): Promise<SelectThumbnailOutput> {
  return selectThumbnailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'selectThumbnailPrompt',
  input: {schema: SelectThumbnailInputSchema},
  output: {schema: SelectThumbnailOutputSchema},
  prompt: `You are an expert web content analyst.

  Given a list of image URLs from a webpage at {{url}}, your task is to select the single most relevant image to serve as the main thumbnail for the page.
  Consider factors such as image size, aspect ratio, content, and relevance to the page's main topic.
  Return the URL of the selected thumbnail.

  Available Images:
  {{#each imageUrls}}
  - {{{this}}}
  {{/each}}
  `,
});

const selectThumbnailFlow = ai.defineFlow(
  {
    name: 'selectThumbnailFlow',
    inputSchema: SelectThumbnailInputSchema,
    outputSchema: SelectThumbnailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
