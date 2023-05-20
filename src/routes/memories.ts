import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    // Nessas linhas acima, o 'request.params' é passado para dentro do 'paramsSchema' para fazer a validação do 'id' (se é string, se é uuid).

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      // A variável boolean não vai necessariamente chegar como 'true' ou 'false' para o 'isPublic'. Ela pode vir como: 0, null, undefined (para false) ou 1, uma string (para true).
      // O coerce é usado para pegar essa resposta e convertê-la para 'true' ou 'false', para o código entender.
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: 'e0dbf263-7dcb-4068-9bc6-3a11dc8e7455',
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}

// http POST http://localhost:3333/memories content="teste 1" coverUrl=https://github.com/laurabteixeira.png isPublic=1 --json
// http PUT http://localhost:3333/memories/06c87a46-eecb-48df-9ebe-2cfad8e547e0 content="teste 2" coverUrl=https://github.com/laurabteixeira.png isPublic=1 --json
// http GET localhost:3333/memories/06c87a46-eecb-48df-9ebe-2cfad8e547e0
