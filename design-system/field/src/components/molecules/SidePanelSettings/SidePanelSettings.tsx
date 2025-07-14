import React, { FC, PropsWithChildren, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewMode } from 'store/features/position/types'
import { Grid, Tab, Tabs } from '@mui/material'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import style from './SidePanelSettings.module.scss'
import { SidePanelSettingsAudio } from './SidePanelSettingsAudio'
import { SidePanelSettingsCamera } from './SidePanelSettingsCamera'
import { SidePanelSettingsMap } from './SidePanelSettingsMap'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}
export interface ISidePanelSettingsProps {
  viewMode: ViewMode
}

/**
 * SidePanelSettings description
 */
export const SidePanelSettings: FC<ISidePanelSettingsProps> = ({
  viewMode,
}: PropsWithChildren<ISidePanelSettingsProps>) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <Grid item container className={style.content}>
      <Grid container marginBottom={2}>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          {viewMode === ViewMode.CAMERA ? (
            <Tab
              label={t(
                'side_panel.settings.camera_settings',
                'camera settings'
              )}
              {...changeTab(0)}
            />
          ) : (
            <Tab
              label={t('side_panel.settings.map_settings', 'map settings')}
              {...changeTab(0)}
            />
          )}
          <Tab
            label={t('side_panel.settings.audio_settings', 'audio settings')}
            {...changeTab(1)}
          />
        </Tabs>
      </Grid>
      {viewMode === ViewMode.CAMERA ? (
        <TabPanel value={tab} index={0} padding={0} cssClass={style.tabPanel}>
          <SidePanelSettingsCamera />
        </TabPanel>
      ) : (
        <TabPanel value={tab} index={0} padding={0} cssClass={style.tabPanel}>
          <SidePanelSettingsMap />
        </TabPanel>
      )}
      <TabPanel value={tab} index={1} padding={0} cssClass={style.tabPanel}>
        <SidePanelSettingsAudio />
      </TabPanel>
    </Grid>
  )
}
