import { NextRequest } from 'next/server';
import { fetchLinkPreview, LinkPreviewData } from '@/app/actions';

export const dynamic = 'force-dynamic';

function formatToTxt(data: LinkPreviewData, include?: (keyof LinkPreviewData)[]): string {
    let output = '';
    const allKeys: (keyof LinkPreviewData)[] = ['url', 'title', 'description', 'image', 'favicon', 'siteName', 'author', 'type'];
    
    // If no specific keys are requested, use all of them.
    const keysToInclude = include && include.length > 0 ? include : allKeys;

    keysToInclude.forEach(key => {
        // Ensure the key is a valid property of LinkPreviewData
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            output += `${capitalizedKey}: ${data[key] || 'N/A'}\n`;
        }
    });
    return output;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string[] } }
) {
  const { searchParams } = request.nextUrl;
  const includeParam = searchParams.get('include');
  const typeParam = searchParams.get('type'); // For backwards compatibility

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
    let keysToInclude: (keyof LinkPreviewData)[] = [];

    if (includeParam) {
      keysToInclude = includeParam.split(',') as (keyof LinkPreviewData)[];
    } else if (typeParam) {
      // Legacy support
      if (typeParam === 'title') keysToInclude.push('title');
      if (typeParam === 'description') keysToInclude.push('description');
    }


    if (keysToInclude.length === 1) {
        // If only one field is requested, return its value directly
        const key = keysToInclude[0];
        responseData = (data[key] as string) || `No ${key} found`;
    } else {
        // If multiple or no specific fields are requested, format as TXT
        // If keysToInclude is empty, formatToTxt will use all keys.
        responseData = formatToTxt(data, keysToInclude);
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
