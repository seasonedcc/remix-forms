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
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex flex-1 flex-col space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Heading>{title}</Heading>
            <CopyPageButton />
          </div>
          <SubHeading>{description}</SubHeading>
        </div>
        {countLines && (
          <div className="flex flex-col items-center justify-center space-y-2 rounded-md border-2 border-white p-4">
            <div className="font-bold text-2xl text-white sm:text-5xl">
              {lineCount}
            </div>
            <div className="text-gray-300">lines of code</div>
          </div>
        )}
      </div>
      <div className="flex flex-col space-x-0 space-y-6 xl:flex-row xl:space-x-6 xl:space-y-0">
        <Code>{code}</Code>
        <div className="xl:flex-1">{children}</div>
      </div>
      {data ? (
        <div id="action-data" className="flex flex-col space-y-4">
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
