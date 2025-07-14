import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import { PerformanceStatus } from 'components/molecules/PerformanceStatus/PerformanceStatus'
import { DeepPartial, mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { OptimizedRootState as OptimizedRootStateDataStorage } from 'store/features/dataStorage/slice'
import { OptimizedRootState as OptimizedRootStateRouting } from 'store/features/routing/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { mockTrackGeometry } from 'store/mock/mockTrackGeometry'
import { gbToTbRnd } from 'utils/numbers'
import { renderWithProvider } from 'utils/test'
import React from 'react'

const performance = mockStore.system.responsiveness!

describe('PerformanceStatus (mockStore - blur on - camera on)', () => {
  const override: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: {
        camera: {
          enable: 1,
          blur: true,
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, override)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PerformanceStatus {...performance} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It NOT should display GDPR', () => {
    expect(screen.queryByTestId('gdpr')).not.toBeInTheDocument()
  })
})

describe('PerformanceStatus (mockStore - blur off - camera on)', () => {
  const override: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: {
        camera: {
          enable: 1,
          blur: false,
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, override)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  const mockWindowOpen = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PerformanceStatus {...performance} />)(
      mockedStore
    )
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    })
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockWindowOpen.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display GDPR', () => {
    expect(component.getByTestId('gdpr')).toBeTruthy()
  })

  test('It should open a new tab at click', () => {
    fireEvent.click(component.getByTestId('gdpr'))
    expect(mockWindowOpen).toHaveBeenCalled()
  })
})

describe('PerformanceStatus (mockStore - blur off - camera off)', () => {
  const override: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: {
        camera: {
          enable: 0,
          blur: false,
        },
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, override)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PerformanceStatus {...performance} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should NOT display GDPR', () => {
    expect(screen.queryByTestId('gdpr')).not.toBeInTheDocument()
  })
})

describe('PerformanceStatus (mockStore - current track blur off - camera on)', () => {
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: {
        camera: {
          blur: true,
        },
      },
    },
  }
  const overrideRouting: DeepPartial<OptimizedRootStateRouting> = {
    routingService: {
      autocaptureCurrentPolygon: {
        paths: [
          {
            ...mockTrackGeometry.paths[0],
            settings: {
              camera: {
                enable: 1,
                blur: false,
              },
            },
          },
        ],
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideDataStorage,
    ...overrideRouting,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PerformanceStatus {...performance} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display GDPR', () => {
    expect(component.getByTestId('gdpr')).toBeTruthy()
  })
})

describe('PerformanceStatus (mockStore - current track blur off - camera off)', () => {
  const overrideDataStorage: DeepPartial<OptimizedRootStateDataStorage> = {
    dataStorageService: {
      currentJob: {
        camera: {
          enable: 1,
          blur: true,
        },
      },
    },
  }
  const overrideRouting: DeepPartial<OptimizedRootStateRouting> = {
    routingService: {
      autocaptureCurrentPolygon: {
        paths: [
          {
            ...mockTrackGeometry.paths[0],
            settings: {
              camera: {
                enable: 0,
                blur: false,
              },
            },
          },
        ],
      },
    },
  }
  const mergedStore = mergeDeepRight(mockStore, {
    ...overrideDataStorage,
    ...overrideRouting,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PerformanceStatus {...performance} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should NOT display GDPR', () => {
    expect(screen.queryByTestId('gdpr')).not.toBeInTheDocument()
  })
})

describe('PerformanceStatus (backend offline)', () => {
  const overrideSystem = {
    details: {
      cpu: {
        label: 'CPU Load',
        health: 100,
        critical: true,
      },
      gpu: {
        label: 'GPU Load',
        health: 100,
        critical: true,
      },
      ram: {
        label: 'RAM Load',
        health: 45,
        critical: true,
      },
    },
    health: 0,
    critical: true,
  }
  const overrideConnection = {
    health: 1,
    critical: true,
    internet: {
      label: 'Internet',
      health: 0,
      critical: true,
    },
    gateway: {
      label: 'Gateway',
      health: 0,
      critical: true,
    },
    client: {
      label: 'Client',
      health: 4,
      critical: false,
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PerformanceStatus
        {...performance}
        system={overrideSystem}
        connection={overrideConnection}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should expand without errors', () => {
    const expandButton = component.getByTestId('toggle-expand')
    fireEvent.click(expandButton)
    expect(component.getByTestId('details')).toBeTruthy()
  })
})

describe('PerformanceStatus: number of connected users', () => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PerformanceStatus
        {...performance}
        usersConnected={5}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show 5 usersconnected', () => {
    const span= component.getByTestId('usersConnectedLabel')
    expect(span).toBeTruthy()
    expect(span.textContent).toBe('5')
  })
})

describe('PerformanceStatus: no users connected', () => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PerformanceStatus
        {...performance}
        usersConnected={0}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should not mount with 0 users', () => {
    const span = component.queryByTestId('usersConnectedLabel')
    expect(span).toBeNull()
  })
})

describe('PerformanceStatus (GB and TB view)', () => {
  const overrideStorage = {
    health: 72.5,
    total: 4000,
    available: 800,
    critical: false,
    details: {
      disks: [
        {
          id: 1,
          name: 'p',
          health: 50,
          total: 2000,
          available: 400,
          critical: false,
          slot: 0,
        },
        {
          id: 2,
          name: 'HD 2',
          health: 100,
          total: 2000,
          available: 400,
          critical: false,
        },
      ],
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PerformanceStatus {...performance} storage={overrideStorage} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should show TB and GB according to the number', () => {
    // TODO: hardcoded, bettere read it from the mock object
    expect(component.getByText(`800GB/${gbToTbRnd(4000)}TB`)).toBeTruthy()
  })
})

describe('PerformanceStatus (Processing)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      dataStorageService: {
        processing: [
          {
            disk: 'p',
            project: 'Project002',
            job: 'Job001',
          },
        ],
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PerformanceStatus
        {...performance}
        storage={mockStore.system.responsiveness.storage}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should display the processing icon', () => {
    expect(component.getByTestId('processing-icon')).toBeTruthy()
  })
})

describe('PerformanceStatus (No Processing)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      dataStorageService: {
        processing: null,
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <PerformanceStatus
        {...performance}
        storage={mockStore.system.responsiveness.storage}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should not show the processing icon', () => {
    expect(screen.queryByTestId('processing-icon')).not.toBeInTheDocument()
  })
})
