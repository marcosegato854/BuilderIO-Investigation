import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { SidePanelInformation } from 'components/molecules/SidePanelInformation/SidePanelInformation'
import { SidePanelMedia } from 'components/molecules/SidePanelMedia/SidePanelMedia'
import { ISound } from 'components/molecules/SidePanelMedia/SidePanelMediaAudio'
import { IImage } from 'components/molecules/SidePanelMedia/SidePanelMediaImage'
import { INote } from 'components/molecules/SidePanelMedia/SidePanelMediaText'
import { SidePanelNotifications } from 'components/molecules/SidePanelNotifications/SidePanelNotifications'
import { SidePanelSettings } from 'components/molecules/SidePanelSettings/SidePanelSettings'
import { SidePanelTracks } from 'components/molecules/SidePanelTracks/SidePanelTracks'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import React, { FC, PropsWithChildren, useMemo, useState } from 'react'
import { ViewMode } from 'store/features/position/types'
import style from './SidePanel.module.scss'
import { Badge } from '@mui/material'

export interface ISidePanelProps {
  /**
   * Flag that tells if the Job is planned or not
   */
  planned: boolean
  /**
   * View mode of the acquisition page
   */
  viewMode: ViewMode
  /**
   * Annotations such as Images, Audios and Notes
   */
  media?: {
    recordings: ISound[]
    images: IImage[]
    notes: INote[]
  }
  /**
   * Job info
   */
  jobInfo: IJob
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * Callback for knowing clicked page
   */
  onPageClick?: (page: string) => void
}

/**
 * SidePanel description
 */
export const SidePanel: FC<ISidePanelProps> = ({
  planned,
  viewMode,
  media,
  jobInfo,
  myVRProvider,
  onPageClick,
}: PropsWithChildren<ISidePanelProps>) => {
  const menu = useMemo(() => {
    const tempMenu: {
      page: string
      icon: JSX.Element
      disabled?: boolean
      notification?: boolean
    }[] = [
      {
        page: 'settings',
        icon: <Icon name="Settings" className={style.sidePanel__menuIcon} />,
        notification: planned ? true : false,
      },
      // {
      //   page: 'media',
      //   icon: <Icon name="Tag" className={style.sidePanel__menuIcon} />,
      //   disabled: true /** DISABLED PEF-1208  */,
      // },
      {
        page: 'information',
        icon: <Icon name="Information" className={style.sidePanel__menuIcon} />,
      },
      {
        page: 'errors',
        icon: (
          <Icon name="Notifications" className={style.sidePanel__menuIcon} />
        ),
      },
    ]

    if (!planned) {
      return tempMenu
    }

    return [
      {
        page: 'tracks',
        icon: <Icon name="Tracks" className={style.sidePanel__menuIcon} />,
      },
      ...tempMenu,
    ]
  }, [planned])

  // values can be: tracks, settings, media, information and errors
  const [page, setPage] = useState(planned ? 'tracks' : '')
  const handleSetPage = (item: string) => {
    setPage((prev) => {
      if (item === prev) {
        onPageClick && onPageClick('')
        return ''
      }
      onPageClick && onPageClick(item)
      return item
    })
  }

  // eslint-disable-next-line consistent-return
  const PageComponent = useMemo(() => {
    switch (page) {
      case 'tracks':
        return () => <SidePanelTracks myVRProvider={myVRProvider} />
      case 'settings':
        return () => <SidePanelSettings viewMode={viewMode} />
      case 'media':
        return () => (
          <SidePanelMedia
            images={media?.images}
            recordings={media?.recordings}
            notes={media?.notes}
          />
        )
      case 'information':
        return () => <SidePanelInformation jobInfo={jobInfo} />
      case 'errors':
        return () => <SidePanelNotifications myVRProvider={myVRProvider} />
      default:
        break
    }
  }, [page, viewMode, jobInfo, media, myVRProvider])

  return (
    <div className={style.sidePanel}>
      {PageComponent && (
        <div className={style.sidePanel__pageContainer}>
          <PageComponent />
        </div>
      )}
      <div className={style.sidePanel__menu}>
        {menu.map((item) => {
          return (
            <button
              key={item.page}
              data-testid={`button-${item.page}`}
              type="button"
              onClick={() => handleSetPage(item.page)}
              className={classNames({
                [style.sidePanel__menuIconContainer]: true,
                [style.sidePanel__menuIconContainer__disabled]:
                  item.disabled === true,
                [style['sidePanel__menuIconContainer--active']]:
                  page === item.page,
              })}
            >
              {item.notification && (
                <Badge
                  overlap="circular"
                  badgeContent=" "
                  variant="dot"
                  sx={{
                    '.MuiBadge-badge': {
                      height: '10px',
                      width: '10px',
                      borderRadius: '50%',
                      boxShadow: '-2px 2px 4px rgba(0, 0, 0, 0.4)',
                      backgroundColor: (theme) => theme.colors.secondary_6,
                    },
                  }}
                >
                  {item.icon}
                </Badge>
              )}
              {!item.notification && item.icon}
            </button>
          )
        })}
      </div>
    </div>
  )
}
