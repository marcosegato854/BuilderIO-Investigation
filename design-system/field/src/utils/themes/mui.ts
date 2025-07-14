import { outlinedInputClasses } from '@mui/material/OutlinedInput'
import { createTheme, Theme } from '@mui/material/styles'
import { TypographyOptions } from '@mui/material/styles/createTypography'
import { makeStyles } from '@mui/styles'

export const hexToRgb = (hexString?: string): string => {
  if (!hexString) return '0,0,0'
  const hex = hexString.replace(/[^0-9A-F]/gi, '')
  const bigint = parseInt(hex, 16)
  const red = (bigint >> 16) & 255
  const green = (bigint >> 8) & 255
  const blue = bigint & 255
  return `${red}, ${green}, ${blue}`
}

export const pathDimension = (dimension: number) => dimension * (32 / 24)

declare module '@mui/styles' {
  interface DefaultTheme extends Theme {}
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    caption: true
    containedRed: true
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    colors: {
      primary_1: React.CSSProperties['color']
      primary_2: React.CSSProperties['color']
      primary_3: React.CSSProperties['color']
      primary_4: React.CSSProperties['color']
      primary_5: React.CSSProperties['color']
      primary_6: React.CSSProperties['color']
      primary_7: React.CSSProperties['color']
      primary_8: React.CSSProperties['color']
      primary_9: React.CSSProperties['color']
      primary_10: React.CSSProperties['color']
      primary_11: React.CSSProperties['color']
      primary_12: React.CSSProperties['color']
      primary_13: React.CSSProperties['color']
      primary_14: React.CSSProperties['color']
      primary_15: React.CSSProperties['color']
      primary_16: React.CSSProperties['color']
      primary_17: React.CSSProperties['color']
      primary_18: React.CSSProperties['color']
      primary_19: React.CSSProperties['color']
      primary_20: React.CSSProperties['color']
      primary_21: React.CSSProperties['color']
      primary_22: React.CSSProperties['color']
      primary_23: React.CSSProperties['color']
      primary_24: React.CSSProperties['color']
      secondary_1: React.CSSProperties['color']
      secondary_2: React.CSSProperties['color']
      secondary_3: React.CSSProperties['color']
      secondary_4: React.CSSProperties['color']
      secondary_5: React.CSSProperties['color']
      secondary_6: React.CSSProperties['color']
      secondary_7: React.CSSProperties['color']
      secondary_8: React.CSSProperties['color']
      secondary_9: React.CSSProperties['color']
      secondary_10: React.CSSProperties['color']
      accuracy_bad: React.CSSProperties['color']
      accuracy_average: React.CSSProperties['color']
      accuracy_good: React.CSSProperties['color']
    }
  }

  interface ThemeOptions {
    colors?: {
      primary1?: React.CSSProperties['color']
      primary_2?: React.CSSProperties['color']
      primary_3?: React.CSSProperties['color']
      primary_4?: React.CSSProperties['color']
      primary_5?: React.CSSProperties['color']
      primary_6?: React.CSSProperties['color']
      primary_7?: React.CSSProperties['color']
      primary_8?: React.CSSProperties['color']
      primary_9?: React.CSSProperties['color']
      primary_10?: React.CSSProperties['color']
      primary_11?: React.CSSProperties['color']
      primary_12?: React.CSSProperties['color']
      primary_13?: React.CSSProperties['color']
      primary_14?: React.CSSProperties['color']
      primary_15?: React.CSSProperties['color']
      primary_16?: React.CSSProperties['color']
      primary_17?: React.CSSProperties['color']
      primary_18?: React.CSSProperties['color']
      primary_19?: React.CSSProperties['color']
      primary_20?: React.CSSProperties['color']
      primary_21?: React.CSSProperties['color']
      primary_22?: React.CSSProperties['color']
      primary_23?: React.CSSProperties['color']
      primary_24?: React.CSSProperties['color']
      secondary_1?: React.CSSProperties['color']
      secondary_2?: React.CSSProperties['color']
      secondary_3?: React.CSSProperties['color']
      secondary_4?: React.CSSProperties['color']
      secondary_5?: React.CSSProperties['color']
      secondary_6?: React.CSSProperties['color']
      secondary_7?: React.CSSProperties['color']
      secondary_8?: React.CSSProperties['color']
      secondary_9?: React.CSSProperties['color']
      secondary_10?: React.CSSProperties['color']
      accuracy_bad?: React.CSSProperties['color']
      accuracy_average?: React.CSSProperties['color']
      accuracy_good?: React.CSSProperties['color']
    }
  }

  interface TypographyVariants {
    buttonLabel: React.CSSProperties
    pegasus: React.CSSProperties
    bold: React.CSSProperties
  }

  interface TypographyVariantsOptions {
    buttonLabel?: React.CSSProperties
    pegasus?: React.CSSProperties
    bold?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    buttonLabel: true
    pegasus: true
  }
}

