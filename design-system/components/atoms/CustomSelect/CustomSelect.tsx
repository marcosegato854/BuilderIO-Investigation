/* eslint-disable react/jsx-curly-newline */
import { Select, SelectChangeEvent, SelectProps, useTheme } from '@mui/material'
import { useMUIStyles } from 'utils/themes/mui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomSelect = (props: SelectProps<any>) => {
  const theme = useTheme()
  const classes = useMUIStyles(theme)
  const menuProps = {
    classes: {
      paper: classes.paper,
      list: classes.list,
    },
  }
  return (
    <Select
      variant="standard"
      disableUnderline
      {...props}
      MenuProps={menuProps}
    />
  )
}
