
import { NextRequest } from 'next/server';
import { getMetadata } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string[] } }
) {
  let url: string;
  try {
    let urlString = params.url.map(decodeURIComponent).join('/');
    if (!urlString.match(/^https?:\/\//)) {
        urlString = `https://${urlString}`;
    }
    new URL(urlString);
    url = urlString;
  } catch (e) {
    return new Response('Invalid URL format provided.', { status: 400 });
  }

  try {
    const data = await getMetadata(url);

    if (data.thumbnailUrl) {
      const imageResponse = await fetch(data.thumbnailUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });

      if (!imageResponse.ok) {
        return new Response(`Failed to fetch thumbnail image from ${data.thumbnailUrl}`, { status: imageResponse.status });
      }

      const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
      const imageBlob = await imageResponse.blob();
      
      return new Response(imageBlob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } else {
      return new Response(`No thumbnail found for ${url}`, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(`Error fetching metadata for ${url}: ${message}`, { status: 500 });
  }
}
