import { Meta, Story } from '@storybook/react'
import image from 'assets/jpg/England2.jpg'
import {
  IJobListItemProps,
  JobListItem,
} from 'components/molecules/JobListItem/JobListItem'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'

const job: IJob = {
  name: 'England',
  scans: 0,
  image,
  completed: 10,
  hardwareModel: 'PEGASUS TRK500 NEO',
}
export default {
  title: 'Molecules/JobListItem',
  component: JobListItem,
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
const Template: Story<IJobListItemProps> = (args) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Route
        component={(routerProps: RouteComponentProps) => {
          return <JobListItem {...args} {...routerProps} />
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
const notProcessedJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    name: 'notProcessed',
    acquired: true,
    scans: 10,
    image,
  }
) as IJob
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
const TemplateNotProcessed: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeNotProcessed}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobListItem {...args} job={notProcessedJob} {...routerProps} />
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
  scans: 20,
  acquired: true,
  image,
  processOutput: {
    progress: 100,
    options: {
      finalize: {
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
      config: {
        Process: {
          office: { available: true },
        },
      },
    },
  })
)
const TemplateProcessed: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeProcessed}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return <JobListItem {...args} job={processedJob} {...routerProps} />
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
 * Processed no office
 */
/* const processedJobNoOffice = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    imageProcessed: 100,
    processed: 100,
    scans: 20,
    acquired: true,
    image: undefined,
  }
) as IJob
const storeProcessedNoOffice = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: {
        imageAI: null,
        office: null,
      },
      config: {
        Process: {
          office: { available: false },
        },
      },
    },
  })
)
const TemplateProcessedNoOffice: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeProcessedNoOffice}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobListItem
                {...args}
                job={processedJobNoOffice}
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
export const ProcessedNoOffice = TemplateProcessedNoOffice.bind({})
ProcessedNoOffice.args = {} */

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
const TemplateProcessingFinalising: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeProcessingFinalising}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobListItem
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
 * Processing export
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
      config: {
        Process: {
          office: { available: true },
        },
      },
    },
  })
)
const TemplateProcessingExporting: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeProcessingExporting}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobListItem
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
const TemplateProcessingPaused: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeProcessingPaused}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobListItem
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

/**
 * NoRTK
 */
/* const noRtkJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
  imageProcessed: 100,
  processed: null,
  acquired: true,
  scans: 20,
  image: undefined,
  ntrip: {
    enable: false,
  },
}) as IJob
const storeNoRTK = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: {
        imageAI: null,
        office: null,
      },
      config: {
        Process: {
          office: { available: true },
        },
      },
    },
  })
)
const TemplateNoRTK: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeNoRTK}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return <JobListItem {...args} job={noRtkJob} {...routerProps} />
          }}
          path="/"
        />
      </MemoryRouter>
    </Provider>
  )
}
export const NoRTK = TemplateNoRTK.bind({})
NoRTK.args = {} */

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
const TemplateProcessingError: Story<IJobListItemProps> = (args) => {
  return (
    <Provider store={storeProcessingError}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <JobListItem
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
