/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import { Box, Button, InputAdornment, ThemeProvider } from '@mui/material'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import style from 'components/dialogs/SaveAsCustomJobType/SaveAsCustomJobType.module.scss'
import { useTranslation } from 'react-i18next'
import { Form, Field, Formik } from 'formik'
import { TextField } from 'formik-mui'
import { object, string } from 'yup'
import { selectDataStorageJobTypes } from 'store/features/dataStorage/slice'
import { NewJobTypeOptions } from 'store/features/dataStorage/types'
import { darkTheme } from 'utils/themes/mui'

export interface ISaveAsCustomJobTypeProps {
  /**
   * ok button callback
   */
  okButtonCallback: (values: NewJobTypeOptions) => void
  /**
   * cancel button callback
   */
  cancelButtonCallback: Function
}

const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9_]$/

/**
 * SaveAsCustomJobType description
 */
const SaveAsCustomJobType: FC<ISaveAsCustomJobTypeProps> = ({
  okButtonCallback,
  cancelButtonCallback,
}: PropsWithChildren<ISaveAsCustomJobTypeProps>) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const jobTypes = useSelector(selectDataStorageJobTypes)

  /**
   * callback for cancel acton
   */
  const onClickCancel = useCallback(() => {
    cancelButtonCallback()
    dispatch(closeDialogAction())
  }, [dispatch, cancelButtonCallback])

  /**
   * callback for cancel acton
   */
  const onClickClose = useCallback(() => {
    dispatch(closeDialogAction())
  }, [dispatch])

  /**
   * handle submit
   */
  const onSubmit = (values: NewJobTypeOptions) => {
    okButtonCallback(values)
    dispatch(closeDialogAction())
  }

  const jobTypeNames = jobTypes
    .map((j) => j.name)
    .concat(['Road', 'Rail', 'Boat', 'Custom'])
  const validationSchema = useMemo(
    () =>
      object({
        jobTypeName: string()
          .required(
            t('job_browser.save_jobtype_name_required', 'name required')
          )
          .min(3, t('job_browser.save_jobtype_min', 'min 3 chars'))
          .notOneOf(
            jobTypeNames,
            t('job_browser.save_jobtype_exists', 'exists')
          )
          .matches(
            nameRegex,
            t('login.form.validation.bad_characters', 'Unallowed characters')
          ),
      }),
    [t, jobTypeNames]
  )

  const title = t('job_browser.save_jobtype_title', 'save jobtype')
  const text = t('job_browser.save_jobtype_text', 'save jobtype or not?')
  const cancelButtonLabel = t('job_browser.save_jobtype_cancel', 'dont save')
  const okButtonLabel = t('job_browser.save_jobtype_ok', 'save')

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.variantGrey]: true,
      })}
      data-testid="new-job-type-dialog"
    >
      <ThemeProvider theme={darkTheme}>
        <Formik
          initialValues={{
            jobTypeName: '',
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ submitForm, values }) => (
            <Form className={style.form}>
              <Box
                sx={{
                  marginBottom: '16px',
                  '& svg': {
                    width: '42px',
                    height: '42px',
                    path: {
                      fill: (theme) => theme.colors.primary_11,
                    },
                  },
                }}
              >
                <Icon name="Alert" />
              </Box>
              <div className={style.title}>{title}</div>
              <div className={style.text}>{text}</div>
              <div className={style.fields}>
                <Field
                  component={TextField}
                  name="jobTypeName"
                  type="text"
                  variant="standard"
                  // label={t('login.form.fields.username', 'Username')}
                  // className={style.textFields}
                  // disabled={isAuthenticating}
                  InputProps={{
                    'data-testid': 'jobtype-name-input',
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="Edit" className={style.editIcon} />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className={style.button}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onClickCancel}
                >
                  {cancelButtonLabel}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  // onClick={onClickOk}
                >
                  {okButtonLabel}
                </Button>
              </div>
              <div className={style.closeButton} onClick={onClickClose}>
                <Icon name="Close" />
              </div>
            </Form>
          )}
        </Formik>
      </ThemeProvider>
    </div>
  )
}
export default SaveAsCustomJobType
