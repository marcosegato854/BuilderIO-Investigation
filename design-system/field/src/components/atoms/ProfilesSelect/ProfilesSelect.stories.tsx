import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  ProfilesSelect,
  IProfilesSelectProps,
} from 'components/atoms/ProfilesSelect/ProfilesSelect'
import { mockStore } from 'store/mock/mockStoreTests'
import { mergeDeepRight } from 'ramda'
import { JobType } from 'store/features/dataStorage/types'
import { Formik } from 'formik'

// Example of how we should declare props' default values:
const customProfile = mergeDeepRight(mockStore.dataStorageService.jobTypes[2], {
  name: 'CustomBoat',
  camera: {
    enable: 0,
    distance: 1.0,
  },
})

const jobTypes: JobType[] = [
  ...mockStore.dataStorageService.jobTypes,
  customProfile,
]

const defaultProps: Partial<IProfilesSelectProps> = {
  jobTypes,
  profileValue: 0,
  typeValue: 'Road',
}

export default {
  title: 'Atoms/ProfilesSelect',
  component: ProfilesSelect,
  argTypes: {
    typeValue: {
      control: {
        type: 'select',
        options: jobTypes.map((p) => p.name),
      },
    },
    profileValue: {
      table: {
        disable: true,
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IProfilesSelectProps> = (args) => {
  return (
    <Formik initialValues={{}} onSubmit={() => {}}>
      <ProfilesSelect {...args} />
    </Formik>
  )
}
export const Default = Template.bind({})
Default.args = defaultProps
