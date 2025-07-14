import { Box } from '@mui/material'
import {
  ITemperatureBoxProps,
  TemperatureBox,
} from 'components/atoms/TemperatureBox/TemperatureBox'
import { DialogNames } from 'components/dialogs/dialogNames'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { openDialogAction } from 'store/features/dialogs/slice'
import { selectScannerInfo } from 'store/features/scanner/slice'
import { TemperatureStatus } from 'store/features/scanner/types'

const styles = {
  boxContainer: {
    display: 'flex',
    gap: 1,
    cursor: 'pointer',
  },
}

interface IScannerTemperatureProps {
  unit?: Unit
}

export const ScannerTemperature: FC<IScannerTemperatureProps> = ({
  unit,
}: PropsWithChildren<IScannerTemperatureProps>) => {
  const scannerInfo = useSelector(selectScannerInfo)
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [leftScannerProps, setLeftScannerProps] =
    useState<ITemperatureBoxProps | null>(null)
  const [rightScannerProps, setRightScannerProps] =
    useState<ITemperatureBoxProps | null>(null)

  const handleOnClick = useCallback(() => {
    dispatch(
      openDialogAction({
        component: DialogNames.ScannerTemperatureLegend,
        componentProps: { unit },
      })
    )
  }, [dispatch, unit])

  /** PEF-4554
   * When using the TRK 300 we need to keep an eye on the temperature of the scanners
   * The BE gives us an array of scanner info, we need to filter the left and right scanner
   * There's the possibility that only one scanner is connected or recognized by the system
   */
  useEffect(() => {
    if (!scannerInfo) return
    const leftScanner = scannerInfo.find((s) => s.position === 'Left')
    const rightScanner = scannerInfo.find((s) => s.position === 'Right')
    if (!leftScanner && !rightScanner) return
    if (leftScanner) {
      setLeftScannerProps({
        temperature: leftScanner.temperature?.value || 0,
        status: leftScanner.temperature?.state || TemperatureStatus.Normal,
        label: t(
          'notifications.scannerTemperature.leftScanner',
          'left scanner'
        ),
        unit,
      })
    }
    if (rightScanner) {
      setRightScannerProps({
        temperature: rightScanner.temperature?.value || 0,
        status: rightScanner.temperature?.state || TemperatureStatus.Normal,
        label: t(
          'notifications.scannerTemperature.rightScanner',
          'right scanner'
        ),
        unit,
      })
    }
  }, [scannerInfo, t, unit])

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {leftScannerProps || rightScannerProps ? (
        <Box
          sx={styles.boxContainer}
          onClick={handleOnClick}
          data-testid="scanner-temperature"
        >
          {leftScannerProps && <TemperatureBox {...leftScannerProps} />}
          {rightScannerProps && <TemperatureBox {...rightScannerProps} />}
        </Box>
      ) : null}
    </>
  )
}
