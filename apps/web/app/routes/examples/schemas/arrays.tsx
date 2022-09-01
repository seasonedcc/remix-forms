import hljs from 'highlight.js/lib/common'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { formAction } from 'remix-forms'
import {z} from 'zod'
import Form from '~/ui/form'
import {metaTags} from '~/helpers'
import { makeDomainFunction } from 'remix-domains'
import Example from '~/ui/example'
import * as React from "react";

const title = 'Arrays'
const description =
  'In this example, all sorts of array schemas are validated on the client and on the server.'

export const meta: MetaFunction = () => metaTags({ title, description })

//
const code = '';
//

const schema = z.object({
  strings: z.string().array().max(30).default([]), // min() not supported
  numbers: z.number().array().default([]), // min() not supported
  numbersWithOptions: z.number().array().default([]), // min() not supported
})

// TODO Current bugs/missing features
// - With JS:
//   - min() doesn't work -> after once to few elements, it doesn't allow a resubmission, even with enough elements
//     -> works when input is not hidden after second button press

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
  return values;
})

export const action: ActionFunction = async ({ request }) => {
  return formAction({ request, schema, mutation })}

export default function Component() {
  return (
    <Example title={title} description={description}>
      <Form
        options={{
          numbersWithOptions: [
            { name: '', value: '' },
            { name: 'Designer', value: 1 },
            { name: 'Dev', value: 2 },
          ],
        }}
        schema={schema}/>
    </Example>
  )
}