import { queries, RenderResult } from '@testing-library/react'
import { AutocaptureBadge } from 'components/atoms/AutocaptureBadge/AutocaptureBadge'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

describe('AutocaptureBadge (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {})

  afterEach(() => {})

  test('It should mount', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockedStore: any = configureMockStore()(mockStore)
    component = renderWithProvider(
      <AutocaptureBadge autocaptureEnabled recording />
    )(mockedStore)
    expect(component).toBeTruthy()
  })
})
