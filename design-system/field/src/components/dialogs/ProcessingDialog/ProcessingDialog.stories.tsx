import { Story, Meta } from '@storybook/react'
import ProcessingDialog, {
  IProcessingDialogProps,
} from 'components/dialogs/ProcessingDialog/ProcessingDialog'
import { mergeDeepRight } from 'ramda'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'

// Example of how we should declare props' default values:

// 1) Declare the defaultProps object with the right properties and assign them a value
// const defaultProps: IProcessingOptionsProps = {
//   propertyA: 'hello',
//   propertyB: true,
// }
const job: IJob = {
  name: 'Job001',
  acquired: true,
  scans: 1,
  hardwareModel: 'PEGASUS TRK700 EVO',
}

const defaultProps: IProcessingDialogProps = {
  job,
}

export default {
  title: 'Dialogs/ProcessingDialog',
  component: ProcessingDialog,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // 2) Assign the default value to the related property inside of argTypes{}
    // propertyA: {
    //   defaultValue: defaultProps.propertyA,
    // },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IProcessingDialogProps> = (args) => {
  return <ProcessingDialog {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

/**
 * Processed Blur
 */
const processedBlurJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
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
  }
) as IJob
const storeProcessedBlur = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
      office: null,
    },
  })
)

const TemplateProcessedBlur: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessedBlur}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
                {...args}
                job={processedBlurJob}
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
export const ProcessedBlur = TemplateProcessedBlur.bind({})
ProcessedBlur.args = {}

/**
 * Processed Colorization
 */
const processedColorizationJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
    processOutput: {
      progress: 100,
      isImageAIdone: true,
      options: {
        finalise: {
          blur: {
            done: true,
          },
          colorization: {
            done: true,
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
  }
) as IJob
const storeProcessedColorization = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
    },
  })
)

const TemplateProcessedColorization: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessedColorization}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
                {...args}
                job={processedColorizationJob}
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
export const ProcessedColorization = TemplateProcessedColorization.bind({})
ProcessedColorization.args = {}

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
    processOutput: {
      progress: 53,
      isImageAIdone: false,
      options: {
        finalise: {
          blur: {
            done: true,
          },
          colorization: {
            done: true,
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
      errors: [
        {
          code: 'LCB012',
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
const TemplateProcessingError: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessingError}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
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
 * Processing finalising
 */
const processingFinalisingJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
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
                enable: true,
                done: false,
              },
              colorization: {
                enable: true,
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
const TemplateProcessingFinalising: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessingFinalising}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
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
 * Processing Export
 */
const processingExportJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
  }
) as IJob
const storeProcessingExport = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: [
        {
          disk: 'p',
          project: 'Project002',
          job: 'Job001',
          isImageAI: false,
          progress: 66,
          options: {
            export: {
              lgs: {
                done: false,
              },
              lgsx: {
                enable: true,
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
                done: true,
              },
            },
          },
        },
      ],
    },
  })
)
const TemplateProcessingExport: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessingExport}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
                {...args}
                job={processingExportJob}
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
export const ProcessingExport = TemplateProcessingExport.bind({})
ProcessingExport.args = {}

/**
 * Processing paused
 */
const processingPausedJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 1,
    processOutput: {
      progress: 72,
      isImageAIdone: true,
    },
  }
) as IJob
const storeProcessingPaused = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
    },
  })
)
const TemplateProcessingPaused: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessingPaused}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
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
 * Process RTK On
 */
const processRTKJob = mergeDeepRight(mockStore.dataStorageService.currentJob!, {
  acquired: true,
  scans: 10,
  ntrip: {
    enable: true,
  },
}) as IJob
const storeProcessRTK = configureMockStore()(
  mergeDeepRight(mockStore, {
    dataStorageService: {
      processing: null,
      office: null,
    },
  })
)

const TemplateProcessRTK: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessRTK}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
                {...args}
                job={processRTKJob}
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
export const ProcessRTK = TemplateProcessRTK.bind({})
ProcessRTK.args = {}

/**
 * Process RTK Off
 */
const processRTKOffJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
    ntrip: {
      enable: false,
    },
  }
) as IJob

const TemplateProcessRTKOff: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessRTK}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
                {...args}
                job={processRTKOffJob}
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
export const ProcessRTKOff = TemplateProcessRTKOff.bind({})
ProcessRTKOff.args = {}

/**
 * Process RTK Off - blur done
 */
const processRTKOffBlurDoneJob = mergeDeepRight(
  mockStore.dataStorageService.currentJob!,
  {
    acquired: true,
    scans: 10,
    ntrip: {
      enable: false,
    },
    processOutput: {
      progress: 100,
      isImageAIdone: true,
      options: {
        finalise: {
          blur: {
            done: true,
            enable: true,
          },
          colorization: {
            done: false,
          },
        },
        export: {
          las: {
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
  }
) as IJob

const TemplateProcessRTKOffBlurDone: Story<IProcessingDialogProps> = (args) => {
  return (
    <Provider store={storeProcessRTK}>
      <MemoryRouter initialEntries={['/']}>
        <Route
          component={(routerProps: RouteComponentProps) => {
            return (
              <ProcessingDialog
                {...args}
                job={processRTKOffBlurDoneJob}
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
export const ProcessRTKOffBlurDone = TemplateProcessRTKOffBlurDone.bind({})
ProcessRTKOffBlurDone.args = {}
