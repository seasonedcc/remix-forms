import type { z } from 'zod/v4'

function getZodDef(schema: z.ZodTypeAny) {
  // biome-ignore lint/suspicious/noExplicitAny: accessing zod internals
  const anySchema: any = schema
  return anySchema._zod?.def ?? anySchema._def
}

export { getZodDef }
