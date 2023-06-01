import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { LogDecorator } from '../decorators/log.decorator'
import { LogExecutionTime } from '../decorators/log-execution-time.decorator'

export class MemoryController {
  @LogDecorator
  @LogExecutionTime
  async createMemory(request: FastifyRequest) {
    try {
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
          userId: '2b7a6fcb-14fb-4223-94b9-db27e6e50449',
        },
      })
      return memory
    } catch (error) {
      return error
    }
  }

  @LogDecorator
  @LogExecutionTime
  async updateMemory(request: FastifyRequest) {
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
  }

  @LogDecorator
  @LogExecutionTime
  async listMemories(request: FastifyRequest) {
    // jwtVerify() verifica que, na requisição que o frontend está fazendo para esta rota, está vindo o token de autenticação. Ou seja, o usuário só pode acessar isso se estiver autenticado.
    await request.jwtVerify()
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
  }

  @LogDecorator
  @LogExecutionTime
  async findUniqueMemory(request: FastifyRequest) {
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
  }

  @LogDecorator
  @LogExecutionTime
  async deleteMemory(request: FastifyRequest) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    await prisma.memory.delete({
      where: {
        id,
      },
    })

    return { success: true }
  }
}
