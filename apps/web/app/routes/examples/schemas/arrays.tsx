import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from 'remix-forms'
import {z} from 'zod'
import Form from '~/ui/form'
import { metaTags } from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'
import {useActionData} from "@remix-run/react";
import Label from "~/ui/label";

const title = 'Arrays'
const description =
  'In this example, all sorts of array schemas are validated on the client and on the server.'
const defaultArray = ['1', '2', '3']

export const meta: MetaFunction = () => metaTags({ title, description })

//

const code = "import {formAction} from 'remix-forms'";

//

const schema = z.object({
  stringArray: z.string().array().default(defaultArray),
  stringArrayAdd: z.string().nullable(),
  stringArrayRemove: z.number().int().positive().nullable(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
  if (!values.stringArray) {
    values.stringArray = []
  }

  if (values.stringArrayRemove) {
    values.stringArray.splice(values.stringArrayRemove - 1, 1)
  }

  if (values.stringArrayAdd) {
    values.stringArray.push(values.stringArrayAdd)
  }

  return values
})

export const action: ActionFunction = async ({ request }) => {
  return formAction({ request, schema, mutation })}

export default function Component() {
  const data = useActionData();
  const stringArray = data?.stringArray || data?.values?.stringArray || defaultArray || [];
  
  return (
    <Example title={title} description={description}>
      <Form
        id={'myform'}
        schema={schema}
        options={{
          stringArrayRemove: stringArray.map((item:string, index:number) => {
            return {value: index+1, name: item}
          })
        }}
        hiddenFields={['stringArray']}
      >
        {({ Field, Errors, Button }) => (
          <>
            <Label>Array</Label>
            <ul className={'list-disc pl-5'}>
              {stringArray && stringArray.map((item:string, index:number) => (
                <li key={index}>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
            <Field name="stringArray" value={stringArray ? stringArray : []}>
              {({ SmartInput, Errors }) => (
                <>
                  <SmartInput />
                  <Errors />
                </>
              )}
            </Field>
            <Field name="stringArrayRemove" />
            <Field name="stringArrayAdd" />
            <Errors />
            <Button disabled={false} />
          </>
        )}
      </Form>
    </Example>
  )
}
