import hljs from 'highlight.js/lib/common'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { metaTags } from '~/helpers'
import ButtonLink from '~/ui/button-link'
import Code from '~/ui/code'
import ExternalLink from '~/ui/external-link'
import Heading from '~/ui/heading'
import Pre from '~/ui/pre'
import SubHeading from '~/ui/sub-heading'

const title = 'Get Started'
const description = 'The full-stack form library for Remix and React Router'

export const meta: MetaFunction = () => metaTags({ title, description })

const createFormCode = `import { createForm } from 'remix-forms'
// For Remix, import it like this
import { Form as FrameworkForm, useActionData, useSubmit, useTransition as useNavigation } from '@remix-run/react'
// For React Router 6.4, like this
import { Form as FrameworkForm, useActionData, useSubmit, useNavigation } from 'react-router-dom'

const Form = createForm({ component: FrameworkForm, useNavigation, useSubmit, useActionData })

export { Form }
`

const createFormActionCode = `import { createFormAction } from 'remix-forms'
// For Remix, import it like this
import { redirect, json } from '@remix-run/node'
// For React Router 6.4, like this
import { redirect, json } from 'react-router-dom'

const formAction = createFormAction({ redirect, json })

export { formAction }
`

const stylesCode = `import type { FormProps, FormSchema } from 'remix-forms'
// For Remix, import it like this
import { Form as BaseForm } from '@remix-forms/remix'
// For React Router 6.4, like this
import { Form as BaseForm } from '@remix-forms/react-router'

function Form<Schema extends FormSchema>(props: FormProps<Schema>) {
  return (
    <BaseForm<Schema>
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
}

export { Form }
`

const schemaCode = `import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})`

const mutationCode = `import { makeDomainFunction } from 'domain-functions'

const mutation = makeDomainFunction(schema)(async (values) => (
  console.log(values) /* or anything else, like saveMyValues(values) */
))`

const actionCode = `import { formAction } from '@remix-forms/remix'
// import { formAction } from '@remix-forms/react-router'

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success', /* path to redirect on success */
  })`

