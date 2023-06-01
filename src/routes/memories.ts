import { FastifyInstance } from 'fastify'
import { MemoryController } from '../controllers/memories'

const memoryController = new MemoryController()

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async (request) => {
    return await memoryController.listMemories(request)
  })

  app.get('/memories/:id', async (request) => {
    return await memoryController.findUniqueMemory(request)
  })

  app.post('/memories', async (request) => {
    return await memoryController.createMemory(request)
  })

  app.put('/memories/:id', async (request) => {
    return await memoryController.updateMemory(request)
  })

  app.delete('/memories/:id', async (request) => {
    return await memoryController.deleteMemory(request)
  })
}

// http POST http://localhost:3333/memories content="teste 1" coverUrl=https://github.com/laurabteixeira.png isPublic=1 --json
// http PUT http://localhost:3333/memories/06c87a46-eecb-48df-9ebe-2cfad8e547e0 content="teste 2" coverUrl=https://github.com/laurabteixeira.png isPublic=1 --json
// http GET localhost:3333/memories/06c87a46-eecb-48df-9ebe-2cfad8e547e0
