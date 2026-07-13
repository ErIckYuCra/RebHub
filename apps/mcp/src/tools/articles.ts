import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { supabase } from '../supabase.js'
import { generateEmbedding } from '@readhub/ai'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, buildUserPrompt } from '@readhub/ai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export function registerArticleTools(server: McpServer) {
  // List all public articles
  server.tool('listar_articulos', 'Lista todos los artículos públicos de ReadHub', {}, async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, summary, created_at, author_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  })

  // Get article by ID
  server.tool(
    'obtener_articulo',
    'Obtiene un artículo de ReadHub por su ID',
    { id: z.string().uuid().describe('UUID del artículo') },
    async ({ id }) => {
      const { data, error } = await supabase
        .from('articles')
        .select('*, profiles:author_id(id, email, role)')
        .eq('id', id)
        .single()
      if (error) throw new Error(error.message)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }
  )

  // Search articles by keyword
  server.tool(
    'buscar_articulos',
    'Busca artículos por palabra clave en título o resumen',
    { query: z.string().describe('Término de búsqueda') },
    async ({ query }) => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, summary, created_at')
        .eq('is_public', true)
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }
  )

  // Semantic search
  server.tool(
    'buscar_por_embedding',
    'Busca artículos mediante búsqueda semántica usando similitud vectorial',
    {
      query: z.string().describe('Consulta en lenguaje natural'),
      top_k: z.number().int().min(1).max(10).default(5).optional().describe('Máximo de resultados'),
      threshold: z.number().min(0).max(1).default(0.45).optional().describe('Umbral mínimo de similitud'),
    },
    async ({ query, top_k = 5, threshold = 0.45 }) => {
      const embedding = await generateEmbedding(query)
      const { data, error } = await supabase.rpc('match_articles', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: threshold,
        match_count: top_k,
      })
      if (error) throw new Error(error.message)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }
  )

  // Full RAG query
  server.tool(
    'consultar_rag',
    'Responde una pregunta usando el pipeline RAG de ReadHub con Claude',
    { query: z.string().describe('Pregunta en lenguaje natural') },
    async ({ query }) => {
      const embedding = await generateEmbedding(query)
      const { data: results, error } = await supabase.rpc('match_articles', {
        query_embedding: JSON.stringify(embedding),
        match_threshold: 0.45,
        match_count: 5,
      })
      if (error) throw new Error(error.message)

      const docs = (results ?? []) as Array<{ title: string; summary: string | null; article_id: string; similarity: number }>
      const context = docs.length > 0
        ? docs.map((d, i) => `[Doc ${i + 1}]\nTítulo: ${d.title}\nContenido: ${d.summary ?? ''}\nID: ${d.article_id}`).join('\n\n---\n\n')
        : 'No se encontraron artículos relevantes.'

      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: buildUserPrompt(query, context) }],
      })

      const answer = msg.content.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join('')
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ answer, sources: docs.map(d => ({ id: d.article_id, title: d.title, similarity: d.similarity })) }, null, 2),
        }],
      }
    }
  )
}
