import { applySchema } from "composable-functions";
import hljs from "highlight.js/lib/common";
import { formAction } from "remix-forms";
import { z } from "zod";
import { metaTags } from "~/helpers";
import Example from "~/ui/example";
import { SchemaForm } from "~/ui/schema-form";
import type { Route } from "./+types/dates";

const title = "Datetime";
const description = "In this example, a datetime field is validated correctly";

export const meta: Route.MetaFunction = () => metaTags({ title, description });

const code = `const schema = z.object({
  datetime: z.string().datetime(),
})

const mutation = applySchema(schema)(async (values) => values)

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation })

export default () => <SchemaForm schema={schema} />`;

const schema = z.object({
  datetime: z.date(),
});

export const loader = () => ({
  code: hljs.highlight(code, { language: "ts" }).value,
});

const mutation = applySchema(schema)(async (values) => values);

export const action = async ({ request }: Route.ActionArgs) =>
  formAction({ request, schema, mutation });

export default function Component() {
  return (
    <Example title={title} description={description}>
      <SchemaForm schema={schema} inputTypes={{ datetime: "datetime-local" }} />
    </Example>
  );
}
