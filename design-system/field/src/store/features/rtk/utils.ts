import { t } from 'i18n/config'
import { digits } from 'utils/numbers'

export const getGdopStatus = (value: string | number | RegExp) => {
  const gdopValue = Number(value)
  if (gdopValue < 21) {
    // round the number at 1 digits and return
    const gdopValueRounded = digits(gdopValue, 3)
    return String(gdopValueRounded)
  }
  if (gdopValue === 9999) {
    return t('rtk.connection_info.gdop_status.poor', 'poor')
  }
  return t('rtk.connection_info.gdop_status.poor', 'poor')
}
