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
  strings: z.string().array().max(10, 'Ey leute zu lang!').default([]), // min() not yet supported
  numbers: z.number().array().max(10).default([]), // min() not yet supported
  submit: z.enum(['submit', 'refresh']).default('submit'), // Can this be solved programmatically in the Form.tsx?
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
  return (
    <Example title={title} description={description}>
      <Form
        options={{
          numbers: [
            { name: '', value: '' },
            { name: 'Designer', value: 1 },
            { name: 'Dev', value: 2 },
          ],
        }}
        schema={schema}/>
     {/*<Form schema={schema}>
       {({ Field, Errors, Button }) => (
         <>
           <Field name="hobbies">
             {({ Label, Errors }) => (
               <>
                  <Label>Hobbies</Label>
                 <ArrayInput name={'hobbies'} className={''} minLength={min} defaultValue={defaultArray} />
                 <Errors />
               </>
             )}
           </Field>
           <Errors />
           <Button />
         </>
       )}
     </Form>*/}
    </Example>
  )
}

{/*<Label>Hobbies</Label>
                 {JSON.stringify(hobbies)}
                 {hobbies.map((hobby, i) => (
                   <>
                     <input
                       key={(i) + '-value'}
                       defaultValue={hobbies[i]}
                       value={hobbies[i]}
                       name={'hobbies[' + (i) + ']'}
                       onChange={(e) => {
                         const newHobbies = [...hobbies]
                         newHobbies[i] = e.target.value
                         setHobbies(newHobbies)}
                       }
                       className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                     />
                     <button
                       key={(i) + '-delete'}
                       className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                       onClick={(e) => {
                         e.preventDefault();
                         // elements before the removed element
                          const newHobbies = hobbies.slice(0, i)
                          // elements after the removed element
                          newHobbies.push(...hobbies.slice(i + 1))
                          setHobbies(newHobbies)
                       }}
                     >
                       Delete
                       <noscript>
                         First clear the input, then click the button.
                       </noscript>
                     </button>
                   </>
                  ))}
                 <noscript>
                   <input
                     key={(hobbies.length) + '-value'}
                     defaultValue={hobbies[hobbies.length]}
                     name={'hobbies[' + (hobbies.length) + ']'}
                     className={'inline rounded-md text-gray-800 shadow-sm sm:text-sm'}
                   />
                 </noscript>
                 <button
                   onClick={(e) => {
                     e.preventDefault();
                     setHobbies([...hobbies, ''])
                   }}
                 >
                   Add
                 </button>*/}
{/*{(Array.from({length: clamp(hobbies.length+1, min, max)}, (_, i) => i)).map(i => (
                   <div key={(i)}>
                     {hobbies[i] ? (
                       <>
                         <input
                           key={(i) + '-value'}
                           defaultValue={hobbies[i]}
                           value={hobbies[i]}
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
                 ))}*/}
