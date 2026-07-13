import { NextRequest, NextResponse } from 'next/server'
import { vectorSearchService } from '@/services/vector-search.service'

export async function POST(request: NextRequest) {
  try {
    const { query, topK, threshold } = await request.json()
    if (!query?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'La consulta es obligatoria' } },
        { status: 400 }
      )
    }

    const results = await vectorSearchService.search(query, { topK, threshold })
    return NextResponse.json({ success: true, data: results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    )
  }
}
