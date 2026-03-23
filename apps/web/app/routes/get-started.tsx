import hljs from 'highlight.js/lib/common'
import { Link } from 'react-router'
import { metaTags } from '~/helpers'
import Code from '~/ui/code'
import CopyPageButton from '~/ui/copy-page-button'
import ExternalLink from '~/ui/external-link'
import Heading from '~/ui/heading'
import Pre from '~/ui/pre'
import SubHeading from '~/ui/sub-heading'
import type { Route } from './+types/get-started'

const title = 'Get started'
const description = 'The full-stack form library for React Router v7'

export const meta: Route.MetaFunction = () => metaTags({ title, description })

const stylesCode = `import { makeSchemaForm } from 'remix-forms'

const SchemaForm = makeSchemaForm({
  fields: /* your custom fields wrapper */,
  field: /* your custom Field */,
  label: /* your custom Label */,
  input: /* your custom Input */,
  multiline: /* your custom Multiline */,
  select: /* your custom Select */,
  checkbox: /* your custom Checkbox */,
  checkboxWrapper: /* your custom checkbox wrapper */,
  button: /* your custom Button */,
  fieldErrors: /* your custom FieldErrors */,
  globalErrors: /* your custom GlobalErrors */,
  error: /* your custom Error */,
})

export { SchemaForm }
`

const schemaCode = `import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})`

const mutationCode = `import { applySchema } from 'composable-functions'

const mutation = applySchema(schema)(async (values) => (
  console.log(values) /* or anything else, like saveMyValues(values) */
))`

const actionCode = `import { formAction } from 'remix-forms'

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success', /* path to redirect on success */
  })`

const basicCode = `import { SchemaForm } from 'remix-forms'

export default () => <SchemaForm schema={schema} />`

const customFormCode = `<SchemaForm schema={schema}>
  {({ Field, Errors, Button }) => (
    <>
      <Field name="firstName" label="First name" />
      <Field name="email" label="E-mail" />
      <em>You'll hear from us at this address 👆🏽</em>
      <Errors />
      <Button />
    </>
  )}
</SchemaForm>`

const customFieldCode = `<SchemaForm schema={schema}>
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
</SchemaForm>`

const customInputCode = `<SchemaForm schema={schema}>
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
</SchemaForm>`

export const loader = () => ({
  stylesCode: hljs.highlight(stylesCode, { language: 'ts' }).value,
  schemaCode: hljs.highlight(schemaCode, { language: 'ts' }).value,
  mutationCode: hljs.highlight(mutationCode, { language: 'ts' }).value,
  actionCode: hljs.highlight(actionCode, { language: 'ts' }).value,
  basicCode: hljs.highlight(basicCode, { language: 'ts' }).value,
  customFormCode: hljs.highlight(customFormCode, { language: 'ts' }).value,
  customFieldCode: hljs.highlight(customFieldCode, { language: 'ts' }).value,
  customInputCode: hljs.highlight(customInputCode, { language: 'ts' }).value,
})

