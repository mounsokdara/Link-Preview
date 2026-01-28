import Image from 'next/image';
import { getMetadata } from '@/app/actions';

export default async function FetchPage({ params }: { params: { url: string[] } }) {
  let url: string;
  try {
      let urlString = params.url.map(decodeURIComponent).join('/');
      if (!urlString.match(/^https?:\/\//)) {
          urlString = `https://${urlString}`;
      }
      // Validate URL constructor
      new URL(urlString);
      url = urlString;
  } catch(e) {
      return <div>Invalid URL format provided.</div>
  }

  try {
    const data = await getMetadata(url);

    if (data.thumbnailUrl) {
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: 'black' }}>
          <Image
            src={data.thumbnailUrl}
            alt={data.title || "Thumbnail"}
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      );
    } else {
      return <div>No thumbnail found for {url}</div>;
    }
  } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return <div>Error fetching metadata for {url}: {message}</div>;
  }
}
