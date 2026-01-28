
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
  iconUrl?: string;
  url: string;
}

export interface ActionState {
  data?: MetadataResult;
  error?: string;
}

export async function getMetadata(url: string): Promise<MetadataResult> {
    const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i;
    if (imageRegex.test(url)) {
      try {
        const urlObject = new URL(url);
        const filename = urlObject.pathname.split('/').pop() || 'Image';
        return {
          title: filename,
          description: `Direct image from ${urlObject.hostname}`,
          thumbnailUrl: url,
          url: url,
        };
      } catch (e) {
        // Fallback for invalid URL, though zod should have caught it.
      }
    }

    if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const oembedResponse = await fetch(oembedUrl);
            if (oembedResponse.ok) {
                const oembedData = await oembedResponse.json();
                return {
                    title: oembedData.title,
                    description: `By ${oembedData.author_name}`,
                    thumbnailUrl: oembedData.thumbnail_url,
                    url,
                };
            }
        } catch (e) {
            console.warn("YouTube oEmbed fetch failed, falling back to scraping.", e);
        }
    }
    
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

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
        try {
            const urlObject = new URL(url);
            const filename = urlObject.pathname.split('/').pop() || 'Image';
            return {
              title: filename,
              description: `Direct image from ${urlObject.hostname}`,
              thumbnailUrl: url,
              url: url,
            };
        } catch (e) {
            // Fallback for invalid URL.
        }
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    if (url.includes('tiktok.com')) {
        if (url.includes('/video/')) {
            try {
                const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
                const oembedResponse = await fetch(oembedUrl);
                if (oembedResponse.ok) {
                    const oembedData = await oembedResponse.json();
                    return {
                        title: oembedData.title || '',
                        description: oembedData.author_name ? `By ${oembedData.author_name}` : '',
                        thumbnailUrl: oembedData.thumbnail_url,
                        url,
                    };
                }
            } catch (e) {
                console.warn("TikTok oEmbed fetch failed, falling back.", e);
            }
        } else if (url.match(/tiktok\.com\/@/)) {
            try {
                const sigiState = $('#SIGI_STATE').text();
                if (sigiState) {
                    const sigiJson = JSON.parse(sigiState);
                    const username = url.split('@')[1].split('/')[0].split('?')[0];
                    const userModule = sigiJson.UserModule || sigiJson.userModule;
                    const userData = userModule?.users?.[username];
                    if (userData) {
                        return {
                            title: userData.nickname || username,
                            description: userData.signature || 'TikTok Profile',
                            thumbnailUrl: userData.avatarLarger || userData.avatarMedium || userData.avatarThumb,
                            url,
                        };
                    }
                }
            } catch (e) {
                console.warn("TikTok profile scraping failed, falling back.", e);
            }
        }
    }

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
      
    let thumbnailUrl = 
      $('meta[property="og:image"]').attr('content') || 
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[property="avatar_url"]').attr('content') ||
      $('meta[name="avatar_url"]').attr('content') ||
      $('meta[property="cover_image_url"]').attr('content') ||
      $('meta[name="cover_image_url"]').attr('content');
      
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

    let iconUrl =
        $('link[rel="apple-touch-icon"]').attr('href') ||
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href');

    if (iconUrl) {
        try {
            iconUrl = new URL(iconUrl, url).href;
        } catch {
            iconUrl = undefined;
        }
    }

    return {
      title,
      description,
      thumbnailUrl,
      iconUrl,
      url,
    };
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
    const metadata = await getMetadata(url);
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

    