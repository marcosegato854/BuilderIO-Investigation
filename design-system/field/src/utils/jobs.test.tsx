import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import { mockStore } from 'store/mock/mockStoreTests'
import { getDetails } from 'utils/jobs'

const job = mockStore.dataStorageService.currentJob
const jobTRK100 = mergeDeepRight(job, {
  hardwareModel: 'PEGASUS TRK100',
}) as IJob

describe('getDetails() - TRK100', () => {
  test('should NOT return the scanline spacing', () => {
    const result = getDetails(jobTRK100, 'metric')
    const query = t('job_browser.details.values.scanner', 'wrong').split(':')[0]
    expect(query.length).toBeGreaterThan(0)
    expect(query).not.toEqual('wrong')
    const queryMatch = result.filter((item) => item.secondary?.includes(query))
    expect(queryMatch.length).toBeFalsy()
  })
})

describe('getDetails() - other units', () => {
  test('should return the scanline spacing', () => {
    const result = getDetails(job, 'metric')
    const query = t('job_browser.details.values.scanner', 'wrong').split(':')[0]
    expect(query.length).toBeGreaterThan(0)
    expect(query).not.toEqual('wrong')
    const queryMatch = result.filter((item) => item.secondary?.includes(query))
    expect(queryMatch.length).toBeTruthy()
  })
})
