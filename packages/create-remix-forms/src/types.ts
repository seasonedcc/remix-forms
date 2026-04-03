type PresetName = 'tailwind' | 'daisyui'

type SlotName =
  | 'form'
  | 'fields'
  | 'field'
  | 'label'
  | 'input'
  | 'multiline'
  | 'select'
  | 'checkbox'
  | 'fileInput'
  | 'radio'
  | 'radioGroup'
  | 'radioLabel'
  | 'checkboxLabel'
  | 'fieldErrors'
  | 'globalErrors'
  | 'error'
  | 'button'
  | 'scalarArrayField'
  | 'scalarArrayItem'
  | 'objectArrayItem'
  | 'arrayArrayItem'
  | 'addButton'
  | 'removeButton'
  | 'arrayEmpty'
  | 'arrayTitle'
  | 'objectTitle'
  | 'objectFields'

type SlotPattern =
  | 'forwardRef-input'
  | 'forwardRef-textarea'
  | 'forwardRef-select'
  | 'forwardRef-div'
  | 'forwardRef-button'
  | 'function-div'
  | 'function-label'
  | 'function-fieldset'
  | 'form'
  | 'button-wrapped'

type SlotDefinition = {
  slotName: SlotName
  fileName: string
  exportName: string
  pattern: SlotPattern
  defaultProps?: Record<string, string>
}

type ClassMap = Record<SlotName, string>

type ButtonClassMap = ClassMap & { buttonWrapper: string }

type PresetConfig = {
  name: PresetName
  displayName: string
  description: string
  classes: ButtonClassMap
}

type SlotTemplate = {
  fileName: string
  content: string
}

export type {
  PresetName,
  SlotName,
  SlotPattern,
  SlotDefinition,
  ClassMap,
  ButtonClassMap,
  PresetConfig,
  SlotTemplate,
}
