import type { SlotDefinition } from '../types'

function renderBarrel(slots: SlotDefinition[]): string {
  const sorted = [...slots].sort((a, b) => a.fileName.localeCompare(b.fileName))

  const imports = sorted
    .map((s) => {
      const moduleName = s.fileName.replace('.tsx', '')
      return `import ${s.exportName} from './${moduleName}'`
    })
    .join('\n')

  const entries = slots
    .map((s) => `  ${s.slotName}: ${s.exportName},`)
    .join('\n')

  return `import { makeSchemaForm } from 'remix-forms'
${imports}

const SchemaForm = makeSchemaForm({
${entries}
})

export { SchemaForm }
`
}

export { renderBarrel }
