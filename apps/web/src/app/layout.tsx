import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Draft Maker',
  description: 'Personal drafts manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
