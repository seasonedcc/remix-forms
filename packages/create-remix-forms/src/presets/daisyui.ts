import type { PresetConfig } from '../types'

const daisyui: PresetConfig = {
  name: 'daisyui',
  displayName: 'DaisyUI',
  description: 'Tailwind CSS + DaisyUI component classes',
  classes: {
    form: 'flex flex-col gap-6',
    fields: 'flex flex-col gap-6',
    field: 'flex flex-col gap-2',
    label: 'label',
    input: 'input input-bordered w-full',
    multiline: 'textarea textarea-bordered w-full',
    select: 'select select-bordered w-full',
    checkbox: 'checkbox checkbox-primary',
    fileInput: 'file-input file-input-bordered w-full',
    radio: 'radio radio-primary',
    radioGroup: 'flex gap-4',
    radioLabel: 'label flex cursor-pointer items-center gap-2',
    checkboxLabel: 'label flex cursor-pointer items-center gap-2',
    fieldErrors: 'flex flex-col gap-2 text-center',
    globalErrors: 'flex flex-col gap-2 text-center',
    error: 'text-error text-sm',
    button: 'btn btn-primary',
    buttonWrapper: 'flex justify-end',
    scalarArrayField: 'flex flex-1 flex-col gap-2',
    scalarArrayItem: 'flex items-center gap-2',
    objectArrayItem: 'flex flex-col gap-2',
    arrayArrayItem: 'flex flex-col gap-2',
    addButton: 'btn btn-outline btn-sm mt-2 self-start',
    removeButton: 'btn btn-ghost btn-sm text-error',
    arrayEmpty: 'py-2 text-base-content/50 text-sm',
    arrayTitle: 'label',
    objectTitle: 'label',
    objectFields: 'flex flex-col gap-4 border-l-2 border-base-100 pl-4',
  },
}

export { daisyui }
