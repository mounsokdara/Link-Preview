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
        const pageResponse = await fetch(validatedUrl, { headers: { 'User-Agent': 'LinkLookBot/1.0 (+https://yourapp.com/bot)' } });
        
        if (!pageResponse.ok) {
             return { error: 'Could not retrieve preview data from the URL. The link may be broken or the site may be down.' };
        }
        
        const html = await pageResponse.text();
        const $ = cheerio.load(html);

        const title = 
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').first().text() ||
            null;
            
        const description = 
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            null;
        
        let domain: string;
        try {
            const urlObject = new URL(validatedUrl);
            domain = urlObject.hostname.replace(/^www\./, '');
        } catch {
            domain = validatedUrl.split('/')[2] || validatedUrl;
        }

        const imageUrls: string[] = [];
        $('img').each((_i, element) => {
            const src = $(element).attr('src');
            if (src) {
                try {
                    const absoluteUrl = new URL(src, validatedUrl).href;
                    if (absoluteUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i) && !absoluteUrl.includes('data:image')) {
                        const width = parseInt($(element).attr('width') || '0');
                        const height = parseInt($(element).attr('height') || '0');
                        if (width === 0 || height === 0 || (width > 50 && height > 50)) {
                            imageUrls.push(absoluteUrl);
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to parse image URL: ${src} from ${validatedUrl}`);
                }
            }
        });
        const uniqueImageUrls = Array.from(new Set(imageUrls));
        
        const imageSelectionResult = await automatedImageSelection({
            pageContent: html,
            imageUrls: uniqueImageUrls
        });
        
        const imageUrl = imageSelectionResult.selectedImageUrl;

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
