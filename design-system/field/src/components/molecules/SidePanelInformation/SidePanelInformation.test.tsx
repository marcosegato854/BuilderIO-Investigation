import { RenderResult, queries, screen, within } from '@testing-library/react'
import {
  cameraEnableOptions,
  cameraEnableOptionsAdmin,
} from 'components/dialogs/NewJobForm/options'
import { SidePanelInformation } from 'components/molecules/SidePanelInformation/SidePanelInformation'
import { t } from 'i18n/config'
import { identity, mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { labelWithUnit, mtToFt } from 'utils/numbers'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
const job = mockStore.dataStorageService.currentJob
const jobCameraTime = mergeDeepRight(job, {
  camera: {
    enable: 2,
    elapse: 1500,
  },
}) as IJob
const jobTRK100 = mergeDeepRight(job, {
  hardwareModel: 'PEGASUS TRK100',
}) as IJob

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('SidePanelInformation (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<SidePanelInformation jobInfo={job} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display camera enable setting correctly', () => {
    const { unit } = mockStore.dataStorageService.currentProject.coordinate
    const cameraDetail = component.getByTestId('detail-camera')
    expect(
      within(cameraDetail).getByText(
        cameraEnableOptions().find((o) => o.value === job.camera.enable)!.label,
        { exact: false }
      )
    ).toBeTruthy()
    expect(
      within(cameraDetail).getByText(
        labelWithUnit('M', mtToFt, job.camera?.distance, unit),
        { exact: false }
      )
    ).toBeTruthy()
  })
})

describe('SidePanelInformation (mockStore camera trigger time)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <SidePanelInformation jobInfo={jobCameraTime} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display camera enable setting correctly', () => {
    const { unit } = mockStore.dataStorageService.currentProject.coordinate
    const cameraDetail = component.getByTestId('detail-camera')
    expect(
      within(cameraDetail).getByText(
        cameraEnableOptionsAdmin().find(
          (o) => o.value === jobCameraTime.camera?.enable
        )!.label,
        { exact: false }
      )
    ).toBeTruthy()
    expect(
      within(cameraDetail).getByText(
        labelWithUnit('MS', identity, jobCameraTime.camera?.elapse, unit),
        { exact: false }
      )
    ).toBeTruthy()
  })
})

describe('SidePanelInformation (mockStore TRK100)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <SidePanelInformation jobInfo={jobTRK100} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should NOT show the scanner spacing property', () => {
    // looking for the "spacing" translation
    const avoidText = t('job_browser.details.values.scanner', 'wrong').split(
      ':'
    )[0]
    expect(avoidText.length).toBeGreaterThan(0)
    expect(avoidText).not.toEqual('wrong')
    expect(
      screen.queryByText(avoidText, { exact: false })
    ).not.toBeInTheDocument()
  })
})
