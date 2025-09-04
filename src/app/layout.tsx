import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/shared/header';
// import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: 'CertifyYT - Get Certified on YouTube Content',
  description: 'Generate certificates after passing an MCQ-based test from any YouTube video or playlist.',
};
// ✅ Use a separate export for viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased", )}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 flex items-stretch sm:items-center justify-center relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-screen">
              {/* Enhanced Background Elements */}
              <div className="absolute inset-0">
                {/* Main gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20" />
                
                {/* Static orbs - removed heavy animations */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-2xl" />
              </div>

              {/* Page Content */}
              <div className="relative z-10 w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12">
                <div className="glass-effect rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 py-0 px-4 sm:px-6 md:px-8 transition-all duration-700 hover:shadow-purple-500/10">
                  {children}
                </div>
              </div>
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
