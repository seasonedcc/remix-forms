import type {
  UnknownKeysParam,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
} from 'zod/v4'

declare module 'zod/v4' {
  export type SomeZodObject = ZodObject<
    ZodRawShape,
    UnknownKeysParam,
    ZodTypeAny
  >
}
