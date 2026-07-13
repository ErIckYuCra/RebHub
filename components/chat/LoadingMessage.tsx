'use client'

export function LoadingMessage() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        AI
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-current animate-bounce" />
      </div>
    </div>
  )
}