const zIndex = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  snackbar: 1450,
  modal: 1410,
  tooltip: 1500,
}

const typography: TypographyOptions = {
  fontSize: 25,
  caption: {
    fontSize: '1.2rem',
    fontWeight: 300,
    textTransform: 'none',
  },
  buttonLabel: {
    fontSize: '1.4rem',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  pegasus: {
    fontSize: '1.2rem',
    fontWeight: 400,
    fontStyle: 'normal',
    lineHeight: '2em',
    letterSpacing: '1.4em',
  },
  h1: {
    fontSize: '4.8rem',
    fontWeight: 300,
  },
  h2: {
    fontSize: '4rem',
    fontWeight: 300,
  },
  h3: {
    fontSize: '3.2rem',
    fontWeight: 400,
  },
  h4: {
    fontSize: '3.2rem',
    fontWeight: 300,
  },
  h5: {
    fontSize: '2rem',
    fontWeight: 400,
  },
  h6: {
    fontSize: '2rem',
    fontWeight: 300,
  },
  body1: {
    fontSize: '1.6rem',
    fontWeight: 400,
  },
  body2: {
    fontSize: '1.4rem',
    fontWeight: 300,
  },
  bold: {
    fontWeight: 700,
  },
}

const mainTheme = createTheme({
  zIndex,
  typography,
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableTouchRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          boxShadow: 'none',
          ...theme.typography.buttonLabel,
        }),
        containedPrimary: ({ theme }) => ({
          backgroundColor: `rgba(${hexToRgb(theme.colors.primary_11)}, 0.85)`,
          color: theme.colors.primary_1,
          '&:hover': {
            color: theme.colors.primary_1,
            backgroundColor: `rgba(${hexToRgb(theme.colors.primary_11)}, 1)`,
          },
          '&.Mui-disabled': {
            backgroundColor: `rgba(${hexToRgb(theme.colors.primary_11)}, 0.60)`,
            color: `rgba(${hexToRgb(theme.colors.primary_1)}, 0.60)`,
          },
        }),
      },
      variants: [
        {
          props: { variant: 'caption' },
          style: ({ theme }) => ({
            ...theme.typography.caption,
          }),
        },
        {
          props: { variant: 'containedRed' },
          style: ({ theme }) => ({
            color: theme.colors.primary_18,
            backgroundColor: `rgba(${hexToRgb(
              theme.colors.secondary_5
            )}, 0.85)`,
            '&:hover': {
              color: theme.colors.primary_18,
              backgroundColor: `rgba(${hexToRgb(theme.colors.secondary_5)}, 1)`,
            },
          }),
        },
      ],
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.colors.primary_11,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'transparent',
          borderRadius: '11px',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.colors.primary_11,
          '&:hover:not(.Mui-disabled, .Mui-error):before': {
            borderColor: 'inherit',
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: `rgba(${hexToRgb(theme.colors.primary_11)}, 0.85)`,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.colors.primary_11,
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: theme.colors.primary_11,
          },
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: 'transparent',
          borderRadius: '11px',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        disableUnderline: true,
        variant: 'standard',
      },
      styleOverrides: {
        select: ({ theme }) => ({
          fontSize: '1.6rem',
          width: 120,
          borderRadius: 6,
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: theme.colors.primary_4,
          color: theme.colors.primary_11,
          '& svg': {
            path: {
              fill: theme.colors.primary_11,
            },
          },
        }),
        icon: ({ theme }) => ({
          color: theme.colors.primary_11,
        }),
      },
    },
    MuiSlider: {
      styleOverrides: {
        mark: {
          display: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 28,
          color: theme.colors.primary_11,
        }),
        indicator: ({ theme }) => ({
          minWidth: 0,
          backgroundColor: theme.colors.secondary_5,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 0,
          border: 0,
          margin: '0 12px 2px 12px',
          minHeight: '24px',
          width: 'auto',
          minWidth: 0,
          textTransform: 'capitalize',
          color: `rgba(${hexToRgb(theme.colors.primary_11)}, 0.7)`,
          '&.Mui-selected': {
            color: `rgba(${hexToRgb(theme.colors.primary_11)}, 1)`,
          },
        }),
        wrapped: {
          padding: 0,
          border: 0,
          margin: 0,
        },
      },
    },
  },
})

