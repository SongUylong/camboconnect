'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/providers/providers";

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Providers>
          {children}
          <Toaster position="top-center" />
          <ReactQueryDevtools initialIsOpen={false} />
          <SpeedInsights />
        </Providers>
      </QueryClientProvider>
    </SessionProvider>
  );
} 