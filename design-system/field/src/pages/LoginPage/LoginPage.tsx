import React, { FC, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { LoginForm } from 'components/molecules/LoginForm/LoginForm'
import { Icon } from 'components/atoms/Icon/Icon'
import { Grid } from '@mui/material'
// import { TmpNotificationsDisplay } from 'components/atoms/TmpNotificationsDisplay/TmpNotificationsDisplay'
// import { LoginInfo } from 'components/atoms/LoginInfo/LoginInfo'
import style from 'pages/LoginPage/LoginPage.module.scss'
import { useDispatch } from 'react-redux'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { DevChip } from 'components/atoms/DevChip/DevChip'

export interface ILoginPageProps extends RouteComponentProps {}

/**
 * LoginPage description
 */
export const LoginPage: FC<ILoginPageProps> = ({
  history,
}: ILoginPageProps) => {
  const [currentForm, setcurrentForm] = useState<'login' | 'forgot'>('login')
  const onForgotPassword = () => setcurrentForm('forgot')
  const onBack = () => setcurrentForm('login')
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(closeAllDialogsAction())
  }, [dispatch])

  return (
    <div className={style.container}>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        className={style.grid}
        spacing={5}
      >
        <Icon name="LogoLeica" className={style.logoLeica} />
        <div className={style.pegasus}>PEGASUS</div>
        <LoginForm
          currentForm={currentForm}
          onForgotPassword={onForgotPassword}
          onBack={onBack}
        />
        <div className={style.version}>
          {/* {`Client: ${process.env.NX_VERSION}`}
          <br />
          {`Backend: ${process.env.NX_BACKEND_VERSION}`}
          <br /> */}
          <DevChip />
        </div>
        {/* TODO: enable when the content is available
        <div className={style.video}>
          <LoginInfo />
        </div> */}
      </Grid>
    </div>
  )
}
