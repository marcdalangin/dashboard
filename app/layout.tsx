import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Work Dashboard",
  description: "Notion-styled personal dashboard for match operations, Kanban tasks, and rapid comment templating.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
        {children}
      </body>
    </html>
  );
}
