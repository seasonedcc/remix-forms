import * as React from 'react'
import { act } from 'react-test-renderer'
import TestRenderer from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import * as z from 'zod'
import { SchemaForm } from './schema-form'

vi.mock('react-hook-form', () => {
  return {
    FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useForm: vi.fn(() => ({
      register: vi.fn(),
      handleSubmit: (fn: unknown) => fn,
      formState: { errors: {}, isValid: true, dirtyFields: {} },
      setError: vi.fn(),
      setFocus: vi.fn(),
      reset: vi.fn(),
    })),
  }
})

const submitMock = vi.fn()
const fetcher = {
  submit: submitMock,
  state: 'idle',
  Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => <form {...props} />,
}

const useNavigation = vi.fn(() => ({ state: 'idle' }))
const useSubmit = vi.fn(() => submitMock)
vi.mock('react-router', () => ({
  Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => <form {...props} />,
  useActionData: vi.fn(() => undefined),
  useNavigation,
  useSubmit,
}))

describe('SchemaForm events', () => {
  it('forwards flushSync to submit', () => {
    const schema = z.object({ name: z.string() })
    let buttonClick: (() => void) | undefined
    const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
      buttonClick = props.onClick as () => void
      return <button {...props} />
    }

    TestRenderer.create(
      <SchemaForm
        schema={schema}
        fetcher={fetcher as never}
        buttonComponent={Button}
        flushSync
      />
    )

    act(() => {
      buttonClick?.({ preventDefault() {} } as unknown as React.MouseEvent)
    })

    expect(submitMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ flushSync: true })
    )
  })

  it('calls onNavigation when navigation state changes', () => {
    const schema = z.object({ name: z.string() })
    const onNavigationSpy = vi.fn()

    let renderer: TestRenderer.ReactTestRenderer
    act(() => {
      renderer = TestRenderer.create(
        <SchemaForm schema={schema} onNavigation={onNavigationSpy} />
      )
    })

    expect(onNavigationSpy).toHaveBeenCalledTimes(1)

    useNavigation.mockReturnValueOnce({ state: 'loading' })

    act(() => {
      renderer.update(<SchemaForm schema={schema} onNavigation={onNavigationSpy} />)
    })

    expect(onNavigationSpy).toHaveBeenCalledTimes(2)
  })
})
