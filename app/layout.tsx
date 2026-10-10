import "./globals.css";
import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import { LangProvider } from "@/lib/i18n";
import { Footer, Header } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "GRANDCARE — O'zbekiston bo'ylab yordam xaritasi",
  description: "Yolg'iz qariyalar, boshpanasizlar va kam ta'minlangan oilalarga birga yordam beramiz. Xarita, volontyorlar va jonli yangilanishlar.",
};
const THEME_INIT = `try{if(localStorage.getItem("mehr-dark")==="1")document.documentElement.dataset.theme="dark"}catch(e){}`;

export const viewport: Viewport = { themeColor: "#fafaf7", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LangProvider>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
        </LangProvider>
      </body>
    </html>
  );
}
