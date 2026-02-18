'use server';
/**
 * @fileOverview An AI-powered flow to analyze webpage content and select the most relevant and visually appealing image for a link preview.
 *
 * - automatedImageSelection - A function that uses AI to select the best image from a list of URLs based on page content.
 * - AutomatedImageSelectionInput - The input type for the automatedImageSelection function.
 * - AutomatedImageSelectionOutput - The return type for the automatedImageSelection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutomatedImageSelectionInputSchema = z.object({
  pageContent: z.string().describe('The full HTML content of the webpage.'),
  imageUrls: z.array(z.string().url()).describe('A list of absolute image URLs found on the page.'),
});
export type AutomatedImageSelectionInput = z.infer<typeof AutomatedImageSelectionInputSchema>;

const AutomatedImageSelectionOutputSchema = z.object({
  selectedImageUrl: z.string().url().nullable().describe('The URL of the selected image, or null if no suitable image is found.'),
});
export type AutomatedImageSelectionOutput = z.infer<typeof AutomatedImageSelectionOutputSchema>;

export async function automatedImageSelection(input: AutomatedImageSelectionInput): Promise<AutomatedImageSelectionOutput> {
  return automatedImageSelectionFlow(input);
}

const selectImagePrompt = ai.definePrompt({
  name: 'selectImagePrompt',
  input: { schema: AutomatedImageSelectionInputSchema },
  output: { schema: AutomatedImageSelectionOutputSchema },
  prompt: `You are an AI assistant specialized in selecting the best image for a link preview.

Given the full HTML content of a webpage and a list of image URLs found on that page, your task is to identify the most relevant and visually appealing image to represent the webpage in a link preview.

Consider the following:
- **Relevance**: How well does the image represent the main topic or content of the webpage?
- **Visual Appeal**: Is the image high-quality, clear, and engaging?
- **Size/Proportion**: Prefer images that are likely to be good candidates for a preview thumbnail (e.g., not tiny icons, not extremely wide/narrow banners).
- **Context**: Use the surrounding HTML content (e.g., 'alt' attributes, text near the image) to infer the image's purpose.

Here is the webpage content:

<page_content>
{{{pageContent}}}
</page_content>

Here is a list of candidate image URLs:

<image_urls>
{{#each imageUrls}}
- {{{this}}}
{{/each}}
</image_urls>

Based on the analysis, select the single best image URL. If no suitable image is found, return null for selectedImageUrl.

Provide your response in JSON format according to the output schema.`,
});

const automatedImageSelectionFlow = ai.defineFlow(
  {
    name: 'automatedImageSelectionFlow',
    inputSchema: AutomatedImageSelectionInputSchema,
    outputSchema: AutomatedImageSelectionOutputSchema,
  },
  async (input) => {
    if (input.imageUrls.length === 0) {
      return { selectedImageUrl: null };
    }

    try {
      const { output } = await selectImagePrompt(input);
      return output!;
    } catch (error) {
      console.error('Error in automatedImageSelectionFlow:', error);
      return { selectedImageUrl: null };
    }
  }
);
