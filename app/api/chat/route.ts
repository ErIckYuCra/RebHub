import { NextRequest, NextResponse } from 'next/server'
import { chatService } from '@/services/chat.service'
import type { ChatRequest } from '@/types/chat'

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    if (!body.query?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'La consulta es obligatoria' } },
        { status: 400 }
      )
    }

    const result = await chatService.query(body.query)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    )
  }
}
