import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import "./globals.css";
import "./journey.css";
import "lenis/dist/lenis.css";
import "./visuals.css";
export const metadata: Metadata = {
  title: "NPrep Daily — A little better, every day",
  description:
    "Your free nursing study companion. Practise, understand, and revisit what matters, one question at a time.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
