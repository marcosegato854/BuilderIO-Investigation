import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  within,
} from '@testing-library/react'
import { getMaxSpeed } from 'components/dialogs/NewJobForm/utils'
import { TrackSettings } from 'components/molecules/TrackSettings/TrackSettings'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { PathSettings, Polygon } from 'store/features/planning/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { settings, withNewSettings } from 'utils/planning/polygonHelpers'
import { renderWithProvider } from 'utils/test'

const track = mockStore.planningService.undoablePolygons.present[0]!
const { unit } = mockStore.dataStorageService.currentProject!.coordinate!
const job = mockStore.dataStorageService.currentJob!
describe('TrackSettings (mockStore camera distance)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  const mockSettingsUpdate = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <TrackSettings track={track} onSettingsUpdate={mockSettingsUpdate} />
    )(mockedStore)
  })

  afterEach(() => {
    mockSettingsUpdate.mockClear()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display collection mode', () => {
    expect(
      component.getByText(
        t('side_panel.settings.collection_mode', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should display image distance with camera on', () => {
    expect(component.getByTestId('camera-distance')).toBeTruthy()
  })

  test('should display scanline spacing', () => {
    expect(component.getByTestId('scanline-spacing')).toBeTruthy()
  })

  test('should NOT display image distance with camera distance mode', () => {
    expect(component.queryByTestId('camera-elapse')).not.toBeInTheDocument()
  })

  test('should display max speed with camera on', () => {
    expect(component.getByTestId('max-speed')).toBeTruthy()
  })

  test('should set the max speed according to job and track values', () => {
    const pathSettings = settings(track)
    const expectedSpeed = getMaxSpeed(
      pathSettings!.camera.distance,
      job.scanner!.scanlinespacing,
      job.scanner!.rotationspeed,
      'Optech'
    )
    const unitLabel = t(`units.${unit}.KMH`, 'KMH')
    expect(component.getByText(expectedSpeed.toString())).toBeTruthy()
    expect(component.getByText(unitLabel)).toBeTruthy()
  })

  test('should update max speed when image distance changes', async () => {
    const imageDistanceField = component.getByTestId('camera-distance')
    const imageDistanceControl =
      within(imageDistanceField).getByTestId('custom-slider')
    const pathSettings = settings(track)
    const hiddenInput = within(imageDistanceField).getByDisplayValue(
      pathSettings!.camera.distance.toString()
    ) as HTMLInputElement
    // these two events end up updating the camera distance to 10
    await fireEvent.mouseDown(imageDistanceControl, {
      clientX: 162,
      clientY: 302,
    })
    await fireEvent.mouseUp(imageDistanceControl, {
      clientX: 162,
      clientY: 302,
    })
    const expectedSpeed = getMaxSpeed(
      Number(hiddenInput.value),
      job.scanner!.scanlinespacing,
      job.scanner!.rotationspeed,
      'Optech'
    )
    expect(mockSettingsUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        drivingSpeed: expectedSpeed,
      })
    )
  })

  test('should update max speed when scanline spacing changes', async () => {
    const scanlineSpacingField = component.getByTestId('scanline-spacing')
    const scanlineSpacingControl =
      within(scanlineSpacingField).getByTestId('custom-slider')
    const pathSettings = settings(track)
    const hiddenInput = within(scanlineSpacingField).getByDisplayValue(
      pathSettings!.scanner!.scanlineSpacing.toString()
    ) as HTMLInputElement
    // these two events end up updating the camera distance to 10
    await fireEvent.mouseDown(scanlineSpacingControl, {
      clientX: 162,
      clientY: 302,
    })
    await fireEvent.mouseUp(scanlineSpacingControl, {
      clientX: 162,
      clientY: 302,
    })
    const expectedSpeed = getMaxSpeed(
      pathSettings!.camera.distance,
      Number(hiddenInput.value),
      job.scanner!.rotationspeed,
      'Optech'
    )
    expect(mockSettingsUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        drivingSpeed: expectedSpeed,
      })
    )
  })

  test('should disable all the controls', () => {
    const cameraEnabledInput = component
      .getByTestId('camera-enabled')
      .getElementsByTagName('ul')[0]
    expect(cameraEnabledInput.getAttribute('class')).not.toContain('Disabled')
    //
    const cameraDistanceInput = component
      .getByTestId('camera-distance')
      .getElementsByTagName('div')[0]
    expect(cameraDistanceInput.getAttribute('class')).not.toContain('disabled')
    //
    const scanlineSpacingInput = component
      .getByTestId('scanline-spacing')
      .getElementsByTagName('div')[0]
    expect(scanlineSpacingInput.getAttribute('class')).not.toContain('disabled')
    //
    const maxSpeedInput = component
      .getByTestId('max-speed')
      .getElementsByTagName('div')[0]
    expect(maxSpeedInput.getAttribute('class')).toContain('disabled')
  })
})

