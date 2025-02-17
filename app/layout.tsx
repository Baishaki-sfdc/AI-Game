import { Bubblegum_Sans, Comic_Neue } from "next/font/google"
import type React from "react"
import Script from "next/script"

const comic = Comic_Neue({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-comic",
})

const bubble = Bubblegum_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bubble",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Comic+Neue:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
        <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js" />
      </head>
      <body className={`${comic.variable} ${bubble.variable} font-comic bg-[#FAFAFA]`}>{children}</body>
    </html>
  )
}

