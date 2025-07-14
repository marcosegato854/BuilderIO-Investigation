import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Provider } from 'react-redux'
import { AlignmentDialog, AlignmentPhase } from 'store/features/alignment/types'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { AlignmentToast } from './AlignmentToast'

export default {
  title: 'Molecules/AlignmentToast',
  component: AlignmentToast,
  argTypes: {},
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

/** TimeBasedDynamic */
const StoreTimeBasedDynamic = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      remaining: 20,
      isFailure: false,
      isComplete: false,
      description: 'Move on a straight line at least at the speed of 30km/h',
      messageCode: 'STRAIGHT',
      dialog: AlignmentDialog.TIME_BASED_DYMANIC,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateTimeBasedDynamic: Story = (args) => {
  return (
    <Provider store={StoreTimeBasedDynamic}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const TimeBasedDynamic = TemplateTimeBasedDynamic.bind({})
TimeBasedDynamic.args = {}

/** DynamicConfirmation */
const StoreDynamicConfirmation = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      isFailure: false,
      isComplete: true,
      description: 'Dynamic alignment is done successfully',
      messageCode: 'DYNDONE',
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateDynamicConfirmation: Story = (args) => {
  return (
    <Provider store={StoreDynamicConfirmation}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const DynamicConfirmation = TemplateDynamicConfirmation.bind({})
DynamicConfirmation.args = {}

/** DynamicConfirmation Failure */
const StoreDynamicConfirmationFailure = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      isFailure: true,
      isComplete: true,
      description: 'Dynamic alignment failed',
      messageCode: 'DYNDONE',
      dialog: AlignmentDialog.DYNAMIC_CONFIRMATION,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateDynamicConfirmationFailure: Story = (args) => {
  return (
    <Provider store={StoreDynamicConfirmationFailure}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const DynamicConfirmationFailure =
  TemplateDynamicConfirmationFailure.bind({})
DynamicConfirmationFailure.args = {}

/** MetersBasedDynamic */
const StoreMetersBasedDynamic = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      remaining: 20,
      isFailure: false,
      isComplete: false,
      description: 'Move on a straight line at least at the speed of 30km/h',
      messageCode: 'METDYN',
      dialog: AlignmentDialog.METERS_BASED_DYNAMIC,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateMetersBasedDynamic: Story = (args) => {
  return (
    <Provider store={StoreMetersBasedDynamic}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const MetersBasedDynamic = TemplateMetersBasedDynamic.bind({})
MetersBasedDynamic.args = {}

/** Static */
const StoreStatic = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      remaining: 20,
      isFailure: false,
      isComplete: true,
      description: "Please don't move until the time is finished",
      messageCode: 'STATIC',
      dialog: AlignmentDialog.STATIC,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateStatic: Story = (args) => {
  return (
    <Provider store={StoreStatic}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const Static = TemplateStatic.bind({})
Static.args = {}

/** StaticConfirmation */
const StoreStaticConfirmation = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      isFailure: false,
      isComplete: false,
      description: 'Static Alignment is done successfully',
      messageCode: 'STATIC',
      dialog: AlignmentDialog.STATIC_CONFIRMATION,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateStaticConfirmation: Story = (args) => {
  return (
    <Provider store={StoreStaticConfirmation}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const StaticConfirmation = TemplateStaticConfirmation.bind({})
StaticConfirmation.args = {}

/** StaticConfirmationFailed */
const StoreStaticConfirmationFailed = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      isFailure: true,
      isComplete: false,
      description: 'Static Alignment failed',
      messageCode: 'STATIC',
      dialog: AlignmentDialog.STATIC_CONFIRMATION,
      alignmentPhase: AlignmentPhase.INITIAL,
    },
    alignmentSocketConnected: false,
  },
})

const TemplateStaticConfirmationFailed: Story = (args) => {
  return (
    <Provider store={StoreStaticConfirmationFailed}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const StaticConfirmationFailed = TemplateStaticConfirmationFailed.bind(
  {}
)
StaticConfirmationFailed.args = {}

/** Test */
const StoreTest = configureMockStore()({
  ...mockStore,
  system: {
    ...mockStore.system,
    systemState: {
      state: 'InitialAlignment',
    },
  },
  alignmentService: {
    alignmentState: {
      remaining: 9.25,
      isFailure: false,
      isComplete: false,
      description: '{time} static alignment',
      messageCode: 'AN4',
      time: 90,
      dialog: 4,
      alignmentPhase: 'FinalAlignment',
    },
    alignmentSocketConnected: false,
  },
})

const TemplateTest: Story = (args) => {
  return (
    <Provider store={StoreTest}>
      <AlignmentToast {...args} />
    </Provider>
  )
}

export const Test = TemplateTest.bind({})
Test.args = {}
