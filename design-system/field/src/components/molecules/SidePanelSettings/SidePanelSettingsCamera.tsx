import { Badge, Button } from '@mui/material'
import { CustomSlider } from 'components/atoms/CustomSlider/CustomSlider'
import { Switch } from 'components/atoms/Switch/Switch'
import { getRangesForCoordinateSystem } from 'components/dialogs/NewJobForm/ranges'
import style from 'components/molecules/SidePanelSettings/SidePanelSettings.module.scss'
import { Form, Formik } from 'formik'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  cameraExposureSetActions,
  cameraTriggerDistanceSetActions,
  selectCameraDistance,
  selectCameraEnabled,
  selectCameraExposure,
} from 'store/features/camera/slice'
import { CameraExposureControl } from 'store/features/camera/types'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  autocaptureStatusUpdateActions,
  confirmAbortAutocaptureAction,
  routingDirectionsEnabledAction,
  selectAutocaptureEnabled,
  selectCurrentPolygon,
  selectRoutingDirectionsEnabled,
  selectRoutingEnabled,
  selectRoutingModule,
} from 'store/features/routing/slice'
import { selectScannerSupportedSettings } from 'store/features/scanner/slice'
import { settings } from 'utils/planning/polygonHelpers'
import { compose } from 'ramda'
import { ftToMt, mtToFt } from 'utils/numbers'
import classNames from 'classnames'

interface RangeValue {
  min: number
  max: number
  default: number
}
interface Ranges {
  cameraDistance: RangeValue
}

/**
 * SidePanelSettingsCamera description
 */
