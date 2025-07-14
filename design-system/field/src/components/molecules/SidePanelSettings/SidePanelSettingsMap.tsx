import { Badge } from '@mui/material'
import classNames from 'classnames'
import { CustomSlider } from 'components/atoms/CustomSlider/CustomSlider'
import { Switch } from 'components/atoms/Switch/Switch'
import style from 'components/molecules/SidePanelSettings/SidePanelSettings.module.scss'
import { Form, Formik } from 'formik'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import {
  pointCloudThicknessSetAction,
  selectPointCloudThickness,
} from 'store/features/pointcloud/slice'
import {
  autocaptureStatusUpdateActions,
  confirmAbortAutocaptureAction,
  routingDirectionsEnabledAction,
  selectAutocaptureEnabled,
  selectRoutingDirectionsEnabled,
  selectRoutingEnabled,
  selectRoutingModule,
} from 'store/features/routing/slice'

/**
 * SidePanelSettingsMap description
 */
export const SidePanelSettingsMap: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const pointCloudThickness = useSelector(selectPointCloudThickness)
  const navigationEnabled = useSelector(selectRoutingEnabled)
  const routingModule = useSelector(selectRoutingModule)
  const job = useSelector(selectDataStorageCurrentJob)
  const directionsEnabled = useSelector(selectRoutingDirectionsEnabled)
  const autocaptureEnabled = useSelector(selectAutocaptureEnabled)

  const formikInitialValues = useMemo(
    () => ({
      pointCloudThickness: pointCloudThickness * 10 || 20,
      /* labellingEnabled: true, */
      navigationEnabled,
      directionsEnabled,
      autocaptureEnabled,
    }),
    [
      pointCloudThickness,
      navigationEnabled,
      directionsEnabled,
      autocaptureEnabled,
    ]
  )

  /** Handle form submission */
  const onSubmit = useCallback((values, { setSubmitting }) => {
    setSubmitting(false)
    // dispatch to store
    console.info(values)

    console.info('Dispatched to store')
  }, [])

  /**
   * SET POINT CLOUD THICKNESS
   */
  const pointCloudThicknessHandler = (value: number) => {
    const thickness = value / 10
    dispatch(pointCloudThicknessSetAction(thickness))
  }

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
      enableReinitialize /** reinitialize at every change in defaultValues */
      onSubmit={onSubmit}
    >
      {({ values, errors, setFieldValue, submitForm }) => (
        <Form className={style.form}>
          {/* <FormikListener onTouched={onTouched} /> */}

          <div className={style.fieldsContainer}>
            <div className={style.sliderField}>
              <p>
                {t(
                  'side_panel.settings.point_cloud_thickness',
                  'Point cloud thickness'
                )}
              </p>
              <CustomSlider
                unit="%"
                value={values.pointCloudThickness}
                min={10}
                max={100}
                step={10}
                onChangeCommitted={(event, newValue) => {
                  setFieldValue('pointCloudThickness', newValue)
                  pointCloudThicknessHandler(newValue as number)
                  /* submitForm() */
                }}
              />
            </div>
          </div>

          <div className={style.fieldsContainer}>
            {/*  <div className={style.switchField}>
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
            {/* {job?.planned && routingModule && (
              <div className={style.switchField} data-testid="navigation">
                <p>{t('side_panel.settings.navigation', 'navigation')}</p>
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
            {/* {job?.planned && navigationEnabled && (
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
            {job?.planned && routingModule && (
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
