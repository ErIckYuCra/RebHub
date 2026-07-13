'use client'
import { useEffect, useRef } from 'react'
import { Bot, Trash2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { LoadingMessage } from './LoadingMessage'

export function ChatWindow() {
  const { messages, loading, error, sendMessage, clearMessages } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Asistente ReadHub</p>
            <p className="text-xs text-muted-foreground">Pregunta sobre los artículos publicados</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Trash2 className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Bot className="size-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">¿En qué puedo ayudarte?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Haz preguntas sobre los artículos publicados en ReadHub
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && <LoadingMessage />}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <ChatInput onSend={sendMessage} disabled={loading} />
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Las respuestas se basan únicamente en artículos publicados en ReadHub
        </p>
      </div>
    </div>
  )
}
