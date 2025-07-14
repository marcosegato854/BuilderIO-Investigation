import { Meta, Story } from '@storybook/react'
import image from 'assets/jpg/England2.jpg'
import {
  IJobGridItemProps,
  JobGridItem,
} from 'components/molecules/JobGridItem/JobGridItem'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'

const job: IJob = {
  name: 'Job001',
  scans: 0,
  image,
  completed: 10,
  hardwareModel: 'PEGASUS TRK500 NEO',
}
export default {
  title: 'Molecules/JobGridItem',
  component: JobGridItem,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    job: {
      defaultValue: job,
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

/**
 * Default
 */
const Template: Story<IJobGridItemProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobGridItem {...args} {...routerProps} />
        }}
        path="/"
      />
    </MemoryRouter>
  )
}
export const Default = Template.bind({})
Default.args = {}

/**
 * NotProcessed
 */
const notProcessedJob: IJob = {
  name: 'notProcessed',
  acquired: true,
  scans: 10,
  image,
}
const storeNotProcessed = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      config: {
        Process: {
          office: { available: true },
        },
      },
    },
  })
)
const TemplateNotProcessed: Story<IJobGridItemProps> = (args) => {
  return (
    <Provider store={storeNotProcessed}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobGridItem {...args} job={notProcessedJob} {...routerProps} />
            )
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const NotProcessed = TemplateNotProcessed.bind({})
NotProcessed.args = {}

/**
 * Processed
 */
const processedJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
  acquired: true,
  scans: 10,
  image,
  processOutput: {
    progress: 100,
    options: {
      finalise: {
        blur: {
          done: true,
        },
        colorization: {
          done: false,
        },
      },
      export: {
        lgs: {
          done: false,
        },
        lgsx: {
          done: false,
        },
        e57: {
          done: false,
        },
      },
    },
  },
}) as IJob
const storeProcessed = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
      office: null,
    },
  })
)
const TemplateProcessed: Story<IJobGridItemProps> = (args) => {
  return (
    <Provider store={storeProcessed}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return <JobGridItem {...args} job={processedJob} {...routerProps} />
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const Processed = TemplateProcessed.bind({})
Processed.args = {}

/**
 * Processing error
 */
const processingErrorJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    imageProcessed: 50,
    scans: 1,
    processed: null,
    acquired: true,
    image,
    processOutput: {
      progress: 100,
      errors: [
        {
          code: 'PE-001',
          description: 'Processing error',
          type: 2,
        },
      ],
    },
  }
) as IJob
const storeProcessingError = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
    },
  })
)
const TemplateProcessingError: Story<IJobGridItemProps> = (args) => {
  return (
    <Provider store={storeProcessingError}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobGridItem
                {...args}
                job={processingErrorJob}
                {...routerProps}
              />
            )
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const ProcessingError = TemplateProcessingError.bind({})
ProcessingError.args = {}

/**
 * Processing exporting
 */
const processingExportingJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
    image,
  }
) as IJob
const storeProcessingExporting = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [
        {
          disk: 'p',
          project: 'Project002',
          job: 'Job001',
          isImageAI: false,
          progress: 33,
          options: {
            export: {
              lgs: {
                done: false,
              },
              lgsx: {
                done: false,
              },
              e57: {
                done: false,
              },
            },
            finalise: {
              blur: {
                done: true,
              },
              colorization: {
                done: false,
              },
            },
          },
        },
      ],
    },
  })
)
const TemplateProcessingExporting: Story<IJobGridItemProps> = (args) => {
  return (
    <Provider store={storeProcessingExporting}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobGridItem
                {...args}
                job={processingExportingJob}
                {...routerProps}
              />
            )
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const ProcessingExporting = TemplateProcessingExporting.bind({})
ProcessingExporting.args = {}

/**
 * Processing finalising
 */
const processingFinalisingJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
    image,
  }
) as IJob
const storeProcessingFinalising = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [
        {
          disk: 'p',
          project: 'Project002',
          job: 'Job001',
          isImageAI: true,
          progress: 66,
          options: {
            export: {
              lgs: {
                done: false,
              },
              lgsx: {
                done: false,
              },
              e57: {
                done: false,
              },
            },
            finalise: {
              blur: {
                done: false,
              },
              colorization: {
                done: false,
              },
            },
          },
        },
      ],
      config: {
        Process: {
          office: { available: true },
        },
      },
    },
  })
)
const TemplateProcessingFinalising: Story<IJobGridItemProps> = (args) => {
  return (
    <Provider store={storeProcessingFinalising}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobGridItem
                {...args}
                job={processingFinalisingJob}
                {...routerProps}
              />
            )
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const ProcessingFinalising = TemplateProcessingFinalising.bind({})
ProcessingFinalising.args = {}

/**
 * Processing paused
 */
const processingPausedJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 1,
    image,
    processOutput: {
      progress: 72,
      isImageAIdone: true,
    },
  }
) as IJob
const storeProcessingPaused = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [],
      config: {
        Process: {
          office: { available: true },
        },
      },
    },
  })
)
const TemplateProcessingPaused: Story<IJobGridItemProps> = (args) => {
  return (
    <Provider store={storeProcessingPaused}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobGridItem
                {...args}
                job={processingPausedJob}
                {...routerProps}
              />
            )
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const ProcessingPaused = TemplateProcessingPaused.bind({})
ProcessingPaused.args = {}
