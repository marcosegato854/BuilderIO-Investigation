/* eslint-disable react/jsx-curly-newline */
import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Input,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material'
import classNames from 'classnames'
import { CustomSlider } from 'components/atoms/CustomSlider/CustomSlider'
import { FinalAlignmentButton } from 'components/atoms/FinalAlignmentButton/FinalAlignmentButton'
import { HelpButton } from 'components/atoms/HelpButton/HelpButton'
import { Icon } from 'components/atoms/Icon/Icon'
import { ImageSelector } from 'components/atoms/ImageSelector/ImageSelector'
import { OpenSelectbox } from 'components/atoms/OpenSelectbox/OpenSelectbox'
import { ProfilesSelect } from 'components/atoms/ProfilesSelect/ProfilesSelect'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import style from 'components/dialogs/NewJobForm/NewJobForm.module.scss'
import {
  DMIType,
  antennaTypeOptions,
  cameraBlurOptions,
  cameraEnableOptions,
  cameraEnableOptionsAdmin,
  collectionmodeOptions,
  dmiOptions,
  ntripOptions,
  plannedOptions,
  pointsPerSecondOptions,
  positionAccuracyOptions,
  scannerRangeOtions,
  scannerRotationSpeedOptions,
} from 'components/dialogs/NewJobForm/options'
import { getRangesForCoordinateSystem } from 'components/dialogs/NewJobForm/ranges'
import {
  FlatJob,
  checkJobtypeChangesWithFlatjob,
  flattenJob,
  getJobValuesToUpdate,
  maxSettingsValue,
  scannerInitialRangeOption,
  unflattenJob,
} from 'components/dialogs/NewJobForm/utils'
import { DialogNames } from 'components/dialogs/dialogNames'
import { Field, Form, Formik } from 'formik'
// TextField from formik-mui has error-text already managed
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { TextField as FormikTextField } from 'formik-mui'
import useAutoSelect from 'hooks/useAutoSelect'
import useLocalStorageExpiration from 'hooks/useLocalStorageExpiration'
import { compose, isNil, keys, lensProp, mergeDeepRight, set } from 'ramda'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  dataStorageCloseJobForm,
  dataStorageSubmitJobForm,
  dataStorageTempJob,
  selectDataStorageCurrentProject,
  selectDataStorageJobTypes,
  selectDataStorageJobs,
  selectDataStorageTempJob,
} from 'store/features/dataStorage/slice'
import { JobType } from 'store/features/dataStorage/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { selectSupportedSatellites } from 'store/features/position/slice'
import { selectRoutingEnabled } from 'store/features/routing/slice'
import { rtkServiceResetCurrentServerConnection } from 'store/features/rtk/slice'
import {
  selectScannerModel,
  selectScannerSupportedSettings,
} from 'store/features/scanner/slice'
import {
  selectJobsSettingsState,
  setJobsSettings,
} from 'store/features/settings/slice'
import { logWarning } from 'store/features/system/slice'
import { FormikListener } from 'utils/formik/FormikListener'
import { getMaxNameChars, getUniqueName } from 'utils/names'
import {
  cmToIn,
  ftToMt,
  inToCm,
  kmToM,
  labelWithUnit,
  mtToFt,
  unitLabel,
} from 'utils/numbers'
import { removeUndefinedProps } from 'utils/objects'
import { array, object, string } from 'yup'
import { re } from 'mathjs'

export interface INewJobFormProps {
  initialValues?: IJob
  lockedPlan?: boolean
}
interface RangeValue {
  min: number
  max: number
  default: number
}
interface Ranges {
  drivingspeed: RangeValue
  scannerRange: RangeValue
  scannerPointPerSecond: RangeValue
  scannerRotationSpeed: RangeValue
  scannerScanlineSpacing: RangeValue
  cameraDistance: RangeValue
  cameraElapse: RangeValue
}

const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9_]$/

// TODO: it appears that the frontend view can be zoomed, that shouldn't happen

/**
 * Form to create and edit Jobs
 */
