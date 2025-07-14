import React from 'react'
import { queries, RenderResult, waitFor, within } from '@testing-library/react'
import { ActivationView } from 'components/organisms/ActivationView/ActivationView'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { actionsServiceActivationInfoActions } from 'store/features/actions/slice'
import { SystemAction } from 'store/features/actions/types'
import { systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

describe('ActivationView (mockStore)', () => {
  let component: RenderResult<typeof queries>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)

  beforeEach(() => {
    component = renderWithProvider(<ActivationView activated={false} />)(
      mockedStore
    )
  })

  afterEach(() => {})

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('ActivationView (mockStore) at start', () => {
  let component: RenderResult<typeof queries>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      systemState: null,
      info: null,
    })
  )

  beforeEach(() => {
    component = renderWithProvider(<ActivationView activated={false} />)(
      mockedStore
    )
  })

  afterEach(() => {})

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the spinner', () => {
    expect(component.getByTestId('progress-layer')).toBeTruthy()
  })

  test('It should display the loading text under the spinner', () => {
    expect(
      component.getByText(
        t('acquisition.activation.bootingUp', 'wrong') as string
      )
    ).toBeTruthy()
  })
})

describe('ActivationView (mockStore with current action)', () => {
  let component: RenderResult<typeof queries>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentAction: SystemAction = {
    code: 'SYS-007',
    status: 'progress',
    progress: 1,
    description: 'temp',
    p1: 'Param1',
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      actionsService: {
        currentAction,
      },
      system: {
        systemState: {
          state: 'Activating',
        },
      },
    })
  )

  beforeEach(() => {
    component = renderWithProvider(<ActivationView activated={false} />)(
      mockedStore
    )
  })

  afterEach(() => {})

  test('It should display activation action message', () => {
    const progresLayer = component.getByTestId('progress-layer')
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', currentAction.p1!)
    expect(within(progresLayer).getByText(expectedMessage)).toBeTruthy()
  })
})

describe('ActivationView (realStore)', () => {
  let component: RenderResult<typeof queries>
  const store = getTestingStore()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentAction: SystemAction = {
    code: 'SYS-007',
    status: 'progress',
    progress: 1,
    description: 'temp',
    p1: 'Param1',
  }

  beforeEach(async () => {
    // enable fake timers
    await waitFor(
      () => {
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'Activating',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useFakeTimers()
    component = renderWithProvider(<ActivationView activated={false} />)(store)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('It should update activation action message', async () => {
    await waitFor(
      () => {
        store.dispatch(
          actionsServiceActivationInfoActions.success({
            action: mergeDeepRight(currentAction, { p1: 'ChangedParam' }),
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const progresLayer = component.getByTestId('progress-layer')
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', 'ChangedParam')
    expect(within(progresLayer).getByText(expectedMessage)).toBeTruthy()
  })
})
