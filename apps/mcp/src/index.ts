import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerArticleTools } from './tools/articles.js'
import { registerArticleResources } from './resources/articles.js'
import { registerArticlePrompts } from './prompts/articles.js'

const server = new McpServer({
  name: 'readhub',
  version: '1.0.0',
})

registerArticleTools(server)
registerArticleResources(server)
registerArticlePrompts(server)

const transport = new StdioServerTransport()
await server.connect(transport)
