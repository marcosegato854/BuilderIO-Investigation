/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { t } from 'i18n/config'
import { ActionError } from 'store/features/actions/types'
import {
  HiddenStatusCodes,
  UserHiddenStatusCodes,
} from 'store/features/errors/types'

export function extractErrorMsg(error: any): string | string[] {
  const defaultMessage = t('api.unexpectedError', {
    defaultValue: 'unexpected error',
  })
  try {
    const { response, message, request, description } = error

    if (description) return description

    // Server responded with a status code that falls out of the range of 2xx
    if (response) {
      if (response.data?.message) {
        return response.data.message
      }
      if (response.data?.error?.message) {
        return response.data.error.message
      }
      if (response.data?.error?.description) {
        // backend translatable error
        return response.data.error.description
      }
      if (response.data?.error?.inner) {
        return response.data.error.inner
      }

      return response.statusText?.length ? response.statusText : defaultMessage
    }
    // The request was made but no response was received
    if (request) {
      return error.message || defaultMessage
    }

    // Something happened in setting up the request that triggered an Error
    return message || defaultMessage
  } catch {
    return defaultMessage
  }
}

export function extractErrorParams(error: any): string[] {
  try {
    if (error?.p1) return [error?.p1 || '', error?.p2 || '', error?.p3 || '']
    return [
      error?.response?.data?.error?.p1 || '',
      error?.response?.data?.error?.p2 || '',
      error?.response?.data?.error?.p3 || '',
    ]
  } catch {
    return ['', '', '']
  }
}

export function replaceErrorParams(
  description: string | string[],
  p1?: string,
  p2?: string,
  p3?: string
): string | string[] {
  if (!description) return ''
  if (typeof description !== 'string') {
    return (description as string[]).map(
      (s) => replaceErrorParams(s, p1, p2, p3) as string
    )
  }
  const regexP1 = /{p1}/i
  const regexP2 = /{p2}/i
  const regexP3 = /{p3}/i
  return description
    .replace(regexP1, p1 || '')
    .replace(regexP2, p2 || '')
    .replace(regexP3, p3 || '')
}

export function translateError(e: any) {
  // check if the error has a cose and a variable string p1, p2, p3
  const code = extractErrorCode(e)
  const msg = t(`backend_errors.code.${code}`, extractErrorMsg(e))
  const [p1, p2, p3] = extractErrorParams(e)
  if (code) {
    return replaceErrorParams(msg, p1, p2, p3) as string
  }
  // fallback is there's no code
  const statusCode = extractErrorStatusCode(e)
  const fallback = replaceErrorParams(msg, p1, p2, p3)
  return t(`backend_errors.status_code.${statusCode}`, fallback)
}

export function extractErrorStatusCode(error: any): number {
  try {
    return error.response?.status || 0
  } catch {
    return 0
  }
}

export function extractErrorCode(error: any): string | null {
  try {
    if (error.code) return error.code
    return error.response?.data?.error?.code || error.code
  } catch {
    return null
  }
}

/**
 * extracts error message and code in a unique string
 * @param e
 * @returns string
 */
export function shortError(e: any): string {
  const statusCodeStr = extractErrorStatusCode(e)
    ? ` - ${extractErrorStatusCode(e)}`
    : ''
  return `${translateError(e)}${statusCodeStr}`
}

export function extractErrorData(
  error: any
): { code: string; description: string } | null {
  try {
    return error.response.data.error
  } catch (e) {
    return null
  }
}

export function getTranslatedErrorDescriptions(errors: any[]): string[] {
  return errors.map(translateError)
}

export function composeError(
  prefix: string,
  errors: any[] | undefined,
  separator: string = ' - '
): Error {
  const errStr = composeErrorString(prefix, errors, separator)
  return new Error(errStr)
}

export function composeErrorString(
  prefix: string,
  errors: any[] | undefined,
  separator: string = ' | '
): string {
  if (!errors) return prefix
  const errStr = getTranslatedErrorDescriptions(errors)?.join(separator)
  if (!prefix.length) return errStr
  const finalStr = `${prefix}: ${errStr}`
  return finalStr
}

export function errorLogInfo(e: Error) {
  try {
    const { message, config } = JSON.parse(JSON.stringify(e))
    return `${message} - METHOD: ${config.method} - URL: ${config.url}`
  } catch (error) {
    return e.message
  }
}

export const errorIsVisible = (e: any, isAdmin: boolean) => {
  const errorCode = extractErrorStatusCode(e)
  if (isAdmin) return !HiddenStatusCodes.includes(errorCode)
  return (
    !HiddenStatusCodes.includes(errorCode) &&
    !UserHiddenStatusCodes.includes(errorCode)
  )
}

export const getDialogTypeFromErrors = (
  errors: ActionError[] | undefined
): IAlertProps['type'] => {
  if (!errors) return 'error'
  const toBeTreatedAsWarnings = ['POS-022']
  if (errors?.find((e) => toBeTreatedAsWarnings.includes(e.code)))
    return 'warning'
  return 'error'
}
