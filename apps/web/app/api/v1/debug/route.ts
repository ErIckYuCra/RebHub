import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@readhub/ai'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@readhub/types'

export async function POST(request: NextRequest) {
  const { query } = await request.json()

  const steps: Record<string, unknown> = {}

  // Paso 1: generar embedding de la consulta
  let queryEmbedding: number[] = []
  try {
    queryEmbedding = await generateEmbedding(query)
    steps.embedding = {
      ok: true,
      dimensions: queryEmbedding.length,
      sample: queryEmbedding.slice(0, 3),
      isNested: Array.isArray(queryEmbedding[0]),
    }
  } catch (err) {
    steps.embedding = { ok: false, error: String(err) }
    return NextResponse.json({ steps })
  }

  // Paso 2: llamar a match_articles con threshold 0 (devuelve todo)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.rpc('match_articles', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0,
    match_count: 5,
  })

  steps.vectorSearch = {
    ok: !error,
    error: error?.message,
    resultsCount: data?.length ?? 0,
    results: data?.map((r: { title: string; similarity: number }) => ({
      title: r.title,
      similarity: r.similarity,
    })),
  }

  return NextResponse.json({ steps })
}
