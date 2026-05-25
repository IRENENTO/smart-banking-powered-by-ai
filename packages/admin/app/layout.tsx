import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sentinel AI - Admin Dashboard',
  description: 'AI-Powered Anti-Theft Security Admin Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0F] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
