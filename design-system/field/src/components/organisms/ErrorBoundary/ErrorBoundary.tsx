import React, { Component, ErrorInfo, ReactNode } from 'react'
import api from 'store/features/system/api'
import { SystemLogType } from 'store/features/system/types'
import { BrokenView } from 'components/atoms/BrokenView/BrokenView'

export interface IErrorBoundaryProps {
  children: ReactNode
}

type State = Readonly<{
  hasError: boolean
  message: string
}>

export class ErrorBoundary extends Component<IErrorBoundaryProps, State> {
  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, message: _.message }
  }

  // eslint-disable-next-line react/state-in-constructor
  readonly state: State = {
    hasError: false,
    message: 'This is a problem on our side, not yours.',
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Uncaught error]:')
    console.error(`ERROR_INFO: ${errorInfo?.componentStack}`)
    console.error(`ERROR: name: ${error?.name} // message: ${error?.message}`)
    api
      .systemLog({
        code: 'crash',
        message: `${error?.name} - ${error?.message} - ${errorInfo?.componentStack}`,
        type: SystemLogType.ERROR,
      })
      .then(() => {
        console.info('[ErrorBoundary] error sent to backend')
      })
  }

  render() {
    const { children } = this.props
    const { hasError, message } = this.state
    const onClickHandler = () => {
      window.location.reload()
    }

    return hasError ? (
      <BrokenView
        message={message}
        action={{
          onClick: onClickHandler,
          label: 'RELOAD',
        }}
      />
    ) : (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>{children}</>
    )
  }
}
