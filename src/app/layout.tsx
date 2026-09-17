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
  title: 'BRTS-Pulse | AI Dynamic Route Optimization & Autonomous Transit System',
  description: 'Smart India Hackathon Mission-Control Cyber-Transit System for Ahmedabad Janmarg BRTS. Dynamic load balancing, DPR algorithm, driver HUD, & commuter trip planner.',
  keywords: ['BRTS', 'Transit Optimization', 'Ahmedabad Janmarg', 'AI Dispatch', 'Smart Transit', 'SIH 2026', 'Fleet Management'],
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
      <body className="min-h-screen bg-[#0A0D14] text-gray-100 font-sans antialiased selection:bg-[#00F2FE] selection:text-black">
        <SimulationProvider>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </SimulationProvider>
      </body>
    </html>
  );
}
