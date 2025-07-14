import { getCopyLimitedCharsName } from 'store/features/dataStorage/utils'

describe('getCopyLimitedCharsName() tests', () => {
  test('should return a limited cloned job name if bigger than 23 chars', () => {
    expect(getCopyLimitedCharsName('ThisIsAVeryVeryLongJobName', '_C')).toEqual(
      'ThisIsAVeryVeryLongJobN_C'
    )
  })
  test('should return the same cloned job name if shorter than 23 chars', () => {
    expect(getCopyLimitedCharsName('ShortJobName', '_C')).toEqual(
      'ShortJobName_C'
    )
  })
})
