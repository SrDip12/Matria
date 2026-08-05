import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matria",
  description: "Acompañamiento longitudinal del puerperio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#5c0a18" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
