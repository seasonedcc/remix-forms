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

const title = 'Arrays'
const description =
  'In this example, all sorts of array schemas are validated on the client and on the server.'

export const meta: MetaFunction = () => metaTags({ title, description })

//

const code = "import {formAction} from 'remix-forms'";

//

const schema = z.object({
  arrayString: z.string().array().default(['a', 'b', 'c']),
  arrayStringAdd: z.string().nullable(),
  arrayStringRemove: z.number().int().positive().nullable(),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
  if (!values.arrayString) {
    values.arrayString = []
  }

  if (values.arrayStringRemove) {
    values.arrayString.splice(values.arrayStringRemove - 1, 1)
    values.arrayStringRemove = -1;
  }

  if (values.arrayStringAdd) {
    values.arrayString.push(values.arrayStringAdd)
    values.arrayStringAdd = '';
  }

  return values
})

export const action: ActionFunction = async ({ request }) => {
  return formAction({ request, schema, mutation })}

export default function Component() {
  const data = useActionData();
  const arrayString = data?.arrayString || [];
  
  return (
    <Example title={title} description={description}>
      <Form schema={schema}>
        {({ Field, Errors, Button, register }) => (
          <>
            {arrayString ? (<Field name="arrayString" value={arrayString}/>) : <Field name="arrayString" />}
            {arrayString && arrayString.map((item:string, index:number) => (
              <div key={index}>
                {item} <input type={'button'} onClick={() => {
                  arrayString.splice(index, 1);
                }}
                />
              </div>
            ))}
            <Field name="arrayStringRemove"/>
            <Field name="arrayStringAdd"/>
            <Errors />
            <Button />
          </>
        )}
      </Form>
    </Example>
  )
}
