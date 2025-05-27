import { type ComposableWithSchema, InputError } from 'composable-functions'
import { describe, expect, it, vi } from 'vitest'
import * as z from 'zod/v4'
import {
  type FormValues,
  type MutationResult,
  formAction,
  performMutation,
} from './mutations'

function makeRequest(body: URLSearchParams) {
  return new Request('https://example.com', { method: 'POST', body })
}

describe('performMutation', () => {
  it('executes the mutation with parsed values and returns transformed result', async () => {
    const schema = z.object({ name: z.string(), agree: z.boolean() })
    const request = makeRequest(
      new URLSearchParams({ name: 'John', agree: 'on' })
    )

    const mutation = Object.assign(
      vi.fn(async (values: { name: string; agree: boolean }) => ({
        success: true,
        data: values.name.toUpperCase(),
      })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>
    const transformValues = vi.fn(
      (values: FormValues<z.infer<typeof schema>>) => values
    )
    const transformResult = vi.fn(
      (r: MutationResult<typeof schema, string>) => r
    )

    const result = (await performMutation({
      request,
      schema,
      mutation,
      transformValues,
      transformResult,
    })) as MutationResult<typeof schema, string>

    expect(mutation).toHaveBeenCalledWith(
      { name: 'John', agree: true },
      undefined
    )
    expect(transformValues).toHaveBeenCalled()
    expect(transformResult).toHaveBeenCalledWith({
      success: true,
      data: 'JOHN',
    })
    expect(result).toEqual({ success: true, data: 'JOHN' })
  })

  it('returns values and structured errors on failure', async () => {
    const schema = z.object({ name: z.string(), agree: z.boolean() })
    const request = makeRequest(new URLSearchParams({ name: '', agree: '' }))

    const errors = [
      new InputError('Required', ['name']),
      new InputError('Too short', ['name']),
      new InputError('Required', ['agree']),
      new Error('nope'),
    ]
    const mutation = Object.assign(
      vi.fn(async () => ({ success: false, errors })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<unknown>

    const result = (await performMutation({
      request,
      schema,
      mutation,
    })) as MutationResult<typeof schema, unknown>

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.errors as Record<string, string[]>
      expect(errors.name).toEqual(['Required', 'Too short'])
      expect(errors.agree).toEqual(['Required'])
      expect(errors._global).toEqual(['nope'])
      expect(result.values).toEqual({ name: '', agree: false })
    }
  })

  it('awaits transformResult when provided', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: 'Jane' }))
    const mutation = Object.assign(
      vi.fn(async () => ({ success: true, data: 'ok' })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>
    const transformResult = vi.fn(
      async (
        r: MutationResult<typeof schema, string>
      ): Promise<MutationResult<typeof schema, string>> => ({
        success: true,
        data: `${(r as { success: true; data: string }).data}!`,
      })
    )

    const result = await performMutation({
      request,
      schema,
      mutation,
      transformResult,
    })

    expect(transformResult).toHaveBeenCalled()
    expect(result).toEqual({ success: true, data: 'ok!' })
  })

  it('forwards transformed values and context to the mutation', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: 'Jane' }))
    const context = { userId: 1 }
    const mutation = Object.assign(
      vi.fn(async () => ({ success: true as const, data: 'done' })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>
    const transformValues = vi.fn(() => ({ name: 'JANE' }))

    await performMutation({
      request,
      schema,
      mutation,
      context,
      transformValues,
    })

    expect(transformValues).toHaveBeenCalled()
    expect(mutation).toHaveBeenCalledWith({ name: 'JANE' }, context)
  })

  it('returns nested errors structured by path', async () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
      }),
    })
    const request = makeRequest(
      new URLSearchParams({ 'user[name]': '', 'user[age]': '42' })
    )
    const errors = [new InputError('Required', ['user', 'name'])]
    const mutation = Object.assign(
      vi.fn(async () => ({ success: false as const, errors })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<unknown>

    const result = (await performMutation({
      request,
      schema,
      mutation,
    })) as MutationResult<typeof schema, unknown>

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.errors as { user?: { name?: string[] } }
      expect(errors.user?.name).toEqual(['Required'])
      const values = result.values as {
        user?: { name?: string; age?: string }
      }
      expect(values.user).toEqual({ name: '', age: '42' })
    }
  })

  it('handles only global errors gracefully', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: '' }))
    const errors = [new Error('Global error')]
    const mutation = Object.assign(
      vi.fn(async () => ({ success: false as const, errors })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<unknown>

    const result = (await performMutation({
      request,
      schema,
      mutation,
    })) as MutationResult<typeof schema, unknown>

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toEqual({ _global: ['Global error'] })
    }
  })

  it('calls transformResult when the mutation fails', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: '' }))
    const errors = [new InputError('Required', ['name'])]
    const mutation = Object.assign(
      vi.fn(async () => ({ success: false as const, errors })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<unknown>
    const transformResult = vi.fn(
      async (
        r: MutationResult<typeof schema, unknown>
      ): Promise<MutationResult<typeof schema, unknown>> => r
    )

    await performMutation({
      request,
      schema,
      mutation,
      transformResult,
    })

    expect(transformResult).toHaveBeenCalled()
  })
})

describe('formAction', () => {
  it('redirects when successPath is provided', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: 'Jane' }))
    const mutation = Object.assign(
      vi.fn(async () => ({ success: true, data: 'ok' })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>

    let response: Response | undefined
    try {
      await formAction({ request, schema, mutation, successPath: '/done' })
    } catch (e) {
      response = e as Response
    }

    expect(response).toBeInstanceOf(Response)
    expect(response?.headers.get('Location')).toBe('/done')
    expect(response?.status).toBe(302)
  })

  it('wraps the mutation result in DataWithResponseInit', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: 'Jane' }))
    const mutation = Object.assign(
      vi.fn(async () => ({ success: true, data: 'ok' })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>

    const result = await formAction({ request, schema, mutation })

    expect(result).toEqual({
      type: 'DataWithResponseInit',
      data: { success: true, data: 'ok' },
      init: null,
    })
  })

  it('uses status 422 for failure results', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: '' }))
    const mutation = Object.assign(
      vi.fn(async () => ({
        success: false,
        errors: [new InputError('Required', ['name'])],
      })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<unknown>

    const result = await formAction({ request, schema, mutation })

    expect(result.init?.status).toBe(422)
    const data = result.data as unknown as { success: boolean }
    expect(data.success).toBe(false)
  })

  it('accepts successPath as a function', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: 'Jane' }))
    const mutation = Object.assign(
      vi.fn(async () => ({ success: true, data: 'ok' })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>

    let response: Response | undefined
    try {
      await formAction({
        request,
        schema,
        mutation,
        successPath: async (data) => `/hello-${data}`,
      })
    } catch (e) {
      response = e as Response
    }

    expect(response?.headers.get('Location')).toBe('/hello-ok')
  })

  it('passes transformResult through formAction', async () => {
    const schema = z.object({ name: z.string() })
    const request = makeRequest(new URLSearchParams({ name: 'Jane' }))
    const mutation = Object.assign(
      vi.fn(async () => ({ success: true as const, data: 'ok' })),
      { kind: 'composable' }
    ) as unknown as ComposableWithSchema<string>
    const transformResult = vi.fn(
      (r: MutationResult<typeof schema, string>) => r
    )

    await formAction({
      request,
      schema,
      mutation,
      transformResult,
    })

    expect(transformResult).toHaveBeenCalled()
  })
})
