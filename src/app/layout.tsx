<<<<<<< HEAD
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkLook',
  description: 'Generate beautiful link previews instantly.',
=======
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Link Preview',
  description: 'Extract rich metadata from your favorite platforms instantly',
>>>>>>> 53c3e7619c244dad8573f030c854a84271f44793
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
=======
    <html lang="en" className="dark">
>>>>>>> 53c3e7619c244dad8573f030c854a84271f44793
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
<<<<<<< HEAD
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
=======
>>>>>>> 53c3e7619c244dad8573f030c854a84271f44793
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
