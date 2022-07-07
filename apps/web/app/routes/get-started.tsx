import hljs from 'highlight.js/lib/common'
import { LoaderFunction, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { $path } from 'remix-routes'
import { metaTags } from '~/helpers'
import ButtonLink from '~/ui/button-link'
import Code from '~/ui/code'
import ExternalLink from '~/ui/external-link'
import Heading from '~/ui/heading'
import Pre from '~/ui/pre'
import SubHeading from '~/ui/sub-heading'

const title = 'Get Started'
const description = 'Magically create forms + actions in Remix'

export const meta: MetaFunction = () => metaTags({ title, description })

const formCode = `import { Form as RemixForm, FormProps } from 'remix-forms'
import { SomeZodObject } from 'zod'

export default function Form<Schema extends SomeZodObject>(
  props: FormProps<Schema>,
) {
  return (
    <RemixForm<Schema>
      className={/* your form classes */}
      fieldComponent={/* your custom Field */}
      labelComponent={/* your custom Label */}
      inputComponent={/* your custom Input */}
      multilineComponent={/* your custom Multiline */}
      selectComponent={/* your custom Select */}
      checkboxComponent={/* your custom Checkbox */}
      checkboxWrapperComponent={/* your custom checkbox wrapper */}
      buttonComponent={/* your custom Button */}
      fieldErrorsComponent={/* your custom FieldErrors */}
      globalErrorsComponent={/* your custom GlobalErrors */}
      errorComponent={/* your custom Error */}
      {...props}
    />
  )
}`

const schemaCode = `import { z } from 'zod'

const schema = z.object({
  firstName: z.string().nonempty(),
  email: z.string().nonempty().email(),
})`

const mutationCode = `import { makeDomainFunction } from 'remix-domains'

const mutation = makeDomainFunction(schema)(async (values) => (
  await saveMyValues(values) /* or anything else */
))`

const actionCode = `import { formAction } from 'remix-forms'

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: /* path to redirect on success */,
  })`

const basicCode = `import { Form } from /* path to your custom Form */

export default () => <Form schema={schema} />`

const customFormCode = `<Form schema={schema}>
  {({ Field, Errors, Button }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email" label="E-mail" />
      <em>You'll hear from us at this address 👆🏽</em>
      <Errors />
      <Button />
    </>
  )}
</Form>`

const customFieldCode = `<Form schema={schema}>
  {({ Field, Errors, Button }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email">
        {({ Label, SmartInput, Errors }) => (
          <>
            <Label>E-mail</Label>
            <em>You'll hear from us at this address 👇🏽</em>
            <SmartInput />
            <Errors />
          </>
        )}
      </Field>
      <Errors />
      <Button />
    </>
  )}
</Form>`

const customInputCode = `<Form schema={schema}>
  {({ Field, Errors, Button, register }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email" label="E-mail">
        {({ Label, Errors }) => (
          <>
            <Label />
            <input {...register('email')} />
            <Errors />
          </>
        )}
      </Field>
      <Errors />
      <Button />
    </>
  )}
</Form>`

export const loader: LoaderFunction = () => ({
  formCode: hljs.highlight(formCode, { language: 'ts' }).value,
  schemaCode: hljs.highlight(schemaCode, { language: 'ts' }).value,
  mutationCode: hljs.highlight(mutationCode, { language: 'ts' }).value,
  actionCode: hljs.highlight(actionCode, { language: 'ts' }).value,
  basicCode: hljs.highlight(basicCode, { language: 'ts' }).value,
  customFormCode: hljs.highlight(customFormCode, { language: 'ts' }).value,
  customFieldCode: hljs.highlight(customFieldCode, { language: 'ts' }).value,
  customInputCode: hljs.highlight(customInputCode, { language: 'ts' }).value,
})

export default function Component() {
  const {
    formCode,
    schemaCode,
    mutationCode,
    actionCode,
    basicCode,
    customFormCode,
    customFieldCode,
    customInputCode,
  } = useLoaderData()

  return (
    <div className="m-auto flex max-w-2xl flex-col space-y-8 px-4 py-8 text-gray-200 sm:px-8 sm:py-16">
      <Heading>Get Started</Heading>
      <SubHeading>Dependencies</SubHeading>
      <p>
        Make sure you have{' '}
        <ExternalLink href="https://remix.run/">Remix</ExternalLink>,{' '}
        <ExternalLink href="https://github.com/colinhacks/zod">
          Zod
        </ExternalLink>
        , and{' '}
        <ExternalLink href="https://github.com/SeasonedSoftware/remix-domains">
          Remix Domains
        </ExternalLink>{' '}
        in your project before using Remix Forms.
      </p>
      <SubHeading>Installation</SubHeading>
      <Pre>npm install remix-forms</Pre>
      <SubHeading>Basic styles</SubHeading>
      <p>
        Remix Forms doesn't ship any styles, so you need to configure basic
        styles for your forms. Let's create a custom <em>Form</em> component for
        your project:
      </p>
      <Code>{formCode}</Code>
      <div className="flex flex-col space-y-2">
        <p>
          Check out{' '}
          <ExternalLink href="https://github.com/SeasonedSoftware/remix-forms-site/blob/main/app/ui/form.tsx">
            how we customized the styles
          </ExternalLink>{' '}
          for this website. We basically created a bunch of UI components and
          passed them to our custom form.
        </p>
        <p>
          With your custom <em>Form</em> in place, now you can use it instead of
          Remix Forms' for all your forms.
        </p>
        <p>
          PS: you don't need to customize everything. We'll use standard html
          tags if you don't.
        </p>
      </div>
      <SubHeading>Write your schema</SubHeading>
      <p>
        Compose a zod schema that will be used in your action, mutation
        function, form generation, server-side validation, and client-side
        validation.
      </p>
      <Code>{schemaCode}</Code>
      <SubHeading>Create your mutation</SubHeading>
      <p>
        Create a mutation function using{' '}
        <ExternalLink href="https://github.com/SeasonedSoftware/remix-domains">
          Remix Domains
        </ExternalLink>
        ' <em>makeDomainFunction</em>. It's a function that receives the values
        from the form and performs the necessary mutations, such as storing data
        on a database.
      </p>
      <p>
        Remix Domains will parse the request's <em>formData</em> and perform the
        mutation only if everything is valid. If something goes bad, it will
        return structured error messages for us.
      </p>
      <Code>{mutationCode}</Code>
      <SubHeading>Create your action</SubHeading>
      <p>
        If the mutation is successful, Remix Forms' <em>formAction</em> will
        redirect to <em>successPath</em>. If not, it will return <em>errors</em>{' '}
        and <em>values</em> to pass to <em>Form</em>.
      </p>
      <Code>{actionCode}</Code>
      <SubHeading>Create a basic form</SubHeading>
      <p>
        If you don't want any custom UI in the form, you can render{' '}
        <em>Form</em> without <em>children</em> and it will generate all the
        inputs, labels, error messages and button for you.
      </p>
      <Code>{basicCode}</Code>
      <SubHeading>Custom Form, standard components</SubHeading>
      <p>
        If you want a custom UI for your form, but don't need to customize the
        rendering of fields, errors, and buttons, do it like this:
      </p>
      <Code>{customFormCode}</Code>
      <SubHeading>Custom Field, standard components</SubHeading>
      <p>
        If you want a custom UI for a specific field, but don't need to
        customize the rendering of the label, input/select, and errors, do this:
      </p>
      <Code>{customFieldCode}</Code>
      <SubHeading>100% custom input</SubHeading>
      <p>
        If you want a 100% custom input, you can access{' '}
        <ExternalLink href="https://react-hook-form.com/">
          React Hook Form
        </ExternalLink>
        's <em>register</em> (and everything else) through the <em>Form</em>'s{' '}
        <em>children</em> and go nuts:
      </p>
      <Code>{customInputCode}</Code>
      <SubHeading>That's it!</SubHeading>
      <div className="flex flex-col space-y-2">
        <p>
          Now go play! Keep in mind that we're just getting started and the APIs
          are unstable, so we appreciate your patience as we figure things out.
        </p>
        <p>
          Also, please join{' '}
          <ExternalLink href="https://rmx.as/discord">
            Remix's community on Discord
          </ExternalLink>
          . We'll be there to provide you support on Remix Forms.
        </p>
      </div>
      <SubHeading>Appreciation</SubHeading>
      <p>
        Remix Forms is a thin layer on top of giants. It wouldn't be possible
        without{' '}
        <ExternalLink href="https://www.typescriptlang.org/">
          TypeScript
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://react-hook-form.com/">
          React Hook Form
        </ExternalLink>
        , <ExternalLink href="https://remix.run/">Remix</ExternalLink>,{' '}
        <ExternalLink href="https://github.com/colinhacks/zod">
          Zod
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://github.com/SeasonedSoftware/remix-domains">
          Remix Domains
        </ExternalLink>
        , and a multitude of other open-source projects. Thank you!
      </p>
      <div className="pt-4 text-center">
        <ButtonLink to={$path('/examples')}>Check out more examples</ButtonLink>
      </div>
    </div>
  )
}
