/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  FormControl,
  MenuItem,
  Popover,
  Portal,
  ThemeProvider,
  Zoom,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import classNames from 'classnames'
import { BrokenView } from 'components/atoms/BrokenView/BrokenView'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { Icon } from 'components/atoms/Icon/Icon'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { AdminOptions } from 'components/molecules/AdminOptions/AdminOptions'
import { Copyright } from 'components/molecules/Copyright/Copyright'
import { FirmwareUpdate } from 'components/molecules/FirmwareUpdate/FirmwareUpdate'
import { HelpSupport } from 'components/molecules/HelpSupport/HelpSupport'
import useTheme from 'hooks/useTheme'
import i18next from 'i18next'
import { isEmpty, keys, mergeDeepRight } from 'ramda'
import { ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  logoutActions,
  selectIsAdmin,
  selectUserInfo,
} from 'store/features/auth/slice'
import { selectProcessingInfo } from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  selectSettingsState,
  setAudioSettings,
  setI18nSettings,
} from 'store/features/settings/slice'
import { AudioSettings } from 'store/features/settings/types'
import api from 'store/features/system/api'
import {
  flushLogsAction,
  logMessage,
  notificationsUnsubscribeAction,
  selectBackendVersion,
  selectCheckUpdate,
  selectClientReleaseTag,
  selectResponsiveness,
  /* selectFirmwareUpdate, */
  selectSystemInfo,
  selectUpdateInfo,
  systemUpdateInfoActions,
} from 'store/features/system/slice'
import { MapsCountry } from 'store/features/system/types'
import { Theme } from 'store/features/theme/slice'
import { formatSwVersion } from 'utils/strings'
import { darkTheme } from 'utils/themes/mui'
import style from './HamburgerMenu.module.scss'

type MenuOption = {
  /**
   * Menu option type.
   * Every menu option can be a string or a select with onClick & onChange events
   */
  type: string
  label: string | ReactNode
  icon: JSX.Element | null
  loginId?: string
  order: number
  testId: string
  update?: boolean
  alert?: boolean
  visible: boolean
  disabled?: boolean
  selectItems?: { value: string; label: string }[]
  selectItemDefault?: Theme | string
  onClick?: () => void
  onChange?: (event: SelectChangeEvent) => void
}

/**
 * HamburgerMenu description
 */
