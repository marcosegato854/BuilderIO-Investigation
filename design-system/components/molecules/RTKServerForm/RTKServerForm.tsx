/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, IconButton, InputAdornment, styled } from '@mui/material'
import { useTheme } from '@mui/system'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/molecules/RTKServerForm/RTKServerForm.module.scss'
import {
  normalizeDataForClient,
  normalizeDataForServer,
} from 'components/molecules/RTKServerForm/RTKServerFormUtils'
import { Field, Form, Formik } from 'formik'
import { TextField } from 'formik-mui'
import { equals, keys } from 'ramda'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { errorAction } from 'store/features/errors/slice'
import {
  rtkServiceSetCurrentServer,
  rtkServiceSubmitServerActions,
  rtkServiceUpdateServerActions,
  selectIsAuthenticating,
  selectRtkServers,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'
import { selectTheme } from 'store/features/theme/slice'
import { FormikListener } from 'utils/formik/FormikListener'
import { object, string } from 'yup'

export interface IRTKServerFormProps {
  initialValues?: RtkServer | null
  connected?: boolean
  /**
   * callback on change
   */
  onUpdate?: (server: RtkServer) => void
  onConnect?: (server: RtkServer) => void
  onCancel?: Function
}

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: '16px',
  width: '102px',
  height: '30px',
  borderRadius: '6px',
  alignSelf: 'center',
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiInputBase-input': {
    ...theme.typography.body1,
    paddingBottom: '2px',
  },
}))

/**
 * Form for connecting to RTK server
 */
