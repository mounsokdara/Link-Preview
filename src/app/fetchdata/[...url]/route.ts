import { NextRequest } from 'next/server';
import { fetchLinkPreview, LinkPreviewData } from '@/app/actions';

export const dynamic = 'force-dynamic';

function formatToTxt(data: LinkPreviewData): string {
    let output = '';
    const keys: (keyof LinkPreviewData)[] = ['title', 'description', 'url', 'image', 'favicon', 'siteName', 'author', 'type'];
    
    keys.forEach(key => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        output += `${capitalizedKey}: ${data[key] || 'N/A'}\n`;
    });
    return output;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string[] } }
) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');

  let url: string;
  try {
    let urlString = params.url.map(decodeURIComponent).join('/');
    
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
    
    let responseData: string;

    if (type === 'title') {
      responseData = data.title || 'No Title Found';
    } else if (type === 'description') {
      responseData = data.description || 'No Description Found';
    } else {
      responseData = formatToTxt(data);
    }

    return new Response(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(`Error fetching metadata for ${url}: ${message}`, { status: 500 });
  }
}
