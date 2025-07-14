import { Meta, Story } from '@storybook/react'
import {
  AdminLogs,
  IAdminLogsProps,
} from 'components/molecules/AdminLogs/AdminLogs'
import { mockStore } from 'store/mock/mockStoreTests'
import { flatten, repeat } from 'ramda'
import React from 'react'

const logs = JSON.parse(
  JSON.stringify(flatten(repeat(mockStore.globalService.log, 100)))
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
logs.forEach((l: any, i: number) => {
  l.args[0] = `log message nr ${i}`
})

const defaultProps = {
  logs,
}
export default {
  title: 'Molecules/AdminLogs',
  component: AdminLogs,
  argTypes: {
    clearLogs: {
      defaultValue: () => {},
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const TemplateMockStore: Story<IAdminLogsProps> = (args) => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <AdminLogs {...args} />
    </div>
  )
}
export const MockStore = TemplateMockStore.bind({})
MockStore.args = defaultProps
