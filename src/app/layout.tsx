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
      <body className="antialiased">{children}</body>
    </html>
  );
}
