<<<<<<< HEAD
import { LinkPreviewForm } from "@/components/link-preview-form";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center p-4 pt-16 sm:pt-24">
      <div className="flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
        <Sparkles className="h-4 w-4 text-accent" />
        <span>Powered by AI</span>
      </div>
      <h1 className="mt-4 font-headline text-4xl font-bold tracking-tight text-center sm:text-5xl lg:text-6xl">
        LinkLook
      </h1>
      <p className="mt-4 max-w-xl text-center text-lg text-muted-foreground">
        Instantly generate beautiful, AI-enhanced link previews. Just paste a URL below to get started.
      </p>
      <div className="mt-8 w-full max-w-2xl">
        <LinkPreviewForm />
      </div>
    </main>
=======
import { MetaGrabber } from "@/components/meta-grabber";
import { fetchMetadata, ActionState } from "@/app/actions";
import { Sparkles } from "lucide-react";

export default async function Home({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const fetchParam = searchParams?.fetch;
  const initialUrl = Array.isArray(fetchParam) ? fetchParam[0] : fetchParam;
  
  let serverState: ActionState | undefined = undefined;

  if (initialUrl) {
    const formData = new FormData();
    formData.append('url', initialUrl);
    serverState = await fetchMetadata({ data: undefined, error: undefined }, formData);
  }

  const platformUrls: Record<string, string> = {
    'YouTube': 'https://www.youtube.com',
    'TikTok': 'https://www.tiktok.com',
    'Twitter/X': 'https://www.twitter.com',
    'Vimeo': 'https://vimeo.com',
    'Spotify': 'https://open.spotify.com',
    'SoundCloud': 'https://soundcloud.com',
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-8">
      <header className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-sm text-secondary-foreground/80 border border-secondary">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Instant Link Previews</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mt-4 bg-gradient-to-br from-primary via-primary to-blue-400 bg-clip-text text-transparent">
            Link Preview
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Extract rich metadata from your favorite platforms instantly
        </p>
      </header>
      <main className="w-full max-w-4xl px-4">
        <MetaGrabber serverState={serverState} platformUrls={platformUrls} />
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>A sleek web utility built with Next.js.</p>
      </footer>
    </div>
>>>>>>> 53c3e7619c244dad8573f030c854a84271f44793
  );
}
