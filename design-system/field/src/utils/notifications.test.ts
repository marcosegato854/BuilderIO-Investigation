/* eslint-disable @typescript-eslint/no-explicit-any */

import { t } from 'i18n/config'
import { translateSystemNotification } from 'utils/notifications'

describe('Notifications utils', () => {
  beforeEach(async () => {})

  afterEach(() => {})

  it('translates an error correctly', () => {
    const regexP1 = /{p1}/i
    const code = 'CAM-048'
    const p1 = 'CameraName'
    const original = {
      time: '2022-04-06T11:10:05',
      type: 2,
      code,
      description: 'Camera 1 disconnected',
      p1,
    }
    const translated = translateSystemNotification(original)
    const expectedTranslation = t(`backend_errors.code.${code}`).replace(
      regexP1,
      p1
    )
    expect(translated.description).toBe(expectedTranslation)
  })

  it('translates a warning correctly', () => {
    const regexP1 = /{p1}/i
    const code = 'SCN-007'
    const p1 = 'CameraName'
    const original = {
      id: 1,
      time: '2022-04-06T12:57:12',
      type: 1,
      code,
      description: 'The firmware of FrontSLAM is unsupported',
      p1,
    }
    const translated = translateSystemNotification(original)
    const expectedTranslation = t(`backend_errors.code.${code}`).replace(
      regexP1,
      p1
    )
    expect(translated.description).toBe(expectedTranslation)
  })
})
