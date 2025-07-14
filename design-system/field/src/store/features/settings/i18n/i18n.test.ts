/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import i18next from 'i18next'
import { getTestingStore } from 'store/configureTestingStorePlanning'
import { mkGetSettings, mkSaveSettings } from 'store/features/settings/mockApi'
import {
  selectFont,
  selectI18SettingsState,
  setI18nSettings,
  settingsGetActions,
} from 'store/features/settings/slice'
import { LocalFonts } from 'store/features/settings/types'
import { mkSystemInfo } from 'store/features/system/mockApi'
import { systemInfoActions } from 'store/features/system/slice'
import { MapsCountry } from 'store/features/system/types'
import { dummyFunc } from 'utils/test'

describe('I18n', () => {
  let store: any
  const mockI18ChangeLanguage = jest
    .spyOn(i18next, 'changeLanguage')
    .mockImplementation(dummyFunc)
  // let ws: WS
  let mockGetSettingsAPI: jest.SpyInstance<any>
  let mockSaveSettingsAPI: jest.SpyInstance<any>
  let mockSystemInfoAPI: jest.SpyInstance<any>
  // let mockUpdateTracksAPI: jest.SpyInstance<any>
  // let mockAbortAPI: jest.SpyInstance<any>
  // const newSettings: PathSettings = {
  //   camera: { enable: false, distance: 2 },
  //   collection: {
  //     multiple: false,
  //   },
  // }
  // const updatedTrack = withNewSettings(mockRoutingTracks[1], newSettings)
  // const updatedRoutingTracks = update(1, updatedTrack, mockRoutingTracks)

  beforeEach(async () => {
    store = getTestingStore()
    // mock API
    // moxios.install(apiClient)
    // moxios.stubRequest('/assets/i18n/en/translation.json', {
    //   status: 200,
    //   response: {},
    // })
    // moxios.stubRequest('/assets/i18n/it/translation.json', {
    //   status: 200,
    //   response: {},
    // })
    mockGetSettingsAPI = mkGetSettings({
      audio: {
        globalVolume: 75,
        audibleMessages: {
          COLLECTION: true,
          ERROR: false,
          NAVIGATION: false,
        },
      },
      lastPosition: {
        latitude: 47.50018,
        longitude: 9.62328,
      },
      planning: {
        scanner: null,
        sideCameras: null,
      },
      i18n: {
        language: 'it',
      },
    })
    mockSaveSettingsAPI = mkSaveSettings()
    mockSystemInfoAPI = mkSystemInfo({
      softwareversion: '2020.1.1.4',
      systemtype: 'Pegasus:TRK 700 Optech',
      serial: 'aaa',
      countryCode: MapsCountry.CHINA,
      trackimo: {
        state: '',
        deviceid: '',
        imei: '',
        swversion: '',
      },
    })
    // mockUpdateTracksAPI = jest
    //   .spyOn(apiRouting, 'routingUpdatePolygons')
    //   .mockReturnValue({
    //     status: 200,
    //     data: {
    //       polygons: updatedRoutingTracks,
    //     },
    //   } as any)
    // mockAbortAPI = mkRoutingAbort()
    // ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    // store.dispatch(routingSubscribeAction())
    // await ws.connected
    jest.useFakeTimers()
  })

  afterEach(async () => {
    // await waitFor(
    //   () => {
    //     store.dispatch(routingUnsubscribeAction())
    //     store.dispatch(
    //       routingPolygonsActions.success({
    //         polygons: [],
    //       })
    //     )
    //   },
    //   { timeout: 500 }
    // )
    // jest.advanceTimersByTime(500)
    // moxios.uninstall(apiClient)
    mockGetSettingsAPI.mockClear()
    mockSaveSettingsAPI.mockClear()
    mockSystemInfoAPI.mockClear()
    mockI18ChangeLanguage.mockClear()
    // mockUpdateTracksAPI.mockClear()
    // mockAbortAPI.mockClear()
    // WS.clean()
    jest.useRealTimers()
  })

  it('should change language with an action', async () => {
    const stateBefore = await store.getState()
    const i18settingsBefore = await selectI18SettingsState(stateBefore)
    expect(i18settingsBefore.language).toBe(null)
    //
    await waitFor(
      () => {
        store.dispatch(
          setI18nSettings({
            language: 'it',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const stateAfter = await store.getState()
    const i18settingsAfter = await selectI18SettingsState(stateAfter)
    expect(i18settingsAfter.language).toBe('it')
    expect(mockI18ChangeLanguage).toHaveBeenCalledWith('it')
  })

  it('should change font based on the language', async () => {
    const stateBefore = await store.getState()
    const i18settingsBefore = await selectI18SettingsState(stateBefore)
    expect(i18settingsBefore.language).toBe(null)
    //
    await waitFor(
      () => {
        store.dispatch(
          setI18nSettings({
            language: 'cn',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const stateAfter = await store.getState()
    const fontAfter = await selectFont(stateAfter)
    expect(fontAfter).toBe(LocalFonts.CHINESE)
  })

  it('should call the save settings API', async () => {
    await waitFor(
      () => {
        store.dispatch(
          setI18nSettings({
            language: 'it',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSaveSettingsAPI).toHaveBeenCalledWith(
      expect.objectContaining({
        i18n: {
          language: 'it',
        },
      })
    )
  })

  it('should pick the default language from system info if not available in the settings', async () => {
    await waitFor(
      () => {
        store.dispatch(systemInfoActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const i18settingsAfter = await selectI18SettingsState(stateAfter)
    expect(i18settingsAfter.language).toBe('cn')
  })

  it('should set the initial language from settings if available', async () => {
    const stateBefore = await store.getState()
    const i18settingsBefore = await selectI18SettingsState(stateBefore)
    expect(i18settingsBefore.language).toBe(null)
    //
    await waitFor(
      () => {
        store.dispatch(settingsGetActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const stateAfter = await store.getState()
    const i18settingsAfter = await selectI18SettingsState(stateAfter)
    expect(i18settingsAfter.language).toBe('it')
  })
})
