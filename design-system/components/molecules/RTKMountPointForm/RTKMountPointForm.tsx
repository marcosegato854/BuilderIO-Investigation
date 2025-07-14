/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material'
import { Field, Form, Formik } from 'formik'
import useTheme from 'hooks/useTheme'
import { isEmpty } from 'ramda'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  rtkServiceInterfaceModesActions,
  selectRtkCurrentServer,
  selectRtkInterfaceModes,
  selectRtkMountpoints,
  selectRtkMountpointsActionProgress,
  selectRtkTestActionProgress,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'
import { FormikListener } from 'utils/formik/FormikListener'
import { useMUIStyles } from 'utils/themes/mui'
import { object, string } from 'yup'
import style from './RTKMountPointForm.module.scss'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'

export type ServerMountpointInfo = Pick<
  RtkServer,
  'mountpoint' | 'interfacemode'
>
export interface IRTKMountPointFormProps {
  /**
   * callback on change
   */
  onTest?: () => void
  /**
   * callback on change
   */
  onUpdate?: (server: ServerMountpointInfo) => void
}
/**
 * RTKMountPointForm description
 */
export const RTKMountPointForm: FC<IRTKMountPointFormProps> = ({
  onUpdate,
  onTest,
}: PropsWithChildren<IRTKMountPointFormProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const mountpoints = useSelector(selectRtkMountpoints)
  const mountpointsProgress = useSelector(selectRtkMountpointsActionProgress)
  const mountPointsRef = useRef<HTMLDivElement>(null)
  const rtkTestBtnRef = useRef<HTMLButtonElement>(null)
  const currentServer = useSelector(selectRtkCurrentServer)
  const interfacemodes = useSelector(selectRtkInterfaceModes)
  const [theme] = useTheme()
  const currentValues = useRef<RtkServer>()
  const progress = useSelector(selectRtkTestActionProgress)
  const isAuthenticating = progress !== 0 && progress < 100
  const validationSchema = useMemo(
    () =>
      object({
        mountpoint: string().required(
          t('rtk.mountpoint.form.validation.mountpoint', 'Mountpoint required')
        ),
        interfacemode: string().required(
          t('rtk.mountpoint.form.validation.interfacemode', 'Format required')
        ),
      }),
    [t]
  )
  const onSubmit = useCallback(
    (values) => {
      rtkTestBtnRef.current &&
        rtkTestBtnRef.current.scrollIntoView &&
        rtkTestBtnRef.current.scrollIntoView({
          behavior: 'smooth', // Defines the transition animation. default: auto
          // block: 'start|center|end|nearest', // Defines vertical alignment. default: start
          // inline: 'start|center|end|nearest', // Defines horizontal alignment. default: nearest
        })

      onTest && onTest()
    },
    [onTest]
  )

  const commonInputProps = {
    'data-testid': 'form-field',
    MenuProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
    },
  }

  const onTouched = useCallback(
    (values) => {
      currentValues.current = values
      onUpdate && onUpdate(values)
    },
    [onUpdate]
  )

  const defaultValues = useMemo(() => {
    const mountpoint = currentServer?.mountpoint || ''
    /** select the default interfacemode for the current mountpoint */
    const interfacemodeItem = mountpoints.find((m) => m.name === mountpoint)
    const interfacemode =
      currentServer?.interfacemode || interfacemodeItem?.interfacemode || ''
    currentValues.current = {
      mountpoint,
      interfacemode,
    }
    return currentValues.current
  }, [currentServer, mountpoints])

  const disabled = useMemo(() => {
    if (mountpoints?.length <= 0) return true
    if (isAuthenticating) return true
    return false
  }, [mountpoints, isAuthenticating])

  const testDisabled = () => {
    if (disabled) return true
    if (isEmpty(currentValues.current?.mountpoint)) return true
    if (isEmpty(currentValues.current?.interfacemode)) return true
    return false
  }

  const updateInterfaceMode = useCallback(
    (value: string, setFieldValue: (field: string, value: string) => void) => {
      setFieldValue('mountpoint', value)
      const interfacemode = mountpoints.find((m) => m.name === value)
      setFieldValue('interfacemode', interfacemode?.interfacemode || '')
    },
    [mountpoints]
  )

  useEffect(() => {
    dispatch(rtkServiceInterfaceModesActions.request())
  }, [dispatch])

  /** scroll to mountpoints after server connection */
  useLayoutEffect(() => {
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()
    if (
      currentServer?.connected &&
      mountpoints?.length &&
      mountpointsProgress === 100
    ) {
      // TODO check if se setTimeout can be removed
      to = setTimeout(() => {
        mountPointsRef.current?.scrollIntoView &&
          mountPointsRef.current.scrollIntoView({
            behavior: 'smooth', // Defines the transition animation. default: auto
            // block: 'start|center|end|nearest', // Defines vertical alignment. default: start
            // inline: 'start|center|end|nearest', // Defines horizontal alignment. default: nearest
          })
      }, 100)
    }
    return cleanup
  }, [mountpoints, mountpointsProgress, currentServer])

  return (
    <div
      data-testid="rtk-mountpoint-form"
      className={style.container}
      ref={mountPointsRef}
    >
      <Formik
        initialValues={defaultValues}
        enableReinitialize /** reinitialize at every change in defaultValues */
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        data-testid="form"
      >
        {({ values, errors, setFieldValue, submitForm }) => {
          const mountpoint =
            (mountpoints.length && currentValues.current?.mountpoint) || ''
          const interfacemode =
            (interfacemodes.length && currentValues.current?.interfacemode) ||
            ''
          return (
            <Form className={style.form}>
              <FormikListener onTouched={onTouched} />
              <div className={style.field}>
                <label className={style.label}>
                  {t('rtk.mountPoint.form.mountpoint', 'Mountpoint')}:
                </label>
                <FormControl className={style.selectBox}>
                  <Field
                    as={CustomSelect}
                    name="mountpoint"
                    value={mountpoint}
                    {...commonInputProps}
                    onChange={(v: { target: { value: string } }) => {
                      updateInterfaceMode(v.target.value, setFieldValue)
                    }}
                    disabled={disabled}
                  >
                    {mountpoints.map((mp) => {
                      return (
                        <MenuItem key={`option-${mp.name}`} value={mp.name}>
                          {mp.name}
                        </MenuItem>
                      )
                    })}
                  </Field>
                </FormControl>
              </div>

              <div className={style.field}>
                <label className={style.label}>
                  {t('rtk.mountPoint.form.interfacemode', 'Format')}:
                </label>
                <FormControl className={style.selectBox}>
                  <Field
                    as={CustomSelect}
                    name="interfacemode"
                    value={interfacemode}
                    disabled={disabled}
                    {...commonInputProps}
                  >
                    {interfacemodes.map((mode) => {
                      return (
                        <MenuItem key={`option-${mode}`} value={mode}>
                          {mode}
                        </MenuItem>
                      )
                    })}
                  </Field>
                </FormControl>
              </div>

              <Button
                type="submit"
                data-testid="submit-button-rtk-test"
                disabled={testDisabled()}
                ref={rtkTestBtnRef}
                sx={{
                  alignSelf: 'center',
                  marginTop: '16px',
                  width: '102px',
                  height: '30px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('rtk.mountPoint.form.test', 'RTK test')}
              </Button>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}
