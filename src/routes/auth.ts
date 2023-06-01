import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string(),
      // Garante que dedentro do corpo da requisição venha o código que é uma string.
    })

    const { code } = bodySchema.parse(request.body)

    // Faz chamada para api do Github (envia o código e receber o access token). Primeiro parâmetro: endereço do Github. Segundo parâmetro: corpo da req (no caso, é nulo porque não tem). Terceiro parâmetro são as configurações da requisição.

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          // Os params são o que eu vou enviar para o github na url. Exemplo: https://github.com/login/oauth/access_token?client_id=843271482347&client_secret=38291hed8d91g1&code=3fds8574jwn3489b@f
        },
        headers: {
          // Headers (cabeçalhos) são metadados da requisição.
          // Accept fala para o github qual será o formado da resposta da requisição.
          Accept: 'application/json',
        },
      },
    )

    const { access_token } = accessTokenResponse.data

    // Esse access_token nos permite buscar informações do github como se estivéssemos logado com o usuário da pessoa que fez login na nossa aplicação.

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
      // Define que o user retornado precisa ter os campos 'id', 'login', 'name' e 'avatarUrl' e a tipagem própria de cada uma.
    })

    const userInfo = userSchema.parse(userResponse.data)
    // Verifica se o user retornado tem as tipagens corretas definidas no userSchema e guarda no userInfo.

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
      // Procura o usuário dentro do banco de dados pelo githubId.
    })

    if (!user) {
      // Se não encontrar um usuário com aquele githubId dentro do banco de dados, cria um.
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
      // Este token é o jwt, e serve para o usuário logar. Para pegar ele, baixo o "npm i @fastify/jwt (poderia ser o express)", importo ele no server.ts, registro ele e atribuo um 'secret'.
      // O sign() recebe 2 objetos.
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
        // No primeiro objeto, colocamos informações do usuário que usaremos no frontend. Não se coloca informações sensíveis aqui.
      },
      {
        sub: user.id,
        // 'sub' = 'subject', de qual usuário este token pertence. Precisa ser uma informação que seja única (como id).
        expiresIn: '30 days',
        // O expiresIn serve para definirmos por quantos dias o usuário ficará logado sem precisar relogar de novo.
      },
    )

    return {
      token,
    }
  })
}

// http POST localhost:3333/register code= --json
