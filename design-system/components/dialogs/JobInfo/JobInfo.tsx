import { Button, styled, TextField } from '@mui/material'
import Grid from '@mui/material/Grid'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { DialogNames } from 'components/dialogs/dialogNames'
import style from 'components/dialogs/JobInfo/JobInfo.module.scss'
import { INewJobFormProps } from 'components/dialogs/NewJobForm/NewJobForm'
import {
  AntennaConfiguration,
  ISecondAntennaConfiguratorProps,
} from 'components/dialogs/SecondAntennaConfigurator/SecondAntennaConfigurator'
import { Field, Form, Formik } from 'formik'
import { DeepPartial, identity, mergeDeepRight } from 'ramda'
import { FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  actionServiceDialogProceed,
  actionsServiceAbort,
} from 'store/features/actions/slice'
import { selectIsAdmin } from 'store/features/auth/slice'
import { cameraUpdate2ndAntennaClientSettingsActions } from 'store/features/camera/slice'
import {
  dataStorageUpdateJobActions,
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  positionGet2ndAntennaSettingsActions,
  positionUpdate2ndAntennaSettingsActions,
  resetSecondAntennaAction,
  select2ndAntenna,
} from 'store/features/position/slice'
import { AntennaSettings } from 'store/features/position/types'
import { logWarning, selectSystemInfo } from 'store/features/system/slice'
import { getCameraEnableDescription } from 'utils/camera'
import { checkAntennaValues } from 'utils/jobs'
import {
  cmToIn,
  digits,
  kmToM,
  labelWithUnit,
  mtToFt,
  unitLabel,
  unitValueFull,
} from 'utils/numbers'
import { getSectionFromPathname } from 'utils/strings'
import { object } from 'yup'

export interface IJobInfoProps {
  initialValues?: IJob
  disableEdit?: boolean
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: 60,

  '.MuiInputBase-input': {
    padding: '6px 0 2px',
    textAlign: 'center',
    color: theme.colors.primary_11,
  },
  '.MuiInput-underline.Mui-disabled:before': {
    borderBottomStyle: 'solid',
  },
  '.MuiInputBase-input.Mui-disabled': {
    borderBottomStyle: 'solid',
    color: theme.colors.primary_13,
    WebkitTextFillColor: theme.colors.primary_13,
  },
}))

/**
 * JobInfo description
 */
