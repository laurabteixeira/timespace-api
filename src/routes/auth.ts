import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    const { code } = bodySchema.parse(request.body)

    const accessTokenResponse = await axios.post(
      // Faz chamada para api do Github (envia o código e recebe o access token).
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )
    // PS:
    // Os params são o que eu vou enviar para o github na url. Exemplo: https://github.com/login/oauth/access_token?client_id=843271482347&client_secret=38291hed8d91g1&code=3fds8574jwn3489b@f
    // Headers (cabeçalhos) são metadados da requisição.
    // Accept fala para o github qual será o formado da resposta da requisição.

    const { access_token } = accessTokenResponse.data
    // PS:
    // access_token nos permite buscar informações do github como se estivéssemos logado com o usuário da pessoa que fez login na nossa aplicação.

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string().optional(),
      avatar_url: z.string().url().optional(),
      // Campos que vão (ou não, no caso .optional()) ser recebidos da api do Github.
    })

    const userInfo = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name || userInfo.login,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,

        expiresIn: '30 days',
      },
    )
    // PS:
    // Este token é o jwt, e serve para o usuário logar. Para pegar ele, baixo o "npm i @fastify/jwt (poderia ser o express)", importo ele no server.ts, registro ele e atribuo um 'secret'.
    // O sign() recebe 2 objetos.
    // No primeiro objeto, colocamos informações do usuário que usaremos no frontend. Não se coloca informações sensíveis aqui.
    // 'sub' = 'subject', de qual usuário este token pertence. Precisa ser uma informação que seja única (como id).
    // O expiresIn serve para definirmos por quantos dias o usuário ficará logado sem precisar relogar de novo.

    return {
      token,
    }
  })
}

// http POST localhost:3333/register code= --json
