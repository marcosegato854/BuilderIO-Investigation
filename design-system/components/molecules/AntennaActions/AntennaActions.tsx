import React, { FC, PropsWithChildren } from 'react'
// import style from 'components/molecules/AntennaActions/AntennaActions.module.scss'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

export interface IAntennaActionsProps {
  /**
   * switch to manual insertion of the coordinates
   * state handling from the parent component
   */
  manual: boolean
  setManual: (manual: boolean) => void
  /**
   * use saved values
   */
  useSavedValues: () => void
  /**
   * calculate
   */
  calculate: () => void
  /**
   *  disables the buttons
   */
  apiProgress: boolean
}

/**
 * AntennaActions description
 */
export const AntennaActions: FC<IAntennaActionsProps> = ({
  manual,
  setManual,
  apiProgress,
  calculate,
  useSavedValues,
}: PropsWithChildren<IAntennaActionsProps>) => {
  const { t } = useTranslation()

  const toggleManualMode = () => {
    setManual(!manual)
  }

  return (
    <>
      {manual || (
        <Button
          variant="outlined"
          color="primary"
          data-testid="antenna2-manual-button"
          onClick={toggleManualMode}
          disabled={apiProgress}
        >
          {t('second_antenna.manual', 'manual')}
        </Button>
      )}
      {manual && (
        <Button
          variant="outlined"
          color="primary"
          data-testid="antenna2-pick-button"
          onClick={toggleManualMode}
          disabled={apiProgress}
        >
          {t('second_antenna.pick', 'pick')}
        </Button>
      )}
      <Button
        variant="outlined"
        color="primary"
        data-testid="antenna2-saved-values-button"
        onClick={useSavedValues}
        disabled={apiProgress}
      >
        {t('second_antenna.use_saved_values', 'use saved')}
      </Button>
      {manual || (
        <Button
          variant="outlined"
          color="primary"
          data-testid="antenna2-calculate-button"
          onClick={calculate}
          disabled={apiProgress}
        >
          {t('second_antenna.calculate', 'calc')}
        </Button>
      )}
    </>
  )
}
