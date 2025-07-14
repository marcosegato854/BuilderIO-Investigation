import React, { FC, useCallback, useMemo, useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { object, string } from 'yup'
import {
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Grid,
  styled,
} from '@mui/material'
import { TextField, Checkbox } from 'formik-mui'
import { useDispatch, useSelector } from 'react-redux'
import { LoginPayload } from 'store/features/auth/types'
import { loginActions, selectIsAuthenticating } from 'store/features/auth/slice'
import { useTranslation } from 'react-i18next'
import { QrCodeReader } from 'components/molecules/QrCodeReader/QrCodeReader'
import { Icon } from 'components/atoms/Icon/Icon'
import { HelpButton } from 'components/atoms/HelpButton/HelpButton'
import classNames from 'classnames'
import style from './LoginForm.module.scss'

export interface ILoginFormProps {
  onSubmitCallBack?: Function
  onForgotPassword?: () => void
  onBack?: () => void
  currentForm: 'login' | 'forgot'
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginTop: '12px',
  '& .MuiFormLabel-root': {
    color: theme.colors.primary_24,
  },
}))

/**
 * LoginForm description
 */
export const LoginForm: FC<ILoginFormProps> = ({
  onSubmitCallBack,
  onForgotPassword,
  onBack,
  currentForm,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isAuthenticating = useSelector(selectIsAuthenticating)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const validationSchema = useMemo(
    () =>
      object({
        username: string().required(
          t('login.form.validation.username', 'Username required')
        ),
        // .min(2, 'Must be more than 2 characters')
        // .max(30, 'Must be at max 30 characters'),
        password: string().required(
          t('login.form.validation.password', 'Password required')
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
    (values: LoginPayload) => {
      dispatch(loginActions.request(values))
      onSubmitCallBack && onSubmitCallBack(values)
    },
    [dispatch, onSubmitCallBack]
  )

  const toggleShowPassword = () => setShowPassword(!showPassword)

  const passwordType = showPassword ? 'text' : 'password'

  return (
    <div className={style.loginForm}>
      {currentForm === 'forgot' && (
        <div className={style.forgotHeader}>
          <div className={style.forgotHeaderTitle}>
            <h5>{t('login.forgot.title', 'Forgot password')}</h5>
            <HelpButton
              className={style.helpIcon}
              node="forgot_password"
              infoIcon={true}
            />
          </div>
          <p>{t('login.forgot.credentials', 'Credentials on PCU display')}</p>
        </div>
      )}
      <Formik
        initialValues={{
          username: '',
          password: '',
          rememberMe: false,
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        data-testid="form"
      >
        {({ submitForm, values }) => (
          <Form
            className={style.form}
            data-test="login-form"
            data-testid="login-form"
          >
            {isAuthenticating && <CircularProgress className={style.loading} />}
            <Field
              component={StyledTextField}
              name="username"
              type="text"
              variant="standard"
              label={t('login.form.fields.username', 'Username')}
              disabled={isAuthenticating}
              InputProps={{
                'data-testid': 'input-username',
              }}
            />
            <Field
              component={StyledTextField}
              variant="standard"
              type={passwordType}
              InputProps={{
                'data-testid': 'input-password',
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      size="small"
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
              label={t('login.form.fields.password', 'password')}
              className={classNames({
                [style.textFieldsSvgVisibility]: showPassword,
                [style.textFieldsSvgVisibilityOff]: !showPassword,
              })}
              name="password"
              disabled={isAuthenticating}
            />
            {currentForm === 'login' && (
              <>
                <div className={style.keepMe}>
                  <FormControlLabel
                    control={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Field
                        component={Checkbox}
                        type="checkbox"
                        name="rememberMe"
                      />
                    }
                    labelPlacement="start"
                    label={t(
                      'login.form.fields.remember_me',
                      'Keep me logged in'
                    )}
                    disabled={isAuthenticating}
                  />
                </div>

                <Button
                  variant="containedRed"
                  type="submit"
                  data-testid="submit-button-login"
                  className={style.loginBtn}
                >
                  {t('login.form.submit', 'Submit')}
                </Button>
                <div className={style.forgot}>
                  <span>
                    {t('login.form.forgot_password', 'Forgot your password?')}
                  </span>
                  <Button
                    variant="text"
                    onClick={onForgotPassword}
                    sx={{
                      position: 'relative',
                      marginLeft: '4px',
                      textTransform: 'none',
                      textDecoration: 'underline',
                      opacity: 0.8,
                      '&:hover': {
                        textDecoration: 'underline',
                        opacity: 1,
                      },
                    }}
                  >
                    {t('login.form.retrive', 'retrive')}
                  </Button>
                </div>
              </>
            )}
            {currentForm === 'forgot' && (
              <Grid container spacing={6} className={style.forgotContainer}>
                <Grid container item xs={6}>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={onBack}
                    className={style.forgotBtnBack}
                  >
                    {t('login.forgot.back', 'Back')}
                  </Button>
                </Grid>
                <Grid container item xs={6}>
                  <Button
                    variant="containedRed"
                    type="submit"
                    data-testid="submit-button-login"
                    className={style.forgotBtnLog}
                  >
                    {t('login.form.submit', 'Submit')}
                  </Button>
                </Grid>
              </Grid>
            )}
          </Form>
        )}
      </Formik>
      {currentForm === 'login' && (
        <>
          <div className={style.divider}>
            <span className={style.line} />
            <span className={style.dividerText}>
              {t('login.form.or', 'or')}
            </span>
            <span className={style.line} />
          </div>
          <QrCodeReader />
        </>
      )}
    </div>
  )
}
