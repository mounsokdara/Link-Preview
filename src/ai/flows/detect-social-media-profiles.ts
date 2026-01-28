// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow that detects social media profiles associated with a given URL.
 *
 * It exports:
 * - `detectSocialMediaProfiles`: An async function that takes a URL as input and returns a list of detected social media profiles.
 * - `DetectSocialMediaProfilesInput`: The input type for the `detectSocialMediaProfiles` function (a URL string).
 * - `DetectSocialMediaProfilesOutput`: The output type for the `detectSocialMediaProfiles` function (an array of social media profile URLs).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const DetectSocialMediaProfilesInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to analyze.'),
});
export type DetectSocialMediaProfilesInput = z.infer<
  typeof DetectSocialMediaProfilesInputSchema
>;

// Define the output schema
const DetectSocialMediaProfilesOutputSchema = z.object({
  profiles: z
    .array(z.string().url())
    .describe('An array of social media profile URLs detected on the website.'),
});
export type DetectSocialMediaProfilesOutput = z.infer<
  typeof DetectSocialMediaProfilesOutputSchema
>;

// Exported function to call the flow
export async function detectSocialMediaProfiles(
  input: DetectSocialMediaProfilesInput
): Promise<DetectSocialMediaProfilesOutput> {
  return detectSocialMediaProfilesFlow(input);
}

// Define the prompt
const detectSocialMediaProfilesPrompt = ai.definePrompt({
  name: 'detectSocialMediaProfilesPrompt',
  input: {schema: DetectSocialMediaProfilesInputSchema},
  output: {schema: DetectSocialMediaProfilesOutputSchema},
  prompt: `You are an expert at identifying social media profiles associated with a given website URL.

  Analyze the provided website content and identify any linked social media profiles (e.g., Facebook, Twitter, Instagram, LinkedIn, etc.).  Return a JSON array of the URLs of the detected profiles.

  URL: {{{url}}}

  Ensure that the profile URLs are valid and directly link to the social media profiles.
  If no social media profiles are found, return an empty array.
  `,
});

// Define the flow
const detectSocialMediaProfilesFlow = ai.defineFlow(
  {
    name: 'detectSocialMediaProfilesFlow',
    inputSchema: DetectSocialMediaProfilesInputSchema,
    outputSchema: DetectSocialMediaProfilesOutputSchema,
  },
  async input => {
    const {output} = await detectSocialMediaProfilesPrompt(input);
    return output!;
  }
);
