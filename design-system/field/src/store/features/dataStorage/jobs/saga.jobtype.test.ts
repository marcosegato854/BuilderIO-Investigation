/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { createJobtypeFromJob } from 'components/dialogs/NewJobForm/utils'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkUserInfo } from 'store/features/auth/mockApi'
import { loginActions, selectIsAdmin } from 'store/features/auth/slice'
import {
  mkNewJobType,
  mkUpdateJobType,
} from 'store/features/dataStorage/mockApi'
import {
  dataStorageJobTypesActions,
  dataStorageProjectDetailActions,
  dataStorageSubmitJobForm,
} from 'store/features/dataStorage/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'

const customJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
  type: 'Custom',
  camera: {
    enable: 2,
    elapse: 1000,
  },
}) as IJob

const jobwithModifiedCustomProfile = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    type: 'MyCustom',
    camera: {
      enable: 2,
      elapse: 1000,
    },
  }
) as IJob

// const jobTypesWithOneAdmin = [
//   ...mockStore.dataStorageService.jobTypes,
//   mergeDeepRight(mockStore.dataStorageService.jobTypes[3], {
//     admin: true,
//   }),
// ]

// const jobsWithOneAdminType = [
//   ...mockStore.dataStorageService.jobs,
//   mergeDeepRight(mockStore.dataStorageService.jobs[0], {
//     type: 'MyCustom',
//   }),
// ]

const newJobType = createJobtypeFromJob(customJob, 'CustomJObType')

describe('Job saga (jobtypes)', () => {
  let mockSaveJobtypeAPI: jest.SpyInstance<any>
  let mockUpdateJobtypeAPI: jest.SpyInstance<any>
  let mockGetUserInfoAPI: jest.SpyInstance<any>
  let store: Store

  beforeEach(async () => {
    mockSaveJobtypeAPI = mkNewJobType()
    mockUpdateJobtypeAPI = mkUpdateJobType()
    mockGetUserInfoAPI = mkUserInfo({
      usertype: 'service',
    })
    moxios.install(apiClient)
    moxios.stubRequest('/user/settings', {
      status: 200,
      response: {},
    })
    store = getTestingStore()
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    mockSaveJobtypeAPI.mockClear()
    mockUpdateJobtypeAPI.mockClear()
    mockGetUserInfoAPI.mockClear()
    jest.useRealTimers()
  })

  it('should call the save job type API when detecting a custom job type', async () => {
    // submit the form
    await waitFor(
      () => {
        store.dispatch(
          dataStorageSubmitJobForm({
            jobName: 'New_job_with_custom_values',
            job: customJob,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // accept
    await waitFor(
      () => {
        store.dispatch({
          type: 'SAVE_JOB_TYPE_CONFIRM',
          payload: {
            jobTypeName: newJobType.name,
            jobTypeProfile: newJobType.profile,
          },
        })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSaveJobtypeAPI).toHaveBeenCalledWith({
      jobType: expect.objectContaining({ name: newJobType.name, admin: false }),
    })
  })

  it('should call the update job type API when detecting a change in custom job type', async () => {
    // load job types
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        store.dispatch(
          dataStorageJobTypesActions.success({
            jobtype: mockStore.dataStorageService.jobTypes,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // submit the form
    await waitFor(
      () => {
        store.dispatch(
          dataStorageSubmitJobForm({
            jobName: 'New_job_with_custom_values',
            job: jobwithModifiedCustomProfile,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockUpdateJobtypeAPI).toHaveBeenCalledWith({
      jobType: expect.objectContaining({
        name: jobwithModifiedCustomProfile.type,
        admin: false,
      }),
    })
  })

  it('should set the admin flag on a new job type', async () => {
    // login as admin thanks to
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D98LCBI8H',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const state = await store.getState()
    const isAdmin = await selectIsAdmin(state)
    expect(isAdmin).toBeTruthy()
    // submit the form
    await waitFor(
      () => {
        store.dispatch(
          dataStorageSubmitJobForm({
            jobName: 'New_job_with_custom_values',
            job: customJob,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // accept
    await waitFor(
      () => {
        store.dispatch({
          type: 'SAVE_JOB_TYPE_CONFIRM',
          payload: {
            jobTypeName: newJobType.name,
            jobTypeProfile: newJobType.profile,
          },
        })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSaveJobtypeAPI).toHaveBeenCalledWith({
      jobType: expect.objectContaining({ name: newJobType.name, admin: true }),
    })
  })

  it('should set the admin flag when updating a job type', async () => {
    // login as admin thanks to mocked info api
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D98LCBI8H',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // load job types
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        store.dispatch(
          dataStorageJobTypesActions.success({
            jobtype: mockStore.dataStorageService.jobTypes,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // submit the form
    await waitFor(
      () => {
        store.dispatch(
          dataStorageSubmitJobForm({
            jobName: 'New_job_with_custom_values',
            job: jobwithModifiedCustomProfile,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockUpdateJobtypeAPI).toHaveBeenCalledWith({
      jobType: expect.objectContaining({
        name: jobwithModifiedCustomProfile.type,
        admin: true,
      }),
    })
  })

  /** disabled because filtering with selectors creates render loops */
  // it('jobtypes should be filtered when not admin', async () => {
  //   // load job types
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         dataStorageJobTypesActions.success({
  //           jobtype: jobTypesWithOneAdmin,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const jobTypes = selectDataStorageJobTypes(state)
  //   expect(jobTypes.length).toBe(jobTypesWithOneAdmin.length - 1)
  // })

  // it('jobtypes should NOT be filtered when admin', async () => {
  //   // login as admin thanks to mocked info api
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         loginActions.success({
  //           authorization: 'bearer D98LCBI8H',
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   // load job types
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         dataStorageJobTypesActions.success({
  //           jobtype: jobTypesWithOneAdmin,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const jobTypes = selectDataStorageJobTypes(state)
  //   expect(jobTypes.length).toBe(jobTypesWithOneAdmin.length)
  // })

  // it('jobs should be filtered when not admin', async () => {
  //   // load job types
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         dataStorageJobTypesActions.success({
  //           jobtype: jobTypesWithOneAdmin,
  //         })
  //       )
  //       store.dispatch(
  //         dataStorageJobsActions.success({
  //           jobs: jobsWithOneAdminType,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const jobs = selectDataStorageJobs(state)
  //   expect(jobs.length).toBe(jobsWithOneAdminType.length - 1)
  // })

  // it('jobs should NOT be filtered when admin', async () => {
  //   // login as admin thanks to mocked info api
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         loginActions.success({
  //           authorization: 'bearer D98LCBI8H',
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   // load job types
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         dataStorageJobTypesActions.success({
  //           jobtype: jobTypesWithOneAdmin,
  //         })
  //       )
  //       store.dispatch(
  //         dataStorageJobsActions.success({
  //           jobs: jobsWithOneAdminType,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const jobs = selectDataStorageJobs(state)
  //   expect(jobs.length).toBe(jobsWithOneAdminType.length)
  // })
})
