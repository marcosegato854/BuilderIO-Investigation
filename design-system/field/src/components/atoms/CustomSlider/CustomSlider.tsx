/* eslint-disable react/jsx-curly-newline */
import { Box, Slider, SliderThumb, styled } from '@mui/material'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { darkTheme } from 'utils/themes/mui'
import style from './CustomSlider.module.scss'
import { ThemeProvider } from '@mui/system'

export interface ICustomSliderProps {
  /**
   * Measurement unit of the value. E.g. Km/h, m/s, Hz...
   */
  unit?: string
  /**
   * Value of the slider
   */
  value?: number
  /**
   * Minimum value
   */
  min?: number
  /**
   * Maximum value
   */
  max?: number
  /**
   * Step
   */
  step?: number | null

  /**
   * Marks indicate predetermined values to which the user can move the slider. If true the marks are spaced according the value of the step prop. If an array, it should contain objects with value and an optional label keys.
   * */
  marks?: { label?: string; value: number }[] | boolean
  /**
   * Disabled
   */
  disabled?: boolean
  /**
   * Fired whenever the there's a change of the value
   */
  // onChange?: (event: object, value: number | number[]) => void
  // /**
  //  * Fired when finishing sliding and releasing mouse ("mouseup")
  //  */
  onChangeCommitted?: (event: object, value: number | number[]) => void
  /**
   * Any other props passed by the parent
   */
  // props: any
}
const TrkSlider = styled(Slider)(({ theme }) => ({
  padding: 0,
  color: 'transparent',
  height: 30,
  '@media(pointer:coarse)': {
    padding: 0,
  },
  '& .MuiSlider-track': {
    height: 30,
    borderRadius: 10,
  },
  '& .MuiSlider-thumb': {
    height: 26,
    width: 80,
    borderRadius: 8,
    backgroundColor: theme.colors.primary_11,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
    '& .content': {
      color: theme.colors.primary_1,
      fontSize: 16,
    },
  },
  '& .MuiSlider-rail': {
    color: theme.colors.primary_3,
    opacity: 1,
    height: 30,
    borderRadius: 10,
    paddingRight: 40,
    paddingLeft: 40,
    marginLeft: -40,
    backgroundColor: theme.colors.primary_3,
  },
  '&.Mui-disabled': {
    color: 'transparent',
    '& .MuiSlider-thumb': {
      opacity: 0.7,
    },
  },
}))

interface renderThumbComponentProps extends React.HTMLAttributes<unknown> {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderThumbComponent = (unit: string) => (props: any) => {
  const { children, ...other } = props
  const { 'aria-valuenow': value } = children.props
  return (
    <SliderThumb {...other}>
      {children}
      <span className="content">{value || 0}</span>
      <span className="content">{unit}</span>
    </SliderThumb>
  )
}

/**
 * Custom slider
 */
export const CustomSlider: FC<ICustomSliderProps> = ({
  unit = '',
  value,
  min,
  max,
  step,
  marks,
  disabled,
  // onChange,
  onChangeCommitted,
}: // props
PropsWithChildren<ICustomSliderProps>) => {
  const [internalValue, setInternalValue] = useState<
    number | number[] | undefined
  >(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedRenderFunc = useCallback(renderThumbComponent(unit), [unit])

  return (
    <Box
      component="div"
      sx={{ width: '100%', padding: '0 40px' }}
      // this class is added for compatibility with the tests
      // TODO find a correct way to read MUI properties
      className={disabled ? 'disabled' : ''}
    >
      <ThemeProvider theme={darkTheme}>
        <TrkSlider
          slots={{
            thumb: memoizedRenderFunc,
          }}
          data-testid="custom-slider"
          value={internalValue}
          disabled={disabled}
          disableSwap={disabled}
          onChangeCommitted={(event, newValue) => {
            return onChangeCommitted && onChangeCommitted(event, newValue)
          }}
          onChange={(event, newValue) => {
            return setInternalValue(newValue)
          }}
          min={min}
          max={max}
          step={step}
          marks={marks}
          size="small"
        />
      </ThemeProvider>
    </Box>
  )
}
