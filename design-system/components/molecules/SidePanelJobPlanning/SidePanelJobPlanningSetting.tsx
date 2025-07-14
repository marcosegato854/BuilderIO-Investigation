/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, Grid, Tab, Tabs, Typography } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import { DialogNames } from 'components/dialogs/dialogNames'
import React, { FC, PropsWithChildren, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import { selectTool, toolAction } from 'store/features/planning/slice'
import { PlanningTools } from 'store/features/planning/types'
import style from './SidePanelJobPlanning.module.scss'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export interface ISidePanelJobPlanningSetting {
  /**
   * open status callback
   */
  onStatusChange?: (opened: boolean) => void
}

// TODO: PLANNING - retrive from the store the job capture date
// TODO: PLANNING - retrive from the store the quality estimations

/**
 * SidePanelJobPlanningSetting description
 */
export const SidePanelJobPlanningSetting: FC<ISidePanelJobPlanningSetting> = ({
  onStatusChange,
}: PropsWithChildren<ISidePanelJobPlanningSetting>) => {
  const dispatch = useDispatch()
  const [tab, setTab] = useState(0)
  const { t } = useTranslation()
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const tool = useSelector(selectTool)
  const [opened, setOpened] = useState<boolean>(true)

  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === tab) {
      setOpened(!opened)
      onStatusChange && onStatusChange(!opened)
      return
    }
    setTab(newValue)
    setOpened(true)
    onStatusChange && onStatusChange(true)
  }

  const seeJobDetailsHandler = () => {
    dispatch(
      openDialogAction({
        component: DialogNames.JobInfo,
        componentProps: {
          initialValues: currentJob,
          disableEdit: true,
        },
      })
    )
  }

  const seeJobQualityHandler = () => {
    dispatch(openDialogAction({ component: DialogNames.PlanQualityForm }))
  }

  const toggleInitialPointTool = useCallback(() => {
    const newTool =
      tool === PlanningTools.INITIAL_POINT
        ? PlanningTools.SELECT
        : PlanningTools.INITIAL_POINT
    dispatch(toolAction(newTool))
  }, [tool, dispatch])

  const toggleFinalPointTool = useCallback(() => {
    const newTool =
      tool === PlanningTools.FINAL_POINT
        ? PlanningTools.SELECT
        : PlanningTools.FINAL_POINT
    dispatch(toolAction(newTool))
  }, [tool, dispatch])

  const caretClickHandler = () => {
    setOpened(!opened)
  }

  return (
    <Grid item container className={style.content}>
      <Icon
        name="Caret"
        className={classNames({ [style.caret]: true, [style.closed]: !opened })}
        onClick={caretClickHandler}
      />
      <Grid container>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          <Tab
            label={t('side_panel.job.setting.title', 'Job setting')}
            {...changeTab(0)}
          />
          {/* THIS SECTION SHOULD BE ACTIVATED WHEN API WILL BE PROVIDED */}
          {/* <Tab
            disabled
            label={t('side_panel.job.quality.title', 'Quality estimation')}
            {...changeTab(1)}
          /> */}
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
        <Grid
          container
          spacing={1}
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Grid item xs={12}>
            <Typography variant="body2" noWrap={true}>
              {t('side_panel.buttons.title', 'alignment')}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={1}>
              <Grid item>
                <Button
                  startIcon={<Icon name="Initial" />}
                  variant={
                    tool === PlanningTools.INITIAL_POINT
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={toggleInitialPointTool}
                  size="small"
                  className={style.settingBtn}
                >
                  <Typography variant="body2" noWrap={true}>
                    {t('side_panel.buttons.initial_point', 'initial')}
                  </Typography>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  startIcon={<Icon name="Final" />}
                  variant={
                    tool === PlanningTools.FINAL_POINT
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={toggleFinalPointTool}
                  size="small"
                  className={style.settingBtn}
                >
                  <Typography variant="body2" noWrap={true}>
                    {t('side_panel.buttons.final_point', 'final')}
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              className={style.detailBtn}
              onClick={seeJobDetailsHandler}
              size="small"
            >
              <Icon name="Information" />
            </Button>
          </Grid>
        </Grid>
        <div className={style.rowBtn}></div>
      </TabPanel>
      <TabPanel
        value={tab}
        index={1}
        padding={0}
        cssClass={classNames({
          [style.tabPanel]: true,
          [style.tabPanelOpened]: opened,
        })}
      >
        {/* THIS SECTION SHOULD BE UPDATED WHEN API WILL BE PROVIDED */}
        {/* <div className={style.rowPicker}>
          <div className={style.rowPickerDate}>
            <label>
              {t('side_panel.job.quality.captureDate', 'Capture Date')}:
            </label>
            <span>
              <Icon name="Calendar" />
              16/05/2020
            </span>
          </div>
          <div className={style.rowPickerTime}>
            <label>{t('side_panel.job.quality.time', 'Time')}:</label>
            <span>
              <Icon name="Clock" />
              09:10
            </span>
            <label>{t('side_panel.job.quality.to', 'to')}:</label>
            <span>
              <Icon name="Clock" />
              10:10
            </span>
          </div>
        </div> */}
        <div className={style.rowBtn}>
          <Button
            variant="outlined"
            fullWidth
            className={style.detailBtn}
            onClick={seeJobQualityHandler}
          >
            <Icon name="SeeDetail" />
            {t('side_panel.job.details', 'See details')}
          </Button>
        </div>
        <div className={style.rowDetails}>
          <p>
            {t('side_panel.job.quality.satType', 'Satellite type')}:{' '}
            {currentJob?.position?.satellites?.map((satellite) => {
              return <span key={satellite}>{satellite} </span>
            })}
          </p>
          {/* THIS SECTION SHOULD BE UPDATED WHEN API WILL BE PROVIDED */}
          {/* <p>{t('side_panel.job.quality.satNr', 'Number of satellite"')}: 5</p>
          <p>
            {t('side_panel.job.quality.startTime', 'Best time to start"')}: 3.00
            PM
          </p> */}
        </div>
      </TabPanel>
    </Grid>
  )
}
