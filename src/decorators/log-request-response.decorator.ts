import { prisma } from '../lib/prisma'

export function LogDecorator(
  target: any,
  propertKey: string,
  descriptor: PropertyDescriptor,
) {
  const className = target.constructor.name
  const method = descriptor.value
  let output: any

  descriptor.value = async function (...args: any[]) {
    try {
      // const output = await method(args)

      output = await method.apply(this, args)
      await prisma.log.create({
        data: {
          request: String(args),
          response:
            typeof output === 'object'
              ? JSON.stringify(output)
              : String(output),
          source: `${className}/${propertKey}`,
        },
      })

      return output
    } catch (error) {
      console.error(error)
      return output
    }
  }
}
