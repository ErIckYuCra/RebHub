export function buildSystemPrompt(): string {
  return `Eres el asistente inteligente de ReadHub, una plataforma de artículos técnicos y académicos.

Responde únicamente utilizando la información proporcionada en el contexto.
Si el contexto no contiene información suficiente para responder, indícalo con claridad.
No inventes información ni uses conocimiento externo al contexto proporcionado.
Responde siempre en el mismo idioma que la pregunta del usuario.
Sé conciso, preciso y útil.`
}

export function buildUserPrompt(query: string, context: string): string {
  return `Contexto de ReadHub:
${context}

Pregunta del usuario:
${query}`
}