const JobInfo: FC<IJobInfoProps> = ({
  initialValues,
  disableEdit,
}: PropsWithChildren<IJobInfoProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const isAdmin = useSelector(selectIsAdmin)
  const job: IJob | undefined = currentJob || initialValues
  // useLocation should be the right hook to use, but it doesn't work with the mockStore.
  // Must use any since the store RootState doesn't contain router info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathname = useSelector((state: any) => state.router.location.pathname)
  const section = getSectionFromPathname(pathname)
  const isAcquisition = section === 'acquisition'
  const secondAntennaSettings = useSelector(select2ndAntenna)
  const jobAntennaSettings = job?.antenna
  const unit = currentProject?.coordinate?.unit
  const systemInfo = useSelector(selectSystemInfo)
  const antennaStoredValues = useSelector(select2ndAntenna)

  /* show the scanline spacing only if it's not a TRK100 or TRK300 */
  const showScanlineSpacing = useMemo(() => {
    if (!systemInfo) return false
    return systemInfo?.product !== 'PEGASUS TRK100' && systemInfo?.product !== 'PEGASUS TRK300'
  }, [systemInfo])

  const antennaLeverarm = useMemo(() => {
    if (!jobAntennaSettings?.leverarm) return null
    if (checkAntennaValues(jobAntennaSettings)) {
      const conv = (v?: number) => {
        return digits(unitValueFull(mtToFt, v, unit), 3)
      }
      return {
        x: conv(jobAntennaSettings.leverarm.x),
        y: conv(jobAntennaSettings.leverarm.y),
        z: conv(jobAntennaSettings.leverarm.z),
      }
    }
    return null
  }, [jobAntennaSettings, unit])

  const drivingSpeedWithUnit = useMemo(
    () => labelWithUnit('KMH', kmToM, job?.drivingspeed, unit),
    [unit, job]
  )

  const imageElapsedWithUnit = useMemo(
    () => labelWithUnit('MS', identity, job?.camera?.elapse, unit),
    [unit, job]
  )

  const scanlineSpacingdWithUnit = useMemo(
    () => labelWithUnit('CM', cmToIn, job?.scanner?.scanlinespacing, unit),
    [unit, job]
  )

  const scanrangeWithUnit = useMemo(
    () => labelWithUnit('M', mtToFt, job?.scanner?.range, unit),
    [unit, job]
  )

  const accuracyWithUnit = useMemo(
    () =>
      labelWithUnit(
        'CM',
        cmToIn,
        (job?.position?.accuracy?.low || 0) * 100,
        unit
      ),
    [unit, job]
  )

  const cameraDescription = useMemo(() => {
    const camera = job?.camera
    if (!unit) return ''
    if (!camera) return ''
    return getCameraEnableDescription(camera, unit)
  }, [job, unit])

  const confirmLabel = useMemo(
    () =>
      disableEdit
        ? t('job_info.close', 'Close')
        : t('job_info.confirm', 'Confirm'),
    [disableEdit, t]
  )

  const formikInitialValues = useMemo(() => {
    if (job) {
      return { ...job }
    }
    return {
      DMI: '',
      x: '',
      y: '',
      z: '',
    }
  }, [job])

  const validationSchema = useMemo(() => {
    return object({
      // DMI: number().required(t('job_info.DMI', 'DMI value required')),
      // x: number().required(),
      // y: number().required(),
      // z: number().required(),
    })
  }, [])

  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      // setTimeout(() => {
      //   setSubmitting(false)
      // }, 500)
      if (isAcquisition && !checkAntennaValues(values.antenna)) {
        const error = {
          name: 'name',
          message: t(
            'job_info.errors.2nd_antenna_not_configured',
            'antenna error'
          ),
        }
        dispatch(errorAction(error))
        return
      }
      dispatch(closeDialogAction())
      dispatch(actionServiceDialogProceed())
    },
    [dispatch, isAcquisition, t]
  )

  const editJob = () => {
    dispatch(closeDialogAction())
    dispatch(
      openDialogAction({
        component: DialogNames.NewJobForm,
        componentProps: {
          initialValues: job,
          lockedPlan: true,
        } as INewJobFormProps,
      })
    )
  }

  const backToJobs = () => {
    dispatch(
      logWarning(
        '[USER_ACTION] user canceled activation from the job info dialog'
      )
    )
    dispatch(closeDialogAction())
    dispatch(actionsServiceAbort())
  }

  const onSecondAntennaSave = (config: AntennaConfiguration) => {
    const { leverarm } = config.server
    if (!leverarm) return
    if (!currentJob) return
    // save the job with the new antenna settings
    const jobOverrides: DeepPartial<IJob> = {
      antenna: { leverarm },
    }
    const updatedJob = mergeDeepRight(currentJob, jobOverrides) as IJob
    const [, , diskName, projectName] = pathname
    dispatch(
      dataStorageUpdateJobActions.request({
        diskName,
        projectName,
        jobName: currentJob.name,
        job: updatedJob,
      })
    )
    // save the antenna settings to the system
    const updatedAntenna = mergeDeepRight(
      secondAntennaSettings,
      config.server
    ) as AntennaSettings
    dispatch(positionUpdate2ndAntennaSettingsActions.request(updatedAntenna))
    // save the antenna client settings to the system
    config.client &&
      dispatch(
        cameraUpdate2ndAntennaClientSettingsActions.request(config.client)
      )
  }

  const open2ndAntennaConf = () => {
    dispatch(resetSecondAntennaAction())
    dispatch(
      openDialogAction({
        component: DialogNames.SecondAntennaConfigurator,
        componentProps: {
          onSave: onSecondAntennaSave,
          onClose: () =>
            dispatch(positionGet2ndAntennaSettingsActions.request()),
        } as ISecondAntennaConfiguratorProps,
        dialogProps: {
          fullScreen: true,
        },
      })
    )
  }

  // if the second antenna is selected, call the api to check if there are saved values
  useEffect(() => {
    if (isAcquisition && job?.antenna?.type === 'double') {
      dispatch(positionGet2ndAntennaSettingsActions.request())
    }
  }, [dispatch, isAcquisition, job?.antenna?.type])

  // show the button only if there are saved values
  const showSecondAntennaButtonLoader = useMemo(() => {
    return (
      !!antennaStoredValues &&
      !!antennaStoredValues.leverarm &&
      checkAntennaValues({ ...antennaStoredValues, type: 'double' })
    )
  }, [antennaStoredValues])

  const loadSavedValues = async () => {
    if (!currentJob) return
    if (!antennaStoredValues || !antennaStoredValues.leverarm) return
    const overrides: DeepPartial<IJob> = {
      antenna: { leverarm: antennaStoredValues.leverarm },
    }
    const updatedJob = mergeDeepRight(currentJob, overrides) as IJob
    const [, , diskName, projectName] = pathname
    dispatch(
      dataStorageUpdateJobActions.request({
        diskName,
        projectName,
        jobName: currentJob.name,
        job: updatedJob,
      })
    )
  }

  return (
    <div>
      <Formik
        initialValues={formikInitialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, submitForm }) => {
          return (
            <Form className={style.jobInfo}>
              <div className={style.header}>
                <Icon name="JobInfo" />
                <h1 className={style.title}>
                  {t('job_info.title', 'job info')}
                </h1>
              </div>
              <div className={style.scrolling}>
                <Grid container className={style.main}>
                  {/** PLANNING */}
                  <Grid item xs={6}>
                    <p className={classNames(style.label)}>
                      {t('job_info.rows.planned.title', 'job planning')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={classNames(style.value)}>
                      {job?.planned
                        ? t('job_info.rows.planned.values.yes', 'yes')
                        : t('job_info.rows.planned.values.no', 'no')}
                    </p>
                  </Grid>

                  {/** JOB TYPE */}
                  <Grid item xs={6}>
                    <p className={classNames(style.label)}>
                      {t('job_info.rows.type.title', 'type')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={classNames(style.value)}>
                      {t(
                        `new_job_form.option.job_type.${job?.type}`,
                        job?.type || '--'
                      )}
                    </p>
                  </Grid>

                  {/** PROFILE */}
                  <Grid item xs={6}>
                    <p className={classNames(style.label)}>
                      {t('job_browser.details.profile', 'profile')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={classNames(style.value)}>
                      {t(`new_job_form.option.job_type.p${job?.profile}`, '--')}
                    </p>
                  </Grid>

                  {/** NTRIP */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t('job_info.rows.ntrip.title', 'positioning')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>
                      {job?.ntrip?.enable
                        ? t('job_info.rows.ntrip.values.enabled', 'rtk')
                        : t('job_info.rows.ntrip.values.not_enabled', 'no rtk')}
                    </p>
                  </Grid>
                  {job?.ntrip?.enable && (
                    <>
                      <Grid item xs={6} className={style.innerCell}>
                        <Icon name="Inside" className={style.insideIcon} />
                        <p
                          className={classNames(style.label, style.labelInner)}
                        >
                          {t(
                            'job_info.rows.ntrip.mountpoint.title',
                            'mountpoint'
                          )}
                        </p>
                      </Grid>
                      <Grid item xs={6}>
                        <p
                          className={classNames(style.value, style.valueInner)}
                        >
                          {job?.ntrip?.mountpoint || '--'}
                        </p>
                      </Grid>
                      <Grid item xs={6} className={style.innerCell}>
                        <Icon name="Inside" className={style.insideIcon} />
                        <p
                          className={classNames(style.label, style.labelInner)}
                        >
                          {t(
                            'job_info.rows.ntrip.interfacemode.title',
                            'interfacemode'
                          )}
                        </p>
                      </Grid>
                      <Grid item xs={6}>
                        <p
                          className={classNames(style.value, style.valueInner)}
                        >
                          {job?.ntrip?.interfacemode || '--'}
                        </p>
                      </Grid>
                    </>
                  )}

                  {/** DMI */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t('job_info.rows.dmi.title', 'DMI')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>
                      {t(
                        `new_job_form.option.dmi.${job?.dmi?.type}`,
                        '--'
                      ).toUpperCase()}
                    </p>
                  </Grid>

                  {/* <Grid item xs={6}>
                  <Icon name='Inside' className={style.insideIcon} />
                  <p className={classNames(style.label, style.labelInner)}>
                    {t('job_info.rows.dmi.leverarm.x.title', 'X')}
                  </p>
                </Grid>
                <Grid item xs={6}>
                  <div className={style.field}>
                    <Edit className={style.editIcon} />
                    <Field
                      component={TextField}
                      name="DMI"
                      type="number"
                      value={job?.dmi?.leverarm?.x || '--'}
                    />
                  </div>
                </Grid> */}

                  {/** COLLECTION MODE */}
                  {/* <Grid item xs={6}>
                    <p className={style.label}>
                      {t(
                        'job_info.rows.collectionmode.title',
                        'Collection mode'
                      )}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>
                      {t(
                        `new_job_form.option.collectionmode.${job?.collectionmode}`,
                        '--'
                      )}
                    </p>
                  </Grid> */}

                  {/** CAMERA */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t('job_info.rows.camera.title', 'camera')}
                    </p>
                  </Grid>
                  <Grid item xs={6} data-testid="camera-enable">
                    <p className={style.value}>{cameraDescription}</p>
                  </Grid>

                  {/** IMAGE ELAPSE */}
                  {job?.camera?.enable === 2 && (
                    <>
                      <Grid item xs={6}>
                        <p className={style.label}>
                          {t('job_info.rows.camera.elapse.title', 'elapse')}
                        </p>
                      </Grid>
                      <Grid item xs={6} data-testid="camera-elapse">
                        <p className={style.value}>{imageElapsedWithUnit}</p>
                      </Grid>
                    </>
                  )}

                  {/* hide the camera blur if the camera is OFF */}
                  {job?.camera?.enable !== 0 && (
                    <>
                      <Grid item xs={6}>
                        <p className={style.label}>
                          {t('job_info.rows.camera.blur.title', 'blur')}
                        </p>
                      </Grid>
                      <Grid item xs={6} data-testid="camera-blur">
                        <p className={style.value}>
                          {job?.camera?.blur
                            ? t('job_info.rows.camera.values.yes', 'yes')
                            : t('job_info.rows.camera.values.no', 'no')}
                        </p>
                      </Grid>
                    </>
                  )}

                  {/** ANTENNA TYPE */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t('job_info.rows.antenna.title', 'antenna')}
                    </p>
                  </Grid>
                  <Grid item xs={6} data-testid="2nd-antenna-field">
                    <p className={style.value}>
                      {t(
                        `new_job_form.option.antenna.${job?.antenna?.type}`,
                        '--'
                      ).toUpperCase()}
                    </p>
                  </Grid>

                  {/** SECOND ANTENNA */}
                  {job?.antenna?.type === 'double' && !isAdmin && (
                    <div
                      className={classNames({
                        [style.standardUserValues]: true,
                        [style.valid]: checkAntennaValues(job.antenna),
                      })}
                    >
                      {checkAntennaValues(job.antenna)
                        ? t('job_info.rows.antenna.valid', 'valid')
                        : t('job_info.rows.antenna.invalid', 'invalid')}
                    </div>
                  )}

                  {job?.antenna?.type === 'double' && isAdmin && (
                    <Grid
                      item
                      xs={12}
                      className={classNames(style.noError, style.antennaValues)}
                      data-testid="2nd-antenna-values"
                    >
                      <Icon name="Inside" className={style.insideIcon} />
                      <div className={style.field}>
                        <p
                          className={classNames(style.label, style.labelInner)}
                        >
                          {t('second_antenna.x', {
                            unit: unitLabel('M', unit),
                          })}
                        </p>
                        <Field
                          component={StyledTextField}
                          name="x"
                          value={antennaLeverarm?.x?.toFixed(3) || '--'}
                          type="text"
                          disabled
                        />
                      </div>

                      <div className={style.field}>
                        <p
                          className={classNames(style.label, style.labelInner)}
                        >
                          {t('second_antenna.y', {
                            unit: unitLabel('M', unit),
                          })}
                        </p>
                        <Field
                          component={StyledTextField}
                          name="y"
                          value={antennaLeverarm?.y?.toFixed(3) || '--'}
                          type="text"
                          disabled
                        />
                      </div>

                      <div className={style.field}>
                        <p
                          className={classNames(style.label, style.labelInner)}
                        >
                          {t('second_antenna.z', {
                            unit: unitLabel('M', unit),
                          })}
                        </p>
                        <Field
                          component={StyledTextField}
                          value={antennaLeverarm?.z?.toFixed(3) || '--'}
                          name="z"
                          type="text"
                          disabled
                        />
                      </div>
                    </Grid>
                  )}

                  {isAcquisition && job?.antenna?.type === 'double' && (
                    <Grid
                      item
                      xs={12}
                      className={style.antennaButtons}
                      data-testid="2nd-antenna-buttons"
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        data-testid="recalculate-button"
                        onClick={open2ndAntennaConf}
                      >
                        {t('job_info.recalculate', 'recalculate')}
                      </Button>
                      {showSecondAntennaButtonLoader && (
                        <Button
                          variant="outlined"
                          color="primary"
                          data-testid="savedvalues-button"
                          onClick={loadSavedValues}
                        >
                          {t('job_info.use_saved_values', 'use saved values')}
                        </Button>
                      )}
                    </Grid>
                  )}

                  {/** DRIVING SPEED */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t('job_info.rows.drivingspeed.title', 'speed')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>{drivingSpeedWithUnit}</p>
                  </Grid>

                  {/** SCANLINE SPACING */}
                  {showScanlineSpacing && (
                    <>
                      <Grid item xs={6}>
                        <p className={style.label}>
                          {t(
                            'job_info.rows.scanner.scanlinespacing.title',
                            'spacing'
                          )}
                        </p>
                      </Grid>
                      <Grid item xs={6}>
                        <p className={style.value}>
                          {scanlineSpacingdWithUnit}
                        </p>
                      </Grid>
                    </>
                  )}

                  {/** ROTATION SPEED */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t(
                        'job_info.rows.scanner.rotationspeed.title',
                        'rotation'
                      )}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>
                      {job?.scanner?.rotationspeed
                        ? `${job?.scanner?.rotationspeed}Hz`
                        : '--'}
                    </p>
                  </Grid>

                  {/** PROFILER POINTS */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t(
                        'job_info.rows.scanner.pointspersecond.title',
                        'points'
                      )}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>
                      {job?.scanner?.pointspersecond
                        ? `${job?.scanner?.pointspersecond}`
                        : '--'}
                    </p>
                  </Grid>

                  {/** MAX RANGE */}
                  <Grid item xs={6}>
                    <p className={style.label}>
                      {t('job_info.rows.scanner.range.title', 'range')}
                    </p>
                  </Grid>
                  <Grid item xs={6}>
                    <p className={style.value}>{scanrangeWithUnit}</p>
                  </Grid>

                  {/** ACCURACY */}
                  {job?.ntrip?.enable && !!job?.position?.accuracy?.low && (
                    <Grid item xs={6}>
                      <p className={style.label}>
                        {t('job_info.rows.position.accuracy.title', 'accuracy')}
                      </p>
                    </Grid>
                  )}
                  {job?.ntrip?.enable && !!job?.position?.accuracy?.low && (
                    <Grid item xs={6}>
                      <p className={style.value}>{accuracyWithUnit}</p>
                    </Grid>
                  )}
                </Grid>
              </div>

              <div className={style.footer}>
                <div className={style.buttonsContainer}>
                  {isAcquisition && (
                    <Button
                      data-testid="back-to-jobs"
                      variant="outlined"
                      color="primary"
                      onClick={backToJobs}
                    >
                      {t('job_info.back_to_jobs', 'back to jobs')}
                    </Button>
                  )}
                  {!!disableEdit || (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={editJob}
                    >
                      {t('job_info.edit', 'edit')}
                    </Button>
                  )}
                  <Button color="primary" onClick={submitForm}>
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}
export default JobInfo