const NewJobForm: FC<INewJobFormProps> = ({
  initialValues,
  lockedPlan,
}: PropsWithChildren<INewJobFormProps>) => {
  const isAdmin = useSelector(selectIsAdmin)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const jobs = useSelector(selectDataStorageJobs)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const titleRef = useAutoSelect()
  const jobTypesTemp = useSelector(selectDataStorageJobTypes)
  const supportedSatellites = useSelector(selectSupportedSatellites)
  // prettier-ignore
  const [useRtk, setUseRtk] = useState<boolean>(initialValues?.ntrip?.enable || false)
  // prettier-ignore
  const [isPlanned, setIsPlanned] = useState<boolean>(initialValues?.planned || false)
  // prettier-ignore
  const shouldRedirectAfterSave = useRef<boolean>(false);
  const currentValues = useRef<FlatJob>()
  const detailsRef = useRef<HTMLDivElement>(null)
  const [blurExpired, setBlurExpiration] = useLocalStorageExpiration(
    'blurExpiration',
    30
  )
  const defaultJobName = useMemo(() => getUniqueName(jobs, 'Job'), [jobs])
  const tempJob = useSelector(selectDataStorageTempJob)
  const scannerModel = useSelector(selectScannerModel)
  const unit = currentProject?.coordinate?.unit
  const supportedSettings = useSelector(selectScannerSupportedSettings)
  const jobNamesList = jobs
    .map((job) => job.name)
    .filter((name) => name !== initialValues?.name)
  const jobSettings = useSelector(selectJobsSettingsState)
  const routingEnabled = useSelector(selectRoutingEnabled)

  const imperial = useMemo(() => {
    return currentProject?.coordinate?.unit === 'imperial'
  }, [currentProject])

  /** this is true when the settings have a value >= 2M - PEF-4339 */
  const supports2MillionsPoints = useMemo(() => {
    if (!supportedSettings) return false
    if (!supportedSettings.settings || !supportedSettings.settings.length)
      return false
    return supportedSettings.settings.some((s) => s.pts >= 2000000)
  }, [supportedSettings])

  /** search for a value that it's around 1M - PEF-4339 */
  const valueNear1Million = useCallback(() => {
    if (!supports2MillionsPoints) return 0
    if (!supportedSettings) return 0
    if (!supportedSettings.settings || !supportedSettings.settings.length)
      return 0
    return supportedSettings.settings.find((s) => s.pts >= 1000000)?.pts || 0
  }, [supportedSettings, supports2MillionsPoints])

  /**
   * fill job types with scanner settings based on the current model, if missing
   * according to PEF-4339, the settings for the CL-360HD2 are max around 1M points per second
   */
  const jobTypes = useMemo(() => {
    const max = maxSettingsValue(supportedSettings, unit || 'metric')
    return jobTypesTemp
      .map((jt) =>
        mergeDeepRight(jt, {
          scanner: {
            pointspersecond:
              jt.scanner?.pointspersecond ||
              (supports2MillionsPoints ? valueNear1Million() : max('pts')),
            rotationspeed: jt.scanner?.rotationspeed || max('rps'),
            range: scannerInitialRangeOption(
              supportedSettings,
              'metric',
              jt.scanner?.pointspersecond ||
                (supports2MillionsPoints ? valueNear1Million() : max('pts')),
              jt.scanner?.rotationspeed || max('rps')
            ),
          },
        })
      )
      .filter((j) => isAdmin || !j.admin) as JobType[]
  }, [
    supportedSettings,
    unit,
    jobTypesTemp,
    supports2MillionsPoints,
    valueNear1Million,
    isAdmin,
  ])

  const editableScannerRange = useMemo(() => {
    if (!scannerModel) return false
    console.info(`[SCANNER] model: ${scannerModel}`)
    return ['Optech'].includes(scannerModel)
  }, [scannerModel])
  const visiblePointsSec = useMemo(() => {
    if (!scannerModel) return false
    return ['Optech'].includes(scannerModel)
  }, [scannerModel])

  const visibleScanlineSpacing = useMemo(() => {
    if (!scannerModel) return false
    return ['Optech', 'ZF'].includes(scannerModel)
  }, [scannerModel])

  const visibleRotationSpeed = useMemo(() => {
    return ['Optech', 'ZF'].includes(scannerModel)
  }, [scannerModel])

  const persistExternalValues = useCallback(
    (job: IJob): IJob => {
      return {
        ...job,
        ntrip: {
          ...initialValues?.ntrip,
          ...job.ntrip,
          enable: job.ntrip?.enable,
        },
        camera: {
          ...initialValues?.camera,
          ...job.camera,
          blur: job.camera?.blur,
        },
        creationdate: initialValues?.creationdate,
        updatedate: initialValues?.updatedate,
        scans: initialValues?.scans,
        size: initialValues?.size,
        completed: initialValues?.completed,
        acquired: initialValues?.acquired,
      }
    },
    [initialValues]
  )

  /** scroll to details when expanded */
  useLayoutEffect(() => {
    if (showDetails) {
      detailsRef.current &&
        detailsRef.current.scrollIntoView &&
        detailsRef.current.scrollIntoView({
          behavior: 'smooth', // Defines the transition animation. default: auto
          // block: 'start|center|end|nearest', // Defines vertical alignment. default: start
          // inline: 'start|center|end|nearest', // Defines horizontal alignment. default: nearest
        })
    }
  }, [showDetails])

  const satelliteOptions: IOption[] = useMemo(() => {
    return supportedSatellites.map((sat) => ({
      value: sat,
      label: sat.toUpperCase(),
    }))
  }, [supportedSatellites])

  /** derived value */
  const title = useMemo(() => {
    if (initialValues?.creationdate) return t('edit_job_form.title', 'Edit Job')
    return t('new_job_form.title', 'New Job')
  }, [initialValues, t])

  const positionAccuracyOptionsWithUnit: IOption[] = useMemo(
    () =>
      positionAccuracyOptions().map((o) => {
        const label = labelWithUnit('CM', cmToIn, o.value, unit)
        return set(lensProp('label'), label, o)
      }),
    [unit]
  )

  /** derived value */
  const ranges: Ranges = useMemo(() => {
    return getRangesForCoordinateSystem(supportedSettings)
  }, [supportedSettings])

  /** default form values, interpolate props and defaults */
  const formikInitialValues: Partial<FlatJob> = useMemo(() => {
    /** retrieve values from the default job type */
    const savedJobType = jobTypes
      ? jobTypes.find((jt) => jt.name === jobSettings?.lastUsedProfile)?.name
      : null
    const DEFAULT_JOBTYPE = savedJobType || 'Road'
    const defaultValues: Partial<FlatJob> = {
      name: defaultJobName,
      image: '',
      planned: 'false',
      type: DEFAULT_JOBTYPE,
      antennaType: 'single',
      cameraDistance: imperial ? 3.5 : 3,
      cameraEnable: 1,
      cameraElapse: 250,
      cameraBlur: 'true',
      collectionmode: 'oneway',
      dmiType: 'none',
      drivingspeed: ranges.drivingspeed.default, // TODO: should be based on the scanner model
      ntripEnable: 'false',
      positionSatellites: ['gps', 'glonass', 'galileo', 'beidou', 'qzss'],
      scannerPointPerSecond: ranges.scannerPointPerSecond.default,
      scannerRange: ranges.scannerRange.default,
      scannerRotationSpeed: ranges.scannerRotationSpeed.default,
      scannerScanlineSpacing: ranges.scannerScanlineSpacing.default,
      positionAccuracy: 5,
      cameraLeftOrientation: undefined,
      cameraRightOrientation: undefined,
    }
    if (!unit) return defaultValues
    if (!jobTypes) return defaultValues
    const defaultJob = jobTypes.find((jt) => jt.name === DEFAULT_JOBTYPE)
    if (!defaultJob) return defaultValues
    const defaultJobTypeWithName = mergeDeepRight(
      flattenJob(defaultJob as IJob, unit, scannerModel, supportedSettings),
      {
        type: DEFAULT_JOBTYPE,
      }
    )
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-unused-vars, @typescript-eslint/no-unused-vars
    const { name: _, ...defaultJobType } = defaultJobTypeWithName
    if (initialValues) {
      const overrideValues = removeUndefinedProps(
        flattenJob(initialValues, unit, scannerModel, supportedSettings)
      )
      return {
        ...defaultValues,
        ...defaultJobType,
        ...overrideValues,
      }
    }
    return {
      ...defaultValues,
      ...defaultJobType,
    }
  }, [
    initialValues,
    ranges,
    jobTypes,
    defaultJobName,
    unit,
    scannerModel,
    supportedSettings,
    jobSettings,
    imperial,
  ])

  const isEdited = useMemo(() => {
    if (!unit) return false
    if (!tempJob) return false
    if (!formikInitialValues) return false
    const changedValues = checkJobtypeChangesWithFlatjob(
      unflattenJob(formikInitialValues as FlatJob) as JobType,
      flattenJob(tempJob, unit, scannerModel, supportedSettings),
      unit,
      scannerModel,
      supportedSettings,
      true
    )
    return changedValues.length > 0
  }, [formikInitialValues, tempJob, unit, scannerModel, supportedSettings])

  /**
   * YUP validation schema
   */
  const validationSchema = useMemo(
    () =>
      object({
        name: string()
          .required(t('new_job_form.validation.job_name', 'job name required'))
          .min(3, t('new_job_form.validation.min3', '3 characters min'))
          .matches(
            nameRegex,
            t('new_job_form.validation.bad_characters', 'unallowed characters')
          )
          .max(
            getMaxNameChars(),
            t('new_job_form.validation.max', '25 characters max')
          )
          .notOneOf(
            jobNamesList,
            t('new_job_form.validation.name_duplicate', 'name already in use')
          ),
        positionSatellites: array().when('ntripEnable', {
          is: 'false',
          then: array().min(
            1,
            t('new_job_form.validation.satellites', 'choose satellites')
          ),
        }),
      }),
    [jobNamesList, t]
  )

  const goToRtkDialog = useCallback(
    (job: IJob) => {
      dispatch(closeDialogAction())
      // reset RTK connection to avoid the form scrolling, it will be reset anyway
      dispatch(rtkServiceResetCurrentServerConnection())
      dispatch(
        openDialogAction({
          component: DialogNames.RTKSettingsDialog,
          componentProps: {
            initialValues: {
              ...job.ntrip,
              connected: false,
            },
          },
        })
      )
    },
    [dispatch]
  )

  const showRtkDetails = () => {
    const newTempJob = persistExternalValues(
      unflattenJob(currentValues.current!, unit)
    )
    goToRtkDialog(newTempJob)
  }

  /** on form field change */
  const onTouched = useCallback(
    (values: FlatJob, setFieldValue: Function) => {
      if (!unit) return
      setUseRtk(values.ntripEnable === 'true')
      setIsPlanned(values.planned === 'true')
      /**
       * check if we need to set the type to custom
       * ignored types are defined inside the method checkJobtypeChangesWithFlatjob
       * */
      // if (values.type !== 'Custom') {
      const jobType =
        jobTypes.find((jt) => jt.name === values.type) ||
        jobTypes.find((jt) => jt.profile === values.profile) // this should be the case of 'Custom'
      if (jobType) {
        const isSavedCustom = !['Road', 'Rail', 'Boat', 'Custom'].includes(
          jobType.name
        )
        const changedValues = checkJobtypeChangesWithFlatjob(
          jobType,
          values,
          unit,
          scannerModel,
          supportedSettings
        )
        if (!isSavedCustom && changedValues.length) {
          setFieldValue('type', 'Custom')
        } else {
          setFieldValue('type', jobType.name)
        }
      }
      // }
      /** update the temp job */
      const newTempJob = persistExternalValues(unflattenJob(values, unit))
      // newTempJob.ntrip = initialValues?.ntrip;
      dispatch(dataStorageTempJob(newTempJob))
      /** open rtk settings dialog when the user changes rtk to on */
      if (currentValues.current) {
        if (currentValues.current?.ntripEnable !== values.ntripEnable) {
          if (values.ntripEnable === 'true') {
            goToRtkDialog(newTempJob)
          }
        }
      }
      currentValues.current = values
    },
    [
      jobTypes,
      dispatch,
      persistExternalValues,
      goToRtkDialog,
      unit,
      scannerModel,
      supportedSettings,
    ]
  )

  const setLinkedFieldValue = (
    valueKey: keyof FlatJob,
    newValue: unknown,
    setFieldValue: Function
  ) => {
    setFieldValue(valueKey, newValue)
    if (!currentProject?.coordinate?.unit) return
    const valuestoUpdate = getJobValuesToUpdate(
      valueKey,
      newValue as string,
      currentValues.current,
      scannerModel,
      supportedSettings
    )
    keys(valuestoUpdate).forEach((key) => {
      setFieldValue(key, valuestoUpdate[key])
    })
  }

  /**
   * Update field values with the defaults from jobtype
   * @param newType string
   * @param setFieldValue Function
   * @returns
   */
  const onTypeChange = (
    newType: string,
    setFieldValue: Function,
    profile?: number
  ) => {
    // when a new profile is created,
    // it's not available in the jobTypes at this point,
    // so we geet the settings from the default profile with the same profile value
    const preset =
      jobTypes.find((jt) => jt.name === newType) ||
      jobTypes.find((jt) => jt.profile === profile)
    if (preset && unit) {
      const flatPreset = flattenJob(
        preset,
        unit,
        scannerModel,
        supportedSettings
      )
      keys(flatPreset).forEach((field) => {
        if (field === 'name') return
        const newValue = flatPreset[field]
        if (field === 'planned') return
        !isNil(newValue) && setFieldValue(field, newValue)
      })
    }
    dispatch(
      setJobsSettings({
        lastUsedProfile: newType,
      })
    )
    return setFieldValue('type', newType)
  }

  /**
   * Reset field values to the initial ones
   * @param e React.ChangeEvent<HTMLSelectElement>
   * @param setFieldValue Function
   * @returns
   */
  const resethandler = (setFieldValue: Function) => {
    const flatPreset = formikInitialValues
    if (flatPreset && unit) {
      keys(flatPreset).forEach((field) => {
        const newValue = flatPreset[field]
        setFieldValue(field, newValue)
      })
    }
  }

  const saveLabel = useMemo(() => {
    if (lockedPlan)
      return t('edit_job_form.update_btn_unplanned', 'save and capture')
    const saveLabelPlanned = initialValues?.creationdate
      ? t('edit_job_form.update_btn_planned', 'plan')
      : t('edit_job_form.save_btn_planned', 'save and plan')
    const saveLabelUnplanned = initialValues?.creationdate
      ? t('edit_job_form.update_btn_unplanned', 'save and capture')
      : t('edit_job_form.save_btn_unplanned', 'capture')
    return isPlanned ? saveLabelPlanned : saveLabelUnplanned
  }, [initialValues, isPlanned, lockedPlan, t])

  /** submit button */
  const submitButton = useCallback(
    (submitForm) => {
      // use lockedPlan to know if we are in activation for now
      const saveOnly = lockedPlan
        ? undefined
        : () => {
            shouldRedirectAfterSave.current = false
            submitForm()
          }
      const labelSecondary = lockedPlan
        ? undefined
        : t('new_job_form.save_only', 'Save Only')
      const saveAndRedirect = () => {
        shouldRedirectAfterSave.current = true
        submitForm()
      }
      // TODO: there could be no scans, better to get it from the backend in the job detail api
      const acquired = initialValues ? Number(initialValues?.scans) > 0 : false
      if (acquired) return null
      return (
        <FinalAlignmentButton
          onClick={saveAndRedirect}
          onClickSecondary={saveOnly}
          label={saveLabel}
          labelSecondary={labelSecondary}
        />
      )
    },
    [initialValues, t, lockedPlan, saveLabel]
  )

  /** Handle form submission */
  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      // TODO: this makes the form editable again, but it should be done only when receiving errors. We can lock the screen in other ways
      setSubmitting(false)
      const job = unflattenJob(values, unit)
      const jobWithExternalValues = persistExternalValues(job)
      dispatch(
        dataStorageSubmitJobForm({
          jobName: initialValues?.name,
          job: jobWithExternalValues,
          redirect: !!shouldRedirectAfterSave.current,
        })
      )
    },
    [dispatch, initialValues, persistExternalValues, unit]
  )

  const closeHandler = () => {
    dispatch(dataStorageCloseJobForm())
  }

  const blurDisclaimerChangeHandler = async (
    value: string,
    setFieldValue: Function
  ) => {
    setFieldValue('cameraBlur', value)
    if (value === 'true') return
    if (!blurExpired) return
    dispatch(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          variant: 'colored',
          text: t('new_job_form.image_blur.text', 'blur text'),
          title: t('new_job_form.image_blur.title', 'title'),
          checkboxLabel: t(
            'new_job_form.image_blur.checkbox',
            'dont show again'
          ),
          checkboxCallback: (checked: boolean) => {
            setBlurExpiration(checked)
            if (checked)
              dispatch(
                logWarning(
                  '[USER_ACTION] user chose to hide GDPR disclaimer for 30 days'
                )
              )
          },
        } as IAlertProps,
      })
    )
  }

  // if the RTK is ON display the details
  useEffect(() => {
    if (initialValues?.ntrip?.enable) {
      setShowDetails(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Formik
      initialValues={formikInitialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, setFieldValue, submitForm }) => {
        const filteredDmiOptions =
          values.profile === 1 || tempJob?.profile === 1
            ? dmiOptions()
            : dmiOptions().filter((o) => o.value !== DMIType.Rail)
        const thumbLabel = values.image
          ? t('new_job_form.delete_thumbnail', 'delete thumbnail')
          : t('new_job_form.add_a_thumbnail', 'thumbnail')
        return (
          <Form className={style.newJobForm}>
            <FormikListener onTouched={onTouched} />
            <h1 className={style.title}>{title}</h1>
            <div className={style.scrollable}>
              <div
                className={classNames({
                  [style.mainForm]: true,
                  [style.expanded]: showDetails,
                })}
              >
                <div className={style.header}>
                  {/* NAME */}
                  <Field
                    component={FormikTextField}
                    name="name"
                    placeholder="Job001"
                    value={values.name}
                    variant="outlined"
                    label={t('new_job_form.job_title_label', 'Job title')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputRef={titleRef}
                    className={style.jobNameInput}
                    disabled={lockedPlan}
                    data-testid="job-name-input"
                  />

                  <h2 className={style.label}>
                    {thumbLabel}
                    {values.image && (
                      <button
                        data-testid="delete-button"
                        type="button"
                        onClick={() => {
                          setFieldValue('image', null)
                        }}
                        className={style.deleteButton}
                      >
                        <Icon name="DeleteTool" />
                      </button>
                    )}
                  </h2>

                  {/* IMAGE */}
                  <div className={style.imageSelector}>
                    <ImageSelector
                      image={values.image}
                      onChange={(image) => {
                        setFieldValue('image', image)
                      }}
                    />
                  </div>

                  {/* PLANNED */}
                  {/** // TODO: check if it saves correctly, maybe we just have to hide it via css */}
                  <div
                    className={style.planningRow}
                    ref={detailsRef}
                    data-testid="job-planning-switch"
                  >
                    <h2 className={style.label}>
                      {t('new_job_form.planning', 'planning')}
                    </h2>
                    <div className={style.singleOpenSelectBox}>
                      <OpenSelectbox
                        value={values.planned}
                        options={plannedOptions()}
                        onChange={(value) => setFieldValue('planned', value)}
                        disabled={lockedPlan}
                      />
                    </div>
                  </div>

                  {/* TYPE */}
                  <div className={style.selectBoxRow}>
                    <h2 className={style.label}>
                      {t('new_job_form.type', 'Type of job')}
                    </h2>
                    <FormControl size="small">
                      <ProfilesSelect
                        typeValue={values.type}
                        profileValue={values.profile}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          onTypeChange(e.target.value, setFieldValue)
                        }
                        onNewProfile={(p) => {
                          // select the just created profile on the current job
                          onTypeChange(
                            p.jobTypeName,
                            setFieldValue,
                            p.jobTypeProfile
                          )
                        }}
                        jobTypes={jobTypes}
                      />
                    </FormControl>
                  </div>
                </div>

                <div className={style.main}>
                  {showDetails && (
                    <>
                      {/* RTK */}
                      <div className={style.fieldBox}>
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.rtk', 'RTK')}
                          </h2>
                          <HelpButton className={style.helpIcon} node="rtk" />
                        </div>
                        <OpenSelectbox
                          value={values.ntripEnable}
                          options={ntripOptions()}
                          onChange={(value) => {
                            setFieldValue('ntripEnable', value)
                          }}
                        />
                        {values.ntripEnable === 'true' && (
                          <button
                            data-testid="rtk-show-details"
                            onClick={showRtkDetails}
                            type="button"
                            className={style.rtkShowDetails}
                          >
                            <span>
                              {t('new_job_form.see_details', 'Show details')}
                            </span>
                            <Icon name="Caret" />
                          </button>
                        )}
                      </div>

                      {/* SATELLITES */}
                      {useRtk || (
                        <div className={style.selectBoxRow}>
                          <h2 className={style.label}>
                            {t(
                              'new_job_form.satellite_selection',
                              'constellations'
                            )}
                          </h2>
                          <FormControl
                            className={style.selectBox}
                            error={!!errors.positionSatellites} // -> true only when errors.satellites is defined | (!!) -> short way to cast a variable to be a boolean (true or false) value
                          >
                            <CustomSelect
                              multiple
                              value={values.positionSatellites} // if satellites is undefined put an empty array
                              onChange={(event) => {
                                const newSatellites = event.target
                                  .value as string[]
                                setFieldValue(
                                  'positionSatellites',
                                  newSatellites
                                )
                              }}
                              input={<Input />}
                              renderValue={(selected) =>
                                (selected as string[]).length === 1
                                  ? `1 ${t(
                                      'new_job_form.satellite_selection_single',
                                      'constellation'
                                    )}`
                                  : `${(selected as string[]).length} ${t(
                                      'new_job_form.satellite_selection',
                                      'constellations'
                                    )}`
                              }
                              MenuProps={{
                                // to make dropdown list appear from bottom
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                },
                              }}
                            >
                              {satelliteOptions.map((satelliteOption) => (
                                <MenuItem
                                  key={satelliteOption.label}
                                  value={satelliteOption.value}
                                >
                                  <Checkbox
                                    checked={
                                      values.positionSatellites &&
                                      values.positionSatellites.indexOf(
                                        satelliteOption.value
                                      ) > -1
                                    }
                                  />
                                  <ListItemText
                                    primary={satelliteOption.label}
                                  />
                                </MenuItem>
                              ))}
                            </CustomSelect>
                            <FormHelperText>
                              {errors.positionSatellites}
                            </FormHelperText>
                          </FormControl>
                        </div>
                      )}

                      {/* JOB TOLERANCE */}
                      <div
                        className={classNames({
                          [style.fieldBox]: true,
                          [style.hidden]: values.ntripEnable === 'false',
                        })}
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.job_tolerance', 'Job tolerance')}
                          </h2>
                          <HelpButton
                            className={style.helpIcon}
                            node="job_tolerance"
                          />
                        </div>
                        <OpenSelectbox
                          value={values.positionAccuracy}
                          options={positionAccuracyOptionsWithUnit}
                          onChange={(value) =>
                            setLinkedFieldValue(
                              'positionAccuracy',
                              value,
                              setFieldValue
                            )
                          }
                        />
                      </div>

                      {/* DMI */}
                      <div className={style.fieldBox} data-testid="dmi-field">
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.dmi', 'DMI type')}
                          </h2>
                          <HelpButton
                            className={style.helpIcon}
                            node={`dmi_${values.dmiType}`}
                          />
                        </div>
                        <OpenSelectbox
                          value={values.dmiType}
                          options={filteredDmiOptions}
                          onChange={(value) => setFieldValue('dmiType', value)}
                        />
                      </div>

                      {/* COLLECTION MODE */}
                      {routingEnabled && values.planned === 'true' && (
                        <div className={style.fieldBox}>
                          <div className={style.fieldBoxLabelRow}>
                            <h2 className={style.label}>
                              {t(
                                'new_job_form.collectionmode',
                                'Collection Mode'
                              )}
                            </h2>
                            <HelpButton
                              className={style.helpIcon}
                              node={`collection_${values.collectionmode}`}
                            />
                          </div>
                          <OpenSelectbox
                            value={values.collectionmode}
                            options={collectionmodeOptions()}
                            onChange={(value) =>
                              setFieldValue('collectionmode', value)
                            }
                          />
                        </div>
                      )}

                      {/* CAMERA */}
                      <div
                        className={style.fieldBox}
                        data-testid="camera-enable-field"
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.camera', 'Camera')}
                          </h2>
                          <HelpButton className={style.helpIcon} />
                        </div>
                        <OpenSelectbox
                          value={values.cameraEnable}
                          options={
                            isAdmin
                              ? cameraEnableOptionsAdmin()
                              : cameraEnableOptions()
                          }
                          onChange={(newValue) =>
                            setLinkedFieldValue(
                              'cameraEnable',
                              newValue,
                              setFieldValue
                            )
                          }
                        />
                      </div>

                      {/* IMAGE ELAPSE */}
                      <div
                        className={classNames({
                          [style.fieldBox]: true,
                          [style.hidden]: values.cameraEnable !== 2,
                        })}
                        data-testid="camera-elapse-field"
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.camera_elapse', 'camera elapse')}
                          </h2>
                        </div>
                        <CustomSlider
                          unit={unitLabel('MS', unit)}
                          value={values.cameraElapse}
                          min={ranges.cameraElapse.min}
                          max={ranges.cameraElapse.max}
                          step={125}
                          disabled={values.cameraEnable !== 2}
                          onChangeCommitted={(event, newValue) =>
                            setLinkedFieldValue(
                              'cameraElapse',
                              newValue,
                              setFieldValue
                            )
                          }
                        />
                      </div>

                      {/* CAMERA BLUR */}
                      <div
                        className={classNames({
                          [style.fieldBox]: true,
                          [style.hidden]: values.cameraEnable === 0,
                        })}
                        data-testid="image-blur"
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.camera_blur', 'Blur')}
                          </h2>
                          {values.cameraBlur === 'true' ? null : (
                            <a
                              href="/assets/documents/gdpr.pdf"
                              target="_blank"
                              data-testid="blur-warning-icon"
                              className={style.blurWarning}
                            >
                              <Icon name="AcquisitionWarningGeo" />
                            </a>
                          )}
                          <HelpButton className={style.helpIcon} />
                        </div>
                        <OpenSelectbox
                          value={values.cameraBlur}
                          options={cameraBlurOptions()}
                          onChange={(value) =>
                            blurDisclaimerChangeHandler(value, setFieldValue)
                          }
                        />
                      </div>

                      {/* ANTENNA */}
                      <div className={style.fieldBox}>
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t(
                              'new_job_form.antenna_type',
                              'antenna configuration'
                            )}
                          </h2>
                          <HelpButton
                            className={style.helpIcon}
                            node={`antenna_${values.antennaType}`}
                          />
                        </div>
                        <OpenSelectbox
                          value={values.antennaType}
                          options={antennaTypeOptions()}
                          onChange={(value) =>
                            setFieldValue('antennaType', value)
                          }
                        />
                      </div>

                      {/* DRIVING SPEED */}
                      <div
                        className={classNames({
                          [style.fieldBox]: true,
                        })}
                        data-testid="driving-speed"
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t('new_job_form.drivingspeed', 'Driving speed')}
                          </h2>
                          <HelpButton className={style.helpIcon} />
                        </div>
                        <CustomSlider
                          unit={unitLabel('KMH', unit)}
                          value={
                            imperial
                              ? compose(Math.round, kmToM)(values.drivingspeed!)
                              : values.drivingspeed
                          }
                          min={
                            imperial
                              ? compose(
                                  Math.round,
                                  kmToM
                                )(ranges.drivingspeed.min!)
                              : ranges.drivingspeed.min
                          }
                          max={
                            imperial
                              ? compose(
                                  Math.round,
                                  kmToM
                                )(ranges.drivingspeed.max!)
                              : ranges.drivingspeed.max
                          }
                          disabled
                          onChangeCommitted={(event, newValue) =>
                            setLinkedFieldValue(
                              'drivingspeed',
                              newValue,
                              setFieldValue
                            )
                          }
                        />
                      </div>

                      {/* IMAGE DISTANCE */}
                      <div
                        className={classNames({
                          [style.fieldBox]: true,
                          [style.hidden]: values.cameraEnable !== 1,
                        })}
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t(
                              'new_job_form.camera_distance',
                              'Image Distance'
                            )}
                          </h2>
                          <HelpButton
                            className={style.helpIcon}
                            node="image_distance"
                          />
                        </div>
                        <CustomSlider
                          unit={unitLabel('M', unit)}
                          value={
                            imperial
                              ? compose(
                                  Math.round,
                                  mtToFt
                                )(values.cameraDistance!)
                              : values.cameraDistance
                          }
                          min={
                            imperial
                              ? compose(
                                  Math.round,
                                  mtToFt
                                )(ranges.cameraDistance.min!)
                              : ranges.cameraDistance.min
                          }
                          max={
                            imperial
                              ? compose(
                                  Math.round,
                                  mtToFt
                                )(ranges.cameraDistance.max!)
                              : ranges.cameraDistance.max
                          }
                          disabled={values.cameraEnable !== 1}
                          onChangeCommitted={(event, newValue) => {
                            const imageDistance = imperial
                              ? Number(ftToMt(newValue as number).toFixed(2))
                              : (newValue as number)
                            setLinkedFieldValue(
                              'cameraDistance',
                              imageDistance,
                              setFieldValue
                            )
                          }}
                        />
                      </div>

                      {/* SCANLINE SPACING */}
                      <div
                        className={classNames({
                          [style.fieldBox]: true,
                          [style.hidden]: !visibleScanlineSpacing,
                        })}
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t(
                              'new_job_form.scanline_spacing',
                              'Scanline Spacing'
                            )}
                          </h2>
                          <HelpButton className={style.helpIcon} />
                        </div>
                        <CustomSlider
                          unit={unitLabel('CM', unit)}
                          value={
                            imperial
                              ? compose(
                                  Math.round,
                                  cmToIn
                                )(values.scannerScanlineSpacing!)
                              : values.scannerScanlineSpacing
                          }
                          min={
                            imperial
                              ? compose(
                                  Math.round,
                                  cmToIn
                                )(ranges.scannerScanlineSpacing.min!)
                              : ranges.scannerScanlineSpacing.min
                          }
                          max={
                            imperial
                              ? compose(
                                  Math.round,
                                  cmToIn
                                )(ranges.scannerScanlineSpacing.max!)
                              : ranges.scannerScanlineSpacing.max
                          }
                          onChangeCommitted={(event, newValue) => {
                            const scanlineSpacing = imperial
                              ? Number(inToCm(newValue as number).toFixed(2))
                              : (newValue as number)
                            setLinkedFieldValue(
                              'scannerScanlineSpacing',
                              scanlineSpacing,
                              setFieldValue
                            )
                          }}
                        />
                      </div>

                      {/* PROFILER ROTATION SPEED */}
                      {scannerRotationSpeedOptions(supportedSettings).length >
                        1 && (
                        <div
                          className={classNames({
                            [style.fieldBox]: true,
                            [style.hidden]: !visibleRotationSpeed,
                          })}
                          data-testid="profiler-rotation-speed"
                        >
                          <div className={style.fieldBoxLabelRow}>
                            <h2 className={style.label}>
                              {t(
                                'new_job_form.scanner_rotation_speed',
                                'Profiler Rotation Speed'
                              )}
                            </h2>
                            <HelpButton
                              className={style.helpIcon}
                              node="profiler"
                            />
                          </div>
                          <OpenSelectbox
                            value={values.scannerRotationSpeed}
                            options={scannerRotationSpeedOptions(
                              supportedSettings
                            )}
                            onChange={(value) =>
                              setLinkedFieldValue(
                                'scannerRotationSpeed',
                                value,
                                setFieldValue
                              )
                            }
                          />
                        </div>
                      )}

                      {/* PROFILER POINT / SEC */}
                      {pointsPerSecondOptions(supportedSettings).length > 1 && (
                        <div
                          className={classNames({
                            [style.fieldBox]: true,
                            /* [style.hidden]: !visiblePointsSec, */
                          })}
                          data-testid="profiler-points-sec"
                        >
                          <div className={style.fieldBoxLabelRow}>
                            <h2 className={style.label}>
                              {t(
                                'new_job_form.scanner_point_per_second',
                                'Profiler points/Sec'
                              )}
                            </h2>
                            <HelpButton className={style.helpIcon} />
                          </div>
                          <OpenSelectbox
                            value={values.scannerPointPerSecond}
                            options={pointsPerSecondOptions(supportedSettings)}
                            onChange={(value) =>
                              setLinkedFieldValue(
                                'scannerPointPerSecond',
                                value,
                                setFieldValue
                              )
                            }
                          />
                        </div>
                      )}

                      {/* MAX SCANNER RANGE */}
                      <div
                        className={style.fieldBox}
                        data-testid={
                          editableScannerRange
                            ? 'max-scanner-range'
                            : 'max-scanner-range-readonly'
                        }
                      >
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t(
                              'new_job_form.scanner_range',
                              'Max scanner range'
                            )}
                          </h2>
                          <HelpButton className={style.helpIcon} />
                        </div>
                        <OpenSelectbox
                          value={values.scannerRange}
                          options={scannerRangeOtions(
                            supportedSettings,
                            imperial
                          )}
                          onChange={(value) =>
                            setLinkedFieldValue(
                              'scannerRange',
                              value,
                              setFieldValue
                            )
                          }
                          // if there's only 1 value, disable it
                          disabled={
                            scannerRangeOtions(supportedSettings, imperial)
                              .length < 2
                          }
                        />
                      </div>
                      {/* Realtime Quality Feedback */}
                      {/* {values.ntripEnable === 'true' && (
                      <div className={style.fieldBox}>
                        <div className={style.fieldBoxLabelRow}>
                          <h2 className={style.label}>
                            {t(
                              'new_job_form.realtime_quality',
                              'Realtime Quality Feedback'
                            )}
                          </h2>
                          <HelpButton className={style.helpIcon} />
                        </div>
                        <QualityFeedback
                          unit={units.CM}
                          value={values.positionAccuracy!}
                          min={1}
                          onChangeCommitted={(newValue) =>
                            setLinkedFieldValue(
                              'positionAccuracy',
                              newValue,
                              setFieldValue
                            )
                          }
                        />
                      </div>
                    )} */}
                    </>
                  )}
                </div>
              </div>

              <div className={style.seeMoreContainer}>
                <Button
                  variant="outlined"
                  color="primary"
                  data-testid="show-details"
                  // className={classes.button}
                  startIcon={
                    <Icon name="SeeDetail" className={style.seeDetailIcon} />
                  }
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {!showDetails
                    ? t('new_job_form.see_details', 'see details')
                    : t('new_job_form.see_less', 'see less')}
                </Button>
              </div>
            </div>

            <div className={style.footer}>
              <div className={style.buttonsContainer}>
                <Button
                  variant="text"
                  color="primary"
                  data-testid="reset"
                  onClick={() => resethandler(setFieldValue)}
                  disabled={!isEdited}
                >
                  <Typography color="primary" variant="buttonLabel">
                    {t('new_job_form.reset', 'reset')}
                  </Typography>
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={closeHandler}
                >
                  {t('new_job_form.cancel', 'cancel')}
                </Button>
                {submitButton(submitForm)}
              </div>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}
export default NewJobForm
