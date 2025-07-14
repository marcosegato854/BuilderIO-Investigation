import { styled } from '@mui/material'
import CustomSwitch from '@mui/material/Switch'
import { ThemeProvider } from '@mui/system'
import React, { FC, PropsWithChildren } from 'react'
import { darkTheme } from 'utils/themes/mui'

export interface ISwitchProps {
  /**
   * Name attribute of the input
   */
  name?: string
  /**
   *  Checkbox onChange function
   */
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void
  /**
   *  Whether the checkbox is checked or not
   */
  checked?: boolean
  /**
   *  Whether the checkbox is disabled or not
   */
  disabled?: boolean
}

const MuiSwitch = styled(CustomSwitch)(({ theme }) => ({
  width: 76,
  height: 30,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 1,
    '&.Mui-checked': {
      transform: 'translateX(38px)',
      color: theme.colors.primary_11,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.colors.secondary_9,
        opacity: 1,
        border: 'none',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    borderRadius: 10,
    width: 37,
    height: 28,
    backgroundColor: theme.colors.primary_11,
  },
  '& .MuiSwitch-track': {
    borderRadius: 10,
    backgroundColor: theme.colors.primary_4,
    opacity: 1,
    transition: theme.transitions.create(['background-color']),
  },
}))

/**
 * Styled on/off switch
 */
export const Switch: FC<ISwitchProps> = ({
  name,
  onChange,
  checked,
  disabled,
}: PropsWithChildren<ISwitchProps>) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <MuiSwitch
        checked={checked}
        // eslint-disable-next-line no-shadow
        onChange={(event, checked) => onChange && onChange(event, checked)}
        name={name}
        data-testid="mui-switch"
        disabled={disabled || false}
      />
    </ThemeProvider>
  )
}
