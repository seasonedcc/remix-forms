import { startCase } from 'lodash/fp'

export default function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}
