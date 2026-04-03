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
  form: /* your custom Form */,
  fields: /* your custom fields wrapper */,
  field: /* your custom Field */,
  label: /* your custom Label */,
  input: /* your custom Input */,
  fileInput: /* your custom FileInput */,
  multiline: /* your custom Multiline */,
  select: /* your custom Select */,
  checkbox: /* your custom Checkbox */,
  checkboxLabel: /* your custom checkbox label (wraps the checkbox input) */,
  radio: /* your custom Radio */,
  radioGroup: /* your custom radio group wrapper */,
  radioLabel: /* your custom radio option label (wraps each radio input) */,
  button: /* your custom Button */,
  fieldErrors: /* your custom FieldErrors */,
  globalErrors: /* your custom GlobalErrors */,
  error: /* your custom Error */,
  scalarArrayField: /* your custom scalar array field wrapper */,
  scalarArrayItem: /* your custom scalar array item wrapper */,
  objectArrayItem: /* your custom object array item wrapper */,
  arrayArrayItem: /* your custom nested-array item wrapper */,
  arrayTitle: /* your custom array title (div by default, not label) */,
  addButton: /* your custom add-item button */,
  removeButton: /* your custom remove-item button */,
  arrayEmpty: /* your custom empty-array message */,
  objectFields: /* your custom object sub-fields wrapper */,
  objectTitle: /* your custom object title (div by default, not label) */,
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
        npm install remix-forms @remix-run/form-data-parser schema-info
        coerce-form-data composable-functions zod react-hook-form
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
        Remix Forms works out of the box with unstyled HTML elements, but
        you&apos;ll probably want styled components. The easiest way is to use
        our CLI:
      </p>
      <Pre>npx create-remix-forms</Pre>
      <p>
        It will scaffold a <em>schema-form</em> directory with styled components
        for every slot. Two presets are available: <strong>Tailwind CSS</strong>{' '}
        (plain utility classes) and <strong>DaisyUI</strong> (Tailwind + DaisyUI
        component classes).
      </p>
      <p>You can also skip the prompts with flags:</p>
      <Pre>
        npx create-remix-forms --preset daisyui --output ./app/ui/schema-form
      </Pre>
      <SubHeading>[Alternative] Manual setup</SubHeading>
      <p>
        If you prefer to set things up manually, create a custom{' '}
        <em>SchemaForm</em> component:
      </p>
      <Code>{stylesCode}</Code>
      <div className="flex flex-col gap-2">
        <p>
          You don&apos;t need to customize every slot — sensible defaults are
          provided for any slot you leave out. Check out{' '}
          <ExternalLink href="https://github.com/seasonedcc/remix-forms/blob/main/apps/web/app/ui/schema-form.tsx">
            how we customized the styles
          </ExternalLink>{' '}
          for this website.
        </p>
        <p>
          <strong>Important:</strong> each slot must be a{' '}
          <strong>unique component</strong>. Even if two slots render identical
          markup, define them as separate functions or <em>forwardRef</em>{' '}
          wrappers. The library identifies components by reference equality, so
          reusing the same component for multiple slots (e.g. passing{' '}
          <em>Label</em> for both <em>label</em> and <em>checkboxLabel</em>)
          will cause the wrong props to be injected.
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
