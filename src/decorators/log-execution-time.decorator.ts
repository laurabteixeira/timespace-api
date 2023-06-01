export function LogExecutionTime(
  target: any,
  propertKey: string,
  descriptor: PropertyDescriptor,
) {
  const method = descriptor.value
  let output: any

  descriptor.value = async function (...args: any[]) {
    try {
      // const output = await method(args)

      const start = Date.now()

      output = await method.apply(this, args)
      const end = Date.now()

      console.log(`[${propertKey}] - Execution time: ${end - start}ms`)

      return output
    } catch (error) {
      console.error(error)
      return output
    }
  }
}