export const RTKServerForm: FC<IRTKServerFormProps> = ({
  onUpdate,
  onConnect,
  connected,
  initialValues,
  onCancel,
}: PropsWithChildren<IRTKServerFormProps>) => {
  const { t } = useTranslation()
  const [disabled, setDisabled] = useState<boolean>(false)
  const isAuthenticating = useSelector(selectIsAuthenticating)
  const servers = useSelector(selectRtkServers)
  const dispatch = useDispatch()
  const currentValues = useRef<RtkServer>()
  const [showPassword, setShowPassword] = useState(false)
  const passwordType = showPassword ? 'text' : 'password'
  const theme = useSelector(selectTheme)
  const muiTheme = useTheme()

  const isEdit = useMemo(() => {
    /* const hasName = !!initialValues?.name
    const isSaved = !!servers?.find((s) => s.name === initialValues?.name)
    return hasName && isSaved */
    const hasId = !!initialValues?.id
    const isSaved = !!servers?.find((s) => s.id === initialValues?.id)
    return hasId && isSaved
  }, [initialValues, servers])

  const connectButtonLabel = useMemo(() => {
    return connected
      ? t('rtk.server.form.connected', 'connected')
      : t('rtk.server.form.connect', 'connect')
  }, [t, connected])

  const saveLabel = useMemo(() => {
    return isEdit
      ? t('rtk.server.form.update', 'update')
      : t('rtk.server.form.save', 'save')
  }, [t, isEdit])

  const validationSchema = useMemo(
    () =>
      object({
        name: string().required(
          t('rtk.server.form.validation.name', 'name required')
        ),
        server: string().required(
          t('rtk.server.form.validation.url', 'url required')
        ),
        port: string()
          .required(t('rtk.server.form.validation.port', 'port required'))
          .matches(
            /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
            t('rtk.server.form.validation.port', 'port required')
          ),
        user: string().required(
          t('rtk.server.form.validation.user', 'username required')
        ),
        // .min(2, 'Must be more than 2 characters')
        // .max(30, 'Must be at max 30 characters'),
        password: string().required(
          t('rtk.server.form.validation.password', 'password required')
        ),
        // .min(8, 'Must be more than 8 characters')
        // .max(30, 'Must be at max 30 characters'),
        // .matches(
        //   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/,
        //   'Password must contain at leat one letter and one number'
        // ),
      }),
    [t]
  )

  const onSubmit = useCallback(
    (values) => {
      const normalizedValues = normalizeDataForServer(values)
      if (isEdit) {
        dispatch(
          rtkServiceUpdateServerActions.request({
            server: normalizedValues,
            id: initialValues!.id as number,
          })
        )
      } else {
        // check if the name exists before saving
        const exists = !!servers?.find((s) => s.name === values.name)
        if (exists) {
          dispatch(
            errorAction(new Error(t('rtk.server.form.exists', 'exists')))
          )
          return
        }
        dispatch(rtkServiceSubmitServerActions.request(normalizedValues))
      }
      setDisabled(true)
    },
    [dispatch, initialValues, servers, t, isEdit]
  )

  const toggleShowPassword = () => setShowPassword(!showPassword)

  const connectHandler = useCallback(
    (validateForm, submitForm) => async () => {
      const errors = await validateForm()
      if (keys(errors).length) {
        submitForm()
      } else {
        if (!currentValues.current) return
        const normalizedValues = normalizeDataForServer(currentValues.current)
        onConnect && onConnect(normalizedValues)
      }
    },
    [onConnect]
  )

  const resetHandler = useCallback(() => {
    if (!isAuthenticating) dispatch(rtkServiceSetCurrentServer(null))
    if (initialValues) onCancel && onCancel(`option-${initialValues.id}`)
  }, [dispatch, initialValues, isAuthenticating, onCancel])

  const onTouched = useCallback(
    (values) => {
      // check if the connect button should be enabled
      const normalizedValues = normalizeDataForServer(values)
      const areEqual = equals(normalizedValues, initialValues)
      const connectedStatus = areEqual ? connected : false
      currentValues.current = {
        ...values,
        mountpoint: '',
        interfacemode: '',
        connected: connectedStatus,
      }
      // callbacks
      onUpdate && onUpdate(normalizedValues)
      setDisabled(false)
    },
    [initialValues, connected, onUpdate]
  )

  useEffect(() => {
    if (currentValues.current) currentValues.current.connected = connected
  }, [connected])

  const defaultValues = useMemo(() => {
    return normalizeDataForClient({
      name: '',
      server: '',
      port: '',
      user: '',
      password: '',
      ...initialValues,
    })
  }, [initialValues])

  const commonInputProps = {
    'data-testid': 'form-field',
    InputLabelProps: {
      shrink: true,
    },
    disabled: isAuthenticating,
  }

  return (
    <div data-testid="rtk-server-form">
      <Formik
        initialValues={defaultValues}
        enableReinitialize /** reinitialize at every change in defaultValues */
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        data-testid="form"
      >
        {({ submitForm, validateForm, values }) => (
          <Form className={style.form}>
            <FormikListener onTouched={onTouched} />
            <div className={style.main}>
              <div className={style.field}>
                <label className={style.fieldLabel}>
                  {t('rtk.server.form.fields.name', 'name')}
                </label>
                <Icon name="Edit" className={style.icon} />
                <Field
                  component={StyledTextField}
                  variant="standard"
                  name="name"
                  type="text"
                  value={values.name}
                  {...commonInputProps}
                  sx={{
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                    },
                  }}
                />
              </div>
              <div className={style.field}>
                <label className={style.fieldLabel}>
                  {t('rtk.server.form.fields.server', 'url')}
                </label>
                <Icon name="Edit" className={style.icon} />
                <Field
                  component={StyledTextField}
                  variant="standard"
                  name="server"
                  type="text"
                  value={values.server}
                  {...commonInputProps}
                />
              </div>

              <div className={style.field}>
                <label className={style.fieldLabel}>
                  {t('rtk.server.form.fields.port', 'port n°')}
                </label>
                <Icon name="Edit" className={style.icon} />
                <Field
                  component={StyledTextField}
                  variant="standard"
                  name="port"
                  type="text"
                  value={values.port}
                  {...commonInputProps}
                />
              </div>

              <div className={style.field}>
                <label className={style.fieldLabel}>
                  {t('rtk.server.form.fields.username', 'username')}
                </label>
                <Icon name="Edit" className={style.icon} />
                <Field
                  component={StyledTextField}
                  variant="standard"
                  name="user"
                  type="text"
                  value={values.user}
                  {...commonInputProps}
                />
              </div>

              <div className={style.field}>
                <label className={style.fieldLabel}>
                  {t('rtk.server.form.fields.password', 'password')}
                </label>
                <Icon name="Edit" className={style.icon} />
                <Field
                  component={StyledTextField}
                  variant="standard"
                  name="password"
                  type={passwordType}
                  InputProps={{
                    'data-testid': 'input-password',
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          size="large"
                          sx={{
                            svg: {
                              path: {
                                fill: (theme) => theme.colors.primary_11,
                              },
                            },
                          }}
                        >
                          {showPassword ? (
                            <Icon name="VisibilityOn" />
                          ) : (
                            <Icon name="VisibilityOff" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  value={values.password}
                  {...commonInputProps}
                />
              </div>

              <div className={classNames(style.field, style.buttons)}>
                <StyledButton
                  color="primary"
                  type="submit"
                  variant="outlined"
                  data-testid="submit-button"
                  disabled={disabled || isAuthenticating}
                >
                  {saveLabel}
                </StyledButton>

                {initialValues?.name && (
                  <StyledButton
                    color="primary"
                    type="button"
                    variant="outlined"
                    data-testid="reset-button"
                    onClick={resetHandler}
                  >
                    {t('project_browser.cancel_button', 'cancel')}
                  </StyledButton>
                )}

                <StyledButton
                  color="primary"
                  type="button"
                  data-testid="rtk-connect-button"
                  onClick={connectHandler(validateForm, submitForm)}
                  disabled={
                    currentValues.current?.connected || isAuthenticating
                  }
                >
                  {connectButtonLabel}
                </StyledButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
