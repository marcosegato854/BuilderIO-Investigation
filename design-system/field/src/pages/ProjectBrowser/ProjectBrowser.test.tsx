import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { DialogNames } from 'components/dialogs/dialogNames'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import {
  IProjectBrowserProps,
  ProjectBrowser,
} from 'pages/ProjectBrowser/ProjectBrowser'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import { act } from 'react-dom/test-utils'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  actionsServiceActivateSystemAction,
  actionsServiceActivationInfoActions,
} from 'store/features/actions/slice'
import { cameraDisplayableNamesActions } from 'store/features/camera/slice'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import {
  closeAllDialogsAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { mkSystemLog } from 'store/features/system/mockApi'
import {
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
  systemStateActions,
} from 'store/features/system/slice'
import { SystemNotification } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const routeComponentPropsMock = {
  history: {
    location: {
      pathname: '/HomePage',
      key: 'default',
    },
  },
  location: {},
  match: {},
}

// describe('ProjectBrowser (mockStore)', () => {
//   let component: RenderResult<typeof queries>
//   beforeEach(() => {
//     // mock API
//     moxios.install(apiClient)
//     moxios.stubRequest('/datastorage/projects', {
//       status: 200,
//       response: {
//         projects: mockStore.dataStorageService.projects,
//       },
//     })
//     component = renderWithProvider(
//       <ProjectBrowser {...(routeComponentPropsMock as IProjectBrowserProps)} />
//     )(mockedStore)
//     jest.useFakeTimers()
//   })

//   afterEach(() => {
//     moxios.uninstall(apiClient)
//     mockDispatch.mockClear()
//     jest.useRealTimers()
//   })

//   test('It should mount', () => {
//     expect(screen.getByText('Pegasus')).toBeTruthy()
//   })

//   test('It displays the projects', async () => {
//     await waitFor(() => {}, { timeout: 500 })
//     jest.advanceTimersByTime(500)
//     const projects = component.getAllByRole('cell')
//     expect(projects.length).toBe(2)
//   })

//   test('It dispatches new project form action when clicking the new project button', () => {
//     const addNewButton = screen.getByTestId('red-plus-mobile')
//     expect(addNewButton).toBeTruthy()
//     fireEvent.click(addNewButton)
//     expect(mockDispatch).toHaveBeenCalledWith(
//       openDialogAction({ component: DialogNames.NewProjectForm })
//     )
//     expect(mockDispatch).toHaveBeenLastCalledWith({
//       payload: {
//         component: 'NewProjectForm',
//       },
//       type: 'dialogs/OPEN_DIALOG',
//     })
//   })
// })

describe('ProjectBrowser NO DISKS (mockStore)', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      dataStorageService: {
        disks: [],
      },
      system: {
        responsiveness: {
          storage: {
            details: {
              disks: [],
            },
          },
        },
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  beforeEach(() => {
    // mock API
    moxios.install(apiClient)
    moxios.stubRequest('/datastorage/projects', {
      status: 200,
      response: {
        projects: mockStore.dataStorageService.projects,
      },
    })
    component = renderWithProvider(
      <ProjectBrowser {...(routeComponentPropsMock as IProjectBrowserProps)} />
    )(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(screen.getByText('Pegasus')).toBeTruthy()
  })

  test('It dispatches new project form action when clicking the new project button', async () => {
    const addNewButton = screen.getByTestId('red-plus-mobile')
    expect(addNewButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(addNewButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).not.toHaveBeenCalledWith(
      openDialogAction({ component: DialogNames.NewProjectForm })
    )
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dialogs/OPEN_DIALOG',
        payload: expect.objectContaining({
          component: DialogNames.Alert,
          componentProps: expect.objectContaining({
            text: t('project_browser.no_disks.text', 'wrong'),
          }),
        }),
      })
    )
  })
})

// describe('ProjectBrowser (realStore)', () => {
//   let component: RenderResult<typeof queries>
//   beforeEach(async () => {
//     // mock API
//     moxios.install(apiClient)
//     moxios.stubRequest('/datastorage/projects', {
//       status: 200,
//       response: {
//         projects: mockStore.dataStorageService.projects,
//       },
//     })
//     component = renderWithProvider(
//       <ProjectBrowser {...(routeComponentPropsMock as IProjectBrowserProps)} />
//     )(store)
//     jest.useFakeTimers()
//     await waitFor(() => {}, { timeout: 500 })
//     jest.advanceTimersByTime(500)
//   })

