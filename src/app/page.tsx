import { MetaGrabber } from "@/components/meta-grabber";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary font-headline">MetaGrab</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Instantly fetch and preview metadata from any URL.
        </p>
      </header>
      <main className="w-full max-w-4xl">
        <MetaGrabber />
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>A sleek web utility built with Next.js and GenAI.</p>
      </footer>
    </div>
  );
}
