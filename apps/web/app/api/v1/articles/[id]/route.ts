import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`*, profiles:author_id ( id, email, role ), likes ( count ), views ( count )`)
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Artículo no encontrado' } }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase.from('articles').update(body).eq('id', id).eq('author_id', user.id).select().single()
  if (error) return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } }, { status: 401 })
  const { error } = await supabase.from('articles').delete().eq('id', id).eq('author_id', user.id)
  if (error) return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Artículo eliminado.' })
}