//   afterEach(() => {
//     jest.useRealTimers()
//     moxios.uninstall(apiClient)
//   })

//   test('It should mount', () => {
//     act(() => {
//       expect(screen.getByText('Pegasus')).toBeTruthy()
//     })
//   })

//   test('It displays the projects', async () => {
//     await waitFor(() => {}, { timeout: 500 })
//     jest.advanceTimersByTime(500)
//     const projects = component.getAllByRole('cell')
//     expect(projects.length).toBe(2)
//   })

//   test('It filters the projects', async () => {
//     await waitFor(() => {}, { timeout: 500 })
//     jest.advanceTimersByTime(500)
//     const searchImput = screen.getByTestId('search-input')
//     expect(searchImput).toBeTruthy()
//     const project = mockStore.dataStorageService.projects[0]
//     const filter = project.name.substr(project.name.length - 3)
//     fireEvent.change(searchImput, {
//       target: {
//         value: filter,
//       },
//     })
//     const projects = component.getAllByRole('cell')
//     expect(projects.length).toBe(1)
//   })

//   test('It changes project view', () => {
//     let listButton = screen.getByTestId('test-Grid')
//     expect(listButton).toBeTruthy()
//     fireEvent.click(listButton)
//     const gridButton = component.getByTestId('test-List')
//     expect(gridButton).toBeTruthy()
//     fireEvent.click(gridButton)
//     listButton = component.getByTestId('test-Grid')
//     expect(listButton).toBeTruthy()
//   })

//   test('[NOT IMPLEMENTED] calls onSortChange callback on change', () => {})
// })

// describe('ProjectBrowser camera disconnection (realStore)', () => {
//   let ws: WS
//   // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//   let component: RenderResult<typeof queries>
//   const diskName = mockStore.dataStorageService.currentProject!.disk
//   const projectName = mockStore.dataStorageService.currentProject!.name
//   const jobName = mockStore.dataStorageService.currentJob!.name
//   const mockedSystemErrorLogApi = mkSystemLog()
//   const testingStore = getTestingStore()
//   beforeEach(async () => {
//     // mock API
//     moxios.install(apiClient)
//     moxios.stubRequest('/datastorage/projects', {
//       status: 200,
//       response: {
//         projects: mockStore.dataStorageService.projects,
//       },
//     })
//     // mock socket
//     ws = new WS(`${getSocketUrl()}/notification`)
//     // cheange section
//     testingStore.dispatch(notificationsSubscribeAction())
//     // render
//     component = renderWithProvider(
//       <div>
//         <DialogManager />
//         <ErrorManager />
//         <ProjectBrowser
//           {...(routeComponentPropsMock as IProjectBrowserProps)}
//         />
//       </div>
//     )(testingStore)
//     // wait for ws connection
//     await ws.connected
//     // enable fake timers
//     jest.useFakeTimers()
//   })

//   afterEach(() => {
//     testingStore.dispatch(notificationsUnsubscribeAction())
//     testingStore.dispatch(resetStoreAction())
//     WS.clean()
//     moxios.uninstall(apiClient)
//     jest.useRealTimers()
//     mockedSystemErrorLogApi.mockClear()
//   })

