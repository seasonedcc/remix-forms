import startCase from './startCase'

export default function inferLabel(fieldName: string) {
  return startCase(fieldName).replace(/Url/g, 'URL')
}
