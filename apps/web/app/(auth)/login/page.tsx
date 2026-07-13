'use client'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { LoginForm } from '@/components/forms/LoginForm'
import { RegisterForm } from '@/components/forms/RegisterForm'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card shadow-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-primary font-bold text-2xl">
            <BookOpen className="size-7" />
            ReadHub
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 transition-colors ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 transition-colors ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Registrarse
          </button>
        </div>

        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  )
}