//   test('should display camera disconnection alert when receiving MV-0 notification', async () => {
//     const notification: SystemNotification = {
//       code: 'MV-0',
//       description: 'Missing Front Left Camera',
//       time: '2021-10-13T11:15:57D',
//       type: 2,
//     }
//     await waitFor(
//       () => {
//         ws.send(JSON.stringify(notification))
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     expect(
//       screen.getByText(
//         t('acquisition.deactivated_camera.title', 'Disconnected') as string
//       )
//     ).toBeTruthy()
//   })

//   test('should display camera disconnection alert with an alert dialog', async () => {
//     const notification: SystemNotification = {
//       code: 'MV-0',
//       description: 'Missing Front Left Camera',
//       time: '2021-10-13T11:15:57D',
//       type: 2,
//     }
//     await waitFor(
//       () => {
//         ws.send(JSON.stringify(notification))
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     expect(screen.getByTestId('dialog-component')).toBeTruthy()
//   })

//   test('should display camera disconnection alert when receiving MV-10 notification', async () => {
//     const notification: SystemNotification = {
//       code: 'MV-10',
//       description: 'Missing Front Left Camera',
//       time: '2021-10-13T11:15:57D',
//       type: 2,
//     }
//     await waitFor(
//       () => {
//         ws.send(JSON.stringify(notification))
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     expect(
//       screen.getByText(
//         t('acquisition.deactivated_camera.title', 'Disconnected') as string
//       )
//     ).toBeTruthy()
//   })

//   test('should remove camera disconnection alert when receiving MV-10 notification removal', async () => {
//     const notification: SystemNotification = {
//       code: 'MV-0',
//       description: 'Missing Front Left Camera',
//       time: '2021-10-13T11:15:57D',
//       type: 2,
//     }
//     await waitFor(
//       () => {
//         ws.send(JSON.stringify(notification))
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     expect(
//       screen.getByText(
//         t('acquisition.deactivated_camera.title', 'Disconnected') as string
//       )
//     ).toBeTruthy()
//     // removal
//     await waitFor(
//       () => {
//         ws.send(JSON.stringify({ ...notification, type: 3 }))
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     expect(
//       screen.queryByText(
//         t('acquisition.deactivated_camera.title', 'Disconnected') as string
//       )
//     ).not.toBeInTheDocument()
//   })

//   test('should ask the user to start acquisition even if the camera is disconnected', async () => {
//     // init state
//     await waitFor(
//       () => {
//         // fill system state
//         testingStore.dispatch(
//           systemStateActions.success({
//             state: 'Deactivated',
//           })
//         )
//         // disconnected cameras
//         testingStore.dispatch(
//           cameraDisplayableNamesActions.success({
//             groups: [
//               {
//                 name: 'Sphere',
//                 cameras: [
//                   {
//                     name: 'Sphere',
//                     active: true,
//                   },
//                 ],
//               },
//             ],
//           })
//         )
//         testingStore.dispatch(
//           cameraDisplayableNamesActions.success({
//             groups: [
//               {
//                 name: 'Sphere',
//                 cameras: [
//                   {
//                     name: 'Sphere',
//                     active: false,
//                   },
//                 ],
//               },
//             ],
//           })
//         )

//         // start activation
//         testingStore.dispatch(
//           actionsServiceActivateSystemAction({
//             disk: diskName || '',
//             job: jobName,
//             project: projectName,
//             // TODO: make it translatable when PEO support any character in folder names
//             scan: 'Track',
//           })
//         )
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     await waitFor(
//       () => {
//         // fill current project
//         testingStore.dispatch(
//           dataStorageProjectDetailActions.success(
//             mockStore.dataStorageService.currentProject!
//           )
//         )
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     await waitFor(
//       () => {
//         // fill current job
//         testingStore.dispatch(
//           dataStorageJobDetailActions.success({
//             job: mockStore.dataStorageService.currentJob!,
//           })
//         )
//         // close all dialogs
//         testingStore.dispatch(closeAllDialogsAction())
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     await waitFor(
//       () => {
//         // finish activation
//         testingStore.dispatch(
//           actionsServiceActivationInfoActions.success({
//             action: {
//               status: 'progress',
//               progress: 0,
//               description: '',
//             },
//           })
//         )
//       },
//       { timeout: 500 }
//     )
//     jest.advanceTimersByTime(500)
//     // test
//     expect(
//       screen.queryByText(
//         t(
//           'acquisition.deactivated_camera.text_activating',
//           'Disconnected'
//         ) as string
//       )
//     ).toBeInTheDocument()
//     // should log the user choice to start acquisition even if the camera is disconnected
//     const buttonOk = screen.queryByText(
//       t('acquisition.deactivated_camera.ok_active', 'Disconnected') as string
//     )
//     fireEvent.click(buttonOk!)
//     expect(mockedSystemErrorLogApi).toHaveBeenCalledWith({
//       code: 'saga',
//       message:
//         '[USER_ACTION] User accepted to acquire with a disconnected camera',
//       type: 'message',
//     })
//   })

//   test('[NOT IMPLEMENTED] should display camera name in the alert', () => {})
// })
