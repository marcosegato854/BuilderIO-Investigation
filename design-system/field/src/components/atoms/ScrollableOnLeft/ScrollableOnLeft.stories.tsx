import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ScrollableOnLeft, IScrollableOnLeftProps } from './ScrollableOnLeft'
import translations from '../../../../public/assets/i18n/en/translation.json'

// Example of how we should declare attributes' default values:

// 1) Declare the default value with the right type and initilize it
// const defaultProps: IScrollableOnLeftProps = {}

export default {
  title: 'Atoms/ScrollableOnLeft',
  component: ScrollableOnLeft,
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

const Template: Story<IScrollableOnLeftProps> = (args) => {
  return (
    <div
      style={{
        background: '#333333',
        width: '250px',
        padding: '20px',
        height: '250px',
        position: 'relative',
        textAlign: 'left',
      }}
    >
      <ScrollableOnLeft {...args}>
        <div style={{ padding: '0 10px' }}>
          {translations.new_job_form.image_blur.text}
        </div>
      </ScrollableOnLeft>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}
