import React, { FC, PropsWithChildren, useState } from 'react'
import { Popover, Container, Grid, Tab, Tabs, Fade } from '@mui/material'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import { SupportForm } from 'components/molecules/SupportForm/SupportForm'
import { Icon } from 'components/atoms/Icon/Icon'
import { useTranslation } from 'react-i18next'
import style from './HelpSupport.module.scss'

export interface IHelpSupportProps {
  onClose?: () => void
}

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

/**
 * HelpSupport description
 */
export const HelpSupport: FC<IHelpSupportProps> = ({
  onClose,
}: PropsWithChildren<IHelpSupportProps>) => {
  const [tab, setTab] = useState(0)
  const anchorEl = document.getElementById('hamburgerMenu')
  const { t } = useTranslation()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <Popover
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      anchorEl={anchorEl}
      onClose={onClose}
      open
      /* Timeout at 0 avoids a wrong width of the highlighted tab when loading for the first time */
      TransitionProps={{ timeout: 0 }}
      TransitionComponent={Fade}
    >
      <Container className={style.container}>
        <div className={style.containerClose}>
          <Icon name="Close" onClick={onClose} />
        </div>
        <Grid
          container
          direction="column"
          alignItems="stretch"
          justifyContent="center"
        >
          <Grid item className={style.header}>
            <Icon name="Help" />
            <h5>{t('helpSupport.header', 'Help & support')}</h5>
          </Grid>
          <Grid item container className={style.content}>
            <div>
              <Grid container>
                <Tabs
                  value={tab}
                  onChange={handleChange}
                  aria-label="help tabs"
                  className={style.tabs}
                >
                  <Tab
                    label={t('helpSupport.contact', 'Contact support')}
                    {...changeTab(0)}
                  />
                  <Tab
                    label={t('helpSupport.helpGuide', 'Help Guide')}
                    {...changeTab(1)}
                  />
                  <Tab
                    label={t('helpSupport.about', 'About')}
                    {...changeTab(2)}
                  />
                </Tabs>
              </Grid>

              <TabPanel cssClass={style.tabpanel} value={tab} index={0}>
                <SupportForm onClose={onClose} />
              </TabPanel>
              <TabPanel cssClass={style.tabpanel} value={tab} index={1}>
                CONTENT UNKNOWN FOR NOW !!!!!!!
              </TabPanel>
              <TabPanel cssClass={style.tabpanel} value={tab} index={2}>
                CONTENT UNKNOWN FOR NOW !!!!!!!
              </TabPanel>
            </div>
          </Grid>
        </Grid>
      </Container>
    </Popover>
  )
}
