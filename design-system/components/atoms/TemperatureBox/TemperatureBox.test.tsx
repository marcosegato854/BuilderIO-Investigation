import { queries, RenderResult } from '@testing-library/react'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import configureMockStore from 'redux-mock-store'
import { TemperatureStatus } from 'store/features/scanner/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { TemperatureBox } from './TemperatureBox'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('TemperatureBox - Normal - Metric', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <TemperatureBox
        temperature={25}
        status={TemperatureStatus.Normal}
        label="Temperature: "
        unit={Unit.Metric}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should render temperature', () => {
    const { getByText } = component
    expect(getByText('25.0 °C')).toBeInTheDocument()
  })

  test('It should NOT show an icon', () => {
    const { queryByTestId } = component
    expect(queryByTestId('temperature-alert-icon')).toBeNull()
  })
})

describe('TemperatureBox - Normal - Imperial', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <TemperatureBox
        temperature={25}
        status={TemperatureStatus.Normal}
        label="Temperature: "
        unit={Unit.Imperial}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should render temperature converted to F', () => {
    const { getByText } = component
    expect(getByText('77.0 °F')).toBeInTheDocument()
  })
})

describe('TemperatureBox - High', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <TemperatureBox
        temperature={25}
        status={TemperatureStatus.High}
        label="Temperature: "
        unit={Unit.Metric}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should NOT show an icon', () => {
    const { queryByTestId } = component
    expect(queryByTestId('temperature-alert-icon')).toBeNull()
  })
})

describe('TemperatureBox - Warning', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <TemperatureBox
        temperature={25}
        status={TemperatureStatus.Warning}
        label="Temperature: "
        unit={Unit.Metric}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('it should show a warning icon', () => {
    const { getByTestId } = component
    expect(getByTestId('temperature-alert-icon')).toBeInTheDocument()
  })
})

describe('TemperatureBox - Error', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <TemperatureBox
        temperature={25}
        status={TemperatureStatus.Error}
        label="Temperature: "
        unit={Unit.Metric}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('it should show an error icon', () => {
    const { getByTestId } = component
    expect(getByTestId('temperature-alert-icon')).toBeInTheDocument()
  })
})
