import {
  Box,
  Button,
  Container,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import CoordinateSystemSelector from 'components/molecules/CoordinateSystemSelector/CoordinateSystemSelector'
import JobProcessingOptions from 'components/molecules/JobProcessingOptions/JobProcessingOptions'
import useProcessingOptions from 'hooks/useProcessingOptions'
import { FC, PropsWithChildren, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  dataStorageStartProcessingActions,
  dataStorageStopProcessingActions,
  selectDataStorageJobs,
} from 'store/features/dataStorage/slice'
import { DataStorageStartProcessingPayload } from 'store/features/dataStorage/types'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { darkTheme, hexToRgb, pathDimension } from 'utils/themes/mui'

/* eslint-disable-next-line */
export interface IProcessingDialogProps {
  job: IJob
  coordsysIsLocked?: boolean
}

const ProcessingDialog: FC<IProcessingDialogProps> = ({
  job,
  coordsysIsLocked = false,
}: PropsWithChildren<IProcessingDialogProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const jobsList = useSelector(selectDataStorageJobs)
  const [processingLayoutOptions, processingOptions, actionPayload] =
    useProcessingOptions(job)
  const [overwriteOverlay, setOverwriteOverlay] = useState(false)
  const [lockOverlay, setLockOverlay] = useState(false)
  const [overwriteList, setOverwriteList] = useState<string | null>(null)
  const currentValuesRef = useRef<ProcessingOptions | null>(null)

  const exportAlreadyDoneInProject = useCallback(
    (exportKey: string) => {
      return jobsList?.some((job) => {
        const { processOutput } = job
        const exportDone =
          processOutput?.options?.export[
            exportKey as keyof ProcessingExportOptions
          ]?.done ?? false
        return exportDone
      })
    },
    [jobsList]
  )

  const processingExportOverwriteArray = useCallback(
    (values: ProcessingExportOptions) => {
      const exportArray = Object.keys(values).filter(
        (key) =>
          values[key as keyof ProcessingExportOptions].enable === true &&
          (key === 'las'
            ? values[key as keyof ProcessingExportOptions].done === true
            : exportAlreadyDoneInProject(key))
      )
      if (exportArray.length > 0) {
        setOverwriteList(
          exportArray.length === 1 ? exportArray[0] : exportArray.join(', ')
        )
      }
      return exportArray
    },
    [exportAlreadyDoneInProject]
  )

  const handleOnClose = () => {
    dispatch(closeDialogAction())
  }

  const handleOnStopAction = () => {
    if (!actionPayload) return
    dispatch(dataStorageStopProcessingActions.request(actionPayload))
  }

  const dispatchProcessingStart = () => {
    if (!actionPayload) return
    if (!currentValuesRef.current) return
    /** check if processing options need the coordinate system */
    const { export: exportOptions, finalise } = currentValuesRef.current
    const hasExportEnabled = Object.keys(exportOptions).some(
      (key) => exportOptions[key as keyof ProcessingExportOptions].enable
    )
    const needsCoordinateWarning =
      finalise.colorization.enable || hasExportEnabled
    /* if the coordinate system is not locked, alert the user */
    if (!coordsysIsLocked && lockOverlay === false && needsCoordinateWarning) {
      setLockOverlay(true)
      return
    }
    const startPayload: DataStorageStartProcessingPayload = {
      ...actionPayload,
      options: {
        ...currentValuesRef.current,
      },
    }
    currentValuesRef.current = null
    setOverwriteOverlay(false)
    setLockOverlay(false)
    dispatch(dataStorageStartProcessingActions.request(startPayload))
    dispatch(closeDialogAction())
  }

  const handleOnStartAction = (values: ProcessingOptions) => {
    if (!actionPayload) return
    currentValuesRef.current = values
    if (processingExportOverwriteArray(values.export).length > 0) {
      setOverwriteOverlay(true)
      return
    }
    dispatchProcessingStart()
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={(theme) => ({
          position: 'relative',
          backgroundColor: `rgba(${hexToRgb(theme.colors.primary_14)}, 0.5)`,
          color: theme.colors.primary_11,
          backdropFilter: 'blur(10px)',
          width: '600px',
          borderRadius: '10px',
          transition: 'all 0.2s ease-in-out',
          padding: '12px',
        })}
      >
        <Box
          component="div"
          sx={(theme) => ({
            height: '22px',
            width: '22px',
            position: 'absolute',
            top: '5px',
            right: '10px',
            cursor: 'pointer',
            backgroundColor: `rgba(${hexToRgb(theme.colors.primary_1)}, 0.5)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': {
              width: `${pathDimension(10)}px`,
              height: `${pathDimension(10)}px`,
              path: {
                fill: theme.colors.primary_11,
              },
            },
          })}
        >
          <Icon name="Close" onClick={handleOnClose} />
        </Box>
        {/* HEADER */}
        <Stack
          alignItems="center"
          sx={{
            color: 'inherit',
            textAlign: 'center',
            padding: '12px',
            '& svg': {
              width: `${pathDimension(32)}px`,
              height: `${pathDimension(32)}px`,
              path: {
                fill: (theme) => theme.colors.primary_11,
              },
            },
          }}
        >
          <Icon name="ProcessingCog" />
          <Typography variant="body1">
            {t('job_processing.dialog.header', 'finalise & export')}
          </Typography>
        </Stack>
        <Container
          sx={(theme) => ({
            position: 'relative',
            backgroundColor: theme.colors.primary_17,
            color: theme.colors.primary_11,
            borderRadius: '10px',
            transition: 'all 0.2s ease-in-out',
            padding: '12px',
          })}
        >
          {/* Coordinate system selection */}
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            px={'8px'}
          >
            <Typography>
              {t(
                'coordsys.selection.processingDialogTitle',
                'coordinate system'
              )}
              {/* <HelpButton node="coordinate_system" /> */}
            </Typography>
            <CoordinateSystemSelector
              isLocked={coordsysIsLocked}
              showDelete={false}
            />
          </Box>

          {/* Processing options */}
          <Stack py={2} gap={3}>
            <JobProcessingOptions
              job={job}
              processingOptions={processingOptions}
              processingLayout={processingLayoutOptions}
              onCancelCallback={handleOnClose}
              startButtonCallback={handleOnStartAction}
              stopButtonCallback={handleOnStopAction}
            />
          </Stack>
          {overwriteOverlay && (
            <Container
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: `rgba(${hexToRgb(
                  theme.colors.primary_10
                )}, 0.90)`,
                color: theme.colors.primary_11,
                backdropFilter: 'blur(2px)',
                borderRadius: '10px',
                transition: 'all 0.2s ease-in-out',
                padding: '12px',
              })}
              data-testid="processing-overwrite"
            >
              <Stack
                alignItems="center"
                sx={{
                  color: 'inherit',
                  textAlign: 'center',
                  padding: '36px',
                  '& svg': {
                    width: `${pathDimension(32)}px`,
                    height: `${pathDimension(32)}px`,
                    path: {
                      fill: (theme) => theme.colors.primary_11,
                    },
                  },
                }}
              >
                <Icon name="Alert" />
                <Typography variant="body1" py={2}>
                  {t(
                    'job_processing.overwrite_alert.title',
                    'export already done'
                  )}{' '}
                  {overwriteList && overwriteList.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  {t(
                    'job_processing.overwrite_alert.text',
                    'project folder contains export files'
                  )}
                </Typography>
                <Typography variant="body2" py={1}>
                  {t(
                    'job_processing.overwrite_alert.cta',
                    'do you want to continue?'
                  )}
                </Typography>
              </Stack>
              <Box
                alignItems="center"
                justifyContent="center"
                display="flex"
                gap={2}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setOverwriteOverlay(false)}
                  data-testid="processing-overwrite-cancel"
                >
                  {t(
                    'job_processing.overwrite_alert.cancelButtonLabel',
                    'cancel'
                  )}
                </Button>
                <Button
                  color="primary"
                  onClick={() => dispatchProcessingStart()}
                  data-testid="processing-overwrite-ok"
                >
                  {t('job_processing.overwrite_alert.okButtonLabel', 'ok')}
                </Button>
              </Box>
            </Container>
          )}
          {lockOverlay && (
            <Container
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: `rgba(${hexToRgb(
                  theme.colors.primary_10
                )}, 0.90)`,
                color: theme.colors.primary_11,
                backdropFilter: 'blur(2px)',
                borderRadius: '10px',
                transition: 'all 0.2s ease-in-out',
                padding: '12px',
              })}
              data-testid="processing-lock"
            >
              <Stack
                alignItems="center"
                sx={{
                  color: 'inherit',
                  textAlign: 'center',
                  padding: '36px',
                  '& svg': {
                    width: `${pathDimension(32)}px`,
                    height: `${pathDimension(32)}px`,
                    path: {
                      fill: (theme) => theme.colors.primary_11,
                    },
                  },
                }}
              >
                <Icon name="Information" />
                <Typography variant="body2" py={1}>
                  {t(
                    'coordsys.processingDialog.text1',
                    'if you start the coordinate system will be locked'
                  )}
                </Typography>
                <Typography variant="body2" py={1}>
                  {t(
                    'coordsys.processingDialog.text2',
                    'it can be changed only in pegasus office'
                  )}
                </Typography>
                <Typography variant="body2" py={1}>
                  {t('coordsys.processingDialog.cta', 'continue?')}
                </Typography>
              </Stack>
              <Box
                alignItems="center"
                justifyContent="center"
                display="flex"
                gap={2}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setLockOverlay(false)}
                  data-testid="processing-lock-cancel"
                >
                  {t('coordsys.processingDialog.cancelButton', 'cancel')}
                </Button>
                <Button
                  color="primary"
                  onClick={() => dispatchProcessingStart()}
                  data-testid="processing-lock-ok"
                >
                  {t('coordsys.processingDialog.okButton', 'start processing')}
                </Button>
              </Box>
            </Container>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default ProcessingDialog
