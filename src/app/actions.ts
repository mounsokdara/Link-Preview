'use server';

import { z } from 'zod';
import * as cheerio from 'cheerio';
import { automatedImageSelection } from '@/ai/flows/automated-image-selection';

const UrlSchema = z.string().url();

export type PreviewData = {
    url: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    domain: string;
};

type ActionState = {
    data?: PreviewData;
    error?: string;
};

export async function generatePreviewAction(url: string): Promise<ActionState> {
    const urlResult = UrlSchema.safeParse(url);

    if (!urlResult.success) {
        return { error: 'Please enter a valid URL.' };
    }

    const validatedUrl = urlResult.data;

    try {
        // Use Promise.allSettled to ensure both promises complete, even if one fails.
        const [pageResult, imageSelectionResult] = await Promise.allSettled([
            fetch(validatedUrl, { headers: { 'User-Agent': 'LinkLookBot/1.0 (+https://yourapp.com/bot)' } }),
            automatedImageSelection({ url: validatedUrl })
        ]);

        let title: string | null = null;
        let description: string | null = null;
        let domain: string;

        try {
            const urlObject = new URL(validatedUrl);
            domain = urlObject.hostname.replace(/^www\./, '');
        } catch {
            domain = validatedUrl.split('/')[2] || validatedUrl;
        }

        if (pageResult.status === 'fulfilled' && pageResult.value.ok) {
            const html = await pageResult.value.text();
            const $ = cheerio.load(html);

            title = 
                $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').first().text() ||
                null;
                
            description = 
                $('meta[property="og:description"]').attr('content') ||
                $('meta[name="twitter:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                null;
        } else if (pageResult.status === 'rejected') {
            console.error('Fetch error:', pageResult.reason);
            // Don't return an error yet, we might still have an image
        }

        const imageUrl = imageSelectionResult.status === 'fulfilled' ? imageSelectionResult.value.selectedImageUrl : null;

        if (!title && !description && !imageUrl) {
            return { error: 'Could not retrieve any preview data from the URL. Please check the link and try again.' };
        }

        return {
            data: {
                url: validatedUrl,
                title,
                description,
                imageUrl,
                domain,
            }
        };

    } catch (e) {
        console.error(e);
        return { error: 'An unexpected error occurred. The server may be unable to reach the provided URL.' };
    }
}
