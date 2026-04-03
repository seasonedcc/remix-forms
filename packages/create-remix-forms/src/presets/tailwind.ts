import type { PresetConfig } from '../types'

const tailwind: PresetConfig = {
  name: 'tailwind',
  displayName: 'Tailwind CSS',
  description: 'Plain Tailwind CSS utility classes',
  classes: {
    form: 'flex flex-col gap-6',
    fields: 'flex flex-col gap-6',
    field: 'flex flex-col gap-2',
    label: 'text-sm font-semibold text-gray-700',
    input:
      'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    multiline:
      'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    select:
      'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    checkbox:
      'size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
    fileInput:
      'w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-l-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100',
    radio: 'size-4 border-gray-300 text-blue-600 focus:ring-blue-500',
    radioGroup: 'flex gap-4',
    radioLabel: 'flex cursor-pointer items-center gap-2 text-sm',
    checkboxLabel: 'flex cursor-pointer items-center gap-2 text-sm',
    fieldErrors: 'flex flex-col gap-1 text-center',
    globalErrors: 'flex flex-col gap-1 text-center',
    error: 'text-sm text-red-600',
    button:
      'rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50',
    buttonWrapper: 'flex justify-end',
    scalarArrayField: 'flex flex-1 flex-col gap-2',
    scalarArrayItem: 'flex items-center gap-2',
    objectArrayItem: 'flex flex-col gap-2',
    arrayArrayItem: 'flex flex-col gap-2',
    addButton:
      'mt-2 self-start rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50',
    removeButton:
      'rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50',
    arrayEmpty: 'py-2 text-sm text-gray-400',
    arrayTitle: 'text-sm font-semibold text-gray-700',
    objectTitle: 'text-sm font-semibold text-gray-700',
    objectFields: 'flex flex-col gap-4 border-l-2 border-gray-200 pl-4',
  },
}

export { tailwind }
