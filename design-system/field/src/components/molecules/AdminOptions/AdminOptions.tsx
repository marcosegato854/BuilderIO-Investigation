/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC } from 'react'
import style from 'components/molecules/AdminOptions/AdminOptions.module.scss'
import { Switch } from 'components/atoms/Switch/Switch'
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAdminSettings,
  setAdminSettings,
} from 'store/features/settings/slice'

/**
 * adminAdditionalOptions description
 */
export const AdminOptions: FC = () => {
  const adminSettings = useSelector(selectAdminSettings)
  const dispatch = useDispatch()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...adminSettings }
    switch (event.target.value) {
      case 'hspc':
        newSettings.disableHSPC = !newSettings.disableHSPC
        break
      case 'buffer':
        newSettings.disableBuffer = !newSettings.disableBuffer
        break
      case 'features':
        newSettings.disableFeatures = !newSettings.disableFeatures
        break
      default:
        break
    }
    dispatch(setAdminSettings(newSettings))
  }

  return (
    <div>
      <Typography fontWeight="800">Disable</Typography>
      <FormGroup row={true}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!adminSettings.disableHSPC}
              value="hspc"
              size="small"
              onChange={handleChange}
            />
          }
          label="HSPC"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={!!adminSettings.disableBuffer}
              value="buffer"
              size="small"
              onChange={handleChange}
            />
          }
          label="Buffer"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={!!adminSettings.disableFeatures}
              value="features"
              size="small"
              onChange={handleChange}
            />
          }
          label="Trajectory"
        />
      </FormGroup>
    </div>
  )
}
