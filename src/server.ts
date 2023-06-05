import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { memoriesRoutes } from './routes/memories.route'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload.route'

import { resolve } from 'node:path'

const app = fastify()

app.register(multipart)
// ou>> app.register(require('@fastify/multipart'))

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: 'fsfji43cujr93jfcrewi0u8',
})

app.register(authRoutes)
// ou>> app.register((app) => memoriesRoutes(app))

app.register(memoriesRoutes)

app.register(uploadRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('😎 HTTP Server running on http://localhost:3333')
  })

// PS
// 'root' indica em qual pasta estarão os arquivos estáticos.
// 'prefix' indica em qual página da URL estará o arquivo.

// 'register()' é um método do Fastify que, nesse caso, retorna o array de usuários (ou array vazio, caso não haja nenhum).

// Alguns HTTP Methods: GET (listar), POST (criar), PUT (atualizar parcialmente), PATCH (atualizar totalmente), DELETE (deletar), HEAD, UPDATE, OPTIONS... Os mais usados sao os 5 primeiros.

// O app.listen serve para o nosso servidor http ouvir as requisições "get, post, delete..." dadas na URL. Ele recebe um objeto de configurações, e a mais importante das configurações é a porta.
// O Listen devolve uma promisse. A promisse significa algo que pode demorar para acontecer.
// O 'then()' roda um código após a promisse ser executada, sem afetar o resto do código.
