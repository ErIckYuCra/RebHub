import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, phone, birth_date } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email y contraseña son obligatorios' } }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return NextResponse.json({ success: false, error: { code: 'AUTH_ERROR', message: error.message } }, { status: 400 })
    if (data.user && (phone || birth_date)) {
      await supabase.from('profiles').update({ phone, birth_date }).eq('id', data.user.id)
    }
    return NextResponse.json({ success: true, message: 'Usuario registrado correctamente.' }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } }, { status: 500 })
  }
}
