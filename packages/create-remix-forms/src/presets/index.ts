import type { PresetConfig, PresetName } from '../types'
import { daisyui } from './daisyui'
import { tailwind } from './tailwind'

const presets: Record<PresetName, PresetConfig> = {
  tailwind,
  daisyui,
}

const presetNames = Object.keys(presets) as PresetName[]

function getPreset(name: PresetName): PresetConfig {
  return presets[name]
}

export { presets, presetNames, getPreset }
