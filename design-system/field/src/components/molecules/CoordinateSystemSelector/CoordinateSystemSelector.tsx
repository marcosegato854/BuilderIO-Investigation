import { Box, MenuItem, SelectChangeEvent, Typography } from '@mui/material'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { Icon } from 'components/atoms/Icon/Icon'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { IImportCoordinateSystemProps } from 'components/dialogs/ImportCoordinateSystem/ImportCoordinateSystem'
import { FC, PropsWithChildren, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteCoordinateSystemActions,
  getCoordinateSystemActions,
  getLastImportedCoordinateSystemActions,
  selectCurrentSystem,
  selectLastImported,
  selectSystemInformation,
  setCurrentCoordinateSystem,
} from 'store/features/coordsys/slice'
import { Wkt } from 'store/features/coordsys/types'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'

export interface ICoordinateSystemSelectorProps {
  label?: string
  isLocked?: boolean
  showDelete?: boolean
  onChange?: (newValue: string) => void
}

const CoordinateSystemSelector: FC<ICoordinateSystemSelectorProps> = ({
  label,
  isLocked = false,
  showDelete = true,
  onChange,
}: PropsWithChildren<ICoordinateSystemSelectorProps>) => {
  const dispatch = useDispatch()
  const lastImportedSystem = useSelector(selectLastImported)
  const currentSystem = useSelector(selectCurrentSystem)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const { coordinate } = currentProject || {}
  const { name: systemName, isAutomatic } = currentSystem || {
    name: 'automatic',
    isAutomatic: true,
  }
  const systemInfo = useSelector(selectSystemInformation)
  const { t } = useTranslation()

  const automaticLabel = useMemo(() => {
    if (isAutomatic) {
      if (systemName !== 'automatic') {
        return `${t(
          'coordsys.selection.automatic',
          'automatic'
        )} (${systemName})`
      }
    }
    return t('coordsys.selection.automatic', 'automatic')
  }, [isAutomatic, systemName, t])

  const showCustomSystem = useMemo(() => {
    return !isAutomatic && !!systemName
  }, [isAutomatic, systemName])

  const showLastImported = useMemo(() => {
    return (
      !!lastImportedSystem && !!lastImportedSystem.name && !showCustomSystem
    )
  }, [lastImportedSystem, showCustomSystem])

  /* const showUsbImport = useMemo(() => {
    return !showCustomSystem
  }, [showCustomSystem]) */

  const showDeleteButton = useMemo(() => {
    return (
      showDelete &&
      systemInfo &&
      systemInfo.canDelete &&
      !!systemName &&
      !isLocked
    )
  }, [isLocked, showDelete, systemInfo, systemName])

  /* handle the select component */
  const onChangeHandler = (e: SelectChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'importSystem') {
      dispatch(
        openDialogAction({
          component: DialogNames.ImportCoordinateSystemDialog,
          componentProps: {
            file_type: 'csys',
            /* onImported: handleOnImported, */
          } as IImportCoordinateSystemProps,
        })
      )
      return
    }
    dispatch(
      setCurrentCoordinateSystem({
        name: value as string,
        isAutomatic: value === 'automatic',
      })
    )
    if (value === 'automatic') {
      dispatch(getLastImportedCoordinateSystemActions.request())
    }
    onChange && onChange(value as string)
  }

  /* delete coordinate system */
  const handleSystemDelete = () => {
    if (!systemName) return
    const onConfirm = () => {
      dispatch(
        setCurrentCoordinateSystem({
          name: coordinate?.name ?? 'automatic',
          isAutomatic: coordinate?.automatic ?? true,
        })
      )
      dispatch(deleteCoordinateSystemActions.request({ name: systemName }))
    }
    dispatch(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          title: t('coordsys.deleteDialog.title', 'delete coordinate system'),
          text: t('coordsys.deleteDialog.text', { name: systemName }),
          okButtonLabel: t('coordsys.deleteDialog.delete', 'delete'),
          cancelButtonLabel: t('coordsys.deleteDialog.cancel', 'cancel'),
          okButtonCallback: onConfirm,
        } as IAlertProps,
      })
    )
  }

  /* opens the system info dialog */
  const handleSystemInfo = () => {
    if (!systemInfo) return
    dispatch(
      openDialogAction({
        component: DialogNames.CoordinateSystemInfo,
        componentProps: {
          /* import_feedback: false, */
        },
      })
    )
  }

  /* Check for the last imported system */
  useEffect(() => {
    if (isLocked) return
    dispatch(getLastImportedCoordinateSystemActions.request())
  }, [dispatch, isLocked])

  /* if the coordinate system has a name, load the information */
  useEffect(() => {
    if (!systemName) return
    if (systemName !== 'automatic') {
      dispatch(getCoordinateSystemActions.request({ name: systemName }))
    }
  }, [currentSystem, dispatch, systemName])

  return (
    <Box
      data-testid="coordinateSystem_selector"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {label && (
        <Box>
          <Typography variant="body1" mr={2}>
            {label}
          </Typography>
        </Box>
      )}
      <CustomSelect
        /* component={CustomSelect} */
        /* name="coordinateSelection" */
        value={isAutomatic ? 'automatic' : systemName}
        onChange={onChangeHandler}
        data-testid="coordinateSystem_select"
        disabled={isLocked}
        sx={{
          '& .MuiSelect-select.MuiSelect-standard.MuiInputBase-input': {
            width: '100%',
            padding: '3px 16px',
            paddingRight: '24px',
          },
        }}
      >
        <MenuItem
          key="automatic"
          value="automatic"
          data-testid="coordsys_automatic"
        >
          <Typography variant="body2">{automaticLabel}</Typography>
        </MenuItem>
        {showLastImported && (
          <MenuItem
            key="lastImported"
            value={lastImportedSystem!.name}
            data-testid="coordsys_lastImported"
          >
            <Typography variant="body2">{lastImportedSystem!.name}</Typography>
          </MenuItem>
        )}
        {showCustomSystem && (
          <MenuItem
            key="customSystem"
            value={systemName}
            data-testid="coordsys_custom"
          >
            <Typography variant="body2">{systemName}</Typography>
          </MenuItem>
        )}

        <MenuItem
          key="importSystem"
          value="importSystem"
          data-testid="coordsys_import"
        >
          <Typography variant="body2">
            {t('coordsys.selection.import', 'import from usb')}
          </Typography>

          <Box
            sx={{
              marginLeft: '8px',
              '& svg': {
                width: '20px',
                height: '20px',
                paddingTop: '4px',
                path: {
                  fill: (theme) => theme.colors.primary_11,
                },
              },
            }}
          >
            <Icon name="Usb" />
          </Box>
        </MenuItem>
      </CustomSelect>
      <Box display={'flex'} alignItems={'center'} gap={1} ml={1}>
        {!!systemInfo &&
          (systemInfo.wkt === Wkt.LOADED ? (
            <Box
              display={'flex'}
              alignItems={'center'}
              sx={{
                '& svg': {
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  path: {
                    fill: (theme) => theme.colors.primary_11,
                  },
                },
              }}
            >
              <Icon
                name="Information"
                data-testid="systemInfo_btn"
                onClick={() => handleSystemInfo()}
              />
            </Box>
          ) : (
            <Box
              display={'flex'}
              alignItems={'center'}
              sx={{
                '& svg': {
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                },
              }}
            >
              <Icon
                name="AcquisitionWarningGeo"
                data-testid="systemInfoWarning_btn"
                onClick={() => handleSystemInfo()}
              />
            </Box>
          ))}
        {showDeleteButton && (
          <Box
            display={'flex'}
            alignItems={'center'}
            sx={{
              '& svg': {
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                path: {
                  fill: (theme) => theme.colors.primary_11,
                },
              },
            }}
          >
            <Icon
              name="Delete"
              data-testid="systemDelete_btn"
              onClick={() => handleSystemDelete()}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CoordinateSystemSelector
