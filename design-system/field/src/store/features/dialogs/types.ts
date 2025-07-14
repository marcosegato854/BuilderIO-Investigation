import { DialogProps } from '@mui/material'
import { DialogNames } from 'components/dialogs/dialogNames'
import { DeepPartial } from 'redux'

/**
 * TYPES
 */
export interface DialogInfo {
  component: DialogNames
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: any
  dialogProps?: DeepPartial<DialogProps>
  id?: number
}
