---
name: safe-element-comparison
description: Maintain element type comparison safety in remix-forms. Use when modifying component mappings, adding new components to mapChildren, investigating unexpected HTML attributes or prop injection, writing docs about component customization, or responding to user issues about wrong elements receiving props.
metadata:
  internal: true
---

# Safe Element Comparison

remix-forms identifies components in JSX trees using `child.type === Component`. This pattern is central to how `mapChildren` injects props into the right elements. This skill covers the architecture, the rules for keeping it safe, and guidance for users.

## How It Works

`mapChildren` in `children-traversal.ts` recursively walks the React element tree returned by user render functions. Callback functions in `create-field.tsx` and `schema-form.tsx` compare `child.type` against component references to decide which props to inject.

React element types follow these rules:

- `<div>` compiles to `React.createElement('div')` — type is the **string** `'div'`
- `<MyComponent />` compiles to `React.createElement(MyComponent)` — type is the **function/object reference**
- `React.forwardRef(fn)` returns a unique object — `===` comparison works reliably when defined at module scope
- `React.cloneElement` preserves `.type` exactly
- React Fast Refresh preserves component identity in development

If a component reference were a string like `'div'`, then `child.type === Component` would match every `<div>` in the tree — not just the intended component. This is why all default components are `React.forwardRef` wrappers with unique object identity.

## Current Architecture

All default components are defined at module scope as `React.forwardRef` wrappers. Each renders its corresponding HTML element and nothing else. Components that render the same HTML tag (e.g. `DefaultInput`, `DefaultCheckbox`, `DefaultRadio` all render `<input>`) are separate objects with distinct identities.

### create-field.tsx

| Default wrapper | Renders | Used as default for |
|---|---|---|
| `DefaultField` | `<div>` | `fieldComponent` |
| `DefaultLabel` | `<label>` | `labelComponent` |
| `DefaultInput` | `<input>` | `inputComponent` |
| `DefaultMultiline` | `<textarea>` | `multilineComponent` |
| `DefaultSelect` | `<select>` | `selectComponent` |
| `DefaultCheckbox` | `<input>` | `checkboxComponent` |
| `DefaultRadio` | `<input>` | `radioComponent` |
| `DefaultRadioGroup` | `<fieldset>` | `radioGroupComponent` |
| `DefaultRadioLabel` | `<label>` | `radioLabelComponent` |
| `DefaultCheckboxLabel` | `<label>` | `checkboxLabelComponent` |
| `DefaultFieldErrors` | `<div>` | `fieldErrorsComponent` |
| `DefaultFieldError` | `<div>` | `errorComponent` |

### schema-form.tsx

| Default wrapper | Renders | Used as default for |
|---|---|---|
| `DefaultFieldsWrapper` | `<div>` | `fieldsComponent` |
| `DefaultGlobalErrors` | `<div>` | `globalErrorsComponent` |
| `DefaultButton` | `<button>` | `buttonComponent` |

`DefaultFieldError` is imported from `create-field.tsx` and reused as the default for `errorComponent` in `SchemaForm`.

## Rules for Development

### Adding a new component mapping

1. Create a `Default*` forwardRef wrapper at **module scope** in the appropriate file.
2. Use it as the default parameter value — never use a string tag name.
3. If the component will be compared via `child.type ===` in any `mapChildren` callback, write a test verifying plain HTML elements of the same tag are not affected.
4. Update the inventory table in this skill.

### Modifying existing components

- Preserve unique identity. Each default must be its own distinct object, even when multiple defaults render the same HTML tag.
- Keep defaults at module scope. Moving them inside a function creates new references each call, breaking `===` comparisons and causing React remounts.

### Never do

- **Never use a string tag name as a default** — it matches every element of that tag in the tree.
- **Never wrap defaults in `React.memo()`** — memo creates a new wrapper object; `child.type === original` silently fails.
- **Never wrap defaults in `React.lazy()`** — lazy also creates a wrapper that doesn't match the inner component.
- **Never define defaults inside render functions** — new identity each render breaks `===` and causes full remounts.

## User-Facing Guidance

When communicating with users about component customization:

### Passing custom components

- **Recommended**: Pass a React component (function, class, or forwardRef). The `===` comparison is safe because each component has a unique reference.
- **Not recommended**: Pass a string tag name like `"div"`. The comparison becomes ambiguous — any element of that tag in the children function will be matched.
- When a user reports unexpected attributes on their elements, check whether they passed a string for a component prop.

### The React.memo limitation

If a user wraps a custom component in `React.memo()` before passing it, the comparison will fail silently — `memo()` creates a wrapper object that doesn't match the inner component. This is an inherent limitation of the `child.type ===` pattern. Advise users to pass the unwrapped component.

### What users should know

- Components passed to `SchemaForm` (like `inputComponent`, `labelComponent`, etc.) are identified by reference equality in the JSX tree.
- Custom HTML elements of the same tag type as a component prop will not be misidentified — the library's defaults use unique component wrappers.
- When using the children render function pattern (`renderField` or `SchemaForm` children), any component received from the helpers object (e.g. `Label`, `Input`, `Errors`) has special identity that the library uses to inject the right props.

## Diagnosing Issues

When a user reports unexpected HTML attributes (e.g. `role="alert"` on a wrapper div, or `name="..."` on an unrelated input):

1. **Check if they're using the children render function** — this is where `mapChildren` runs and where false matches can occur.
2. **Check if they passed a string for a component prop** — e.g. `fieldErrorsComponent="div"`. This restores the ambiguity the defaults are designed to prevent.
3. **Check if they wrapped a component in `React.memo()`** — this causes false negatives (the component is NOT recognized, so it doesn't receive its intended props).
4. **Check `mapChildren` callbacks** — verify that the `child.type ===` comparison targets the correct variable and that the variable is a unique component reference.
5. **Check for new comparisons** — if someone added a new `child.type ===` check, verify it follows the rules above.

## Testing

For each component compared in `mapChildren`, maintain a regression test that:

1. Renders a Field (or SchemaForm) with a children function.
2. Includes BOTH the library component AND a plain HTML element of the same tag.
3. Asserts the library component receives injected props.
4. Asserts the plain HTML element does NOT receive injected props.

Existing tests live in `create-field.test.tsx` (describe block: "element type comparison safety") and `schema-form.test.tsx` (describe block: "element type comparison safety").