export const HamburgerMenu = () => {
  const [open, setOpen] = useState(false)
  const [openFirmware, setOpenFirmware] = useState(false)
  const [openSupport, setOpenSupport] = useState(false)
  const [systemIsOff, setSystemIsOff] = useState(false)
  const [openCopyright, setOpenCopyright] = useState(false)
  const [theme, setTheme] = useTheme()
  const { language } = i18next
  const anchorEl = document.getElementById('hamburgerMenu')
  const dispatch = useDispatch()
  const { t } = useTranslation()
  // the menu will always use the dark colors
  const systeminfo = useSelector(selectSystemInfo)
  const backendVersion = useSelector(selectBackendVersion)
  // TODO: evaluate if we can remove this
  // const firmwareUpdate = useSelector(selectFirmwareUpdate)
  const isAdmin = useSelector(selectIsAdmin)
  const allSettings = useSelector(selectSettingsState)
  const audioSettings = allSettings.audio
  const systemInfo = useSelector(selectSystemInfo)
  const userInfo = useSelector(selectUserInfo)
  const processing = useSelector(selectProcessingInfo)
  const clientReleaseTag = useSelector(selectClientReleaseTag)
  const serverReleaseTag = systemInfo?.softwareBuildType
  const windowsImage = systemInfo?.windowsBuild
  const installerVersion = systemInfo?.installerversion
  const updateInfo = useSelector(selectUpdateInfo)
  const checkUpdate = useSelector(selectCheckUpdate)
  const updateVersionAvailable = updateInfo?.version
  const { battery } = useSelector(selectResponsiveness) || {}

  const isUsbUpdateAvailable = useMemo(() => {
    if (updateVersionAvailable) {
      return !(updateVersionAvailable.length === 0)
    }
    return false
  }, [updateVersionAvailable])

  const isOnlineUpdateAvailable = useMemo(() => {
    if (checkUpdate) {
      return checkUpdate.newUpdate
    }
    return false
  }, [checkUpdate])

  const isUpdateAvailable = useMemo(
    () => isUsbUpdateAvailable || isOnlineUpdateAvailable,
    [isUsbUpdateAvailable, isOnlineUpdateAvailable]
  )

  const isProcessing = useMemo(() => {
    if (processing && !isEmpty(processing)) return true
    return false
  }, [processing])

  const rebootIsDisabled = useMemo(() => {
    if (!battery) return false
    if (battery.acplug) return false
    if (battery.details && battery.details.batteries.length > 0) {
      return !battery.details.batteries?.some((battery) => battery.health > 20)
    }
    return false
  }, [battery])

  const handleToggle = () => {
    console.info(`[HAMBURGER_MENU] toggle to ${open ? 'closed' : 'opened'}`)
    setOpen(!open)
  }

  const handleFirmware = () => {
    setOpenFirmware(!openFirmware)
    setOpen(false)
  }

  const handleCopyright = () => {
    setOpenCopyright(!openCopyright)
    setOpen(false)
  }

  const handleSupport = () => {
    setOpenSupport(!openSupport)
    setOpen(false)
  }

  const handleTheme = (event: SelectChangeEvent) => {
    const newTheme = event.target.value as Theme

    // fallback in the case 'disabled' property of the select is not working
    if (newTheme === theme) {
      return
    }

    setTheme(newTheme)
  }

  const handleLanguage = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value as string

    // fallback in the case 'disabled' property of the select is not working
    if (newLanguage === language) {
      return
    }

    dispatch(setI18nSettings({ language: newLanguage }))
  }

  const handleCountryCode = (event: SelectChangeEvent) => {
    const newCountry = event.target.value as MapsCountry
    dispatch(systemUpdateInfoActions.request({ countryCode: newCountry }))
  }

  const languageOptions = useMemo(() => {
    const languages = t('language', {
      returnObjects: true,
    }) as Record<string, string>
    // const hiddenLanguages = isAdmin ? [] : []
    return keys(languages).map((key) => ({
      value: key,
      label: languages[key],
    }))
    // .filter((l) => !hiddenLanguages.includes(l.value))
  }, [t])

  const countryOptions = useMemo(() => {
    const countries = t('countries', {
      returnObjects: true,
    }) as Record<string, string>
    return keys(countries).map((key) => ({
      value: key,
      label: countries[key],
    }))
  }, [t])

  // REMOVED PEF-3867
  /* const versionOk = useMemo(() => {
    if (!backendVersion) return false
    if (!process.env.NX_BACKEND_VERSION) return false
    const cleanVersion = process.env.NX_BACKEND_VERSION.split('-')[0]
    return isSupportedVersion(backendVersion, cleanVersion)
  }, [backendVersion])

  const VersionIcon = useMemo(() => {
    return versionOk ? <Icon name="Connect2" /> : <Icon name="Alert" />
  }, [versionOk])

  const versionText = useMemo(() => {
    const cleanVersion = process.env.NX_BACKEND_VERSION?.split('-')[0]
    return versionOk
      ? t('header.menu.version_ok', 'ok')
      : t('header.menu.version_ko', { expected: cleanVersion })
  }, [versionOk, t]) */

  const audioOn = useMemo(() => {
    if (!audioSettings) return false
    if (audioSettings.globalVolume > 0) {
      if (
        audioSettings.audibleMessages.COLLECTION ||
        audioSettings.audibleMessages.NAVIGATION ||
        audioSettings.audibleMessages.ERROR
      )
        return true
    }
    return false
  }, [audioSettings])

  const AudioIcon = useMemo(() => {
    return audioOn ? <Icon name="VolumeOff" /> : <Icon name="VolumeOn" />
  }, [audioOn])

  const audioText = useMemo(() => {
    return audioOn
      ? t('header.menu.audio_ko', 'mute audio')
      : t('header.menu.audio_ok', 'un-mute audio')
  }, [audioOn, t])

  const handleAudioMute = () => {
    const newVolume = audioOn
      ? audioSettings.globalVolume
      : audioSettings.globalVolume || 75
    dispatch(
      setAudioSettings(
        mergeDeepRight(audioSettings, {
          audibleMessages: {
            COLLECTION: !audioOn,
            ERROR: !audioOn,
            NAVIGATION: !audioOn,
          },
          globalVolume: newVolume,
        }) as AudioSettings
      )
    )
  }

  const shutdownActions = () => {
    dispatch(logMessage('[SYSTEM] the user chose to shutdown the system'))
    api
      .systemShutdown()
      .then(() => {
        handleToggle()
        setSystemIsOff(true)
        // stop trying to keep socket connection up
        dispatch(notificationsUnsubscribeAction())
      })
      .catch((err) => console.error(err))
  }

  const rebootActions = () => {
    dispatch(logMessage('[SYSTEM] the user chose to reboot the system'))
    api
      .systemReboot()
      .then(() => {
        handleToggle()
        setSystemIsOff(true)
      })
      .catch((err) => console.error(err))
  }

  const handleShutdown = () => {
    dispatch(flushLogsAction(true))
    if (isProcessing) {
      const { title, text, okButtonLabel, cancelButtonLabel } = t(
        'header.menu.processingShutdown',
        {
          returnObjects: true,
        }
      ) as Record<string, string>
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'warning',
            okButtonCallback: shutdownActions,
            okButtonLabel,
            cancelButtonLabel,
            text,
            title,
          } as IAlertProps,
        })
      )
      return
    }
    // if not processing show the dialog without the text
    const { title, okButtonLabel, cancelButtonLabel } = t(
      'header.menu.processingShutdown',
      {
        returnObjects: true,
      }
    ) as Record<string, string>
    dispatch(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          okButtonCallback: shutdownActions,
          okButtonLabel,
          cancelButtonLabel,
          title,
        } as IAlertProps,
      })
    )
  }

  const handleReboot = () => {
    if (rebootIsDisabled) return
    dispatch(flushLogsAction(true))
    if (isProcessing) {
      const { title, text, okButtonLabel, cancelButtonLabel } = t(
        'header.menu.processingReboot',
        { returnObjects: true }
      ) as Record<string, string>
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'warning',
            okButtonCallback: rebootActions,
            okButtonLabel,
            cancelButtonLabel,
            text,
            title,
          } as IAlertProps,
        })
      )
      return
    }
    // if not processing show the dialog without the text
    const { title, okButtonLabel, cancelButtonLabel } = t(
      'header.menu.processingReboot',
      { returnObjects: true }
    ) as Record<string, string>
    dispatch(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          okButtonCallback: rebootActions,
          okButtonLabel,
          cancelButtonLabel,
          title,
        } as IAlertProps,
      })
    )
  }

  const menuOptions: MenuOption[] = [
    /**
     * Menu options list.
     * Every menu option can be a string or a select with onClick & onChange events
     */
    {
      type: 'string',
      order: 1,
      loginId: userInfo?.username || '',
      label: t('header.menu.login', 'login system id'),
      icon: <Icon name="User" />,
      /* onClick: () => {}, */
      visible: true,
      testId: 'systemSerial',
    },
    {
      type: 'string',
      order: 2,
      label: t('header.menu.license', 'license & firmware update'),
      icon: isUpdateAvailable ? (
        <Icon name="UpdateAvailable" />
      ) : (
        <Icon name="License" />
      ),
      /* icon: <License />, */
      onClick: handleFirmware,
      update: isUpdateAvailable,
      visible: true,
      testId: 'firmware',
    },
    // TODO: disabled
    {
      type: 'string',
      order: 3,
      label: t('header.menu.help', 'help & support'),
      icon: <Icon name="HelpMenu" />,
      onClick: handleSupport,
      visible: false,
      testId: 'helpSupport',
    },
    // TODO: disabled - enable when releasing multilanguage
    {
      type: 'select',
      order: 4,
      label: t('header.menu.lang', 'change language'),
      icon: <Icon name="Lang" />,
      selectItems: languageOptions,
      selectItemDefault: language,
      onChange: handleLanguage,
      visible: true,
      testId: 'changeLanguage',
    },
    {
      type: 'select',
      order: 5,
      label: t('header.menu.country', 'country'),
      icon: <Icon name="Theme" />,
      selectItems: countryOptions,
      selectItemDefault: systemInfo?.countryCode,
      onChange: handleCountryCode,
      visible: isAdmin,
      testId: 'changeCountryCode',
    },
    {
      type: 'select',
      order: 6,
      label: t('header.menu.theme', 'theme'),
      icon: <Icon name="Theme" />,
      selectItems: [
        { value: 'light', label: t('theme.light', 'Light') },
        { value: 'dark', label: t('theme.dark', 'Dark') },
      ],
      selectItemDefault: theme,
      onChange: handleTheme,
      visible: true,
      testId: 'changeTheme',
    },
    {
      type: 'string',
      order: 7,
      label: t('header.menu.logout', 'logout'),
      icon: <Icon name="Logout" />,
      onClick: () => {
        dispatch(logoutActions.request())
      },
      visible: true,
      testId: 'logout',
    },
    {
      type: 'string',
      order: 8,
      label: t('header.menu.shutdown', 'shutdown'),
      icon: <Icon name="Shutdown" />,
      onClick: handleShutdown,
      visible: true,
      testId: 'shutdown',
    },
    {
      type: 'string',
      order: 9,
      label: t('header.menu.reboot', 'reboot'),
      icon: <Icon name="Reboot" />,
      onClick: handleReboot,
      visible: true,
      testId: 'reboot',
      disabled: rebootIsDisabled,
    },
    {
      type: 'string',
      order: 10,
      label: audioText,
      icon: AudioIcon,
      onClick: handleAudioMute,
      visible: true,
      testId: 'audioMute',
    },
    {
      type: 'string',
      order: 11,
      label: <AdminOptions />,
      icon: null,
      // alert: !versionOk,
      visible: isAdmin,
      testId: 'adminOptions',
    },
    // REMOVED PEF-3867
    /* {
      type: 'string',
      order: 12,
      label: versionText,
      icon: VersionIcon,
      alert: !versionOk,
      visible: isAdmin,
      testId: 'systemVersion',
    }, */
    {
      type: 'string',
      order: 13,
      label: t('header.menu.copyright', 'copyright'),
      icon: <Icon name="Copyright" />,
      onClick: handleCopyright,
      visible: true,
      testId: 'copyright',
    },
  ]

  const versionInfo = useMemo(() => {
    return isAdmin
      ? formatSwVersion(
          clientReleaseTag,
          serverReleaseTag,
          windowsImage,
          backendVersion,
          installerVersion
        )
      : `${t('header.menu.version', 'version')}: ${installerVersion}`
  }, [
    backendVersion,
    serverReleaseTag,
    isAdmin,
    t,
    clientReleaseTag,
    windowsImage,
    installerVersion,
  ])

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={style.container}>
        <div
          className={classNames({
            [style.menu]: true,
            [style['menu--open']]: open,
          })}
          id="hamburgerMenu"
          onClick={handleToggle}
          data-test="open-button"
          data-testid="open-button"
        >
          <span
            className={classNames({
              [style.menu__burger]: true,
              [style['menu__burger--first']]: true,
            })}
          />
          <span
            className={classNames({
              [style.menu__burger]: true,
              [style['menu__burger--second']]: true,
            })}
          />
          {isUpdateAvailable && (
            <div
              className={classNames({
                [style.menu__burger]: true,
                [style['menu__burger--update']]: true,
              })}
            />
          )}
        </div>

        <Popover
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={open}
          anchorEl={anchorEl}
          onClose={handleToggle}
          TransitionComponent={Zoom}
        >
          <div
            className={classNames({
              [style.menu__nav]: true,
              [style['menu__nav--open']]: true,
            })}
            data-testid="popoverMenu"
          >
            <Icon
              name="Close"
              onClick={handleToggle}
              className={style.menu__navClose}
            />
            <div className={style.menu__navHeader}>
              {t('header.menu.title', 'Profile Details')}
            </div>

            <ul>
              {menuOptions.map((option) => {
                const {
                  type,
                  label,
                  order,
                  loginId,
                  icon,
                  testId,
                  update,
                  alert,
                  selectItems,
                  selectItemDefault,
                  visible,
                  onClick,
                  onChange,
                  disabled,
                } = option
                if (!visible) return false
                return (
                  <li className={style.menu__navItem} key={order}>
                    <div
                      className={classNames({
                        [style.menu__navItemLeft]: true,
                        [style.menu__navItemLeftSelect]: type === 'select',
                        [style.menu__navItemAlert]: alert,
                        [style.cursorPointer]: !!onClick,
                        [style.disabled]: disabled,
                      })}
                      onClick={onClick}
                      data-testid={testId}
                    >
                      {icon && (
                        <span className={style.menu__navItemIcon}>{icon}</span>
                      )}
                      {label && (
                        <span
                          className={classNames({
                            [style.menu__navItemLabel]: true,
                            [style.menu__navItemLabelSelect]: type === 'select',
                          })}
                        >
                          {label}
                        </span>
                      )}
                      {loginId && (
                        <span className={style.menu__navItemId}>{loginId}</span>
                      )}
                      {update && (
                        <span
                          data-testid="firmwareUpdate"
                          className={style.menu__navItemLabelUpdate}
                        >
                          {isUsbUpdateAvailable
                            ? t('header.menu.update.usb', 'update detected')
                            : t(
                                'header.menu.update.myWorld',
                                'update available'
                              )}
                        </span>
                      )}
                      {testId === 'reboot' && rebootIsDisabled && (
                        <span
                          data-testid="reboot-disabled"
                          className={style.menu__navItemLabelRebootDisabled}
                        >
                          {t('header.menu.rebootDisabled', 'reboot disabled')}
                        </span>
                      )}
                    </div>
                    {type === 'select' && selectItems! && (
                      <div className={style.select}>
                        <FormControl>
                          <CustomSelect
                            value={selectItemDefault}
                            onChange={onChange}
                            id={order + (label as string)}
                            MenuProps={{
                              anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                              },
                            }}
                          >
                            {selectItems.map((item) => (
                              <MenuItem
                                key={item.value}
                                value={item.value}
                                disabled={item.value === selectItemDefault}
                                data-testid={`language-${item.value}`}
                              >
                                {item.label}
                              </MenuItem>
                            ))}
                          </CustomSelect>
                        </FormControl>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className={style.version}>{versionInfo}</div>
          </div>
        </Popover>
        {/* We need to send the firmware info from the store as soon as available. Now we're handling only the closure */}
        {openFirmware && <FirmwareUpdate onClose={handleFirmware} />}
        {openSupport && <HelpSupport onClose={handleSupport} />}
        {systemIsOff && (
          <Portal>
            <BrokenView message={t('header.systemIsOff', 'System is off')} />
          </Portal>
        )}
        {openCopyright && (
          <Copyright onClose={handleCopyright} versionInfo={versionInfo} />
        )}
      </div>
    </ThemeProvider>
  )
}
