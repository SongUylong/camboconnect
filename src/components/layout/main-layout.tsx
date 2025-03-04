import { Header } from "./header";
import { Footer } from "./footer";
import { UnconfirmedApplicationsCheck } from "../opportunities/unconfirmed-applications-check";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <UnconfirmedApplicationsCheck />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}