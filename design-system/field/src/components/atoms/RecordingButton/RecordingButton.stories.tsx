import { Typography } from '@mui/material'
import { Meta, Story } from '@storybook/react'
import { AutocaptureBadge } from 'components/atoms/AutocaptureBadge/AutocaptureBadge'
import { IRecordingButtonProps, RecordingButton } from './RecordingButton'

const defaultProps: Partial<IRecordingButtonProps> = {
  recording: true,
}

export default {
  title: 'Atoms/RecordingButton',
  component: RecordingButton,
  argTypes: {
    onClick: {
      table: { disable: true },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IRecordingButtonProps> = (args) => {
  return <RecordingButton {...args} />
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateExtraInfo: Story<IRecordingButtonProps> = (args) => {
  return (
    <RecordingButton
      {...args}
      extraInfo={
        <Typography
          sx={{
            color: (theme) => theme.colors.primary_11,
          }}
          noWrap
        >
          test asdfasdf asdf as
        </Typography>
      }
    />
  )
}
export const ExtraInfo = TemplateExtraInfo.bind({})
ExtraInfo.args = defaultProps

/** ACRecordingEnabled */
const TemplateACRecordingEnabled: Story<IRecordingButtonProps> = (args) => {
  return (
    <RecordingButton
      {...args}
      recording={true}
      extraInfo={<AutocaptureBadge recording autocaptureEnabled />}
    />
  )
}
export const ACRecordingEnabled = TemplateACRecordingEnabled.bind({})
ACRecordingEnabled.args = {}

/** ACRecordingDisnabled */
const TemplateACRecordingDisnabled: Story<IRecordingButtonProps> = (args) => {
  return (
    <RecordingButton
      {...args}
      recording={true}
      extraInfo={<AutocaptureBadge recording autocaptureEnabled={false} />}
    />
  )
}
export const ACRecordingDisnabled = TemplateACRecordingDisnabled.bind({})
ACRecordingDisnabled.args = {}

/** ACNotRecordingEnabled */
const TemplateACNotRecordingEnabled: Story<IRecordingButtonProps> = (args) => {
  return (
    <RecordingButton
      {...args}
      recording={false}
      extraInfo={<AutocaptureBadge recording={false} autocaptureEnabled />}
    />
  )
}
export const ACNotRecordingEnabled = TemplateACNotRecordingEnabled.bind({})
ACNotRecordingEnabled.args = {}

/** ACNotRecordingDisnabled */
const TemplateACNotRecordingDisnabled: Story<IRecordingButtonProps> = (
  args
) => {
  return (
    <RecordingButton
      {...args}
      recording={false}
      extraInfo={
        <AutocaptureBadge recording={false} autocaptureEnabled={false} />
      }
    />
  )
}
export const ACNotRecordingDisnabled = TemplateACNotRecordingDisnabled.bind({})
ACNotRecordingDisnabled.args = {}

/** IntoPCU */
const TemplateIntoPCU: Story<IRecordingButtonProps> = (args) => {
  return (
    <RecordingButton
      {...args}
      variant="pcuapp"
      recording={false}
      extraInfo={
        <AutocaptureBadge
          recording={false}
          autocaptureEnabled={false}
          variant="pcuapp"
        />
      }
    />
  )
}
export const IntoPCU = TemplateIntoPCU.bind({})
IntoPCU.args = {}
