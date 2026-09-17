import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SimulationProvider } from '../context/SimulationContext';
import { Navbar } from '../components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BRTS-Pulse | Ahmedabad Janmarg Transit Operations',
  description: 'Transit operations system for Ahmedabad Janmarg BRTS with dynamic load balancing, route planning, driver tools, and commuter information.',
  keywords: ['BRTS', 'Transit Operations', 'Ahmedabad Janmarg', 'Route Planning', 'Fleet Management'],
  authors: [{ name: 'Antigravity Engineering Team' }],
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen text-slate-900 font-sans antialiased selection:bg-cyan-200 selection:text-slate-900">
        <SimulationProvider>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </SimulationProvider>
      </body>
    </html>
  );
}
