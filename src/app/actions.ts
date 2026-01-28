'use server';

import { z } from 'zod';
import * as cheerio from 'cheerio';

const schema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export interface MetadataResult {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  url: string;
}

export interface ActionState {
  data?: MetadataResult;
  error?: string;
}

export async function fetchMetadata(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validatedFields = schema.safeParse({
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.url?.join(', '),
    };
  }
  
  const url = validatedFields.data.url;

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        },
        redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';
      
    let thumbnailUrl = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    if (thumbnailUrl) {
        try {
            thumbnailUrl = new URL(thumbnailUrl, url).href;
        } catch {
            thumbnailUrl = undefined;
        }
    }

    if (!thumbnailUrl) {
        const imageUrls = $('img')
          .map((i, el) => $(el).attr('src'))
          .get()
          .map(src => {
            try {
              if (src) return new URL(src, url).href;
            } catch (e) {
              return null;
            }
            return null;
          })
          .filter((src): src is string => !!src && !src.startsWith('data:') && /\.(jpg|jpeg|png|gif|webp)$/i.test(src));
          
        const uniqueImageUrls = [...new Set(imageUrls)];

        if (uniqueImageUrls.length > 0) {
            thumbnailUrl = uniqueImageUrls[0];
        }
    }

    return {
      data: {
        title,
        description,
        thumbnailUrl,
        url,
      },
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      error: `Failed to process metadata. ${errorMessage}`,
    };
  }
}
