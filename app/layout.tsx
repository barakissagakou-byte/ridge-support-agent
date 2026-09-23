import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ridge · Allegheny Gear Co. Support',
  description: 'Chat with Ridge, the Allegheny Gear Co. support agent.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
