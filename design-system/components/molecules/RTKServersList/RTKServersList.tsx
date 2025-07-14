/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import { RTKServersListItem } from 'components/molecules/RTKServersListItem/RTKServersListItem'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { equals, omit, pick } from 'ramda'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  rtkServiceDeleteServerActions,
  rtkServiceResetCurrentServerConnection,
  rtkServiceSetCurrentServer,
  selectRtkCurrentServer,
  selectRtkServers,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'
import style from './RTKServersList.module.scss'

const essential: (s: RtkServer) => RtkServer = pick([
  'name',
  'server',
  'user',
  'password',
  /* 'id', */
])

export interface IRTKServersListProps {
  initialValues?: RtkServer
  onUpdate?: (server: RtkServer) => void
  onConnect?: (server: RtkServer) => void
}

const tempServer: RtkServer = {
  name: '',
  password: '',
  server: '',
  user: '',
  temporary: true,
}

/**
 * Interactive list of RTK servers which users can connect to, modify params and delete.
 */
export const RTKServersList: FC<IRTKServersListProps> = ({
  onUpdate,
  initialValues,
  onConnect,
}) => {
  const { t } = useTranslation()
  const servers = useSelector(selectRtkServers)
  const currentServer = useSelector(selectRtkCurrentServer)
  const [openedItemIndex, setOpenedItemIndex] = useState<number>()
  const dispatch = useDispatch()

  const onEditHandler = () => {
    dispatch(rtkServiceResetCurrentServerConnection())
    setOpenedItemIndex(undefined) // to handle not opening on connect without flickering
  }

  const onConnectHandler = useCallback(
    (serverToConnect: RtkServer) => {
      setOpenedItemIndex(-1)
      onConnect && onConnect(serverToConnect)
    },
    [onConnect]
  )

  const onDeleteHandler = useCallback(
    (serverToDelete: RtkServer) => {
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'warning',
            cancelButtonLabel: t('rtk.server.delete_dialog.cancel', 'cancel'),
            okButtonCallback: () => {
              if (currentServer && currentServer.id) {
                if (currentServer.id === serverToDelete.id) {
                  dispatch(rtkServiceSetCurrentServer(null))
                }
              }
              dispatch(rtkServiceDeleteServerActions.request(serverToDelete))
            },
            okButtonLabel: t('rtk.server.delete_dialog.confirm', 'yes'),
            text: t('rtk.server.delete_dialog.text', 'text'),
            title: t('rtk.server.delete_dialog.title', 'title'),
          } as IAlertProps,
        })
      )
    },
    [currentServer, dispatch, t]
  )

  /**
   * Remove id if present
   * Change name if connecting to an edited server (listed but not saved)
   */
  const handleNotInListServer = useCallback(
    (server: RtkServer) => {
      if (server && server.id) {
        if (servers && servers.find((s) => s.id === server.id)) {
          const newServer: RtkServer = {
            ...server,
            name: `${t('rtk.server.form.copy', 'copy')}_${server.name}`,
          }
          return omit(['id'], newServer)
        }
        return omit(['id'], server)
      }
      return server
    },
    [servers, t]
  )

  const serverList: RtkServer[] = useMemo(() => {
    const serversArray = servers || []
    const notInTheListServer = serversArray.find((s) => {
      if (!currentServer) return false
      return equals(essential(s), essential(currentServer))
    })
      ? null
      : handleNotInListServer(currentServer!)
    return [...serversArray, notInTheListServer].filter(
      (s) => s && (s.name || s.temporary)
    ) as RtkServer[]
  }, [servers, handleNotInListServer, currentServer])

  const isEmpty = useMemo(() => {
    return serverList ? serverList.length <= 0 : true
  }, [serverList])

  const newItemHandler = () => {
    setOpenedItemIndex(undefined)
    dispatch(rtkServiceSetCurrentServer(tempServer))
  }

  const onCancelHandler = () => {
    setOpenedItemIndex(undefined)
    dispatch(rtkServiceSetCurrentServer(null))
  }

  useEffect(() => {
    if (openedItemIndex !== -1) {
      // to handle not opening on connect without flickering
      if (currentServer) {
        const newIndex = serverList.findIndex((s) => {
          return equals(essential(s), essential(currentServer))
        })
        if (newIndex >= 0) {
          setOpenedItemIndex(newIndex)
        } else {
          setOpenedItemIndex(undefined)
        }
      }
    }
  }, [currentServer, serverList, setOpenedItemIndex, openedItemIndex])

  return (
    <div
      className={classNames({ [style.list]: true, [style.empty]: isEmpty })}
      data-testid="rtk-servers-list"
    >
      {serverList.map((server, i, arr) => {
        const connected =
          currentServer?.connected &&
          equals(essential(currentServer), essential(server))
        const key = `option-${server.id}`
        const isEditing = i === openedItemIndex
        return (
          <RTKServersListItem
            key={key}
            server={server}
            connected={!!connected}
            onUpdate={onUpdate}
            onDelete={onDeleteHandler}
            onEdit={onEditHandler}
            onConnect={onConnectHandler}
            isEditing={isEditing}
            isTemporary={server.temporary}
            onCancel={onCancelHandler}
          />
        )
      })}
      <div
        className={classNames({
          [style.newItem]: true,
          [style.newItemTm]: !isEmpty,
          [style.newItemDisable]: currentServer?.temporary,
        })}
        onClick={newItemHandler}
        role="button"
        data-testid="new-server-button"
      >
        <div className={style.newItemHeader}>
          {t('rtk.server.add_new', 'add new server')}
        </div>
        <Icon name="Plus" />
      </div>
    </div>
  )
}
