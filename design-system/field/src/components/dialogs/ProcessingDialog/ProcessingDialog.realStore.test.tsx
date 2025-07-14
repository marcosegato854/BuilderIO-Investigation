/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RenderResult,
  queries,
  waitFor,
  screen,
  fireEvent,
} from '@testing-library/react'
import ProcessingDialog from './ProcessingDialog'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import moxios from 'moxios'
import { store } from 'store'
import {
  dataStorageJobDetailActions,
  dataStorageProcessingStatusActions,
  dataStorageProjectDetailActions,
  dataStorageStartProcessingActions,
} from 'store/features/dataStorage/slice'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'
import api from 'store/features/dataStorage/api'
import {
  DataStorageProcessingStatusResponse,
  DataStorageStartProcessingPayload,
  DataStorageStartProcessingResponse,
} from 'store/features/dataStorage/types'
import { AxiosResponse } from 'axios'
import { t } from 'i18n/config'
import { replaceErrorParams } from 'utils/errors'

const currentProject = mockStore.dataStorageService.currentProject!
const currentJob = mockStore.dataStorageService.currentJob!

describe('Processing Dialog (real store)', () => {
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  const payload: DataStorageStartProcessingPayload = {
    disk: currentProject.disk,
    project: currentProject.name,
    job: currentJob.name,
    options: {
      finalise: {
        blur: {
          enable: true,
        },
        colorization: {
          enable: false,
        },
      },
      export: {
        las: {
          enable: false,
        },
        lgsx: {
          enable: false,
        },
        e57: {
          enable: false,
        },
      },
    },
  }

  beforeEach(async () => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // mock API
    moxios.install(apiClient)
    jest.advanceTimersByTime(500)
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <ProcessingDialog job={currentJob} />
      </div>
    )(store)
  })

  afterEach(async () => {
    moxios.uninstall(apiClient)
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
    mockConsoleError.mockClear()
    mockDispatchRealStore.mockClear()
  })

  test('should alert if no space is available for processing (error inside the payload in the POST start processing)', async () => {
    const mk = jest.spyOn(api, 'dataStorageStartProcessing').mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          result: {
            disk: currentProject.disk,
            project: currentProject.name,
            job: currentJob.name,
          },
          errors: [
            {
              code: 'LCB011',
              description: 'disk error',
              p1: 'JobName',
            },
          ],
        },
        statusText: 'progress',
        headers: {},
        config: {},
      }) as Promise<AxiosResponse<DataStorageStartProcessingResponse>>
    )
    await waitFor(
      () => {
        store.dispatch(dataStorageStartProcessingActions.request(payload))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mk.mockRestore()
    const dialogData: any = t('notifications.dataStorage.LCB011', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.title)
    expect(alert).toBeTruthy()
  })

  test('should alert if no space is available for processing (error inside the payload in the GET processing)', async () => {
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProcessingStatusActions.success({
            currentProcess: [
              {
                disk: currentProject.disk,
                project: currentProject.name,
                job: currentJob.name,
                errors: [
                  {
                    code: 'LCB011',
                    description: 'disk error',
                    type: 2,
                  },
                ],
              },
            ],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogData: any = t('notifications.dataStorage.LCB011', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.title)
    expect(alert).toBeTruthy()
  })

  test('should write the name of the job exceeding the disk space', async () => {
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProcessingStatusActions.success({
            currentProcess: [
              {
                disk: currentProject.disk,
                project: currentProject.name,
                job: currentJob.name,
                errors: [
                  {
                    code: 'LCB011',
                    description: 'disk error',
                    type: 2,
                  },
                ],
              },
            ],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedText = replaceErrorParams(
      t(
        'notifications.dataStorage.LCB011.text',
        'running out of space, continue anyway?'
      ),
      currentJob.name
    ) as string
    const text = screen.getByText(expectedText)
    expect(text).toBeTruthy()
  })

  test('should dispatch a start process action if Ok button is pressed', async () => {
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProcessingStatusActions.success({
            currentProcess: [
              {
                disk: currentProject.disk,
                project: currentProject.name,
                job: currentJob.name,
                errors: [
                  {
                    code: 'LCB011',
                    description: 'disk error',
                    type: 2,
                  },
                ],
              },
            ],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialogData: any = t('notifications.dataStorage.LCB011', {
      returnObjects: true,
    })
    const alert = screen.getByText(dialogData.okButton)
    expect(alert).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(alert)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataStorageService/START_PROCESSING_REQUEST',
        payload: {
          disk: currentProject.disk,
          project: currentProject.name,
          job: currentJob.name,
          errors: [
            {
              code: 'LCB011',
              description: 'disk error',
              type: 2,
            },
          ],
          forceSpace: true,
        },
      })
    )
  })
})
