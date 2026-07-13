import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { supabase } from '../supabase.js'

export function registerArticleResources(server: McpServer) {
  // All articles listing
  server.resource('readhub://articles', 'readhub://articles', { mimeType: 'application/json' }, async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, title, summary, created_at, author_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    return { contents: [{ uri: 'readhub://articles', mimeType: 'application/json', text: JSON.stringify(data ?? [], null, 2) }] }
  })

  // Authors (profiles with writer/admin role)
  server.resource('readhub://authors', 'readhub://authors', { mimeType: 'application/json' }, async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .in('role', ['writer', 'admin'])
    return { contents: [{ uri: 'readhub://authors', mimeType: 'application/json', text: JSON.stringify(data ?? [], null, 2) }] }
  })

  // Platform statistics
  server.resource('readhub://stats', 'readhub://stats', { mimeType: 'application/json' }, async () => {
    const [articles, profiles, comments, likes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_public', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
      supabase.from('likes').select('id', { count: 'exact', head: true }),
    ])
    const stats = {
      totalArticles: articles.count ?? 0,
      totalUsers: profiles.count ?? 0,
      totalComments: comments.count ?? 0,
      totalLikes: likes.count ?? 0,
    }
    return { contents: [{ uri: 'readhub://stats', mimeType: 'application/json', text: JSON.stringify(stats, null, 2) }] }
  })

  // Platform info
  server.resource('readhub://info', 'readhub://info', { mimeType: 'application/json' }, async () => {
    const info = {
      name: 'ReadHub',
      description: 'Plataforma de artículos técnicos y académicos con búsqueda semántica y asistente IA',
      features: ['Artículos', 'Comentarios', 'Likes', 'Favoritos', 'Búsqueda Semántica', 'Chat RAG'],
      stack: ['Next.js', 'Supabase', 'pgvector', 'OpenAI', 'Claude'],
    }
    return { contents: [{ uri: 'readhub://info', mimeType: 'application/json', text: JSON.stringify(info, null, 2) }] }
  })
}
