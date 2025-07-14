import { mockStore } from 'store/mock/mockStoreTests'
import { isSupportedVersion } from './version'

const tables = mockStore.scanner.supportedSettings.optech!

describe('Version utils', () => {
  beforeEach(() => {})
  test('Is supported if equal', () => {
    expect(isSupportedVersion('2022.1.1.32', '2022.1.1.32')).toBeTruthy()
  })
  test('Is supported if build is higher', () => {
    expect(isSupportedVersion('2022.1.1.40', '2022.1.1.32')).toBeTruthy()
  })
  test('Is not supported if build is lower', () => {
    expect(isSupportedVersion('2022.1.1.1', '2022.1.1.32')).toBeFalsy()
  })
  test('Is supported if major is higher', () => {
    expect(isSupportedVersion('2023.1.1.1', '2022.1.1.32')).toBeTruthy()
  })
  test('Is not supported if major is lower', () => {
    expect(isSupportedVersion('2022.2.3.1', '2023.1.1.1')).toBeFalsy()
  })
  test('Is supported if minor is higher', () => {
    expect(isSupportedVersion('2022.2.1.1', '2022.1.1.1')).toBeTruthy()
  })
  test('Is not supported if minor is lower', () => {
    expect(isSupportedVersion('2022.1.3.1', '2022.2.3.1')).toBeFalsy()
  })
  test('Is supported if patch is higher', () => {
    expect(isSupportedVersion('2022.1.3.1', '2022.1.1.32')).toBeTruthy()
  })
  test('Is not supported if patch is lower', () => {
    expect(isSupportedVersion('2022.1.1.1', '2022.1.2.1')).toBeFalsy()
  })
})
