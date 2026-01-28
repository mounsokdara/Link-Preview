'use server';

import { z } from 'zod';

export interface LinkPreviewData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  author?: string;
  type: 'video' | 'photo' | 'rich' | 'link';
}

const OEMBED_PROVIDERS: Record<string, string> = {
  youtube: 'https://www.youtube.com/oembed?url=',
  tiktok: 'https://www.tiktok.com/oembed?url=',
  twitter: 'https://publish.twitter.com/oembed?url=',
  vimeo: 'https://vimeo.com/api/oembed.json?url=',
  spotify: 'https://open.spotify.com/oembed?url=',
  soundcloud: 'https://soundcloud.com/oembed?format=json&url=',
};

function detectProvider(url: string): string | null {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/')) return 'youtube';
  if (urlLower.includes('tiktok.com') && urlLower.includes('/video/')) return 'tiktok';
  if ((urlLower.includes('twitter.com') || urlLower.includes('x.com')) && urlLower.includes('/status/')) return 'twitter';
  if (urlLower.includes('vimeo.com/') && /vimeo\.com\/\d+/.test(urlLower)) return 'vimeo';
  if (urlLower.includes('spotify.com/')) return 'spotify';
  if (urlLower.includes('soundcloud.com/')) return 'soundcloud';
  
  return null;
}

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return '';
  }
}

function getSiteName(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return hostname.charAt(0).toUpperCase() + hostname.slice(1).split('.')[0];
  } catch {
    return 'Unknown';
  }
}

async function fetchWithMicrolink(url: string): Promise<LinkPreviewData> {
  const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
  
  if (!response.ok) {
    throw new Error('Microlink fetch failed');
  }
  
  const result = await response.json();
  
  if (result.status !== 'success' || !result.data) {
    throw new Error('Microlink returned no data');
  }
  
  const data = result.data;
  
  return {
    url: url,
    title: data.title || getSiteName(url),
    description: data.description,
    image: data.image?.url || data.logo?.url,
    favicon: getFaviconUrl(url),
    siteName: data.publisher || getSiteName(url),
    author: data.author,
    type: 'link',
  };
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  // Ensure URL has protocol
  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const provider = detectProvider(formattedUrl);
  
  // Try oEmbed first for supported providers
  if (provider && OEMBED_PROVIDERS[provider]) {
    try {
      const oembedUrl = `${OEMBED_PROVIDERS[provider]}${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(oembedUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        // Only use oEmbed if it returns a thumbnail
        if (data.thumbnail_url) {
          return {
            url: formattedUrl,
            title: data.title || getSiteName(formattedUrl),
            description: data.author_name ? `By ${data.author_name}` : undefined,
            image: data.thumbnail_url,
            favicon: getFaviconUrl(formattedUrl),
            siteName: data.provider_name || getSiteName(formattedUrl),
            author: data.author_name,
            type: data.type || 'link',
          };
        }
      }
    } catch (error) {
      console.error('oEmbed fetch failed:', error);
    }
  }

  // Fallback to Microlink for all other sites or when oEmbed has no image
  try {
    return await fetchWithMicrolink(formattedUrl);
  } catch (error) {
    console.error('Microlink fetch failed:', error);
  }

  // Final fallback
  return {
    url: formattedUrl,
    title: getSiteName(formattedUrl),
    description: 'Preview not available for this link',
    favicon: getFaviconUrl(formattedUrl),
    siteName: getSiteName(formattedUrl),
    type: 'link',
  };
}


const schema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export interface ActionState {
  data?: LinkPreviewData;
  error?: string;
}

export async function fetchMetadata(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawUrl = formData.get('url');

  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return {
      error: 'Please enter a URL.',
    };
  }

  let url = rawUrl.trim();
  if (!url.match(/^https?:\/\//)) {
    url = `https://${url}`;
  }
  
  const validatedFields = schema.safeParse({
    url: url,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.url?.join(', '),
    };
  }
  
  const finalUrl = validatedFields.data.url;

  try {
    const metadata = await fetchLinkPreview(finalUrl);
    return {
      data: metadata
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      error: `Failed to process metadata. ${errorMessage}`,
    };
  }
}
