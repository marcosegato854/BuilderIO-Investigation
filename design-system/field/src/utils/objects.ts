/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  assoc,
  countBy,
  eqBy,
  identity,
  is,
  keys,
  map,
  mapObjIndexed,
} from 'ramda'

export const removeUndefinedProps = (obj: any): any => {
  return keys(obj).reduce((stack: any, key: string) => {
    // eslint-disable-next-line no-param-reassign
    if (typeof obj[key] !== 'undefined') stack[key] = obj[key]
    return stack
  }, {})
}

export const removeUnchangedProps = (newObj: any, originalObj: any): any => {
  return keys(newObj).reduce((stack: any, key: string) => {
    // eslint-disable-next-line no-param-reassign
    if (newObj[key] !== originalObj[key]) stack[key] = newObj[key]
    return stack
  }, {})
}

export const enumValues = (typescriptEnum: object): unknown[] => {
  return Object.keys(typescriptEnum).map(
    (key) => typescriptEnum[key as keyof typeof typescriptEnum]
  )
}

export const arraysAreEqual = (arr1: any, arr2: any): boolean =>
  eqBy(countBy<any>(identity), arr1, arr2)

/**
 * Recursively obfuscates the password property of an object if it exists.
 * @param obj - The object to be processed.
 * @returns The processed object with the password obfuscated.
 */
export function obfuscatePassword<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'password') {
        ;(obj as any)[key] = '***'
      } else if (typeof (obj as any)[key] === 'object') {
        obfuscatePassword((obj as any)[key])
      }
    }
  }
  return obj
}
