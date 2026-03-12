import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ScrivixProvider } from "@/components/providers/scrivix-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrivix",
  description: "The intelligent workspace for serious writing.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ScrivixProvider>{children}</ScrivixProvider>
      </body>
    </html>
  );
}
