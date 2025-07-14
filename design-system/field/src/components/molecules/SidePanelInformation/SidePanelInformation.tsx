import { Grid, Tab, Tabs } from '@mui/material'
import { ItemDetails } from 'components/atoms/ItemDetails/ItemDetails'
import { NeededBlock } from 'components/atoms/NeededBlock/NeededBlock'
import { ScrollableOnLeft } from 'components/atoms/ScrollableOnLeft/ScrollableOnLeft'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import React, { FC, PropsWithChildren, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { selectNeeded } from 'store/features/planning/slice'
import { selectAutocaptureNeeded } from 'store/features/routing/slice'
import { getDetails } from 'utils/jobs'
import { hasNeededInfo } from 'utils/planning/plan'
import style from './SidePanelInformation.module.scss'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export interface ISidePanelInformationProps {
  jobInfo?: IJob
}

/**
 * SidePanelInformation description
 */
export const SidePanelInformation: FC<ISidePanelInformationProps> = ({
  jobInfo,
}: PropsWithChildren<ISidePanelInformationProps>) => {
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const needed = useSelector(selectAutocaptureNeeded)
  const planNeeded = useSelector(selectNeeded)
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)

  const currentNeeded = useMemo(() => {
    return needed || planNeeded
  }, [needed, planNeeded])

  const showNeeded = useMemo(
    () => hasNeededInfo(currentNeeded),
    [currentNeeded]
  )

  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const unit = currentProject?.coordinate?.unit || 'metric'

  const details = getDetails(jobInfo, unit)

  return (
    <Grid item container className={style.content}>
      <Grid container marginBottom={2}>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          <Tab
            label={t('side_panel.information.title', 'Job info')}
            {...changeTab(0)}
          />
          {showNeeded && (
            <Tab
              label={t('side_panel.estimations.title', 'estimations')}
              {...changeTab(1)}
              disabled={!currentNeeded}
            />
          )}
        </Tabs>
      </Grid>
      <TabPanel value={tab} index={0} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <div className={style.list}>
            <ItemDetails details={details} variant="bulletListStyle" />
          </div>
        </ScrollableOnLeft>
      </TabPanel>
      {showNeeded && (
        <TabPanel value={tab} index={1} padding={0} cssClass={style.tabPanel}>
          <ScrollableOnLeft>
            <NeededBlock needed={currentNeeded} variant="bigger" />
          </ScrollableOnLeft>
        </TabPanel>
      )}
    </Grid>
  )
}
