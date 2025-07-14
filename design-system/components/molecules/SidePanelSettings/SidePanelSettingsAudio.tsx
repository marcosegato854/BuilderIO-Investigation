/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import { CustomSlider } from 'components/atoms/CustomSlider/CustomSlider'
import style from 'components/molecules/SidePanelSettings/SidePanelSettings.module.scss'
import { Form, Formik } from 'formik'
import React, { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAudioState,
  setAudioSettings,
} from 'store/features/settings/slice'
import { AudioSettings } from 'store/features/settings/types'
import { selectRoutingEnabled } from 'store/features/routing/slice'

type FlatSettings = {
  generalVolume: number
  navigationVolumeEnabled: boolean
  errorVolumeEnabled: boolean
  collectionVolumeEnabled: boolean
}
const normalizeForClient = (settings: AudioSettings): FlatSettings => ({
  generalVolume: settings.globalVolume,
  collectionVolumeEnabled: settings.audibleMessages.COLLECTION,
  errorVolumeEnabled: settings.audibleMessages.ERROR,
  navigationVolumeEnabled: settings.audibleMessages.NAVIGATION,
})
const normalizeForServer = (flatSettings: FlatSettings): AudioSettings => ({
  globalVolume: flatSettings.generalVolume,
  audibleMessages: {
    COLLECTION: flatSettings.collectionVolumeEnabled,
    ERROR: flatSettings.errorVolumeEnabled,
    NAVIGATION: flatSettings.navigationVolumeEnabled,
  },
})

/**
 * SidePanelSettingsAudio description
 */
export const SidePanelSettingsAudio: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const settings = useSelector(selectAudioState)
  const formikInitialValues = normalizeForClient(settings)
  const routingEnabled = useSelector(selectRoutingEnabled)

  /** Handle form submission */
  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      setSubmitting(false)
      const newSettings = normalizeForServer(values)
      dispatch(setAudioSettings(newSettings))
    },
    [dispatch]
  )

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

          <div className={style.fieldsContainer}>
            <div className={style.sliderField}>
              <p>{t('side_panel.settings.general_volume', 'General volume')}</p>
              <CustomSlider
                unit="%"
                value={values.generalVolume}
                min={0}
                max={100}
                onChangeCommitted={(event, newValue) => {
                  setFieldValue('generalVolume', newValue)
                  submitForm()
                }}
              />
            </div>
          </div>

          <div className={style.fieldsContainer}>
            {routingEnabled && (
              <div className={style.switchField}>
                <p>{t('side_panel.settings.navigation', 'Navigation')}</p>
                <div className={style.volumeButton}>
                  {values.navigationVolumeEnabled ? (
                    <Icon
                      name="VolumeOn"
                      className={style.icon}
                      onClick={() => {
                        setFieldValue(
                          'navigationVolumeEnabled',
                          !values.navigationVolumeEnabled
                        )
                        submitForm()
                      }}
                    />
                  ) : (
                    <Icon
                      name="VolumeOff"
                      className={style.icon}
                      onClick={() => {
                        setFieldValue(
                          'navigationVolumeEnabled',
                          !values.navigationVolumeEnabled
                        )
                        submitForm()
                      }}
                    />
                  )}
                  <p
                    className={classNames({
                      [style.text]: true,
                      [style.textVisible]: !values.navigationVolumeEnabled,
                      [style.textInvisible]: values.navigationVolumeEnabled,
                    })}
                  >
                    Mute
                  </p>
                </div>
              </div>
            )}

            <div className={style.switchField}>
              <p>{t('side_panel.settings.error', 'Error')}</p>
              <div className={style.volumeButton}>
                {values.errorVolumeEnabled ? (
                  <Icon
                    name="VolumeOn"
                    className={style.icon}
                    onClick={() => {
                      setFieldValue(
                        'errorVolumeEnabled',
                        !values.errorVolumeEnabled
                      )
                      submitForm()
                    }}
                  />
                ) : (
                  <Icon
                    name="VolumeOff"
                    className={style.icon}
                    onClick={() => {
                      setFieldValue(
                        'errorVolumeEnabled',
                        !values.errorVolumeEnabled
                      )
                      submitForm()
                    }}
                  />
                )}
                <p
                  className={classNames({
                    [style.text]: true,
                    [style.textVisible]: !values.errorVolumeEnabled,
                    [style.textInvisible]: values.errorVolumeEnabled,
                  })}
                >
                  Mute
                </p>
              </div>
            </div>

            <div className={style.switchField}>
              <p>{t('side_panel.settings.collection', 'Collection')}</p>
              <div className={style.volumeButton}>
                {values.collectionVolumeEnabled ? (
                  <Icon
                    name="VolumeOn"
                    className={style.icon}
                    onClick={() => {
                      setFieldValue(
                        'collectionVolumeEnabled',
                        !values.collectionVolumeEnabled
                      )
                      submitForm()
                    }}
                  />
                ) : (
                  <Icon
                    name="VolumeOff"
                    className={style.icon}
                    onClick={() => {
                      setFieldValue(
                        'collectionVolumeEnabled',
                        !values.collectionVolumeEnabled
                      )
                      submitForm()
                    }}
                  />
                )}
                <p
                  className={classNames({
                    [style.text]: true,
                    [style.textVisible]: !values.collectionVolumeEnabled,
                    [style.textInvisible]: values.collectionVolumeEnabled,
                  })}
                >
                  Mute
                </p>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}
