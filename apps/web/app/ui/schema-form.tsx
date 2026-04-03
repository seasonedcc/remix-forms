import { makeSchemaForm } from 'remix-forms'
import AddButton from './add-button'
import ArrayArrayItem from './array-array-item'
import ArrayEmpty from './array-empty'
import ArrayTitle from './array-title'
import Checkbox from './checkbox'
import CheckboxLabel from './checkbox-label'
import Error from './error'
import Errors from './errors'
import Field from './field'
import Fields from './fields'
import FileInput from './file-input'
import Input from './input'
import Label from './label'
import ObjectArrayItem from './object-array-item'
import ObjectFields from './object-fields'
import ObjectTitle from './object-title'
import Radio from './radio'
import RadioGroup from './radio-group'
import RadioLabel from './radio-label'
import RemoveButton from './remove-button'
import ScalarArrayField from './scalar-array-field'
import ScalarArrayItem from './scalar-array-item'
import Select from './select'
import StyledForm from './styled-form'
import SubmitButton from './submit-button'
import TextArea from './text-area'

const SchemaForm = makeSchemaForm({
  form: StyledForm,
  fields: Fields,
  field: Field,
  label: Label,
  input: Input,
  fileInput: FileInput,
  multiline: TextArea,
  select: Select,
  radio: Radio,
  radioGroup: RadioGroup,
  radioLabel: RadioLabel,
  checkboxLabel: CheckboxLabel,
  checkbox: Checkbox,
  button: SubmitButton,
  globalErrors: Errors,
  error: Error,
  scalarArrayField: ScalarArrayField,
  scalarArrayItem: ScalarArrayItem,
  objectArrayItem: ObjectArrayItem,
  arrayArrayItem: ArrayArrayItem,
  addButton: AddButton,
  removeButton: RemoveButton,
  arrayEmpty: ArrayEmpty,
  objectFields: ObjectFields,
  arrayTitle: ArrayTitle,
  objectTitle: ObjectTitle,
})

export { SchemaForm }