export const SidePanelSettingsCamera: FC = () => {
  const { t } = useTranslation()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const currentRoutingPolygon = useSelector(selectCurrentPolygon)
  const cameraExposure = useSelector(selectCameraExposure)
  const cameraDistance = useSelector(selectCameraDistance)
  const cameraEnabled = useSelector(selectCameraEnabled)
  const autocaptureEnabled = useSelector(selectAutocaptureEnabled)
  const navigationEnabled = useSelector(selectRoutingEnabled)
  const routingModule = useSelector(selectRoutingModule)
  const supportedSettings = useSelector(selectScannerSupportedSettings)
  const directionsEnabled = useSelector(selectRoutingDirectionsEnabled)
  const dispatch = useDispatch()

  const imperial = useMemo(() => {
    return currentProject?.coordinate?.unit === 'imperial'
  }, [currentProject])

  /** derived value */
  const units: Units = useMemo(() => {
    const coordUnit = currentProject?.coordinate?.unit || 'metric'
    return {
      CM: t(`units.${coordUnit}.CM`, 'CM'),
      HZ: t(`units.${coordUnit}.HZ`, 'HZ'),
      KMH: t(`units.${coordUnit}.KMH`, 'KMH'),
      M: t(`units.${coordUnit}.M`, 'M'),
      MSEC: t(`units.${coordUnit}.MSEC`, 'MSEC'),
    }
  }, [currentProject, t])

  /** derived value */
  const ranges: Ranges = useMemo(() => {
    return getRangesForCoordinateSystem(supportedSettings)
  }, [supportedSettings])

  const validCameraDistance = useMemo(() => {
    if (currentRoutingPolygon) {
      const polygonSettings = settings(currentRoutingPolygon)
      return polygonSettings?.camera.distance
    }
    return cameraDistance || currentJob?.camera?.distance
  }, [cameraDistance, currentJob, currentRoutingPolygon])

  const validCameraEnabled = useMemo(() => {
    if (currentRoutingPolygon) {
      const polygonSettings = settings(currentRoutingPolygon)
      return polygonSettings?.camera.enable
    }
    if (cameraEnabled === 'None') return 0
    if (cameraEnabled === 'Distance') return 1
    return 2
  }, [cameraEnabled, currentRoutingPolygon])

  const formikInitialValues = useMemo(() => {
    const defaultValues = {
      cameraDistance: validCameraDistance,
      exposure: cameraExposure || '0.0',
      cameraEnabled: validCameraEnabled,
      // labellingEnabled: false,
      navigationEnabled,
      directionsEnabled,
      autocaptureEnabled,
    }
    return defaultValues
  }, [
    validCameraDistance,
    cameraExposure,
    validCameraEnabled,
    navigationEnabled,
    directionsEnabled,
    autocaptureEnabled,
  ])

  /** Handle form submission */
  const onSubmit = useCallback((values, { setSubmitting }) => {
    setSubmitting(false)
    // dispatch to store
    console.info(values)

    console.info('Dispatched to store')
  }, [])

  const cameraDistanceHandler = (distance: number) => {
    console.info('CAMERA: dispatch API, value: ', distance)
    dispatch(
      cameraTriggerDistanceSetActions.request({
        type: 'Distance',
        space: distance,
      })
    )
  }

  const cameraExposureHandler = (value: CameraExposureControl) => {
    console.info('CAMERA: change exposure: ', value)
    dispatch(cameraExposureSetActions.request({ action: value }))
  }

  // TODO: DISABLED
  // const cameraEnabledHandler = (value: boolean) => {
  //   value
  //     ? dispatch(cameraTriggerToggleActions.request({ type: 'Distance' }))
  //     : dispatch(cameraTriggerToggleActions.request({ type: 'None' }))
  // }

  /**
   * SET NAVIGATION ENABLED
   */
  const navigationHandler = (value: boolean) => {
    dispatch(confirmAbortAutocaptureAction({}))
  }

  /**
   * SET SHOW HIDE DIRECTIONS
   */
  const directionsHandler = (value: boolean) => {
    dispatch(routingDirectionsEnabledAction(value))
  }

  /**
   * SET SHOW HIDE DIRECTIONS
   */
  const autocaptureHandler = (value: boolean) => {
    dispatch(autocaptureStatusUpdateActions.request({ enabled: value }))
  }

  return (
    <Formik
      initialValues={formikInitialValues}
      // validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, errors, setFieldValue, submitForm }) => (
        <Form className={style.form}>
          {/* <FormikListener onTouched={onTouched} /> */}
          {values.cameraEnabled === 1 && (
            <div className={style.fieldsContainer}>
              <div
                className={style.sliderField}
                data-testid="cameraDistanceField"
              >
                <p>
                  {t('side_panel.settings.image_distance', 'Image distance')}
                </p>
                <CustomSlider
                  unit={units.M}
                  value={
                    imperial
                      ? compose(Math.round, mtToFt)(values.cameraDistance!)
                      : values.cameraDistance
                  }
                  min={
                    imperial
                      ? compose(Math.round, mtToFt)(ranges.cameraDistance.min!)
                      : ranges.cameraDistance.min
                  }
                  max={
                    imperial
                      ? compose(Math.round, mtToFt)(ranges.cameraDistance.max!)
                      : ranges.cameraDistance.max
                  }
                  onChangeCommitted={(event, newValue) => {
                    const imageDistance = imperial
                      ? Number(ftToMt(newValue as number).toFixed(2))
                      : (newValue as number)
                    setFieldValue('cameraDistance', imageDistance)
                    cameraDistanceHandler(Number(imageDistance))
                    /* submitForm() */
                  }}
                  disabled={!!autocaptureEnabled}
                />
              </div>
            </div>
          )}
          {values.cameraEnabled !== 0 && (
            <div className={style.fieldsContainer}>
              <div className={style.exposureField}>
                <p>{t('side_panel.settings.brightness', 'Brightness')}</p>
                <div className={style.exposureFieldBtnGroup}>
                  <Button onClick={() => cameraExposureHandler('decrease')}>
                    -
                  </Button>
                  <div className={style.exposureFieldValue}>
                    {cameraExposure}
                  </div>
                  <Button onClick={() => cameraExposureHandler('increase')}>
                    +
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className={style.fieldsContainer}>
            {/* TODO: disabled
            <div className={style.switchField}>
              <p>{t('side_panel.settings.camera', 'Camera')}</p>
              <Switch
                checked={values.cameraEnabled}
                onChange={(event) => {
                  const checked = event.target.checked
                  setFieldValue('cameraEnabled', checked)
                  cameraEnabledHandler(checked)
                }}
                disabled={!!routingEnabled}
              />
            </div> */}
            {/* <div className={style.switchField}>
              <p>{t('side_panel.settings.labelling', 'Labelling')}</p>
              <Switch
                checked={values.labellingEnabled}
                onChange={(event, checked) => {
                  setFieldValue('labellingEnabled', checked)
                  submitForm()
                }}
              />
            </div> */}
            {/* NAVIGATION ENABLE */}
            {/* TODO - DISABLE BUTTON AS SOON AS ROUTING IS AVAILABLE PEF-2938 */}
            {/* {currentJob?.planned && routingModule && (
              <div className={style.switchField} data-testid="navigation">
                <p>{t('side_panel.settings.navigation', 'Navigation')}</p>
                <Switch
                  checked={!!values.navigationEnabled}
                  onChange={(event) => {
                    // setFieldValue('navigationEnabled', checked)
                    const checked = event.target.checked
                    navigationHandler(checked as boolean)
                    // submitForm()
                  }}
                  disabled={!values.navigationEnabled}
                />
              </div>
            )} */}
            {/* ROUTING DIRECTIONS */}
            {/* TODO - DISABLE BUTTON AS SOON AS ROUTING IS AVAILABLE PEF-2938 */}
            {/* {currentJob?.planned && navigationEnabled && (
              <div className={style.switchField} data-testid="directions">
                <p>{t('side_panel.settings.directions', 'directions')}</p>
                <Switch
                  checked={!!values.directionsEnabled}
                  onChange={(event) => {
                    const checked = event.target.checked
                    directionsHandler(checked as boolean)
                  }}
                />
              </div>
            )} */}

            {/* AUTOCAPTURE TOGGLE */}
            {currentJob?.planned && routingModule && (
              <Badge
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                badgeContent="BETA"
                sx={[
                  (theme) => ({
                    left: '0px',
                    width: '100%',
                    '.MuiBadge-badge': {
                      backgroundColor: theme.colors.secondary_6,
                      ...theme.typography.bold,
                      fontSize: '9px',
                      left: '28px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    },
                  }),
                ]}
              >
                <div
                  className={classNames({
                    [style.switchField]: true,
                    [style.betaFeature]: true,
                  })}
                  data-testid="autocapture-toggle"
                >
                  <p>{t('side_panel.settings.autocapture', 'autocapture')}</p>
                  <Switch
                    checked={!!values.autocaptureEnabled}
                    onChange={(event) => {
                      const checked = event.target.checked
                      autocaptureHandler(checked as boolean)
                    }}
                  />
                </div>
              </Badge>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}
