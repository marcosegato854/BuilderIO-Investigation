import React, { FC, PropsWithChildren, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectPosition } from 'store/features/position/slice'
import { Icon } from 'components/atoms/Icon/Icon'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { digits, forceDecimals, mtToFt, unitLabel } from 'utils/numbers'
import style from './DataAcquisitionSmallStatusBar.module.scss'

export interface IDataAcquisitionSmallStatusBarProps {
  /**
   * Tells if the RTK is enabled or not
   */
  rtkEnabled?: boolean
  /**
   * onStatusChange
   */
  onStatusChange?: (status: boolean) => void
}

/**
 * DataAcquisitionSmallStatusBar description
 */
export const DataAcquisitionSmallStatusBar: FC<IDataAcquisitionSmallStatusBarProps> =
  ({
    rtkEnabled = false,
    onStatusChange,
  }: PropsWithChildren<IDataAcquisitionSmallStatusBarProps>) => {
    const currentProject = useSelector(selectDataStorageCurrentProject)
    const position = useSelector(selectPosition)
    const quality = useMemo(() => position?.accuracy?.class || 0, [position])

    const unit = currentProject?.coordinate?.unit

    const uLbl = useMemo(() => {
      return unitLabel('M', unit)
    }, [unit])
    const horizontal = useMemo(() => {
      const value = position?.accuracy?.height
      if (!value) return '--'
      const convertedValue = unit === 'imperial' ? mtToFt(value) : value
      return `H ${forceDecimals(digits(convertedValue, 3), 3)}${uLbl}`
    }, [position, unit, uLbl])
    const vertical = useMemo(() => {
      const value = position?.accuracy?.value
      if (!value) return '--'
      const convertedValue = unit === 'imperial' ? mtToFt(value) : value
      return `V ${forceDecimals(digits(convertedValue, 3), 3)}${uLbl}`
    }, [position, unit, uLbl])

    const { t } = useTranslation()
    const [active, setActive] = useState(false)

    const handleClick = () => {
      setActive(!active)
      onStatusChange && onStatusChange(!active)
    }

    return (
      <div
        className={classNames({
          [style.panel]: true,
          [style.panelWithoutRTK]: !rtkEnabled,
        })}
      >
        <p className={style.label}>
          {rtkEnabled
            ? t('data_acquisition_small_status_bar.rtk', 'RTK')
            : t('data_acquisition_small_status_bar.status', 'Status')}
        </p>
        {rtkEnabled && (
          <div
            className={classNames({
              [style.valueBox]: true,
              [style[`quality${quality}`]]: true,
            })}
          >
            <div>{horizontal}</div>
            <div>{vertical}</div>
          </div>
        )}

        <button
          className={style.iconButton}
          onClick={handleClick}
          type="button"
          data-testid="toggle-info"
        >
          <Icon
            name="Caret"
            className={classNames({
              [style.icon]: true,
              [style.iconUp]: active,
              [style.iconDown]: !active,
            })}
          />
        </button>
      </div>
    )
  }
