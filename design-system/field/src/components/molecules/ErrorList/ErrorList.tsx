import React, { FC, useMemo } from 'react'
import { Grid } from '@mui/material'
import { useSelector } from 'react-redux'
import { selectSystemNotifications } from 'store/features/system/slice'
import { ErrorItem } from 'components/atoms/ErrorItem/ErrorItem'
import { SystemNotificationType } from 'store/features/system/types'

export const ErrorList: FC = () => {
  const notifications = useSelector(selectSystemNotifications)

  const orderednotification = useMemo(() => {
    if (!notifications) return []
    return [...notifications].reverse()
  }, [notifications])

  return (
    <Grid container direction="column" spacing={0.25}>
      {orderednotification?.map((notification, index) => (
        <Grid item data-testid="error-list-item" key={index}>
          <ErrorItem
            title={notification.description}
            type={
              notification.type === SystemNotificationType.ERROR
                ? 'Error'
                : 'Warning'
            }
            datetime={
              notification.time
                ? notification.time.replace('T', ' ')
                : undefined
            }
          />
        </Grid>
      ))}
    </Grid>
  )
}
