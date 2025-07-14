import { Grid, Tab, Tabs } from '@mui/material'
import classNames from 'classnames'
import { NeededBlock } from 'components/atoms/NeededBlock/NeededBlock'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import React, { FC, PropsWithChildren, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectNeeded } from 'store/features/planning/slice'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/molecules/SidePanelJobPlanning/SidePanelJobPlanning.module.scss'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export interface ISidePanelJobPlanningNeededProps {
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * open status callback
   */
  onStatusChange?: (opened: boolean) => void
}

/**
 * SidePanelJobPlanningNeeded description
 */
export const SidePanelJobPlanningNeeded: FC<ISidePanelJobPlanningNeededProps> =
  ({
    myVRProvider,
    onStatusChange,
  }: PropsWithChildren<ISidePanelJobPlanningNeededProps>) => {
    const [tab, setTab] = useState(0)
    const { t } = useTranslation()
    const [opened, setOpened] = useState<boolean>(true)
    const needed = useSelector(selectNeeded)

    const changeTabHandler = (
      event: React.SyntheticEvent,
      newValue: number
    ) => {
      if (newValue === tab) {
        setOpened(!opened)
        onStatusChange && onStatusChange(!opened)
        return
      }
      setTab(newValue)
      setOpened(true)
      onStatusChange && onStatusChange(true)
    }

    const caretClickHandler = () => {
      setOpened(!opened)
    }

    return (
      <Grid item container className={style.content}>
        <Icon
          name="Caret"
          className={classNames({
            [style.caret]: true,
            [style.closed]: !opened,
          })}
          onClick={caretClickHandler}
        />
        <div>
          <Grid container>
            <Tabs
              value={tab}
              onChange={changeTabHandler}
              aria-label="help tabs"
            >
              <Tab
                label={t('side_panel.job.needed.title', 'estimations')}
                {...changeTab(0)}
              />
            </Tabs>
          </Grid>

          <TabPanel
            value={tab}
            index={0}
            padding={0}
            cssClass={classNames({
              [style.tabPanel]: true,
              [style.tabPanelOpened]: opened,
            })}
          >
            <NeededBlock needed={needed} />
          </TabPanel>
        </div>
      </Grid>
    )
  }
