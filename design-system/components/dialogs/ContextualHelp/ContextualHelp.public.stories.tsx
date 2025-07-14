import React from 'react'
import { Story, Meta } from '@storybook/react'
import ContextualHelp, { IContextualHelpProps } from './ContextualHelp'

const defaultProps: IContextualHelpProps = {
  title: 'Positioning accuracy',
  $type: 'Image',
  $imageURL:
    'https://cdn.euroncap.com/media/62863/genesis-g80.png?mode=crop&width=308&height=204',
  text: '<p>Contrary to popular belief, <b>Lorem Ipsum</b> is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.</p><p>Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p><p>Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC.</p><p>This book is a treatise on the theory of ethics, very popular during the Renaissance.</p><p>The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>',
}

export default {
  title: 'Dialogs/ContextualHelp',
  component: ContextualHelp,
  argTypes: {
    $type: {
      defaultValue: defaultProps.$type,
      control: {
        type: 'select',
        options: ['Image', 'Text'],
      },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<IContextualHelpProps> = (args) => {
  return <ContextualHelp {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
