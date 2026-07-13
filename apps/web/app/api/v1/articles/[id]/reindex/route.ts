import { embeddingService } from '@/services/embedding.service'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@readhub/types'

function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, summary, document_path')
    .eq('id', id)
    .single()

  if (error || !article) {
    return NextResponse.json({ success: false, error: 'Artículo no encontrado' }, { status: 404 })
  }

  // Force re-index by deleting existing embedding first
  await supabase.from('article_embeddings').delete().eq('article_id', id)

  try {
    await embeddingService.upsert({
      article_id: article.id,
      title: article.title,
      summary: article.summary,
      document_path: article.document_path,
    })
    return NextResponse.json({ success: true, message: 'Embedding re-generado con contenido del PDF' })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
