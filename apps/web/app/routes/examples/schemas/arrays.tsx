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
import {useActionData} from "@remix-run/react";
import {useState} from "react";

const title = 'Arrays'
const description =
  'In this example, all sorts of array schemas are validated on the client and on the server.'
const min = 3;
const max = 10;
const defaultArray = ['1', '2', '3']

export const meta: MetaFunction = () => metaTags({ title, description })

//
const code = '';
//

const schema = z.object({
  hobbies: z.string().array().min(min).max(max).default(defaultArray),
})

export const loader: LoaderFunction = () => ({
  code: hljs.highlight(code, { language: 'ts' }).value,
})

const mutation = makeDomainFunction(schema)(async (values) => {
  return values;
})

export const action: ActionFunction = async ({ request }) => {
  return formAction({ request, schema, mutation })}

export default function Component() {
  const data = useActionData();
  const [hobbies, setHobbies] = useState<string[]>(data?.hobbies || data?.values?.hobbies || defaultArray || []);

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
                 {(Array.from({length: clamp(hobbies.length+1, min, max)}, (_, i) => i)).map(i => (
                   <div key={(i)}>
                     {hobbies[i] ? (
                       <>
                         <input
                           key={(i) + '-value'}
                           defaultValue={hobbies[i]}
                           name={'hobbies[' + (i) + ']'}
                           className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                         />
                         <button
                            key={(i) + '-delete'}
                            className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                            onClick={(e) => {
                              e.preventDefault();
                              setHobbies(hobbies.filter((_, j) => j !== i))
                            }}
                          >
                            Delete
                           <noscript>
                             First clear the input, then click the button.
                           </noscript>
                          </button>
                       </>) : (
                       <>
                         <input
                           key={(i) + '-empty'}
                           name={'hobbies[' + (i) + ']'}
                           id={'hobbies[' + (i) + ']'}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault();
                             }
                           }
                           }
                           className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                         />
                         <button
                            key={(i) + '-add'}
                            className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                            onClick={(e) => {
                              e.preventDefault();
                              const value = (document.getElementById('hobbies[' + (i) + ']') as HTMLInputElement).value;
                              if (value) {
                                setHobbies([...hobbies, value])
                              }
                            }}
                          >
                            Add
                          </button>
                       </>
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
    </Example>
  )
}