const basicCode = `import { Form } from '@remix-forms/remix'
// import { Form } from '@remix-forms/react-router'

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
  createFormCode: hljs.highlight(createFormCode, { language: 'ts' }).value,
  createFormActionCode: hljs.highlight(createFormActionCode, { language: 'ts' })
    .value,
  stylesCode: hljs.highlight(stylesCode, { language: 'ts' }).value,
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
    createFormCode,
    createFormActionCode,
    stylesCode,
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
      <SubHeading>Remix or React Router 6.4?</SubHeading>
      <p>
        You can use Remix Forms with{' '}
        <ExternalLink href="https://remix.run/">Remix</ExternalLink>,{' '}
        <ExternalLink href="https://reactrouter.com/">
          React Router 6.4
        </ExternalLink>
        , or even your custom framework. As long as you pass it a <em>Form</em>{' '}
        component and a couple of functions and hooks, it will work anywhere
        React runs.
      </p>
      <SubHeading>Installation</SubHeading>
      <p>
        Assuming you already have <em>React</em> and{' '}
        <em>Remix or React Router</em> installed, you'll need the following
        packages:
      </p>
      <Pre>npm install remix-forms domain-functions zod react-hook-form</Pre>
      <p>
        Depending on your framework, you'll also need to install the correct
        adapter packages:
      </p>
      <Pre>npm install @remix-forms/remix</Pre>
      <Pre>npm install @remix-forms/react-router</Pre>

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
        <ExternalLink href="https://github.com/seasonedcc/domain-functions">
          Domain Functions
        </ExternalLink>
        &apos; <em>makeDomainFunction</em>. It&apos;s a function that receives
        the values from the form and performs the necessary mutations, such as
        storing data on a database.
      </p>
      <p>
        Domain Functions will parse the request&apos;s <em>formData</em> and
        perform the mutation only if everything is valid. If something goes bad,
        it will return structured error messages for us.
      </p>
      <Code>{mutationCode}</Code>
      <SubHeading>Create your action</SubHeading>
      <p>
        If the mutation is successful, <em>formAction</em> will redirect to{' '}
        <em>successPath</em>. If not, it will return <em>errors</em> and{' '}
        <em>values</em> to pass to <em>Form</em>.
      </p>
      <Code>{actionCode}</Code>
      <SubHeading>Create a basic form</SubHeading>
      <p>
        If you don&apos;t want any custom UI in the form, you can render{' '}
        <em>Form</em> without <em>children</em> and it will generate all the
        inputs, labels, error messages and button for you.
      </p>
      <Code>{basicCode}</Code>
      <SubHeading>Custom Form, standard components</SubHeading>
      <p>
        If you want a custom UI for your form, but don&apos;t need to customize
        the rendering of fields, errors, and buttons, do it like this:
      </p>
      <Code>{customFormCode}</Code>
      <SubHeading>Custom Field, standard components</SubHeading>
      <p>
        If you want a custom UI for a specific field, but don&apos;t need to
        customize the rendering of the label, input/select, and errors, do this:
      </p>
      <Code>{customFieldCode}</Code>
      <SubHeading>100% custom input</SubHeading>
      <p>
        If you want a 100% custom input, you can access{' '}
        <ExternalLink href="https://react-hook-form.com/">
          React Hook Form
        </ExternalLink>
        &apos;s <em>register</em> (and everything else) through the{' '}
        <em>Form</em>
        &apos;s <em>children</em> and go nuts:
      </p>
      <Code>{customInputCode}</Code>
      <SubHeading>[Optional] Customize styles</SubHeading>
      <p>
        Remix Forms doesn&apos;t ship any styles, so you might want to configure
        basic styles for your forms. Let&apos;s edit our custom <em>Form</em>{' '}
        component:
      </p>
      <Code>{stylesCode}</Code>
      <div className="flex flex-col space-y-2">
        <p>
          Check out{' '}
          <ExternalLink href="https://github.com/seasonedcc/remix-forms/blob/main/apps/web/app/ui/form.tsx">
            how we customized the styles
          </ExternalLink>{' '}
          for this website. We basically created a bunch of UI components and
          passed them to our custom form.
        </p>
        <p>
          PS: you don&apos;t need to customize everything. We&apos;ll use
          standard html tags if you don&apos;t.
        </p>
      </div>

      <SubHeading>That&apos;s it!</SubHeading>
      <div className="flex flex-col space-y-2">
        <p>
          Now go play! Keep in mind that we&apos;re just getting started and the
          APIs are unstable, so we appreciate your patience as we figure things
          out.
        </p>
        <p>
          Also, please join{' '}
          <ExternalLink href="https://discord.gg/2eahPMwxb8">
            Seasoned&apos;s OSS community on Discord
          </ExternalLink>
          . We&apos;ll be there to provide you support on Remix Forms.
        </p>
      </div>

      <SubHeading>Appreciation</SubHeading>
      <p>
        Remix Forms is a thin layer on top of giants. It wouldn&apos;t be
        possible without{' '}
        <ExternalLink href="https://www.typescriptlang.org/">
          TypeScript
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://react-hook-form.com/">
          React Hook Form
        </ExternalLink>
        , <ExternalLink href="https://remix.run/">Remix</ExternalLink>,{' '}
        <ExternalLink href="https://reactrouter.com/">
          React Router
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://github.com/colinhacks/zod">
          Zod
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://github.com/seasonedcc/domain-functions">
          Domain Functions
        </ExternalLink>
        , and a multitude of other open-source projects. Thank you!
      </p>
      <div className="pt-4 text-center">
        <ButtonLink to={'/examples'}>Check out more examples</ButtonLink>
      </div>

      <Heading>
        Support other frameworks or change the default behavior of formAction
      </Heading>

      <p>
        To support another framework or change the default behavior of{' '}
        <em>formAction</em>, all you have to do is to create your own{' '}
        <em>formAction</em> function and <em>Form</em> adapter.
      </p>

      <SubHeading>Create your custom formAction function</SubHeading>
      <p>
        Somewhere within your <em>app/</em>, create a file named{' '}
        <em>
          <strong>form-action.server.ts</strong>
        </em>
        .
      </p>
      <Pre>/app/form-action.server.ts</Pre>
      <p>
        <strong>Important</strong>: do not forget to include the suffix{' '}
        <em>
          <strong>.server</strong>
        </em>{' '}
        in the file name otherwise server-side code will leak to the browser,
        triggering a confusing error.
      </p>
      <Code>{createFormActionCode}</Code>
      <SubHeading>Create your base Form adapter</SubHeading>
      <p>
        Alongside your <em>form-action.server.ts</em>, create a <em>form.ts</em>{' '}
        file and include the following code:
      </p>
      <Pre>/app/form.ts</Pre>
      <Code>{createFormCode}</Code>
      <div className="pt-4 text-center">
        <ButtonLink to={'/examples'}>Check out more examples</ButtonLink>
      </div>
    </div>
  )
}
