import React from 'react'
import { Story, Meta } from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import image from 'assets/jpg/England2.jpg'
import { Provider } from 'react-redux'
import { ViewMode } from 'store/features/position/types'
import {
  SidePanel,
  ISidePanelProps,
} from 'components/organisms/SidePanel/SidePanel'
import { mergeDeepRight } from 'ramda'

const customMockStore = mergeDeepRight(mockStore, {
  routingService: {
    autocaptureNeeded: mockStore.planningService.needed,
  },
})
const mockedStore = configureMockStore()(customMockStore)

const defaultProps: ISidePanelProps = {
  planned: true,
  viewMode: ViewMode.CAMERA,
  media: {
    recordings: [
      {
        id: '001',
        title: 'Audio_001',
        sound:
          'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3',
      },
      {
        id: '002',
        title: 'Audio_002',
        sound:
          'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3',
      },
      {
        id: '003',
        title: 'Audio_003',
        sound:
          'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3',
      },
    ],
    images: [
      {
        id: '001',
        title: 'Image_001',
        data: image,
      },
      {
        id: '002',
        title: 'Image_002',
        data: image,
      },
      {
        id: '003',
        title: 'Image_003',
        data: image,
      },
    ],
    notes: [
      {
        id: '001',
        title: 'Text_001',
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lorem ante, pretium nec sem eu, molestie elementum ante. Proin elementum pellentesque lacinia. Mauris pretium augue nec efficitur volutpat. Mauris sagittis dolor auctor posuere vestibulum. In quis aliquam ex, ut tincidunt ligula. Donec convallis tortor sit amet enim vulputate, vel hendrerit augue ultrices. Curabitur vitae mollis nibh, et ullamcorper purus. Proin luctus elementum lectus, sit amet consequat urna euismod sed. Suspendisse tortor felis, feugiat nec eleifend ut, egestas id urna. Donec consectetur nibh ac interdum aliquet. Integer semper et dui vehicula viverra. Sed tristique blandit nibh eget euismod. Vivamus congue ullamcorper euismod. Morbi congue eget nibh sit amet hendrerit. Integer laoreet eros dolor, in consequat velit aliquam nec.',
      },
      {
        id: '002',
        title: 'Text_002',
        content: 'i love short texts',
      },
      {
        id: '003',
        title: 'Text_003',
        content: 'i love short texts two times',
      },
    ],
  },
  jobInfo: mockStore.dataStorageService.currentJob!,
}

export default {
  title: 'Organisms/SidePanel',
  component: SidePanel,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    viewMode: {
      control: {
        type: 'radio',
        options: Object.values(ViewMode),
      },
    },
    // 2) Assign the default value to the related property inside of argTypes{}
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ISidePanelProps> = (args) => {
  return <SidePanel {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps

const TemplateMockStore: Story<ISidePanelProps> = (args) => {
  return (
    <Provider store={mockedStore}>
      <SidePanel {...args} />
    </Provider>
  )
}

export const MockStore = TemplateMockStore.bind({})
MockStore.args = defaultProps
