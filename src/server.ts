import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const app = fastify()

app.register(cors, {
  origin: true, // todas as ULRs de frontend poderão acessar o backend.
})

app.register(jwt, {
  secret: 'fsfji43cujr93jfcrewi0u8',
})

// app.register((app) => memoriesRoutes(app))
app.register(authRoutes)
app.register(memoriesRoutes)

// 'register()' é um método do Fastify que, nesse caso, retorna o array de usuários (ou array vazio, caso não haja nenhum).

// Alguns HTTP Methods: GET (listar), POST (criar), PUT (atualizar parcialmente), PATCH (atualizar totalmente), DELETE (deletar), HEAD, UPDATE, OPTIONS... Os mais usados sao os 5 primeiros.

// O app.listen serve para o nosso servidor http ouvir as requisições "get, post, delete..." dadas na URL. Ele recebe um objeto de configurações, e a mais importante das configurações é a porta.
// O Listen devolve uma promisse. A promisse significa algo que pode demorar para acontecer.
// O 'then()' roda um código após a promisse ser executada, sem afetar o resto do código.

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('😎 HTTP Server running on http://localhost:3333')
    // Para inserir emojis: 'windows + .'
  })
