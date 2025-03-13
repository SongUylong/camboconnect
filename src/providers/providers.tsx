'use client';

import { SessionProvider } from "next-auth/react";
import { NavigationProvider } from "@/providers/navigation-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ApplicationProvider } from "@/contexts/application-context";
import { UnconfirmedApplicationsCheck } from "@/components/global/UnconfirmedApplicationsCheck";
import { ApplicationStateInitializer } from "@/components/global/ApplicationStateInitializer";
import QueryProvider from "@/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavigationProvider>
        <AuthProvider>
          <QueryProvider>
            <ApplicationProvider>
              <ApplicationStateInitializer />
              {children}
            </ApplicationProvider>
          </QueryProvider>
        </AuthProvider>
      </NavigationProvider>
    </SessionProvider>
  );
} 