const trackCameraTime = mergeDeepRight(
  mockStore.planningService.undoablePolygons.present[0]!,
  {
    paths: [
      mergeDeepRight(
        mockStore.planningService.undoablePolygons.present[0]!.paths[0]!,
        {
          settings: {
            camera: {
              enable: 2,
            },
          },
        }
      ),
    ],
  }
) as Polygon
const jobCameraTime = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
  camera: {
    enable: 2,
  },
})
describe('TrackSettings (mockStore camera time)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  const mockSettingsUpdate = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <TrackSettings
        track={trackCameraTime}
        onSettingsUpdate={mockSettingsUpdate}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockSettingsUpdate.mockClear()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display collection mode', () => {
    expect(
      component.getByText(
        t('side_panel.settings.collection_mode', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should display image elapse with camera time mode', () => {
    expect(component.getByTestId('camera-elapse')).toBeTruthy()
  })

  test('should display max speed with camera time mode', () => {
    expect(component.getByTestId('max-speed')).toBeTruthy()
  })
})

describe('TrackSettings (mockStore - camera off)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    const settingsWithCameraOff: PathSettings = {
      camera: { enable: 0, distance: 2, elapse: 250 },
      scanner: { range: 150, scanlineSpacing: 5 },
      collection: {
        multiple: false,
      },
    }
    const polygonWithCameraOff = withNewSettings(
      mockStore.planningService.undoablePolygons.present[0],
      settingsWithCameraOff
    )
    component = renderWithProvider(
      <TrackSettings track={polygonWithCameraOff} onSettingsUpdate={() => {}} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display collection mode', () => {
    expect(
      component.getByText(
        t('side_panel.settings.collection_mode', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should hide image distance with camera off', () => {
    expect(screen.queryByTestId('camera-distance')).not.toBeInTheDocument()
  })

  test('should display scanline spacing', () => {
    expect(component.getByTestId('scanline-spacing')).toBeTruthy()
  })

  test('should display the translated label', () => {
    expect(
      component.getByText(
        t('side_panel.settings.scanline_spacing', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should hide image elapse with camera off', () => {
    expect(screen.queryByTestId('camera-elapse')).not.toBeInTheDocument()
  })

  test('should display max speed with camera off', () => {
    expect(component.getByTestId('max-speed')).toBeTruthy()
  })
})

describe('TrackSettings (mockStore - no routing module)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      routingService: {
        moduleEnabled: false,
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    const settings: PathSettings = {
      camera: { enable: 1, distance: 2, elapse: 250 },
      scanner: { range: 150, scanlineSpacing: 5 },
      collection: {
        multiple: false,
      },
    }
    const polygon = withNewSettings(
      mockStore.planningService.undoablePolygons.present[0],
      settings
    )
    component = renderWithProvider(
      <TrackSettings track={polygon} onSettingsUpdate={() => {}} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should NOT display collection mode', () => {
    expect(
      screen.queryByText(
        t('side_panel.settings.collection_mode', 'wrong') as string
      )
    ).not.toBeInTheDocument()
  })

  test('should disable all the controls', () => {
    const cameraEnabledInput = component
      .getByTestId('camera-enabled')
      .getElementsByTagName('ul')[0]
    expect(cameraEnabledInput.getAttribute('class')).toContain('Disabled')
    //
    const cameraDistanceInput = component
      .getByTestId('camera-distance')
      .getElementsByTagName('div')[0]
    expect(cameraDistanceInput.getAttribute('class')).toContain('disabled')
    //
    const scanlineSpacingInput = component
      .getByTestId('scanline-spacing')
      .getElementsByTagName('div')[0]
    expect(scanlineSpacingInput.getAttribute('class')).toContain('disabled')
    //
    const maxSpeedInput = component
      .getByTestId('max-speed')
      .getElementsByTagName('div')[0]
    expect(maxSpeedInput.getAttribute('class')).toContain('disabled')
    //
  })
})
