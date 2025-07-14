/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Box, Button, Stack, Typography } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import style from 'components/dialogs/CoordinateSystemInfo/CoordinateSystemInfo.module.scss'
import { DialogNames } from 'components/dialogs/dialogNames'
import { IImportCoordinateSystemProps } from 'components/dialogs/ImportCoordinateSystem/ImportCoordinateSystem'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteCoordinateSystemWktActions,
  getCoordinateSystemWktActions,
  selectCurrentSystem,
  selectSystemInformation,
  selectWktInformation,
} from 'store/features/coordsys/slice'
import { CoordinateSystem, Wkt } from 'store/features/coordsys/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'

export interface ICoordinateSystemInfoProps {}

/**
 * CoordinateSystemInfo description
 */
const CoordinateSystemInfo: FC<ICoordinateSystemInfoProps> = () => {
  const dispatch = useDispatch()
  const [showOverlay, setShowOverlay] = useState(false)
  const { t } = useTranslation()
  const wktInfo = useSelector(selectWktInformation)
  const currentSystem = useSelector(selectCurrentSystem)
  const systemInfo = useSelector(selectSystemInformation)

  const propertiesToShow: Partial<CoordinateSystem> = useMemo(() => {
    if (!systemInfo) return {}
    return {
      transformation: systemInfo.transformation,
      ellipsoid: systemInfo.ellipsoid,
      projection: systemInfo.projection,
      geoidModel: systemInfo.geoidModel,
      cscsModel: systemInfo.cscsModel,
    }
  }, [systemInfo])

  const onClickViewHandler = useCallback(() => {
    setShowOverlay(true)
  }, [setShowOverlay])

  const handleClickClose = useCallback(() => {
    dispatch(closeDialogAction())
  }, [dispatch])

  const onCancelOverlayHandler = useCallback(() => {
    setShowOverlay(false)
  }, [setShowOverlay])

  const handleLoadWkt = useCallback(() => {
    if (!currentSystem) return
    dispatch(
      openDialogAction({
        component: DialogNames.ImportCoordinateSystemDialog,
        componentProps: {
          file_type: 'wkt',
          csys_name: currentSystem.name,
        } as IImportCoordinateSystemProps,
      })
    )
  }, [currentSystem, dispatch])

  const handleDeleteWkt = useCallback(() => {
    if (!currentSystem) return
    const onConfirm = () => {
      dispatch(
        deleteCoordinateSystemWktActions.request({ name: currentSystem.name })
      )
    }
    dispatch(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          title: t('coordsys.deleteDialog.titleWkt', 'delete wkt file'),
          text: t('coordsys.deleteDialog.textWkt', {
            name: currentSystem.name,
          }),
          okButtonLabel: t('coordsys.deleteDialog.delete', 'delete'),
          cancelButtonLabel: t('coordsys.deleteDialog.cancel', 'cancel'),
          okButtonCallback: onConfirm,
        } as IAlertProps,
      })
    )
  }, [currentSystem, dispatch, t])

  useEffect(() => {
    if (!currentSystem) return
    if (!systemInfo) return
    if (systemInfo.wkt !== Wkt.LOADED) return
    dispatch(
      getCoordinateSystemWktActions.request({ name: currentSystem.name })
    )
  }, [currentSystem, dispatch, systemInfo])

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.variantGrey]: true,
      })}
      data-testid="csys-info-dialog"
    >
      <div className={style.header}>
        <div className={style.title}>
          {t('coordsys.csysInfo.title', 'system info')}
        </div>
      </div>
      <div className={style.csys} data-testid="csys-box">
        {currentSystem && (
          <div className={style.csysHeader}>{currentSystem.name}</div>
        )}
        <Stack gap={1} sx={{ padding: '3px 10px' }}>
          {Object.entries(propertiesToShow).map(
            ([key, value]: [string, string | boolean]) => (
              <Box key={key} display={'flex'} justifyContent={'space-between'}>
                <Typography variant="body1">
                  {t(`coordsys.csysInfo.${key}`, key)}
                  {': '}
                </Typography>
                <Typography variant="body1">{value}</Typography>
              </Box>
            )
          )}
          <Box display={'flex'} justifyContent={'space-between'}>
            <Typography variant="body1">
              {t('coordsys.csysInfo.wkt', 'wkt')}
              {': '}
            </Typography>
            {systemInfo && systemInfo.wkt === Wkt.LOADED ? (
              <Typography variant="body1">
                {t('coordsys.csysInfo.wktLoaded', 'loaded')}
              </Typography>
            ) : (
              <Typography
                variant="body1"
                display={'flex'}
                alignItems={'center'}
                sx={{
                  /* color: (theme) => theme.colors.secondary_10, */
                  marginLeft: '4px',
                  '& svg': {
                    width: '32px',
                    height: '32px',
                    /* path: { fill: (theme) => theme.colors.secondary_10 }, */
                  },
                }}
              >
                {t('coordsys.csysInfo.wktMissing', 'missing')}
                <Icon name="AcquisitionWarningGeo" />
              </Typography>
            )}
          </Box>
        </Stack>
      </div>
      <div className={style.footer}>
        <div className={style.buttonsContainer}>
          <Button
            variant="outlined"
            color="primary"
            data-testid="close-button"
            onClick={handleClickClose}
          >
            {t('coordsys.csysInfo.close', 'close')}
          </Button>
          {wktInfo && wktInfo.wkt !== '' ? (
            <Button
              variant="outlined"
              color="primary"
              data-testid="view-wkt-button"
              onClick={onClickViewHandler}
            >
              {t('coordsys.csysInfo.viewWkt', 'view wkt')}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              data-testid="load-wkt-button"
              onClick={handleLoadWkt}
            >
              {t('coordsys.csysInfo.loadWkt', 'load wkt')}
            </Button>
          )}
        </div>
      </div>
      {showOverlay && wktInfo && (
        <div className={style.overlay} data-testid="wkt-overlay">
          {currentSystem && (
            <div className={style.title}>
              <p>
                {t('coordsys.csysInfo.wktTitle', { name: currentSystem.name })}
              </p>
            </div>
          )}
          <div className={style.wktContainer}>
            <pre>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                  overflowWrap: 'break-word',
                  color: 'inherit',
                }}
              >
                {wktInfo.wkt}
              </Typography>
            </pre>
          </div>
          <div className={style.buttonsContainer}>
            <Button
              variant="outlined"
              color="primary"
              data-testid="wkt-cancel-button"
              onClick={onCancelOverlayHandler}
              sx={{
                borderRadius: '6px',
              }}
            >
              {t('coordsys.csysInfo.close', 'close')}
            </Button>
            {currentSystem && !currentSystem.isAutomatic && (
              <Button
                variant="outlined"
                color="primary"
                data-testid="wkt-delete-button"
                onClick={handleDeleteWkt}
                sx={{
                  borderRadius: '6px',
                }}
              >
                {t('coordsys.csysInfo.delete', 'delete')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default CoordinateSystemInfo
