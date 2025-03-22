import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ApplicationProvider } from "@/contexts/application-context";
import { Toaster } from "sonner";
import { UnconfirmedApplicationsCheck } from "@/components/global/UnconfirmedApplicationsCheck";
import { ApplicationStateInitializer } from "@/components/global/ApplicationStateInitializer";
import { BookmarkStateInitializer } from "@/components/global/BookmarkStateInitializer";
import { QueryProvider } from "@/providers/query-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CamboConnect | Centralized Opportunities Platform",
  description: "Connecting Cambodians with opportunities for growth and development",
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/favicon/site.webmanifest',
      },
      {
        url: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ApplicationProvider>
              <ApplicationStateInitializer />
              <BookmarkStateInitializer />
              {children}
            </ApplicationProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster 
          position="bottom-right" 
          richColors 
          expand={true}
          closeButton={true}
          toastOptions={{
            style: { 
              maxWidth: '500px',
              marginBottom: '1rem'
            },
            duration: 4000
          }}
        />
      </body>
    </html>
  );
}