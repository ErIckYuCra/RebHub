import { ChatWindow } from '@/components/chat/ChatWindow'

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Asistente IA</h1>
        <p className="text-sm text-muted-foreground">
          Consulta la base de conocimiento de ReadHub mediante lenguaje natural
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ChatWindow />
      </div>
    </div>
  )
}
