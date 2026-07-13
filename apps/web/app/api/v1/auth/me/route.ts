import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return NextResponse.json({ success: true, data: { id: user.id, email: user.email, role: profile?.role ?? 'reader' } })
}
