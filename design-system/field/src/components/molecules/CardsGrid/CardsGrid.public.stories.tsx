import React from 'react'
import { Story, Meta } from '@storybook/react'
import { CardsGrid, GridVariant, ICardsGridProps } from './CardsGrid'
import { IProjectGridItemProps } from '../ProjectGridItem/ProjectGridItem'
import { SortField } from 'store/features/dataStorage/slice'
import { GridSortDirection } from 'store/features/dataStorage/slice'
import moment from 'moment'

const project: IProject = {
  disk: 'p',
  name: 'England',
  jobs: 20,
  // image,
  completed: 10,
}

const defaultItems: IProjectGridItemProps[] = Array(5)
  .fill(-1)
  .map((_, index) => ({
    project: {
      ...project,
      name: `${project.name}${index}`,
      creationdate: moment(new Date()).subtract(index, 'days').toString(),
    },
  }))

const defaultProps: Partial<ICardsGridProps> = {
  items: defaultItems,
  viewBy: GridVariant.GridView,
  search: '',
  sortField: SortField.Name,
  sortDirection: GridSortDirection.Asc,
}

export default {
  title: 'Molecules/CardsGrid',
  component: CardsGrid,
  // See the options: https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    viewBy: {
      defaultValue: defaultProps.viewBy,
      control: {
        type: 'radio',
        options: [GridVariant.GridView, GridVariant.ListView],
      },
    },
    sortField: {
      defaultValue: defaultProps.sortDirection,
      control: {
        type: 'radio',
        options: [
          SortField.Name,
          SortField.CreationDate,
          SortField.LastModified,
        ],
      },
    },
    sortDirection: {
      defaultValue: defaultProps.sortDirection,
      control: {
        type: 'radio',
        options: [GridSortDirection.Asc, GridSortDirection.Desc],
      },
    },
  },
  /**
   * registers callbacks starting with 'on' to actions automatically
   */
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta

const Template: Story<ICardsGridProps> = (args) => {
  return <CardsGrid {...args} />
}

export const Default = Template.bind({})
Default.args = defaultProps
