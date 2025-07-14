/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormControlLabelProps,
  ThemeProvider,
  styled,
} from '@mui/material'
import { capitalize } from 'utils/strings'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import style from './Alert.module.scss'
import { darkTheme } from 'utils/themes/mui'
import { fontWeight } from '@mui/system'

export interface IAlertProps {
  /**
   * type of message
   */
  type: 'error' | 'warning' | 'message'
  /**
   * variant
   */
  variant?: 'grey' | 'colored'
  /**
   * title
   */
  title?: string
  /**
   * text
   */
  text?: string
  /**
   * text
   */
  noWrapButton?: boolean
  /**
   * ok button label
   */
  okButtonLabel?: string
  /**
   * ok button callback
   */
  okButtonCallback?: Function
  /**
   * cancel button label
   */
  cancelButtonLabel?: string
  /**
   * cancel button callback
   */
  cancelButtonCallback?: Function
  /**
   * checkbox label
   */
  checkboxLabel?: string
  /**
   * force show close button
   */
  showCloseButton?: boolean
  /**
   * checkbox callback
   */
  checkboxCallback?: (value: boolean) => void
}

interface StyledFormControlLabelProps extends FormControlLabelProps {
  variant?: 'grey' | 'colored'
  type?: 'error' | 'warning' | 'message'
}

const StyledFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'type',
})<StyledFormControlLabelProps>(({ variant, type, theme }) => ({
  alignItems: 'center',
  '& .MuiFormControlLabel-label': {
    ...theme.typography.buttonLabel,
    fontWeight: 100,
    color: theme.colors.primary_11,
  },
  '& .MuiCheckbox-root': {
    padding: 0,
    marginRight: '8px',
    color: theme.colors.primary_11,
  },
  ...(variant === 'colored' &&
    type === 'warning' && {
      [`& .MuiFormControlLabel-label`]: {
        ...theme.typography.buttonLabel,
        fontWeight: 100,
        color: theme.colors.primary_1,
      },
      [`& .MuiCheckbox-root`]: {
        padding: 0,
        marginRight: '8px',
        color: theme.colors.primary_1,
      },
    }),
}))

/**
 * Alert description
 */
const Alert: FC<IAlertProps> = ({
  type = 'error',
  variant = 'grey',
  noWrapButton = false,
  title,
  text,
  okButtonLabel,
  okButtonCallback,
  cancelButtonLabel,
  cancelButtonCallback,
  checkboxLabel,
  showCloseButton = false,
  checkboxCallback,
}: PropsWithChildren<IAlertProps>) => {
  const dispatch = useDispatch()
  /**
   * determine if it's an Alert or a Confirm
   */
  const isConfirm = useMemo(() => {
    return !!okButtonCallback && !!cancelButtonLabel
  }, [okButtonCallback, cancelButtonLabel])
  /**
   * determine if the checkbox should be displayed
   */
  const hasCheckbox = useMemo(() => {
    return checkboxLabel && checkboxCallback
  }, [checkboxLabel, checkboxCallback])
  /**
   * determine if close button should be displayed
   */
  const hasCloseButton = useMemo(() => {
    if (showCloseButton) return true
    if (okButtonLabel || cancelButtonLabel) return false
    return true
  }, [showCloseButton, okButtonLabel, cancelButtonLabel])
  /**
   * determine the icon
   */
  const AlertIcon = useMemo(() => {
    switch (type) {
      case 'error':
        return variant === 'grey' ? (
          <Icon name="Alert" />
        ) : (
          <Icon name="AcquisitionError" />
        )
      case 'warning':
        return variant === 'grey' ? (
          <Icon name="Warning2" />
        ) : (
          <Icon name="AcquisitionWarning" />
        )
      default:
        return null
    }
  }, [type, variant])
  /**
   * callback for ok acton
   */
  const onClickOk = useCallback(() => {
    okButtonCallback && okButtonCallback()
    dispatch(closeDialogAction())
  }, [dispatch, okButtonCallback])
  /**
   * callback for cancel acton
   */
  const onClickCancel = useCallback(() => {
    cancelButtonCallback && cancelButtonCallback()
    dispatch(closeDialogAction())
  }, [dispatch, cancelButtonCallback])
  /**
   * callback for cancel acton
   */
  const onClickClose = useCallback(() => {
    dispatch(closeDialogAction())
  }, [dispatch])
  /**
   * callback for cancel acton
   */
  const onCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      checkboxCallback && checkboxCallback(checked)
    },
    [checkboxCallback]
  )
  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.noWrap]: noWrapButton,
        [style.containerConfirm]: isConfirm,
        [style.containerAlert]: !isConfirm,
        [style[`variant${capitalize(variant)}`]]: true,
        [style[`type${capitalize(type)}`]]: true,
      })}
      data-testid="alert-dialog"
    >
      <ThemeProvider theme={darkTheme}>
        {AlertIcon && <div className={style.icon}>{AlertIcon}</div>}
        <div
          className={style.title}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: title || '' }}
        />
        <div
          data-testid={`alert-dialog-${type}`}
          className={style.text}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: text || '' }}
        />
        <div
          className={classNames({
            [style.button]: true,
            [style.noWrap]: noWrapButton,
          })}
        >
          {isConfirm && (
            <Button
              variant="outlined"
              color="primary"
              onClick={onClickCancel}
              data-testid="alert-cancel-button"
              sx={[
                (theme) => ({
                  ...theme.typography.caption,
                  ...theme.typography.bold,
                }),
              ]}
            >
              {cancelButtonLabel}
            </Button>
          )}
          {okButtonLabel && (
            <Button
              color="primary"
              onClick={onClickOk}
              data-testid="alert-ok-button"
              sx={[
                (theme) => ({
                  ...theme.typography.caption,
                  ...theme.typography.bold,
                }),
              ]}
            >
              {okButtonLabel}
            </Button>
          )}
        </div>
        {hasCheckbox && (
          <Box sx={{ textAlign: 'left', padding: '0 12px' }}>
            <StyledFormControlLabel
              control={
                <Checkbox
                  data-testid="alert-checkbox"
                  onChange={onCheckboxChange}
                />
              }
              label={checkboxLabel}
              variant={variant}
              type={type}
            />
          </Box>
        )}
        {hasCloseButton && (
          <div
            className={style.closeButton}
            data-testid="close-button"
            onClick={onClickClose}
          >
            <Icon name="Close" />
          </div>
        )}
      </ThemeProvider>
    </div>
  )
}
export default Alert
