import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventHub - Discover Amazing Events",
  description: "A modern event management platform where organizers create events and attendees discover unforgettable experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
