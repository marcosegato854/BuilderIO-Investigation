import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as Emotion10ThemeProvider } from 'emotion-theming'
import useTheme from 'hooks/useTheme'
import { getThemeByName } from 'utils/themes/mui'

const MaterialUIThemeProvider: React.FC = ({ children }) => {
  const [themeName] = useTheme()
  const theme = getThemeByName(themeName)
  return (
    <Emotion10ThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Emotion10ThemeProvider>
  )
}

export default MaterialUIThemeProvider
