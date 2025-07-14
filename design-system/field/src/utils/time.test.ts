import { checkForDateValidity } from './time'

describe('Time utils', () => {
  test('It should return true if 7 days are passed', () => {
    expect(checkForDateValidity('2024-07-01T09:00:00Z', 7)).toBeTruthy()
  })

  test('It should return false if 7 days are not passed', () => {
    expect(
      checkForDateValidity('2024-07-01T09:00:00Z', 7, '2024-07-05T09:00:00Z')
    ).toBeFalsy()
  })

  test('It should return true if 7 days are passed - check minutes', () => {
    expect(
      checkForDateValidity('2024-07-01T09:00:00Z', 7, '2024-07-08T09:01:00Z')
    ).toBeTruthy()
  })

  test('It should return false if 7 days are not passed - check minutes', () => {
    expect(
      checkForDateValidity('2024-07-01T09:00:00Z', 7, '2024-07-08T09:00:00Z')
    ).toBeFalsy()
  })
})
