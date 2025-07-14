/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollableOnLeft } from 'components/atoms/ScrollableOnLeft/ScrollableOnLeft'
import { Grid, Tab, Tabs } from '@mui/material'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import style from './SidePanelMedia.module.scss'
import { INote, SidePanelMediaText } from './SidePanelMediaText'
import { IImage, SidePanelMediaImage } from './SidePanelMediaImage'
import { ISound, SidePanelMediaAudio } from './SidePanelMediaAudio'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export interface ISidePanelMediaProps {
  recordings?: ISound[]
  images?: IImage[]
  notes?: INote[]
}

/**
 * SidePanelMedia description
 */
export const SidePanelMedia: FC<ISidePanelMediaProps> = ({
  recordings,
  images,
  notes,
}: PropsWithChildren<ISidePanelMediaProps>) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <Grid item container className={style.content}>
      <Grid container marginBottom={2}>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          <Tab label={t('side_panel.media.audio', 'Audio')} {...changeTab(0)} />
          <Tab label={t('side_panel.media.image', 'Image')} {...changeTab(1)} />
          <Tab label={t('side_panel.media.text', 'Text')} {...changeTab(2)} />
        </Tabs>
      </Grid>
      <TabPanel value={tab} index={0} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <SidePanelMediaAudio recordings={recordings} />
        </ScrollableOnLeft>
      </TabPanel>
      <TabPanel value={tab} index={1} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <SidePanelMediaImage images={images} />
        </ScrollableOnLeft>
      </TabPanel>
      <TabPanel value={tab} index={2} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <SidePanelMediaText notes={notes} />
        </ScrollableOnLeft>
      </TabPanel>
    </Grid>
  )
}
