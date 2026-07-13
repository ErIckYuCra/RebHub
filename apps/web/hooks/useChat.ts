'use client'
import { useState, useCallback } from 'react'
import type { ChatMessage, ChatResponse } from '@readhub/types'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (query: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message ?? 'Error desconocido')

      const data: ChatResponse = json.data
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar el asistente')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, loading, error, sendMessage, clearMessages }
}

