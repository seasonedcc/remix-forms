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
import {useActionData, useFormAction} from "@remix-run/react";
import Label from "~/ui/label";
import {useState} from "react";

const title = 'Arrays'
const description =
  'In this example, all sorts of array schemas are validated on the client and on the server.'
const min = 3;
const max = 10;
const defaultArray = ['1', '2', '3']

export const meta: MetaFunction = () => metaTags({ title, description })

//
const code = "import {formAction} from 'remix-forms'";
//

const schema = z.object({
  hobbies: z.string().array().min(min).max(max).default(defaultArray),
  /*hobbiesAdd: z.string().nullable(),
  hobbiesRemove: z.number().int().positive().nullable(),
  finalSubmit: z.boolean().default(true),*/
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
/*  if (!values.hobbies) {
    values.hobbies = [];
  }

  if (values.hobbiesRemove) {
    values.hobbies.splice(values.hobbiesRemove - 1, 1)
    values.finalSubmit = false;
    values.hobbiesRemove = 0;
  }

  if (values.hobbiesAdd) {
    values.hobbies.push(values.hobbiesAdd)
    values.finalSubmit = false;
    values.hobbiesAdd = '';
  }*/

  return values;
})

export const action: ActionFunction = async ({ request }) => {
  console.log(request);
  return formAction({ request, schema, mutation })}

export default function Component() {
  const data = useActionData();
  const [formAction] = useFormAction('destroy');
  let hobbies = data?.hobbies || data?.values?.hobbies || [];

  const clamp = (num:number, min:number, max:number) => Math.min(Math.max(num, min), max);

  return (
    <Example title={title} description={description}>
      <Form schema={schema}>
        {({ Field, Errors, Button }) => (
          <>
            <Field name="hobbies">
              {({ Label, Errors }) => (
                <>
                  <Label>Hobbies</Label>
                  {JSON.stringify(hobbies)}
                  {(Array.from({length: clamp(hobbies.length+1, min, max)}, (_, i) => i + 1)).map(i => (
                    <div key={i}>
                      {hobbies[i-1] ? (
                        <>
                          <input
                            className={'text-blue-500'}
                            key={i + '-value'}
                            value={hobbies[i-1]}
                            readOnly={true}
                            name={'hobbies[' + i + ']'}
                          />
                          <button
                            formAction={formAction}
                            formMethod="delete"
                          >
                            Delete
                          </button>
                        </>) : (
                        <input
                          className={'text-blue-500'}
                          key={i + '-empty'}
                          name={'hobbies[' + i + ']'}
                        />
                      )}
                    </div>
                  ))}
                  <Errors />
                </>
              )}
            </Field>
            <Errors />
            <Button />
          </>
        )}
      </Form>
      {/*<Form
        schema={schema}
        options={{
          hobbiesRemove: hobbies.map((item:string, index:number) => {
            return {value: index+1, name: item}
          })
        }}
      >
        {({ Field, Errors, Button }) => (
          <>
            <div>
              <Label>Hobbies</Label>
              <ul className={'list-disc pl-5'}>
                {hobbies && hobbies.map((item:string, index:number) => (
                  <li key={index}>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
              <Field name="hobbies" value={hobbies ? hobbies : []}>
                {({ SmartInput, Errors }) => (
                  <>
                    <SmartInput />
                    <Errors />
                  </>
                )}
              </Field>
              <Field name="hobbiesRemove" />
              <Field name="hobbiesAdd" />
            </div>
            <Field name="finalSubmit" value={true}/>
            <Errors />
            <Button />
          </>
        )}
      </Form>*/}
    </Example>
  )
}
