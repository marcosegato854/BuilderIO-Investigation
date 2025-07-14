import axios, { AxiosError } from 'axios'

import { store } from 'store'

import { selectToken, logoutActions } from 'store/features/auth/slice'
import { IS_TESTING } from 'utils/capabilities'

const getApiUrl = () => {
  const { protocol, hostname } = window.location
  const port = protocol === 'https:' ? '' : '9080'
  return (
    process.env.NX_BACKEND_API_URL || `${protocol}//${hostname}:${port}/api`
  )
}

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 5 * 1000,
  headers: {
    common: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
})

/**
 * add Authorization bearer if token exists
 */
apiClient.interceptors.request.use(async (config) => {
  const token = selectToken(store.getState())
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.common = config.headers.common ?? {}
    // eslint-disable-next-line no-param-reassign
    config.headers.common.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * logout the user if error status is 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (IS_TESTING) return
    if (!error.response) {
      console.error(`[BACKEND API] FAILED ${error.config?.url}`, error)
      // if (IS_TESTING) {
      //   apiClient.post('/system/log', {
      //     module: '[WEB]',
      //     description: 'API failed',
      //     url: error.config?.url,
      //   })
      // }
    }
    const ForceLogoutErrorCodes = [401, 403]
    if (!axios.isCancel(error)) {
      if (ForceLogoutErrorCodes.find((e) => e === error.response?.status)) {
        store.dispatch(logoutActions.success())
      }
      throw error
      // TODO: try the following instead of throw
      // return Promise.reject(error)
    }
  }
)

export default apiClient
