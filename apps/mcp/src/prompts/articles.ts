import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export function registerArticlePrompts(server: McpServer) {
  server.prompt(
    'resumir_articulo',
    'Genera un resumen conciso de un artículo',
    { articulo: z.string().describe('Título o contenido del artículo a resumir') },
    ({ articulo }) => ({
      messages: [{
        role: 'user',
        content: { type: 'text', text: `Por favor, genera un resumen conciso (máximo 3 párrafos) del siguiente artículo de ReadHub:\n\n${articulo}` },
      }],
    })
  )

  server.prompt(
    'explicar_articulo',
    'Explica un artículo de forma clara y accesible',
    {
      articulo: z.string().describe('Contenido del artículo'),
      nivel: z.enum(['basico', 'intermedio', 'avanzado']).default('intermedio').optional().describe('Nivel de complejidad de la explicación'),
    },
    ({ articulo, nivel = 'intermedio' }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Explica el siguiente artículo de ReadHub a un nivel ${nivel}. Usa ejemplos cuando sea útil.\n\n${articulo}`,
        },
      }],
    })
  )

  server.prompt(
    'comparar_articulos',
    'Compara dos artículos identificando similitudes y diferencias',
    {
      articulo1: z.string().describe('Primer artículo'),
      articulo2: z.string().describe('Segundo artículo'),
    },
    ({ articulo1, articulo2 }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Compara los siguientes dos artículos de ReadHub. Identifica similitudes, diferencias, posibles contradicciones y aspectos complementarios.\n\nArtículo 1:\n${articulo1}\n\nArtículo 2:\n${articulo2}`,
        },
      }],
    })
  )

  server.prompt(
    'generar_preguntas',
    'Genera preguntas de comprensión sobre un artículo',
    {
      articulo: z.string().describe('Contenido del artículo'),
      cantidad: z.number().int().min(1).max(10).default(5).optional().describe('Número de preguntas'),
    },
    ({ articulo, cantidad = 5 }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Genera ${cantidad} preguntas de comprensión sobre el siguiente artículo de ReadHub. Incluye respuestas breves para cada una.\n\n${articulo}`,
        },
      }],
    })
  )

  server.prompt(
    'extraer_conceptos',
    'Extrae y explica los conceptos clave de un artículo',
    { articulo: z.string().describe('Contenido del artículo') },
    ({ articulo }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Extrae y explica brevemente los conceptos clave del siguiente artículo de ReadHub. Presenta cada concepto con una definición clara y su relevancia en el contexto del artículo.\n\n${articulo}`,
        },
      }],
    })
  )
}
