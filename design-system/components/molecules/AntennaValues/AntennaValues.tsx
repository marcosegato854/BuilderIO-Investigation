import { Input } from '@mui/material'
import classNames from 'classnames'
import { HelpButton } from 'components/atoms/HelpButton/HelpButton'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/molecules/AntennaValues/AntennaValues.module.scss'
import { t } from 'i18n/config'
import React, { FC, FocusEvent, PropsWithChildren, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { unitLabel } from 'utils/numbers'

type InputAxes = 'distance' | 'x' | 'y' | 'z'

type FocusInput = {
  distance: boolean
  x: boolean
  y: boolean
  z: boolean
}

const focusInputReset = {
  distance: false,
  x: false,
  y: false,
  z: false,
}
export interface IAntennaValuesProps {
  /**
   * when the user changes a value
   */
  userInteractionHandler: () => void
  /**
   * state handling from the parent component
   */
  setDistance: (distance: string) => void
  distance: string
  /**
   * switch to manual insertion of the coordinates
   */
  manual: boolean
  /**
   * handle focus on the distance field
   */
  distanceFocusHandler: React.FocusEventHandler<HTMLInputElement>
  /**
   * handle manual leverarm values change
   */
  manualLeverarmHandler: (
    coordinate: 'x' | 'y' | 'z'
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * leverarm to display
   */
  leverArm: LeverArm | null
}

/**
 * AntennaValues description
 */
export const AntennaValues: FC<IAntennaValuesProps> = ({
  userInteractionHandler,
  setDistance,
  distance,
  manual,
  distanceFocusHandler,
  manualLeverarmHandler,
  leverArm,
}: PropsWithChildren<IAntennaValuesProps>) => {
  const [focusInput, setFocusInput] =
    React.useState<FocusInput>(focusInputReset)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const isAdmin = useSelector(selectIsAdmin)
  const displayLeverarm = useMemo(() => isAdmin || manual, [isAdmin, manual])
  const displayDistance = useMemo(
    () => isAdmin || !displayLeverarm,
    [isAdmin, displayLeverarm]
  )
  const unit = currentProject?.coordinate?.unit

  /** Users want to see all the 3 digits in the number
   * To be able to fullfill this requirement, we need to handle the focus event
   * When the user clicks on the input field, we show a "fillable" number
   * when the input is out of focus we show the number with 3 digits
   */
  const handleFocus =
    (axis: InputAxes) => (event: FocusEvent<HTMLInputElement>) => {
      setFocusInput({ ...focusInputReset, [axis]: true })
      axis === 'distance' && distanceFocusHandler(event)
    }

  const handleBlur =
    (axis: InputAxes) => (event: FocusEvent<HTMLInputElement>) => {
      setFocusInput({ ...focusInput, [axis]: false })
      axis === 'distance' && distanceFocusHandler(event)
    }

  const handleValue = (axis: InputAxes, value: number | string) => {
    if (!value || value === 0) return ''
    if (focusInput[axis]) {
      return value.toString()
    }
    return Number(value).toFixed(3)
  }
  /* const numberValidator = new RegExp('[0-9.,]')
  const isNumberValid = (value: string) => {
    console.log('REGEX - input value is: ', value)
    // eslint-disable-next-line no-useless-escape
    console.log('REGEX - boolean values is: ', numberValidator.test(value))
  } */

  return (
    <div className={classNames(style.noError, style.antennaValues)}>
      <div>
        <Icon name="Inside" className={style.insideIcon} />
        <div
          className={classNames({
            [style.field]: true,
            [style.hidden]: !displayDistance,
          })}
        >
          <p className={classNames(style.label, style.labelInner)}>
            {t('second_antenna.dist', { unit: unitLabel('M', unit) })}
          </p>
          <Input
            className={classNames({
              [style.textField]: true,
              [style.textFieldDistance]: true,
            })}
            value={handleValue('distance', distance || 0)}
            /* value={distance || ''} */
            inputProps={{
              'data-testid': 'distance-field',
            }}
            type="number"
            onChange={(event) => {
              const { value } = event.target
              userInteractionHandler()
              setDistance(value)
            }}
            onFocus={handleFocus('distance')}
            onBlur={handleBlur('distance')}
            disabled={manual}
          />
        </div>

        <div
          className={classNames({
            [style.field]: true,
            [style.hidden]: !displayLeverarm,
          })}
        >
          <p className={classNames(style.label, style.labelInner)}>
            {t('second_antenna.x', { unit: unitLabel('M', unit) })}
          </p>
          <Input
            className={style.textField}
            value={handleValue('x', leverArm?.x || 0)}
            inputProps={{
              'data-testid': 'leverarm-x',
            }}
            type="number"
            onChange={manualLeverarmHandler('x')}
            onFocus={handleFocus('x')}
            onBlur={handleBlur('x')}
            disabled={!manual}
          />
        </div>

        <div
          className={classNames({
            [style.field]: true,
            [style.hidden]: !displayLeverarm,
          })}
        >
          <p className={classNames(style.label, style.labelInner)}>
            {t('second_antenna.y', { unit: unitLabel('M', unit) })}
          </p>
          <Input
            className={style.textField}
            value={handleValue('y', leverArm?.y || 0)}
            inputProps={{
              'data-testid': 'leverarm-y',
            }}
            type="number"
            onChange={manualLeverarmHandler('y')}
            onFocus={handleFocus('y')}
            onBlur={handleBlur('y')}
            disabled={!manual}
          />
        </div>

        <div
          className={classNames({
            [style.field]: true,
            [style.hidden]: !displayLeverarm,
          })}
        >
          <p className={classNames(style.label, style.labelInner)}>
            {t('second_antenna.z', { unit: unitLabel('M', unit) })}
          </p>
          <Input
            className={style.textField}
            value={handleValue('z', leverArm?.z || 0)}
            inputProps={{
              'data-testid': 'leverarm-z',
            }}
            type="number"
            onChange={manualLeverarmHandler('z')}
            onFocus={handleFocus('z')}
            onBlur={handleBlur('z')}
            disabled={!manual}
          />
        </div>

        {manual && (
          <div
            className={classNames({
              [style.field]: true,
            })}
          >
            <HelpButton
              className={style.helpIcon}
              node="antenna_double"
              position="top"
            />
          </div>
        )}
      </div>
    </div>
  )
}
