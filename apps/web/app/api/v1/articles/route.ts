import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { embeddingService } from '@/services/embedding.service'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`*, profiles:author_id ( id, email, role ), likes ( count ), views ( count )`)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } }, { status: 401 })

    const body = await request.json()
    const { title, summary, document_path, image_path } = body
    if (!title) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'El título es obligatorio' } }, { status: 400 })

    const { data, error } = await supabase
      .from('articles')
      .insert({ title, summary, document_path, image_path, author_id: user.id, is_public: true })
      .select().single()
    if (error) return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })

    await embeddingService.upsert({ article_id: data.id, title: data.title, summary: data.summary, document_path: data.document_path })

    return NextResponse.json({ success: true, message: 'Artículo publicado correctamente.', data }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error interno' } }, { status: 500 })
  }
}
