import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { LogDecorator } from '../decorators/log-request-response.decorator'
import { LogExecutionTime } from '../decorators/log-execution-time.decorator'

export class MemoryController {
  @LogDecorator
  @LogExecutionTime
  async listMemories(request: FastifyRequest) {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    // PS:
    // O where serve para que apenas as memórias DESTE usuário sejam listadas.
    // Foi declarado no 'auth.ts' que o 'sub' tem a informação 'userId'. E foi declarado no 'auth.d.ts' que o 'user' tem a informação 'sub'.

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
  async findUniqueMemory(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    // Nessas linhas acima, o 'request.params' é passado para dentro do 'paramsSchema' para fazer a validação do 'id' (se é string, se é uuid).

    const memory = await prisma.memory.findFirstOrThrow({
      where: {
        id,
        userId: request.user.sub,
        isPublic: true,
      },
    })

    return memory
  }

  @LogDecorator
  @LogExecutionTime
  async createMemory(request: FastifyRequest) {
    try {
      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false),
      })
      // PS:
      // A variável boolean não vai necessariamente chegar como 'true' ou 'false' para o 'isPublic'. Ela pode vir como: 0, null, undefined (para false) ou 1, uma string (para true).
      // O coerce é usado para pegar essa resposta e convertê-la para 'true' ou 'false', para o código entender.

      const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
      const memory = await prisma.memory.create({
        data: {
          content,
          coverUrl,
          isPublic,
          userId: request.user.sub,
        },
      })
      return memory
    } catch (error) {
      return error
    }
  }

  @LogDecorator
  @LogExecutionTime
  async editMemory(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<{ success: boolean }> {
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

    const memory = await prisma.memory
      .update({
        where: {
          id_userId: {
            id,
            userId: request.user.sub,
          },
        },
        data: {
          content,
          coverUrl,
          isPublic,
        },
      })
      .then(() => ({ success: true }))
      .catch(() => ({ success: false }))

    if (!memory.success) {
      return reply.status(422).send()
    }

    return memory
  }

  @LogDecorator
  @LogExecutionTime
  async deleteMemory(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<{ success: boolean }> {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    // Código Diego NLW:
    // const memory = await prisma.memory.findUniqueOrThrow({
    //   where: {
    //     id, //id do usuário que possui a memória a ser deletada.
    //   },
    // })

    // if (memory.id !== request.user.sub) {
    // compara id do usuário que possui a memória e o id do usuário que fez a requisição de 'delete'
    //   return reply.status(401).send()
    // }

    // await prisma.memory.delete({
    //   where: {
    //     id,
    //   },
    // })

    const deleteResult = await prisma.memory
      .delete({
        where: {
          id_userId: {
            // id_userId quando usados juntos são únicos. (./prisma/schema.prisma, linha 33 '@@unique')
            id,
            userId: request.user.sub,
          },
        },
      })
      .then(() => ({ success: true }))
      .catch(() => ({ success: false }))

    if (!deleteResult.success) {
      return reply.status(422).send()
    }

    return deleteResult
  }
}
