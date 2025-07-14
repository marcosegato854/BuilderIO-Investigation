import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  styled,
} from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import { Field, Form, Formik } from 'formik'
import { all, defaultTo, mergeDeepRight, propEq } from 'ramda'
import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import {
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'
import { jobHadCameraEnabled } from 'store/features/dataStorage/utils'
import './JobProcessingOptions.module.scss'

const PROCESSINGCODES = {
  colorization: ['LCB103', 'LCB012'],
  e57: ['LCB010'],
  las: ['LCB009'],
  lgsx: ['LCB014'],
}

/* eslint-disable-next-line */
export interface IJobProcessingOptionsProps {
  job: IJob
  processingOptions: ProcessingOptions
  processingLayout: ProcessingProgressInfo
  onCancelCallback?: Function
  startButtonCallback?: (values: ProcessingOptions) => void
  stopButtonCallback?: Function
}

const CustomFormControl = styled(FormControlLabel)(({ theme }) => ({
  color: 'inherit',
  '.MuiFormControlLabel-label': { color: 'inherit' },
  '.MuiCheckbox-root': { color: 'inherit', padding: '3px 9px' },
  '.MuiFormControlLabel-label.Mui-disabled': {
    color: 'inherit',
    opacity: '.4',
  },
  '.MuiCheckbox-root.Mui-disabled': {
    color: 'inherit',
    opacity: '.4',
  },
}))

const JobProcessingOptions: FC<IJobProcessingOptionsProps> = ({
  job,
  processingOptions,
  processingLayout,
  onCancelCallback,
  startButtonCallback,
  stopButtonCallback,
}: PropsWithChildren<IJobProcessingOptionsProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { currentStatus, isImageAI } = processingLayout

  const blurDisabled = useMemo(() => {
    // blur is disabled if already done or the camera was OFF
    if (processingOptions.finalise?.blur?.done) return true
    return !jobHadCameraEnabled(job)
  }, [job, processingOptions])

  const colorizationDisabled = useMemo(() => {
    // colorization is disabled if already done or the camera was OFF
    if (processingOptions.finalise?.colorization?.done) return true
    return !jobHadCameraEnabled(job)
  }, [job, processingOptions])

  const rtkEnabled = defaultTo(false, job.ntrip?.enable)

  const isChecked = (
    enableValue: boolean,
    doneValue: boolean,
    isDisabled: boolean
  ) => {
    if (isDisabled) return doneValue
    return doneValue ? true : enableValue
  }

  const checkDisabled = useMemo(() => {
    if (currentStatus === JobProcessStatus.PLAY) return true
    return false
  }, [currentStatus])

  /* const handleStopButtonCallback = useCallback(() => {
    stopButtonCallback && stopButtonCallback()
  }, [stopButtonCallback]) */

  const processingButtonDisabled = useCallback(
    (values: ProcessingOptions) => {
      if (blurDisabled && !rtkEnabled) return true
      const flattenValues = [
        ...Object.values(values.finalise),
        ...Object.values(values.export),
      ]
      // CHECK that there is at least 1 value enabled
      return all(propEq('enable', false))(flattenValues)
    },
    [blurDisabled, rtkEnabled]
  )

  const processingErrorFound = useCallback(
    (codeErrorList: string[]) => {
      if (
        job.processOutput &&
        job.processOutput.errors &&
        job.processOutput.errors.length > 0
      ) {
        const { errors } = job.processOutput
        return !!errors.find((error) => codeErrorList.includes(error.code))
      }
      return false
    },
    [job.processOutput]
  )

  /* const ProcessingButton = useCallback(
    (submitForm, values) => {
      if (currentStatus === JobProcessStatus.ERROR) return null
      if (currentStatus === JobProcessStatus.PLAY) {
        if (isImageAI)
          return (
            <Button
              color="primary"
              onClick={() => handleStopButtonCallback()}
              data-testid="processing-pause-button"
            >
              {t('job_processing.options.button_pause', 'pause')}
            </Button>
          )
        return (
          <Button
            color="primary"
            onClick={() => handleStopButtonCallback()}
            data-testid="processing-stop-button"
          >
            {t('job_processing.options.button_stop', 'stop')}
          </Button>
        )
      }
      return (
        <Button
          color="primary"
          onClick={submitForm}
          disabled={processingButtonDisabled(values)}
          data-testid="processing-start-button"
        >
          {t('job_processing.options.button_start', 'start')}
        </Button>
      )
    },
    [
      currentStatus,
      processingButtonDisabled,
      t,
      isImageAI,
      handleStopButtonCallback,
    ]
  )
 */

  const formikInitialValues = useMemo(() => {
    return mergeDeepRight(processingOptions, {
      finalise: {
        blur: {
          enable: blurDisabled
            ? false
            : processingOptions.finalise.blur.enable || false,
        },
        colorization: {
          enable: colorizationDisabled
            ? false
            : processingOptions.finalise.colorization.enable || false,
        },
      },
      export: {
        lgsx: {
          enable: false,
        },
        e57: {
          enable: false,
        },
        las: {
          enable: false,
        },
      },
    })
  }, [blurDisabled, colorizationDisabled, processingOptions])

  const onSubmit = useCallback(
    (values: ProcessingOptions) => {
      startButtonCallback && startButtonCallback(values)
    },
    [startButtonCallback]
  )

  const handleOnClose = () => {
    onCancelCallback && onCancelCallback()
  }

  return (
    <Box padding={1}>
      <Formik initialValues={formikInitialValues} onSubmit={onSubmit}>
        {({ values, setFieldValue, submitForm }) => (
          <Form>
            {/* FINALISE */}
            <FormGroup sx={{ color: (theme) => theme.colors.primary_11 }}>
              <FormLabel sx={{ color: 'inherit', marginBottom: '6px' }}>
                {t('job_processing.options.finalise.label', 'finalise')}
              </FormLabel>
              <CustomFormControl
                control={
                  <Field
                    component={Checkbox}
                    inputProps={{ 'data-testid': 'processing-blur-checkbox' }}
                    type="checkbox"
                    disabled={blurDisabled || checkDisabled}
                    size="small"
                    checked={isChecked(
                      defaultTo(false, values.finalise?.blur?.enable),
                      defaultTo(false, values.finalise?.blur?.done),
                      blurDisabled
                    )}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue(
                        'finalise.blur.enable',
                        event.target.checked
                      )
                    }}
                  />
                }
                labelPlacement="end"
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {t('job_processing.options.finalise.blur', 'blur')}
                  </Box>
                }
              />

              <CustomFormControl
                control={
                  <Field
                    component={Checkbox}
                    type="checkbox"
                    disabled={
                      colorizationDisabled || !rtkEnabled || checkDisabled
                    }
                    size="small"
                    checked={isChecked(
                      defaultTo(false, values.finalise?.colorization?.enable),
                      defaultTo(false, values.finalise?.colorization?.done),
                      colorizationDisabled || !rtkEnabled
                    )}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue(
                        'finalise.colorization.enable',
                        event.target.checked
                      )
                    }}
                  />
                }
                labelPlacement="end"
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {t(
                      'job_processing.options.finalise.colorization',
                      'colorize'
                    )}
                    {processingErrorFound(PROCESSINGCODES.colorization) && (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        data-testid="error-icon-colorization"
                        sx={{
                          marginLeft: '16px',
                          lineHeight: 0,
                          '& svg': { width: '24px', height: '24px' },
                        }}
                      >
                        <Icon name="Warning" />
                      </Box>
                    )}
                  </Box>
                }
              />
            </FormGroup>
            <Divider
              sx={{
                borderColor: (theme) => theme.colors.primary_11,
                opacity: '.7',
                margin: '16px 0',
              }}
            />

            {/* EXPORT */}
            <FormGroup sx={{ color: (theme) => theme.colors.primary_11 }}>
              <FormLabel sx={{ color: 'inherit', marginBottom: '6px' }}>
                {t('job_processing.options.export.label', 'export')}
              </FormLabel>
              <CustomFormControl
                control={
                  <Field
                    component={Checkbox}
                    type="checkbox"
                    disabled={!rtkEnabled || checkDisabled}
                    checked={values.export?.las?.enable || false}
                    size="small"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('export.las.enable', event.target.checked)
                    }}
                  />
                }
                labelPlacement="end"
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {t('job_processing.options.export.las', 'las')}
                    {processingErrorFound(PROCESSINGCODES.las) && (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        data-testid="error-icon-las"
                        sx={{
                          marginLeft: '16px',
                          lineHeight: 0,
                          '& svg': { width: '24px', height: '24px' },
                        }}
                      >
                        <Icon name="Warning" />
                      </Box>
                    )}
                  </Box>
                }
              />
              <CustomFormControl
                control={
                  <Field
                    component={Checkbox}
                    type="checkbox"
                    disabled={!rtkEnabled || checkDisabled}
                    checked={values.export?.lgsx?.enable || false}
                    size="small"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('export.lgsx.enable', event.target.checked)
                    }}
                  />
                }
                labelPlacement="end"
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {t('job_processing.options.export.lgsx', 'lgsx')}
                    {processingErrorFound(PROCESSINGCODES.lgsx) && (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        data-testid="error-icon-lgsx"
                        sx={{
                          marginLeft: '16px',
                          lineHeight: 0,
                          '& svg': { width: '24px', height: '24px' },
                        }}
                      >
                        <Icon name="Warning" />
                      </Box>
                    )}
                  </Box>
                }
              />
              <CustomFormControl
                control={
                  <Field
                    component={Checkbox}
                    type="checkbox"
                    disabled={!rtkEnabled || checkDisabled}
                    checked={values.export?.e57?.enable || false}
                    size="small"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('export.e57.enable', event.target.checked)
                    }}
                  />
                }
                labelPlacement="end"
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {t('job_processing.options.export.e57', 'e57')}
                    {processingErrorFound(PROCESSINGCODES.e57) && (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        data-testid="error-icon-e57"
                        sx={{
                          marginLeft: '16px',
                          lineHeight: 0,
                          '& svg': { width: '24px', height: '24px' },
                        }}
                      >
                        <Icon name="Warning" />
                      </Box>
                    )}
                  </Box>
                }
              />
            </FormGroup>
            <Box
              alignItems="center"
              justifyContent="flex-end"
              display="flex"
              gap={2}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleOnClose()}
              >
                {t('job_processing.options.button_cancel', 'cancel')}
              </Button>
              <Button
                color="primary"
                onClick={submitForm}
                disabled={processingButtonDisabled(values)}
                data-testid="processing-start-button"
              >
                {t('job_processing.options.button_start', 'start')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default JobProcessingOptions
