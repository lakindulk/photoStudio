import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Malka Studio - Premier Photography Marketplace",
  description: "Connect with elite photographers, videographers, and event specialists in Sri Lanka.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <style>{`html { font-family: ${GeistSans.style.fontFamily}; }`}</style>
      </head>
      <body
        className={`${GeistSans.variable} ${playfair.variable} selection:bg-primary/20 selection:text-primary font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
