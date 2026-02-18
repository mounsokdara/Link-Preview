'use server';

import { z } from 'zod';
<<<<<<< HEAD
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
=======

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
  // Fix: Detect all TikTok URLs (both videos and profiles)
  if (urlLower.includes('tiktok.com/')) return 'tiktok';
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
  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Microlink fetch failed with status: ${response.status}`);
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
  } catch (error) {
    console.error('Microlink fetch error:', error);
    throw error;
  }
}

// Alternative method for TikTok when oEmbed fails
async function fetchTikTokDirect(url: string): Promise<LinkPreviewData> {
  try {
    // Try to get basic profile info from TikTok URLs
    const profileMatch = url.match(/tiktok\.com\/@([^/?]+)/);
    const videoMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    
    if (profileMatch) {
      const username = profileMatch[1];
      return {
        url: url,
        title: `@${username} on TikTok`,
        description: 'TikTok creator profile',
        favicon: getFaviconUrl(url),
        siteName: 'TikTok',
        author: `@${username}`,
        type: 'rich',
      };
    }
    
    if (videoMatch) {
      const videoId = videoMatch[1];
      return {
        url: url,
        title: 'TikTok Video',
        description: 'Watch this video on TikTok',
        image: `https://v16m-default.akamaized.net/${videoId}/`, // This won't always work due to CDN changes
        favicon: getFaviconUrl(url),
        siteName: 'TikTok',
        type: 'video',
      };
    }
    
    throw new Error('Could not parse TikTok URL');
  } catch (error) {
    console.error('TikTok direct fetch failed:', error);
    throw error;
  }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  // Ensure URL has protocol
  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const provider = detectProvider(formattedUrl);
  
  // Special handling for TikTok
  if (provider === 'tiktok') {
    // Check if it's a video URL (oEmbed only works for videos)
    const isTikTokVideo = formattedUrl.toLowerCase().includes('/video/');
    
    if (isTikTokVideo) {
      // Try oEmbed for TikTok videos
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(formattedUrl)}`;
        const response = await fetch(oembedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.thumbnail_url) {
            return {
              url: formattedUrl,
              title: data.title || getSiteName(formattedUrl),
              description: data.author_name ? `By ${data.author_name}` : undefined,
              image: data.thumbnail_url,
              favicon: getFaviconUrl(formattedUrl),
              siteName: data.provider_name || getSiteName(formattedUrl),
              author: data.author_name,
              type: 'video',
            };
          }
        }
      } catch (error) {
        console.error('TikTok oEmbed fetch failed:', error);
      }
    }
    
    // For TikTok profiles or when oEmbed fails, try multiple approaches
    try {
      // First try Microlink
      return await fetchWithMicrolink(formattedUrl);
    } catch (microlinkError) {
      console.error('Microlink failed for TikTok, trying direct method:', microlinkError);
      
      try {
        // Fallback to direct TikTok method
        return await fetchTikTokDirect(formattedUrl);
      } catch (directError) {
        console.error('All TikTok methods failed:', directError);
      }
    }
  }
  
  // Original oEmbed logic for other providers
  if (provider && provider !== 'tiktok' && OEMBED_PROVIDERS[provider]) {
    try {
      const oembedUrl = `${OEMBED_PROVIDERS[provider]}${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Only use oEmbed if it returns a thumbnail
        if (data.thumbnail_url || data.image) {
          return {
            url: formattedUrl,
            title: data.title || getSiteName(formattedUrl),
            description: data.author_name ? `By ${data.author_name}` : undefined,
            image: data.thumbnail_url || data.image,
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

  // Final fallback with basic information
  try {
    const urlObj = new URL(formattedUrl);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // Try to extract username from TikTok URLs
    let author: string | undefined;
    if (hostname.includes('tiktok.com')) {
      const usernameMatch = pathname.match(/^\/(@[^/]+)/);
      if (usernameMatch) {
        author = usernameMatch[1];
      }
    }
    
    return {
      url: formattedUrl,
      title: getSiteName(formattedUrl),
      description: author ? `TikTok profile ${author}` : 'Link preview not available',
      favicon: getFaviconUrl(formattedUrl),
      siteName: getSiteName(formattedUrl),
      author: author,
      type: 'link',
    };
  } catch {
    // Ultimate fallback if URL parsing fails
    return {
      url: formattedUrl,
      title: 'Website',
      description: 'Preview not available for this link',
      type: 'link',
    };
  }
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
    console.error('Metadata fetch error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    
    // Provide more helpful error messages for TikTok
    if (finalUrl.includes('tiktok.com')) {
      return {
        error: `TikTok preview might be blocked. Try again or use a different URL. Details: ${errorMessage}`,
      };
    }
    
    return {
      error: `Failed to fetch link preview. ${errorMessage}`,
    };
  }
>>>>>>> 53c3e7619c244dad8573f030c854a84271f44793
}
