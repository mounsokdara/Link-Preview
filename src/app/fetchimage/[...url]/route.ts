
import { NextRequest } from 'next/server';
import { fetchLinkPreview } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string[] } }
) {
  let url: string;
  try {
    let urlString = params.url.map(decodeURIComponent).join('/');
    
    // Fix for incomplete protocols like https:/
    if (urlString.match(/^https?:\/[^/]/)) {
        urlString = urlString.replace(':/', '://');
    }

    if (!urlString.match(/^https?:\/\//)) {
        urlString = `https://${urlString}`;
    }
    new URL(urlString);
    url = urlString;
  } catch (e) {
    return new Response('Invalid URL format provided.', { status: 400 });
  }

  try {
    const data = await fetchLinkPreview(url);

    // Try to fetch the primary image URL first
    if (data.image) {
      try {
        const imageResponse = await fetch(data.image, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });

        if (imageResponse.ok) {
          const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
          return new Response(imageResponse.body, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      } catch (e) {
        console.warn(`Primary image fetch failed for ${data.image}, trying favicon.`, e);
      }
    }

    // If thumbnail fails or doesn't exist, fall back to the favicon URL
    if (data.favicon) {
      try {
        const imageResponse = await fetch(data.favicon, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });

        if (imageResponse.ok) {
          const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
          return new Response(imageResponse.body, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      } catch (e) {
        console.warn(`Favicon fetch failed for ${data.favicon}.`, e);
      }
    }

    // If both fail, return a 404
    return new Response(`No image or favicon found for ${url}`, { status: 404 });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(`Error fetching metadata for ${url}: ${message}`, { status: 500 });
  }
}
