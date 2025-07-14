import axios, { AxiosError } from 'axios'

import { store } from 'store'

import { selectToken } from 'store/features/auth/slice'

export const getApiUrl = () => {
  const { protocol, hostname } = window.location
  return process.env.NX_NODE_API_URL || `${protocol}//${hostname}`
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
 * log errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      console.error(`[NODE API] FAILED ${error.config.url}`)
    }
    if (!axios.isCancel(error)) {
      console.error(error)
      throw error
    }
  }
)

export default apiClient
