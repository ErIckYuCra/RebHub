import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email y contraseña son obligatorios' } }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ success: false, error: { code: 'AUTH_ERROR', message: 'Credenciales incorrectas' } }, { status: 401 })
    return NextResponse.json({ success: true, message: 'Inicio de sesión exitoso.', user: { id: data.user.id, email: data.user.email, role: data.user.role } })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } }, { status: 500 })
  }
}
