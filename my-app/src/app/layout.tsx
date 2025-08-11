import type { Metadata } from "next";
import "./globals.css";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "Map Plotting App",
  description: "A web app for plotting coordinates on a map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}