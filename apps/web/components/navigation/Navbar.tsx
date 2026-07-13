'use client'
import Link from 'next/link'
import { BookOpen, PenSquare, LogOut, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 font-bold text-lg text-primary">
          <BookOpen className="size-5" />
          ReadHub
        </Link>

        <nav className="flex items-center gap-2">
          {user && (
            <>
              <span className="hidden sm:block text-sm text-muted-foreground">
                {user.email?.split('@')[0]}
              </span>
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Bot className="size-4" />
                  <span className="hidden sm:inline">Asistente</span>
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <PenSquare className="size-4" />
                  Publicar
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut} title="Cerrar sesión">
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