const lightPaletteTheme = createTheme(mainTheme, {
  colors: {
    primary_1: '#ffffff',
    primary_2: '#fafafa',
    primary_3: '#242424',
    primary_4: '#f5f5f5',
    primary_5: '#bdbdbd',
    primary_6: '#9e9e9e',
    primary_7: '#b5b5b5',
    primary_8: '#bcbec5',
    primary_9: '#e0e0e0',
    primary_10: '#ffffff',
    primary_11: '#000000',
    primary_12: '#3a3a3a',
    primary_13: '#424242',
    primary_14: '#393f48',
    primary_15: '#f5f5f5',
    primary_16: '#9e9e9e',
    primary_17: '#ffffff',
    primary_18: '#ffffff',
    primary_19: '#fafafa',
    primary_20: '#fafafa',
    primary_21: '#9e9e9e',
    primary_22: '#424242',
    primary_23: '#393f48',
    primary_24: '#787878',
    secondary_1: '#f2d83b',
    secondary_2: '#146f84',
    secondary_3: '#52e7ff',
    secondary_4: '#2ebe9f',
    secondary_5: '#e00c0c',
    secondary_6: '#e72d31',
    secondary_7: '#be5050',
    secondary_8: '#1db0ff',
    secondary_9: '#98bf67',
    secondary_10: '#ffc120',
    // RTK / GDOP accuracy values
    accuracy_bad: '#ff0000',
    accuracy_average: '#ffff00',
    accuracy_good: '#00ff00',
  },
  palette: {
    mode: 'light',
    // we're not handling MUI color standards
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#3a3a3a',
    },
    error: {
      main: '#e72d31',
    },
  },
})

const darkPaletteTheme = createTheme(mainTheme, {
  colors: {
    primary_1: '#000000',
    primary_2: '#121212',
    primary_3: '#242424',
    primary_4: '#5b6370',
    primary_5: '#30353b',
    primary_6: '#282d33',
    primary_7: '#b5b5b5',
    primary_8: '#bcbec5',
    primary_9: '#e0e0e0',
    primary_10: '#393f48',
    primary_11: '#ffffff',
    primary_12: '#3a3a3a',
    primary_13: '#c4c4c4',
    primary_14: '#393f48',
    primary_15: '#282d33',
    primary_16: '#9e9e9e',
    primary_17: '#242424',
    primary_18: '#ffffff',
    primary_19: '#393f48',
    primary_20: '#242424',
    primary_21: '#9e9e9e',
    primary_22: '#424242',
    primary_23: '#303030',
    primary_24: '#787878',
    secondary_1: '#f2d83b',
    secondary_2: '#146f84',
    secondary_3: '#52e7ff',
    secondary_4: '#2ebe9f',
    secondary_5: '#e00c0c',
    secondary_6: '#e72d31',
    secondary_7: '#be5050',
    secondary_8: '#1db0ff',
    secondary_9: '#98bf67',
    secondary_10: '#ffc120',
    // RTK / GDOP accuracy values
    accuracy_bad: '#ff0000',
    accuracy_average: '#ffff00',
    accuracy_good: '#00ff00',
  },
  palette: {
    mode: 'dark',
    // we're not handling MUI color standards
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#3a3a3a',
    },
    error: {
      main: '#e72d31',
    },
  },
})

export const lightTheme = createTheme(lightPaletteTheme, {})

export const darkTheme = createTheme(darkPaletteTheme, {
  /* components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: darkPaletteTheme.colors.primary_11,
          },
          [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: darkPaletteTheme.colors.primary_11,
          },
        },
        notchedOutline: {
          color: darkPaletteTheme.colors.primary_11,
        },
      },
    },
  }, */
})

export function getThemeByName(theme: string): Theme {
  return themeMap[theme]
}

const themeMap: { [key: string]: Theme } = {
  light: lightTheme,
  dark: darkTheme,
}

export const useMUIStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 6,
    marginTop: 0,
  },
  list: {
    padding: 8,
    background: theme.colors.primary_4,
    color: theme.colors.primary_11,
    '& li': {
      padding: 8,
      borderRadius: 6,
      fontSize: '1.6rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    '& li:hover': {
      background: '#FFFFFF1A',
    },
    '& li.Mui-selected': {
      background: 'transparent',
    },
    '& li.Mui-selected:hover': {
      background: '#FFFFFF1A',
    },
  },
}))
