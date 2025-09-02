import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CTV Rollup - CTV Delivery Logs Analytics',
  description: 'Ingest, normalize, and analyze CTV delivery logs with deduplication and rollup reporting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">CTV Rollup</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                  <a href="/campaigns" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Campaigns</a>
                  <a href="/content-networks" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Content Networks</a>
                  <a href="/normalize" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Normalize</a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
