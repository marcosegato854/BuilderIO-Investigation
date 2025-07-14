/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { PlanningBigTools } from './PlanningBigTools'
import { mergeDeepRight } from 'ramda'
import { t } from 'i18n/config'
import { PlanningTools } from 'store/features/planning/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

const loggedUser: UserInfo = {
  usertype: 'service',
  username: 'admin',
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('PlanningBigTools (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {})

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable />
    )(mockedStore)
    expect(component).toBeTruthy()
  })

  test('Track button label when selected', () => {
    component = renderWithProvider(
      <PlanningBigTools
        onSelect={() => {}}
        selected={PlanningTools.DRAW_PATH}
        currentPolygonAvailable={false}
      />
    )(mockedStore)
    expect(
      component.getByText(t('planning.tools.end_track', 'wrong') as string)
    ).toBeTruthy()
  })

  test('Track button label when selected', () => {
    component = renderWithProvider(
      <PlanningBigTools
        onSelect={() => {}}
        selected={PlanningTools.DRAW_PATH}
        currentPolygonAvailable={false}
      />
    )(mockedStore)
    expect(
      component.getByText(t('planning.tools.end_track', 'wrong') as string)
    ).toBeTruthy()
  })

  test('Track button label when NOT selected / with polygon selection', () => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable={true} />
    )(mockedStore)
    expect(
      component.getByText(t('planning.tools.draw_track', 'wrong') as string)
    ).toBeTruthy()
  })

  test('Track button label when NOT selected / with polygon selection / isPolygon', () => {
    component = renderWithProvider(
      <PlanningBigTools
        onSelect={() => {}}
        currentPolygonAvailable={true}
        isPolygon={true}
      />
    )(mockedStore)
    const trackButton = component.getByText(
      t('planning.tools.draw_new_track', 'wrong') as string
    )
    expect(trackButton).toBeTruthy()
    expect(
      (trackButton.parentNode as HTMLButtonElement).getAttribute('class')
    ).toContain('disabled')
  })

  test('Track button label when NOT selected / without polygon selection', () => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable={false} />
    )(mockedStore)
    expect(
      component.getByText(t('planning.tools.draw_new_track', 'wrong') as string)
    ).toBeTruthy()
  })

  // TODO restore as soon as the polygons are supported by BE
  /* test('Polygon button label when NOT selected / with polygon selection', () => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable={true} />
    )(mockedStore)
    expect(
      component.getByText(t('planning.tools.draw_polygon', 'wrong') as string)
    ).toBeTruthy()
  })

  test('Polygon button label when NOT selected / without polygon selection', () => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable={false} />
    )(mockedStore)
    expect(
      component.getByText(
        t('planning.tools.draw_new_polygon', 'wrong') as string
      )
    ).toBeTruthy()
  }) */
})

describe('PlanningBigTools (mockStore busy)', () => {
  let component: RenderResult<typeof queries>
  const mockedStoreBusy: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      planningService: {
        importShpStatus: 'progress',
      },
    })
  )

  beforeEach(() => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable />
    )(mockedStoreBusy)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Buttons should be disabled', () => {
    const buttons = component.getAllByTestId('big-tool')
    buttons.forEach((b) => {
      expect(b.getAttribute('class')).toContain('disabled')
    })
  })
})

describe('PlanningBigTools (mockStore no routing)', () => {
  let component: RenderResult<typeof queries>
  const mockedStoreNoRouting: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      routingService: {
        moduleEnabled: false,
      },
      authService: {
        userInfo: loggedUser,
      },
    })
  )

  beforeEach(() => {
    component = renderWithProvider(
      <PlanningBigTools onSelect={() => {}} currentPolygonAvailable />
    )(mockedStoreNoRouting)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Buttons should display two buttons', () => {
    const buttons = component.getAllByTestId('big-tool')
    expect(buttons.length).toBe(2)
  })
})
