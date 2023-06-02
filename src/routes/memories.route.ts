import { FastifyInstance } from 'fastify'
import { MemoryController } from '../controllers/memories.controller'

const memoryController = new MemoryController()

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
    // PS:
    // O addHook('preHandler', ...) serve para que, antes de excutar o handler (função) de cada uma das rotas (por isso, "pre"Handler), ele execute a função que passamos no segundo parâmetro.
    // jwtVerify() verifica que, na requisição que o frontend está fazendo para esta rota, está vindo o token de autenticação. Ou seja, o usuário só pode acessar isso se estiver autenticado. Se o token não estiver vindo, ela bloqueia e nao deixa o restante do código prosseguir.
  })

  app.get('/memories', async (request) => {
    return await memoryController.listMemories(request)
  })

  app.get('/memories/:id', async (request, reply) => {
    return await memoryController.findUniqueMemory(request, reply)
  })

  app.post('/memories', async (request) => {
    return await memoryController.createMemory(request)
  })

  app.put('/memories/:id', async (request, reply) => {
    return await memoryController.editMemory(request, reply)
  })

  app.delete('/memories/:id', async (request, reply) => {
    return await memoryController.deleteMemory(request, reply)
  })
}

// HTTPie
// http POST http://localhost:3333/memories content="teste 1" coverUrl=https://github.com/laurabteixeira.png isPublic=1 --json
// http PUT http://localhost:3333/memories/06c87a46-eecb-48df-9ebe-2cfad8e547e0 content="teste 2" coverUrl=https://github.com/laurabteixeira.png isPublic=1 --json
// http GET localhost:3333/memories/06c87a46-eecb-48df-9ebe-2cfad8e547e0
