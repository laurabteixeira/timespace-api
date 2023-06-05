import { FastifyInstance } from 'fastify'
import { UploadController } from '../controllers/upload.controller'

const uploadController = new UploadController()

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    return await uploadController.uploadFile(request, reply)
  })
}
