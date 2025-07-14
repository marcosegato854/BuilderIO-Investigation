import { Box } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import { DialogNames } from 'components/dialogs/dialogNames'
import { defaultTo, mergeDeepRight } from 'ramda'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  dataStorageStartProcessingActions,
  dataStorageStopProcessingActions,
  selectDataStorageCurrentProject,
  selectProcessingInfo,
} from 'store/features/dataStorage/slice'
import {
  DataStorageProcessingItem,
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'
import {
  extractJobProcessing,
  jobHadCameraEnabled,
} from 'store/features/dataStorage/utils'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'

const emptyLayoutOptions: ProcessingProgressInfo = {
  action: null,
  progress: 0,
  currentStatus: JobProcessStatus.NONE,
  isImageAI: false,
}

/**
 * Hook that handles the processing options
 */
const useProcessingOptions = (
  job: IJob
): [
  ProcessingProgressInfo,
  ProcessingOptions,
  DataStorageProcessingItem | null
] => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const processingInfo = useSelector(selectProcessingInfo)

  const emptyOptions: ProcessingOptions = useMemo(() => {
    return {
      export: {
        las: {
          enable: false,
          done: false,
        },
        lgsx: {
          enable: false,
          done: false,
        },
        e57: {
          enable: false,
          done: false,
        },
      },
      finalise: {
        blur: {
          enable: jobHadCameraEnabled(job),
          done: false,
        },
        colorization: {
          enable: false,
          done: false,
        },
      },
    }
  }, [job])

  /**
   * extract the current processing job from processingInfo
   */
  const jobProcessing: DataStorageProcessingItem | null = useMemo(() => {
    if (!currentProject || !job || !processingInfo) return null
    return extractJobProcessing(currentProject, job, processingInfo)
  }, [currentProject, job, processingInfo])

  const isProcessing = useMemo(() => {
    return jobProcessing ? true : false
  }, [jobProcessing])

  const isPaused = useMemo(() => {
    if (isProcessing) return false
    if (job.processOutput) {
      if (job.processOutput.isImageAIdone) return false
      if (
        job.processOutput.progress === 100 ||
        job.processOutput.progress === 0
      )
        return false
      return true
    }
    return false
  }, [isProcessing, job.processOutput])

  /** errors are shown only it they have type 2 (error) */
  const jobHasErrors = useMemo(() => {
    if (isProcessing) return false
    if (isPaused) return false
    const errors: ProcessingError[] | undefined = job.processOutput?.errors
    if (errors && errors.length > 0) {
      return errors?.some((e) => e.type === 2)
    }
    return false
  }, [isPaused, isProcessing, job.processOutput?.errors])

  /**
   * payload for the stop action (stop or pause)
   */
  const actionPayload: DataStorageProcessingItem | null = useMemo(() => {
    if (!currentProject || !job) return null
    const basePayload = {
      disk: currentProject.disk,
      project: currentProject.name,
      job: job.name,
    }
    if (
      isPaused &&
      job.processOutput &&
      job.processOutput.options?.finalise.blur
    ) {
      return {
        ...basePayload,
        options: mergeDeepRight(emptyOptions, {
          finalise: {
            blur: {
              enable:
                job.processOutput.options?.finalise.blur.enable ||
                jobHadCameraEnabled(job),
            },
          },
        }),
      }
    }
    return basePayload
  }, [currentProject, emptyOptions, isPaused, job])

  const dispatchHandler = useCallback(
    (
      request: DataStorageProcessingItem,
      action: 'start' | 'stop' | 'pause'
    ) => {
      switch (action) {
        case 'pause':
          // open the alert
          dispatch(
            openDialogAction({
              component: DialogNames.Alert,
              componentProps: {
                type: 'warning',
                title: t(
                  'job_processing.pause_alert.title',
                  'pause processing'
                ),
                text: t(
                  'job_processing.pause_alert.text',
                  'options will be lost except blur, continue?'
                ),
                okButtonLabel: t(
                  'job_processing.pause_alert.okButtonLabel',
                  'ok'
                ),
                okButtonCallback: () => {
                  dispatch(dataStorageStopProcessingActions.request(request))
                  dispatch(closeDialogAction())
                },
                cancelButtonLabel: t(
                  'job_processing.pause_alert.cancelButtonLabel',
                  'no'
                ),
              },
            })
          )
          break
        case 'start':
          dispatch(dataStorageStartProcessingActions.request(request))
          break
        case 'stop':
          dispatch(dataStorageStopProcessingActions.request(request))
          break
        default:
          break
      }
    },
    [dispatch, t]
  )

  const action = useMemo(() => {
    if (isProcessing && actionPayload) {
      if (jobProcessing?.isImageAI)
        return (
          <Box sx={{ cursor: 'pointer' }} paddingX={1}>
            <Icon
              name="RoundPause"
              data-testid="image-processing-pause"
              onClick={() => dispatchHandler(actionPayload, 'pause')}
            />
          </Box>
        )
      return (
        <Box sx={{ cursor: 'pointer' }} paddingX={1}>
          <Icon
            name="RoundStop"
            data-testid="office-processing-stop"
            onClick={() => dispatchHandler(actionPayload, 'stop')}
          />
        </Box>
      )
    }
    if (isPaused && actionPayload) {
      return (
        <Box sx={{ cursor: 'pointer' }} paddingX={1}>
          <Icon
            name="RoundPlay"
            data-testid="image-processing-play"
            onClick={() => dispatchHandler(actionPayload, 'start')}
          />
        </Box>
      )
    }

    return null
  }, [
    isProcessing,
    actionPayload,
    isPaused,
    jobProcessing?.isImageAI,
    dispatchHandler,
  ])

  const progress = useMemo(() => {
    if (jobHasErrors) return 100
    if (isProcessing) return jobProcessing?.progress || 0
    if (job.processOutput) return job.processOutput.progress || 0
    return 0
  }, [jobHasErrors, isProcessing, jobProcessing?.progress, job.processOutput])

  const currentStatus = useMemo(() => {
    if (jobHasErrors) return JobProcessStatus.ERROR
    if (isProcessing) return JobProcessStatus.PLAY
    if (job.processOutput?.progress === 100) return JobProcessStatus.DONE
    if (job.processOutput?.progress) return JobProcessStatus.PAUSE
    return JobProcessStatus.NONE
  }, [jobHasErrors, isProcessing, job.processOutput?.progress])

  const processingLayoutOptions = useMemo(() => {
    if (!job || !job.acquired || !job.scans || !currentProject)
      return emptyLayoutOptions

    const options: ProcessingProgressInfo = {
      action,
      progress,
      currentStatus,
      isImageAI: defaultTo(false, jobProcessing?.isImageAI),
    }
    return options
  }, [job, currentProject, action, progress, currentStatus, jobProcessing])

  const processingOptions = useMemo(() => {
    return jobProcessing
      ? jobProcessing.options!
      : job.processOutput?.options || emptyOptions
  }, [job, jobProcessing, emptyOptions])

  return [processingLayoutOptions, processingOptions, actionPayload]
}

export default useProcessingOptions
