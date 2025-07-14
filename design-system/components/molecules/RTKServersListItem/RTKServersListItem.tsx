/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames'
import { RTKServerForm } from 'components/molecules/RTKServerForm/RTKServerForm'
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  rtkServiceSetCurrentServer,
  selectRtkServers,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './RTKServersListItem.module.scss'

export interface IRTKServersListItemProps {
  server: RtkServer
  connected: boolean
  onUpdate?: (server: RtkServer) => void
  onConnect?: (server: RtkServer) => void
  onDelete?: (server: RtkServer) => void
  onEdit: Function
  onCancel?: Function
  isEditing: boolean
  isTemporary?: boolean
}

/**
 * RTKServersListItem description
 */
export const RTKServersListItem: FC<IRTKServersListItemProps> = ({
  server,
  connected,
  onUpdate,
  onConnect,
  onDelete,
  onEdit,
  onCancel,
  isEditing,
  isTemporary,
}: PropsWithChildren<IRTKServersListItemProps>) => {
  const { t } = useTranslation()
  const { name, server: url } = server
  const serverConnected = connected ? 'server-item-connected' : ''
  const dispatch = useDispatch()
  const servers = useSelector(selectRtkServers)
  const isServerListed = useMemo(() => {
    return servers ? !!servers.find((s) => s.id === server.id) : false
  }, [servers, server])

  /**
   * authenticate
   */
  const connectToServer = useCallback(
    (serverToConnect: RtkServer) => {
      onConnect && onConnect(serverToConnect)
    },
    [onConnect]
  )

  const onClickConnect = useCallback(() => {
    connectToServer(server)
  }, [connectToServer, server])
  /**
   * edit server
   */
  const onClickEdit = useCallback(() => {
    dispatch(rtkServiceSetCurrentServer(server))
    onEdit(`option-${server.id}`)
  }, [dispatch, onEdit, server])
  /**
   * delete server
   */
  const onClickDelete = useCallback(() => {
    onDelete && onDelete(server)
  }, [onDelete, server])

  const onClickClose = useCallback(() => {
    onCancel && onCancel()
  }, [onCancel])

  const connectionIcon = connected ? (
    <Icon name="Connected" />
  ) : (
    <Icon
      name="Disconnected"
      className={style.iconsListAction}
      data-testid="icon-connect"
      onClick={onClickConnect}
    />
  )

  const itemTitle = useMemo(() => {
    return isTemporary ? (
      <h1 className={classNames(style.name)}>
        {t('rtk.server.temporary', 'new server')}
      </h1>
    ) : (
      <>
        <h1 className={classNames(style.name, style.truncate)}>{name}</h1>
        <h2 className={classNames(style.ipAddress, style.truncate)}>
          {`IP: ${url}`}
        </h2>
      </>
    )
  }, [isTemporary, name, url, t])

  return (
    <div
      className={classNames({
        [style.item]: true,
        [style.itemEditing]: isEditing,
        [style.itemNotListed]: !isServerListed,
      })}
      data-testid="server-item"
    >
      <div className={style.itemHeader}>
        <div className={style.info}>{itemTitle}</div>

        <div className={style.iconsList} data-testid={serverConnected}>
          {!isEditing && connectionIcon}
          {!isEditing && (
            <Icon
              name="EditUnderlined"
              className={style.iconsListAction}
              data-testid="icon-edit"
              onClick={onClickEdit}
            />
          )}
          {isServerListed && (
            <Icon
              name="Bin"
              className={style.iconsListAction}
              data-testid="icon-delete"
              onClick={onClickDelete}
            />
          )}
          {!isServerListed && isEditing && (
            <Icon
              name="Close2"
              className={style.iconsListAction}
              onClick={onClickClose}
            />
          )}
        </div>
      </div>
      {isEditing && (
        <div className={style.rtkServerFormContainer}>
          <RTKServerForm
            onUpdate={onUpdate}
            initialValues={server}
            connected={connected}
            onCancel={onEdit}
            onConnect={connectToServer}
          />
        </div>
      )}
    </div>
  )
}