export default function Component({ loaderData }: Route.ComponentProps) {
  const {
    stylesCode,
    schemaCode,
    mutationCode,
    actionCode,
    basicCode,
    customFormCode,
    customFieldCode,
    customInputCode,
  } = loaderData

  return (
    <div className="relative m-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-16">
      <div className="flex items-center justify-between gap-4">
        <Heading>Get started</Heading>
        <CopyPageButton />
      </div>
      <SubHeading>Installation</SubHeading>
      <p>
        Assuming you already have <em>React</em> and <em>React Router v7</em>{' '}
        installed, you'll need the following packages:
      </p>
      <Pre>
        npm install remix-forms schema-info coerce-form-data
        composable-functions zod react-hook-form
      </Pre>
      <p className="text-base-content/60 text-sm">
        You can replace <em>zod</em> with <em>valibot</em>, <em>yup</em>,{' '}
        <em>arktype</em>, <em>@effect/schema</em>, or <em>joi</em>.
      </p>
      <SubHeading>Write your schema</SubHeading>
      <p>
        Compose a schema that will be used in your action, mutation function,
        form generation, server-side validation, and client-side validation.
        We're using Zod in this example, but Yup, Valibot, ArkType, Effect
        Schema, and Joi work too.
      </p>
      <Code>{schemaCode}</Code>
      <SubHeading>Create your mutation</SubHeading>
      <p>
        Create a mutation function wrapped by{' '}
        <ExternalLink href="https://github.com/seasonedcc/composable-functions">
          Composable Functions
        </ExternalLink>
        &apos; <em>applySchema</em>. Remix Forms will parse the request&apos;s{' '}
        <em>formData</em> and send it to the mutation.
      </p>
      <p>
        <em>applySchema</em> will ensure the mutation only performs if the
        arguments are valid.
        <br />
        If something goes bad, it will return a list of errors for us.
      </p>
      <Code>{mutationCode}</Code>
      <SubHeading>Create your action</SubHeading>
      <p>
        If the mutation is successful, <em>formAction</em> will redirect to{' '}
        <em>successPath</em>. If not, it will return <em>errors</em> and{' '}
        <em>values</em> to pass to <em>SchemaForm</em>.
      </p>
      <Code>{actionCode}</Code>
      <SubHeading>Create a basic form</SubHeading>
      <p>
        If you don&apos;t want any custom UI in the form, you can render{' '}
        <em>SchemaForm</em> without <em>children</em> and it will generate all
        the inputs, labels, error messages and button for you.
      </p>
      <Code>{basicCode}</Code>
      <SubHeading>Custom form, standard components</SubHeading>
      <p>
        If you want a custom UI for your form, but don&apos;t need to customize
        the rendering of fields, errors, and buttons, do it like this:
      </p>
      <Code>{customFormCode}</Code>
      <SubHeading>Custom field, standard components</SubHeading>
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
        <em>SchemaForm</em>
        &apos;s <em>children</em> and go nuts:
      </p>
      <Code>{customInputCode}</Code>
      <SubHeading>[Optional] Customize styles</SubHeading>
      <p>
        Remix Forms doesn&apos;t ship any styles, so you might want to configure
        basic styles for your forms. Let&apos;s edit our custom{' '}
        <em>SchemaForm</em> component:
      </p>
      <Code>{stylesCode}</Code>
      <div className="flex flex-col gap-2">
        <p>
          Check out{' '}
          <ExternalLink href="https://github.com/seasonedcc/remix-forms/blob/main/apps/web/app/ui/schema-form.tsx">
            how we customized the styles
          </ExternalLink>{' '}
          for this website. We basically created a bunch of UI components and
          passed them to our custom form.
        </p>
        <p>
          PS: you don&apos;t need to customize everything. We&apos;ll use
          standard html tags if you don&apos;t.
        </p>
        <p>
          When passing custom components, always pass actual React components
          rather than string tag names like <em>&quot;div&quot;</em> or{' '}
          <em>&quot;input&quot;</em>. Remix Forms identifies these components by
          reference in the JSX tree, so strings can cause unexpected behavior.
        </p>
      </div>
      <SubHeading>That&apos;s it!</SubHeading>
      <div className="flex flex-col gap-2">
        <p>Now go play 😊</p>
        <p>
          Please{' '}
          <ExternalLink href="https://github.com/seasonedcc/remix-forms/issues">
            create issues
          </ExternalLink>{' '}
          as you encounter them. We appreciate the contribution!
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
        <ExternalLink href="https://standardschema.dev">
          Standard Schema
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://github.com/colinhacks/zod">
          Zod
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://github.com/seasonedcc/composable-functions">
          Composable Functions
        </ExternalLink>
        , and a multitude of other open-source projects. Thank you!
      </p>
      <div className="pt-4 text-center">
        <Link to="/examples" className="btn btn-primary">
          Check out more examples
        </Link>
      </div>
    </div>
  )
}
