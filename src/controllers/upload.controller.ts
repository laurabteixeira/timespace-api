import { FastifyReply, FastifyRequest } from 'fastify'

import { LogDecorator } from '../decorators/log-request-response.decorator'
import { LogExecutionTime } from '../decorators/log-execution-time.decorator'

import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export class UploadController {
  @LogDecorator
  @LogExecutionTime
  async uploadFile(request: FastifyRequest, reply: FastifyReply) {
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // 5mb
      },
    })

    if (!upload) {
      return reply.status(400).send()
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype) // Valida se é img ou vídeo.

    if (!isValidFileFormat) {
      return reply.status(400).send()
    }

    const fileId = randomUUID()
    const extension = extname(upload.filename) // Retorna a extensão do arquivo.
    const fileName = fileId.concat(extension)

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', fileName),
    )

    await pump(upload.file, writeStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)

    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return { fileUrl }
  }
}

// PS
// O pipeline permite eu aguardar uma stream (o processo de upload) finalizar. Consigo verificar quando um processo de upload chegou até o final.
// No entanto, no node, a maioria das funções não usam promisses, que é a api mais recomendada para saber quando as coisas acabaram. Por isso, o promisify é usado. Ele transforma algumas funções do node mais antigas que não têm suporte para promises, em promises.
// O 'randomUUID()' gera um id único para cada arquivo, pois as pessoas podem subir arquivos com o mesmo nome no banco de dados.
// Na maioria das vezes, é melhor salvar esses arquivos num serviço específico para upload de arquivos, como um Amazon S3, Google GCS, Cloudflare R2...
// A função 'resolve()' padroniza o caminho do arquivo. Porque, dependendo do sistema operacional, os caminhos de arquivos são escritos de maneiras diferentes.
// O 'request.protocol' é o 'http'. O 'request.hostname' é o 'localhost:3333'.
