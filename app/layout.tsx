import type { Metadata } from 'next'
import '../styles/globals.css'

import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'TypeCraft — The Ultimate Typing Platform',
  description: 'Master touch typing with beautiful lessons, real-time races, and a global leaderboard.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
