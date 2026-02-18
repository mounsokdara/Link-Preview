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
  );
}
