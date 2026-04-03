import * as fs from 'node:fs'
import * as path from 'node:path'
import { renderBarrel } from './presets/barrel'
import { getPreset } from './presets/index'
import { slotDefinitions } from './presets/shared'
import { renderSlot } from './presets/templates'
import type { PresetName } from './types'

type GenerateOptions = {
  preset: PresetName
  outputDir: string
}

function generate({ preset, outputDir }: GenerateOptions): string[] {
  const config = getPreset(preset)
  const resolvedDir = path.resolve(outputDir)
  const createdFiles: string[] = []

  fs.mkdirSync(resolvedDir, { recursive: true })

  for (const slot of slotDefinitions) {
    const filePath = path.join(resolvedDir, slot.fileName)
    const content = renderSlot(slot, config.classes)
    fs.writeFileSync(filePath, content, 'utf-8')
    createdFiles.push(filePath)
  }

  const barrelPath = path.join(resolvedDir, 'index.ts')
  const barrelContent = renderBarrel(slotDefinitions)
  fs.writeFileSync(barrelPath, barrelContent, 'utf-8')
  createdFiles.push(barrelPath)

  return createdFiles
}

export { generate }
export type { GenerateOptions }
