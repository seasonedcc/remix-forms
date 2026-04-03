import * as fs from 'node:fs'
import * as path from 'node:path'
import * as p from '@clack/prompts'
import { Command } from 'commander'
import { generate } from './generate'
import { presetNames } from './presets/index'
import { installDependencies } from './presets/install'
import type { PresetName } from './types'

const version = '0.1.0'

type Options = {
  preset?: string
  output: string
  yes?: boolean
}

const program = new Command()
  .name('create-remix-forms')
  .description('Scaffold styled components for remix-forms')
  .version(version)
  .option('--preset <name>', 'Preset to use: tailwind | daisyui')
  .option(
    '--output <path>',
    'Output directory for generated components',
    './app/ui/schema-form'
  )
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (options: Options) => {
    p.intro('create-remix-forms')

    let preset: PresetName

    if (options.preset && presetNames.includes(options.preset as PresetName)) {
      preset = options.preset as PresetName
    } else {
      const result = await p.select({
        message: 'Which preset would you like to use?',
        options: [
          {
            value: 'tailwind' as const,
            label: 'Tailwind CSS',
            hint: 'Plain utility classes',
          },
          {
            value: 'daisyui' as const,
            label: 'DaisyUI',
            hint: 'Tailwind + DaisyUI component classes',
          },
        ],
      })
      if (p.isCancel(result)) {
        p.cancel('Cancelled.')
        process.exit(0)
      }
      preset = result
    }

    let outputDir = options.output

    if (!options.preset) {
      const result = await p.text({
        message: 'Where should we create the components?',
        placeholder: './app/ui/schema-form',
        defaultValue: outputDir,
        validate: (v) => {
          if (!v.trim()) return 'Path cannot be empty'
        },
      })
      if (p.isCancel(result)) {
        p.cancel('Cancelled.')
        process.exit(0)
      }
      outputDir = result
    }

    const resolved = path.resolve(outputDir)
    if (fs.existsSync(resolved) && !options.yes) {
      const overwrite = await p.confirm({
        message: `Directory ${outputDir} already exists. Overwrite?`,
      })
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Cancelled.')
        process.exit(0)
      }
    }

    const s = p.spinner()

    s.start('Installing remix-forms and tailwind-merge...')
    try {
      installDependencies(process.cwd())
      s.stop('Installed remix-forms and tailwind-merge')
    } catch {
      s.stop('Could not auto-install dependencies')
      p.log.warn(
        'Please install manually: npm install remix-forms tailwind-merge'
      )
    }

    s.start('Generating components...')
    const files = generate({ preset, outputDir })
    s.stop(`Created ${files.length} files in ${outputDir}`)

    p.note(`import { SchemaForm } from '${outputDir}'`, 'Next step')

    p.outro('Done! Happy form building.')
  })

program.parse()
