import React from 'react'
import { Story, Meta } from '@storybook/react'
import { KebabMenuMaterial, IKebabMenuMaterialProps } from './KebabMenuMaterial'

const defaultProps: IKebabMenuMaterialProps = {
  options: [
    {
      onClick: () => console.info('edit project clicked'),
      value: 'edit',
      label: 'Edit Project',
    },
    {
      onClick: () => console.info('delete project clicked'),
      value: 'delete',
      label: 'Delete Project',
    },
    {
      onClick: () => console.info('view settings clicked'),
      value: 'view',
      label: 'View Settings',
      dontCloseOnClick: true,
    },
  ],
  placement: 'right',
  variant: 'Processing',
}

export default {
  title: 'Atoms/KebabMenuMaterial',
  component: KebabMenuMaterial,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    placement: {
      control: {
        type: 'select',
        options: ['bottom', 'left', 'right'],
      },
    },
    variant: {
      control: {
        type: 'select',
        options: ['Processing', 'White'],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IKebabMenuMaterialProps> = (args) => {
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
      <KebabMenuMaterial {...args} />
    </div>
  )
}
export const Default = Template.bind({})
Default.args = defaultProps

const TemplateOpened: Story<IKebabMenuMaterialProps> = (args) => {
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
      <KebabMenuMaterial {...args} defaultOpened />
    </div>
  )
}
export const Opened = TemplateOpened.bind({})
Opened.args = defaultProps
