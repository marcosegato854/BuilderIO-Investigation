import style from 'components/molecules/PlanningTopLeftControls/PlanningTopLeftControls.module.scss'
import React, { FC, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from 'components/atoms/Icon/Icon'
import {
  rangeDisplayAction,
  selectRangeDisplay,
} from 'store/features/planning/slice'

/**
 * PlanningTopLeftControls description
 */
export const PlanningTopLeftControls: FC = () => {
  const rangeDisplay = useSelector(selectRangeDisplay)
  const dispatch = useDispatch()

  const toggleRangeDisplay = useCallback(() => {
    dispatch(rangeDisplayAction(!rangeDisplay))
  }, [rangeDisplay, dispatch])

  return (
    <div className={style.container}>
      <div className={style.flexWrapper}>
        <Icon
          name={rangeDisplay ? 'ScanRangeOff' : 'ScanRangeOn'}
          onClick={toggleRangeDisplay}
          data-testid="toggle-range-button"
        />
      </div>
    </div>
  )
}
