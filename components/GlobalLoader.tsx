'use client'

import { useLoading } from '@/lib/context/LoadingContext'

export default function GlobalLoader() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  )
}