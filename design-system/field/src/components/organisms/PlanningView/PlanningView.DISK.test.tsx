/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { AxiosResponse } from 'axios'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { PlanningView } from 'components/organisms/PlanningView/PlanningView'
import { t } from 'i18n/config'
import moxios from 'moxios'
import React from 'react'
import { store } from 'store'
import {
  dataStorageAvailableDisksActions,
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import api from 'store/features/planning/api'
import {
  mkGetPlan,
  mkPlanProcessInfo,
  mkSavePlan,
  mkUpdatePlan,
  mockPlan,
} from 'store/features/planning/mockApi'
import {
  addPolygonAction,
  finalPointAction,
  initialPointAction,
  savePlannedJobActions,
} from 'store/features/planning/slice'
import { Polygon } from 'store/features/planning/types'
import { mkSaveSettings } from 'store/features/settings/mockApi'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'

const mockPolygon: Polygon = {
  ...mockStore.planningService.undoablePolygons.present[0]!,
  id: undefined,
}

const currentProject = mockStore.dataStorageService.currentProject!
const currentJob = mockStore.dataStorageService.currentJob!

describe('PlanningView (real store)', () => {
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>
  let mockGetPlanAPI: jest.SpyInstance<any>
  let mockSavePlanAPI: jest.SpyInstance<any>
  let mockUpdatePlanAPI: jest.SpyInstance<any>
  let mockSaveSettingsAPI: jest.SpyInstance<any>

  beforeEach(async () => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(
          dataStorageAvailableDisksActions.success({
            disks: [{ name: 'Disk1' }, { name: 'Disk2' }],
          })
        )
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // mock API
    moxios.install(apiClient)
    // moxios.install(mockApiClientPlanning)
    mockGetPlanAPI = mkGetPlan()
    // prevent api to actually call the backend
    mockSavePlanAPI = mkSavePlan({
      plan: mockPlan,
      warnings: [{ code: 'DS-039', description: 'Space not enough' }],
    })
    mockSaveSettingsAPI = mkSaveSettings()
    mockUpdatePlanAPI = mkUpdatePlan()
    jest.advanceTimersByTime(500)
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <PlanningView />
      </div>
    )(store)
  })

  afterEach(async () => {
    moxios.uninstall(apiClient)
    mockGetPlanAPI.mockClear()
    mockUpdatePlanAPI.mockClear()
    mockSavePlanAPI.mockClear()
    mockSaveSettingsAPI.mockClear()
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
    mockConsoleError.mockClear()
  })

  test('should alert the user if the disk space is critical', async () => {
    const mk = jest.spyOn(api, 'planningProcessStart').mockRejectedValue({
      status: 500,
      response: {
        status: 500,
        data: {
          error: {
            code: 'DS-038',
            description: 'disk space critical',
          },
        },
      },
      statusText: 'error',
      headers: {},
      config: {},
    })
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const estimateLabel: string = t('planning.submit.optimise_plan', 'wrong')
    const estimateAlert = component.getByText(estimateLabel)
    expect(estimateAlert).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    expect(okButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    mk.mockRestore()
    const dialogData: any = t('planning.warnings.DS-038', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.title)
    expect(alert).toBeTruthy()
  })

  test('should warn the user if the disk space is almost critical', async () => {
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          savePlannedJobActions.request({
            disk: 'd',
            project: 'Project001',
            job: 'Job001',
            plan: mockPlan,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogData: any = t('planning.warnings.DS-039', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.text)
    expect(alert).toBeTruthy()
  })

  test('should display translated errors on processing', async () => {
    const mk = jest.spyOn(api, 'planningProcessStart').mockRejectedValue({
      status: 500,
      response: {
        status: 500,
        data: {
          error: {
            code: 'DS-017',
            description: 'Error to create the gps file',
          },
        },
      },
      statusText: 'error',
      headers: {},
      config: {},
    })
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const estimateLabel: string = t('planning.submit.optimise_plan', 'wrong')
    const estimateAlert = component.getByText(estimateLabel)
    expect(estimateAlert).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    expect(okButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    mk.mockRestore()
    const translatedError = `${t('backend_errors.code.DS-017', 'wrong')} - 500`
    const alert = screen.getByText(translatedError)
    expect(alert).toBeTruthy()
  })

  test('should display translated errors on processing action', async () => {
    moxios.stubRequest('/planning/actionProcess', {
      status: 200,
      response: {
        action: {
          status: 'error',
          progress: 0,
          description: 'error during processing',
          errors: [
            {
              code: 'DS-017',
              description: 'Error to create the gps file',
            },
          ],
        },
        result: mockStore.planningService.needed!,
      },
    })
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const estimateLabel: string = t('planning.submit.optimise_plan', 'wrong')
    const estimateAlert = component.getByText(estimateLabel)
    expect(estimateAlert).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    expect(okButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    const translatedError = `Processing failed: ${t(
      'backend_errors.code.DS-017',
      'wrong'
    )}`
    const alert = screen.getByText(translatedError)
    expect(alert).toBeTruthy()
  })

  test('should display only the save anyway button if there is 1 disk only (warning)', async () => {
    await waitFor(
      () => {
        store.dispatch(
          dataStorageAvailableDisksActions.success({
            disks: [{ name: 'Disk1' }],
          })
        )
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          savePlannedJobActions.request({
            disk: 'd',
            project: 'Project001',
            job: 'Job001',
            plan: mockPlan,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogData: any = t('planning.warnings.DS-039', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.text)
    expect(alert).toBeTruthy()
    expect(
      screen.queryByText(dialogData.buttonOk as string)
    ).not.toBeInTheDocument()
  })

  test('should display only the Go ahead button if there is 1 disk only (critical)', async () => {
    const mk = jest.spyOn(api, 'planningProcessStart').mockRejectedValue({
      status: 500,
      response: {
        status: 500,
        data: {
          error: {
            code: 'DS-038',
            description: 'disk space critical',
          },
        },
      },
      statusText: 'error',
      headers: {},
      config: {},
    })
    await waitFor(
      () => {
        store.dispatch(
          dataStorageAvailableDisksActions.success({
            disks: [{ name: 'Disk1' }],
          })
        )
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const estimateLabel: string = t('planning.submit.optimise_plan', 'wrong')
    const estimateAlert = component.getByText(estimateLabel)
    expect(estimateAlert).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    expect(okButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    mk.mockRestore()
    const dialogData: any = t('planning.warnings.DS-038', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.textSingle)
    expect(alert).toBeTruthy()
    expect(
      screen.queryByText(dialogData.buttonOk as string)
    ).not.toBeInTheDocument()
  })
})
