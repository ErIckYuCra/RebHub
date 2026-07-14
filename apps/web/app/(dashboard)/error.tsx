'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-lg font-semibold">Algo salió mal</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">Reintentar</Button>
        <Link href="/home"><Button>Volver al inicio</Button></Link>
      </div>
    </div>
  )
}
