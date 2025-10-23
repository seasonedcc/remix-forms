interface PageContent {
  schemaCode: string
  mutationCode: string
  actionCode: string
  basicCode: string
  customFormCode: string
  customFieldCode: string
  customInputCode: string
  stylesCode: string
}

export function getStartedPageToMarkdown(content: PageContent): string {
  return `# Get Started

## Installation

Assuming you already have *React* and *React Router v7* installed, you'll need the following packages:

\`\`\`bash
npm install remix-forms composable-functions zod react-hook-form
\`\`\`

## Write your schema

Compose a zod schema that will be used in your action, mutation function, form generation, server-side validation, and client-side validation.

\`\`\`typescript
${content.schemaCode}
\`\`\`

## Create your mutation

Create a mutation function wrapped by [Composable Functions](https://github.com/seasonedcc/composable-functions)' *applySchema*. Remix Forms will parse the request's *formData* and send it to the mutation.

*applySchema* will ensure the mutation only performs if the arguments are valid.
If something goes bad, it will return a list of errors for us.

\`\`\`typescript
${content.mutationCode}
\`\`\`

## Create your action

If the mutation is successful, *formAction* will redirect to *successPath*. If not, it will return *errors* and *values* to pass to *SchemaForm*.

\`\`\`typescript
${content.actionCode}
\`\`\`

## Create a basic form

If you don't want any custom UI in the form, you can render *SchemaForm* without *children* and it will generate all the inputs, labels, error messages and button for you.

\`\`\`typescript
${content.basicCode}
\`\`\`

## Custom form, standard components

If you want a custom UI for your form, but don't need to customize the rendering of fields, errors, and buttons, do it like this:

\`\`\`typescript
${content.customFormCode}
\`\`\`

## Custom field, standard components

If you want a custom UI for a specific field, but don't need to customize the rendering of the label, input/select, and errors, do this:

\`\`\`typescript
${content.customFieldCode}
\`\`\`

## 100% custom input

If you want a 100% custom input, you can access [React Hook Form](https://react-hook-form.com/)'s *register* (and everything else) through the *SchemaForm*'s *children* and go nuts:

\`\`\`typescript
${content.customInputCode}
\`\`\`

## [Optional] Customize styles

Remix Forms doesn't ship any styles, so you might want to configure basic styles for your forms. Let's edit our custom *SchemaForm* component:

\`\`\`typescript
${content.stylesCode}
\`\`\`

Check out [how we customized the styles](https://github.com/seasonedcc/remix-forms/blob/main/apps/web/app/ui/schema-form.tsx) for this website. We basically created a bunch of UI components and passed them to our custom form.

PS: you don't need to customize everything. We'll use standard html tags if you don't.

## That's it!

Now go play 😊

Please [create issues](https://github.com/seasonedcc/remix-forms/issues) as you encounter them. We appreciate the contribution!`
}
