import { startCase } from './startCase'

function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}

export { inferLabel }
