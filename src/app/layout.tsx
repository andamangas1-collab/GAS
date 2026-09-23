import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: {
    default: "GAS™ — Grand Affiliate System",
    template: "%s | GAS™",
  },
  description: "Create value. Earn rewards. Build community. The GAS™ V2V™ Engine.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans">
        <Providers>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
