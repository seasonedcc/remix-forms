import { useEffect } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import Code from '~/ui/code'
import CopyPageButton from '~/ui/copy-page-button'
import Heading from '~/ui/heading'
import SubHeading from '~/ui/sub-heading'

type Props = {
  title: React.ReactNode
  description: React.ReactNode
  children: React.ReactNode
  countLines?: boolean
}

export default function Example({
  title,
  description,
  children,
  countLines = false,
}: Props) {
  const code = String(useLoaderData<{ code: string }>()?.code)
  const actionData = useActionData<{ errors?: Record<string, unknown> }>()
  const data = actionData?.errors ? null : actionData

  const lineCount = countLines
    ? code.split(/\r\n|\r|\n/).filter((line) => line).length
    : 0

  useEffect(() => {
    if (!data) return

    const element = document.querySelector('#action-data')
    element?.scrollIntoView({ behavior: 'smooth' })
  }, [data])

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Heading>{title}</Heading>
            <CopyPageButton />
          </div>
          <SubHeading>{description}</SubHeading>
        </div>
        {countLines && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-base-content p-4">
            <div className="font-bold text-2xl text-base-content sm:text-5xl">
              {lineCount}
            </div>
            <div className="text-base-content/60">lines of code</div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6 xl:flex-row">
        <Code>{code}</Code>
        <div className="self-start rounded-2xl border border-white/10 bg-white/5 p-6 xl:flex-1">
          {children}
        </div>
      </div>
      {data ? (
        <div
          id="action-data"
          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <h4>
            This data was returned by our <em>action</em>. We got it through the{' '}
            <em>actionData</em> prop passed to our route component.
          </h4>
          <Code>{JSON.stringify(data, null, 2)}</Code>
        </div>
      ) : null}
    </>
  )
}
