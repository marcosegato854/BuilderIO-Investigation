import { t } from 'i18n/config'
import { SystemAction } from 'store/features/actions/types'
import { AlignmentNotification } from 'store/features/alignment/types'
import { AutocaptureNotification } from 'store/features/routing/types'
import { SystemNotification } from 'store/features/system/types'
import { mtToFt } from 'utils/numbers'

/**
 * Translate notifications from the backend
 */

export const translateSystemNotification = (
  notification: SystemNotification
) => {
  const { description, code, p1, p2, p3 } = notification
  // Check for the translation or use the fallback description
  let translation = t(`backend_errors.code.${code}`, description)
  // If p1 is provided, replace it
  const regexP1 = /{p1}/i
  const regexP2 = /{p2}/i
  const regexP3 = /{p3}/i
  if (p1) translation = translation.replace(regexP1, p1)
  if (p2) translation = translation.replace(regexP2, p2)
  if (p3) translation = translation.replace(regexP3, p3)

  const translatedNotification = {
    ...notification,
    description: translation,
  }
  return translatedNotification
}

/**
 * Translate actions from the backend
 */

export const translateSystemAction = (action: SystemAction) => {
  const { description, code, p1, p2, p3 } = action
  // Check for the translation or use the fallback description
  let translation = t(`backend_errors.code.${code}`, description)
  // If p1 is provided, replace it
  const regexP1 = /{p1}/i
  const regexP2 = /{p2}/i
  const regexP3 = /{p3}/i
  if (p1) translation = translation.replace(regexP1, p1)
  if (p2) translation = translation.replace(regexP2, p2)
  if (p3) translation = translation.replace(regexP3, p3)

  const translatedAction = {
    ...action,
    description: translation,
  }
  return translatedAction
}

export const translateAutocaptureNotification = (
  notification: AutocaptureNotification
) => {
  const { description, code, p1, p2, p3 } = notification
  // Check for the translation or use the fallback description
  let translation = t(`backend_errors.code.${code}`, description)
  // If p1 is provided, replace it
  const regexP1 = /{p1}/i
  const regexP2 = /{p2}/i
  const regexP3 = /{p3}/i
  if (p1) translation = translation.replace(regexP1, p1)
  if (p2) translation = translation.replace(regexP2, p2)
  if (p3) translation = translation.replace(regexP3, p3)

  const translatedNotification = {
    ...notification,
    description: translation,
  }
  return translatedNotification
}

/**
 * Translate notifications from the backend
 */

export const translateAlignmentNotificationMessage = (
  notification: Pick<
    AlignmentNotification,
    'description' | 'messageCode' | 'space' | 'time'
  >,
  unit: 'imperial' | 'metric'
) => {
  const { description, messageCode, space, time } = notification
  let translation = t(
    `acquisition.alignment.messages.${messageCode}`,
    description
  )
  const regexSpace = /{space}/i
  const regexTime = /{time}/i
  if (space) {
    const unitLabel =
      unit === 'imperial' ? t('units.feet', 'ft') : t('units.meters', 'm')
    const spaceValue = unit === 'imperial' ? Math.ceil(mtToFt(space)) : space
    const spaceWithUnit = `${spaceValue} ${unitLabel}`
    translation = translation.replace(regexSpace, spaceWithUnit)
  }
  if (time) {
    const timeValue = `${time.toString()} ${t('units.seconds', 's')}`
    translation = translation.replace(regexTime, timeValue)
  }
  return translation
}

export const getKey = (n: SystemNotification, i: number): string => {
  return (
    n.id?.toString() ||
    `${n.code}${n.description}${n.p1}` ||
    n.time ||
    i.toString()
  )
}
