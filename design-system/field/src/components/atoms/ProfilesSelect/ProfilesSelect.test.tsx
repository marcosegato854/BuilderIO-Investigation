import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { ProfilesSelect } from 'components/atoms/ProfilesSelect/ProfilesSelect'
import { Formik } from 'formik'
import { t } from 'i18n/config'
import { JobType } from 'store/features/dataStorage/types'
import { mergeDeepRight } from 'ramda'
import { getType } from 'typesafe-actions'
import { openDialogAction } from 'store/features/dialogs/slice'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const customProfile = mergeDeepRight(mockStore.dataStorageService.jobTypes[2], {
  name: 'CustomBoat',
  camera: {
    enable: 0,
    distance: 1.0,
  },
}) as JobType

const jobTypes: JobType[] = [
  ...mockStore.dataStorageService.jobTypes,
  customProfile,
]

describe('ProfilesSelect (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const mockOnChange = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <ProfilesSelect
          onChange={mockOnChange}
          profileValue={0}
          typeValue={jobTypes[0].name}
          jobTypes={jobTypes}
        />
      </Formik>
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOnChange.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  // test('It should NOT display the rename button', () => {
  //   expect(screen.queryByTestId('rename-profile')).not.toBeInTheDocument()
  // })

  test('It should NOT display the delete button', () => {
    expect(screen.queryByTestId('delete-profile')).not.toBeInTheDocument()
  })

  test('It should display the new profile option', () => {
    const select = component.getByText(jobTypes[0].name)
    fireEvent.mouseDown(select)
    expect(
      screen.getByText(t('new_job_form.option.job_type.new', 'Wrong') as string)
    ).toBeTruthy()
  })

  test('It should display saved custom profiles', () => {
    const select = component.getByText(jobTypes[0].name)
    fireEvent.mouseDown(select)
    expect(screen.getByText(customProfile.name)).toBeTruthy()
  })

  test('It should not change when the add new option is selected', () => {
    const select = component.getByText(jobTypes[0].name)
    fireEvent.mouseDown(select)
    const createNewButton = screen.getByText(
      t('new_job_form.option.job_type.new', 'Wrong') as string
    )
    fireEvent.click(createNewButton)
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  test('It should open a dialog when the add new option is selected', () => {
    const select = component.getByText(jobTypes[0].name)
    fireEvent.mouseDown(select)
    const createNewButton = screen.getByText(
      t('new_job_form.option.job_type.new', 'Wrong') as string
    )
    fireEvent.click(createNewButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(openDialogAction) })
    )
  })
})

describe('ProfilesSelect saved custom selected (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <ProfilesSelect
          onChange={jest.fn}
          profileValue={0}
          typeValue={customProfile.name}
          jobTypes={jobTypes}
        />
      </Formik>
    )(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display selected custom profile when closed', () => {
    expect(component.getByText(customProfile.name)).toBeTruthy()
  })

  // test('It should display the rename button', () => {
  //   expect(component.getByTestId('rename-profile')).toBeTruthy()
  // })

  // test('It should open a dialog when the rename button is clicked', () => {
  //   const button = component.getByTestId('rename-profile')
  //   fireEvent.click(button)
  //   expect(mockDispatch).toHaveBeenCalledWith(
  //     expect.objectContaining({ type: getType(openDialogAction) })
  //   )
  // })

  test('It should display the delete button', () => {
    expect(component.getByTestId('delete-profile')).toBeTruthy()
  })

  test('It should open a dialog when the delete button is clicked', async () => {
    const button = component.getByTestId('delete-profile')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(openDialogAction),
        payload: expect.objectContaining({
          componentProps: expect.objectContaining({
            title: t('job_browser.delete_jobtype_title', 'wrong'),
            text: t('job_browser.delete_jobtype_text', {
              profile: customProfile.name,
              defaultProfile: t(
                `new_job_form.option.job_type.p${customProfile.profile}`
              ),
            }),
          }),
        }),
      })
    )
  })
})

describe('ProfilesSelect unsaved custom selected (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <ProfilesSelect
          onChange={jest.fn}
          profileValue={0}
          typeValue="Custom"
          jobTypes={jobTypes}
        />
      </Formik>
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display "Custom" when closed', () => {
    expect(
      component.getByText(
        t('new_job_form.option.job_type.custom', 'wrong') as string
      )
    ).toBeTruthy()
  })

  // test('It should NOT display the rename button', () => {
  //   expect(screen.queryByTestId('rename-profile')).not.toBeInTheDocument()
  // })

  test('It should NOT display the delete button', () => {
    expect(screen.queryByTestId('delete-profile')).not.toBeInTheDocument()
  })
})
