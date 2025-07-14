/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Grid } from '@mui/material'
import classNames from 'classnames'
import { HamburgerMenu } from 'components/molecules/HamburgerMenu/HamburgerMenu'
import { PerformanceStatus } from 'components/molecules/PerformanceStatus/PerformanceStatus'
import style from 'components/organisms/Header/Header.module.scss'
import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  selectDataStorageCurrentDisk,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import { selectResponsiveness } from 'store/features/system/slice'
import { SystemResponsiveness } from 'store/features/system/types'

export interface IHeaderProps {
  /**
   * Title label on the left
   */
  title?: string
  /**
   * Title on the center
   */
  centerText?: string
  /**
   * React component diplayed in the top left column
   */
  leftCta?: ReactNode
  /**
   * React component diplayed on the bottom right column
   */
  rightComponent?: ReactNode
  /**
   * Current pathname
   */
  pathname?: string
}

/**
 * Page header
 */
export const Header: FC<IHeaderProps> = ({
  title,
  centerText,
  leftCta,
  rightComponent,
  pathname,
}: PropsWithChildren<IHeaderProps>) => {
  const { t } = useTranslation()
  const responsiveness = useSelector(selectResponsiveness)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentDisk = useSelector(selectDataStorageCurrentDisk)
  const [performance, setPerformance] = useState<SystemResponsiveness>()

  useEffect(() => {
    if (responsiveness) {
      /**
       * If we're not in the projects list and there's a currentProject, we should display the project disk information
       */
      if (currentProject && currentDisk && pathname !== 'projects') {
        // TODO: not needed if we update disks data with the reponsiveness API too
        const updatedDisk = responsiveness.storage?.details?.disks?.find(
          (d) => d.name === currentDisk?.name
        )
        if (!updatedDisk) {
          console.warn(`[RESPONSIVENESS] disk ${currentDisk.name} not found`)
          return
        }
        const newPerformance: SystemResponsiveness = {
          ...responsiveness,
          storage: {
            ...responsiveness.storage,
            ...updatedDisk,
          },
        }
        setPerformance(newPerformance)
        return
      }
      setPerformance(responsiveness)
    }
  }, [currentProject, currentDisk, responsiveness, pathname])
  return (
    <div className={style.container}>
      <Grid container spacing={0}>
        <Grid container spacing={0}>
          <Grid item xs={5}>
            {leftCta || ' '}
          </Grid>
          <Grid item xs={2} className={style.pegasus}>
            {t('header.pegasus', 'pegasus')}
          </Grid>
          <Grid item xs={5}>
            {performance && <PerformanceStatus {...performance} />}
          </Grid>
        </Grid>

        {/* Render second grid if and only if either title or centerText props are passed */}
        {(title || centerText) && (
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <h1 className={style.leftTitle}>
                {title && (
                  <span
                    className={classNames({
                      [style.leftTitleActive]: true,
                    })}
                  >
                    {title}
                  </span>
                )}
              </h1>
            </Grid>
            <Grid item xs={6} zeroMinWidth>
              <h1
                /* className={classNames({
                  [style.centerTitle]: true,
                  [style.centerTitleTruncate]: rightComponent,
                })} */
                className={style.centerTitle}
              >
                {centerText}
              </h1>
            </Grid>
            <Grid item xs={3}>
              {rightComponent}
            </Grid>
          </Grid>
        )}
      </Grid>
      <div className={style.hamburgerMenu}>
        <HamburgerMenu />
      </div>
    </div>
  )
}
