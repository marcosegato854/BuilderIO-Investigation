import React, { FC, PropsWithChildren, useEffect, useMemo } from 'react'
import { RouteComponentProps, useParams } from 'react-router-dom'
import { loginActions } from 'store/features/auth/slice'
import { useDispatch } from 'react-redux'
import { LoginPayload } from 'store/features/auth/types'
import { getIpFromUrl } from 'utils/getIpFromUrl'
import { obfuscatePassword } from 'utils/objects'

export interface IQrCodeLoginProps extends RouteComponentProps {}

/**
 * QrCodeLogin description
 */
export const QrCodeLogin: FC<IQrCodeLoginProps> = ({
  history,
}: PropsWithChildren<IQrCodeLoginProps>) => {
  const dispatch = useDispatch()
  const ip = getIpFromUrl()
  const user = useParams<{ username: string }>().username
  const pass = useParams<{ password: string }>().password

  const loginPayload: LoginPayload = useMemo(() => {
    return {
      username: user,
      password: pass,
      rememberMe: true,
    }
  }, [user, pass])

  useEffect(() => {
    /* when logging with the QrCode we must ensure that previous token is removed */
    console.info('[QRCODELOGIN]')
    /** According to PEF-4560 we need to hide the password embedded in the job object */
    const loginPayloadCopy = obfuscatePassword({ ...loginPayload })
    console.info(JSON.stringify(loginPayloadCopy, null, '\t'))
    localStorage.removeItem('PEF_token')
    dispatch(loginActions.request(loginPayload))
  }, [dispatch, ip, loginPayload])

  return <div>REDIRECTING</div>
}
