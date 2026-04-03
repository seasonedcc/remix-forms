import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { generate } from './generate'
import { slotDefinitions } from './presets/shared'
import type { PresetName } from './types'

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'create-remix-forms-'))
}

function cleanup(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true })
}

describe('generate', () => {
  const presets: PresetName[] = ['daisyui', 'tailwind']
  let tempDir: string

  afterEach(() => {
    if (tempDir) cleanup(tempDir)
  })

  for (const preset of presets) {
    describe(preset, () => {
      it('creates the expected number of files', () => {
        tempDir = makeTempDir()
        const outputDir = path.join(tempDir, 'schema-form')
        const files = generate({ preset, outputDir })

        // 27 component files + 1 barrel
        expect(files).toHaveLength(slotDefinitions.length + 1)
      })

      it('creates all component files and the barrel', () => {
        tempDir = makeTempDir()
        const outputDir = path.join(tempDir, 'schema-form')
        generate({ preset, outputDir })

        for (const slot of slotDefinitions) {
          const filePath = path.join(outputDir, slot.fileName)
          expect(fs.existsSync(filePath)).toBe(true)
        }
        expect(fs.existsSync(path.join(outputDir, 'index.ts'))).toBe(true)
      })

      it('barrel imports all components and calls makeSchemaForm', () => {
        tempDir = makeTempDir()
        const outputDir = path.join(tempDir, 'schema-form')
        generate({ preset, outputDir })

        const barrel = fs.readFileSync(
          path.join(outputDir, 'index.ts'),
          'utf-8'
        )
        expect(barrel).toContain("import { makeSchemaForm } from 'remix-forms'")
        expect(barrel).toContain('export { SchemaForm }')

        for (const slot of slotDefinitions) {
          expect(barrel).toContain(`import ${slot.exportName} from`)
          expect(barrel).toContain(`${slot.slotName}: ${slot.exportName}`)
        }
      })

      it('creates the output directory recursively', () => {
        tempDir = makeTempDir()
        const outputDir = path.join(tempDir, 'deep', 'nested', 'schema-form')
        const files = generate({ preset, outputDir })
        expect(files.length).toBeGreaterThan(0)
        expect(fs.existsSync(outputDir)).toBe(true)
      })
    })
  }
})

describe('generate (daisyui-specific)', () => {
  let tempDir: string

  afterEach(() => {
    if (tempDir) cleanup(tempDir)
  })

  it('uses DaisyUI classes in input component', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const input = fs.readFileSync(path.join(outputDir, 'input.tsx'), 'utf-8')
    expect(input).toContain('input input-bordered w-full')
  })

  it('uses DaisyUI classes in button component', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const button = fs.readFileSync(path.join(outputDir, 'button.tsx'), 'utf-8')
    expect(button).toContain('btn btn-primary')
  })

  it('uses twMerge for className merging', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const input = fs.readFileSync(path.join(outputDir, 'input.tsx'), 'utf-8')
    expect(input).toContain("import { twMerge } from 'tailwind-merge'")
    expect(input).toContain('twMerge(')
  })
})

describe('generate (tailwind-specific)', () => {
  let tempDir: string

  afterEach(() => {
    if (tempDir) cleanup(tempDir)
  })

  it('uses plain Tailwind classes instead of DaisyUI', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'tailwind', outputDir })

    const input = fs.readFileSync(path.join(outputDir, 'input.tsx'), 'utf-8')
    expect(input).not.toContain('input input-bordered')
    expect(input).toContain('rounded-md')
    expect(input).toContain('border-gray-300')
  })

  it('uses text-red-600 instead of text-error', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'tailwind', outputDir })

    const error = fs.readFileSync(path.join(outputDir, 'error.tsx'), 'utf-8')
    expect(error).not.toContain('text-error')
    expect(error).toContain('text-red-600')
  })
})

describe('generate (component patterns)', () => {
  let tempDir: string

  afterEach(() => {
    if (tempDir) cleanup(tempDir)
  })

  it('form component uses ReactRouterForm alias', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const form = fs.readFileSync(path.join(outputDir, 'form.tsx'), 'utf-8')
    expect(form).toContain(
      "import { Form as ReactRouterForm } from 'react-router'"
    )
    expect(form).toContain('<ReactRouterForm')
  })

  it('input uses forwardRef with HTMLInputElement', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const input = fs.readFileSync(path.join(outputDir, 'input.tsx'), 'utf-8')
    expect(input).toContain('React.forwardRef<')
    expect(input).toContain('HTMLInputElement')
    expect(input).toContain("type = 'text'")
  })

  it('multiline uses forwardRef with HTMLTextAreaElement', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const multiline = fs.readFileSync(
      path.join(outputDir, 'multiline.tsx'),
      'utf-8'
    )
    expect(multiline).toContain('HTMLTextAreaElement')
    expect(multiline).toContain('<textarea')
    expect(multiline).toContain('rows={5}')
  })

  it('select uses forwardRef with HTMLSelectElement', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const select = fs.readFileSync(path.join(outputDir, 'select.tsx'), 'utf-8')
    expect(select).toContain('HTMLSelectElement')
    expect(select).toContain('<select')
  })

  it('add/remove buttons have type="button"', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const add = fs.readFileSync(path.join(outputDir, 'add-button.tsx'), 'utf-8')
    const remove = fs.readFileSync(
      path.join(outputDir, 'remove-button.tsx'),
      'utf-8'
    )
    expect(add).toContain("type = 'button'")
    expect(remove).toContain("type = 'button'")
  })

  it('label does not include linter-specific comments', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const label = fs.readFileSync(path.join(outputDir, 'label.tsx'), 'utf-8')
    expect(label).not.toContain('biome-ignore')
  })

  it('submit button is wrapped in a div', () => {
    tempDir = makeTempDir()
    const outputDir = path.join(tempDir, 'schema-form')
    generate({ preset: 'daisyui', outputDir })

    const button = fs.readFileSync(path.join(outputDir, 'button.tsx'), 'utf-8')
    expect(button).toContain('<div className="flex justify-end">')
    expect(button).toContain('<button')
  })
})
