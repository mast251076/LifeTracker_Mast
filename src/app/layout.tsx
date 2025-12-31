import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Life Tracker",
  description: "Secure, local-first personal finance tracker",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
