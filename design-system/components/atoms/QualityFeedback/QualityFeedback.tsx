/* eslint-disable react/no-array-index-key */
import { Grid, TextField } from '@mui/material'
import classNames from 'classnames'
import useSelectOnFocus from 'hooks/useSelectOnFocus'
import React, { FC, PropsWithChildren, useEffect } from 'react'

import style from './QualityFeedback.module.scss'

export interface IQualityFeedbackProps {
  /**
   * Measurement unit of the value. E.g. Km/h, m/s, Hz...
   */
  unit: string
  /**
   * Value of the slider
   */
  value: number[]
  /**
   * Minimum value
   */
  min?: number
  /**
   * Maximum value
   */
  max?: number
  /**
   * Fired whenever the there's a change of the value
   */
  onChangeCommitted?: (value: number[]) => void
}

const STEPS = Array(9).fill(-1)
const accuracyLevels = [0, 0, 0, 1, 1, 1, 2, 2, 2]

/**
 * QualityFeedback description
 */
export const QualityFeedback: FC<IQualityFeedbackProps> = ({
  unit,
  value,
  min,
  max,
  onChangeCommitted,
}: PropsWithChildren<IQualityFeedbackProps>) => {
  const minRef = useSelectOnFocus()
  const maxRef = useSelectOnFocus()
  // const minRef = useRef<HTMLInputElement>()
  // const maxRef = useRef<HTMLInputElement>()

  /**
   * value change handler
   */
  // const changeHandler = (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const changeHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    /** force integers */
    const inputValue = Number(e.target.value)
    const roundValue = Math.round(inputValue)
    if (roundValue !== inputValue) {
      e.target.value = roundValue.toString()
    }
    if (!maxRef.current) return
    if (!minRef.current) return
    /** force max value greater than minvalue */
    if (Number(minRef.current?.value) >= Number(maxRef.current?.value)) {
      maxRef.current.value = (Number(minRef.current?.value) + 1).toString()
    }
    /** force min value greater than min param */
    if (min) {
      if (Number(minRef.current?.value) < min) {
        minRef.current.value = min.toString()
      }
      /** force min value lower than max param */
      if (max) {
        if (Number(minRef.current?.value) >= max) {
          minRef.current.value = (max - 1).toString()
        }
      }
    }
    /** force min value greater than min param */
    if (max) {
      if (Number(maxRef.current?.value) > max) {
        maxRef.current.value = max.toString()
      }
    }
    /** callback */
    const newValue = [
      Math.round(Number(minRef.current?.value)),
      Math.round(Number(maxRef.current?.value)),
    ]
    onChangeCommitted && onChangeCommitted(newValue)
  }

  useEffect(() => {
    if (maxRef.current && minRef.current && value?.length === 2) {
      minRef.current.value = Math.round(value[0]).toString()
      maxRef.current.value = Math.round(value[1]).toString()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <div className={style.container}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Grid container spacing={0} className={style.rowSteps}>
            {STEPS.map((v, i) => {
              const accuracyClass = style[`accuracy-${accuracyLevels[i]}`]
              return (
                <Grid item xs key={`step-${i}`} className={accuracyClass} />
              )
            })}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={0} className={style.rowValues}>
            {STEPS.map((v, i) => {
              return (
                <Grid item xs key={i}>
                  <div>&nbsp;</div>
                </Grid>
              )
            })}
          </Grid>
        </Grid>
      </Grid>
      <div className={classNames([style.inputField, style.min])}>
        <TextField
          id="min-input"
          // defaultValue={value ? value[0] : undefined}
          // use uncontrolled version here, otherwise is tricky to handle updates and events
          // value={value[0]}
          type="number"
          inputProps={{
            'data-testid': 'min-input',
          }}
          inputRef={minRef}
          onChange={changeHandler}
          value={value ? value[0] : undefined}
          size="small"
        />
      </div>
      <div className={classNames([style.inputField, style.max])}>
        <TextField
          id="max-input"
          // defaultValue={value ? value[1] : undefined}
          // use uncontrolled version here, otherwise is tricky to handle updates and events
          // value={value[1]}
          type="number"
          inputProps={{
            'data-testid': 'max-input',
          }}
          inputRef={maxRef}
          onBlur={changeHandler}
          value={value ? value[1] : undefined}
          size="small"
        />
      </div>
      <div className={style.unit}>{unit}</div>
    </div>
  )
}
