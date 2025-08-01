
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import ExitIntentPopup from "@/components/ui/exit-intent-popup";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Designer",
  description: "Arte moderna e vibrante para o seu espaço.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
            <ExitIntentPopup />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
