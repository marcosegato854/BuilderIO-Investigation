import { AcquisitionView } from 'components/organisms/AcquisitionView/AcquisitionView'
import { ActivationView } from 'components/organisms/ActivationView/ActivationView'
import style from 'pages/Acquisition/Acquisition.module.scss'
import React, { FC, PropsWithChildren, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RouteComponentProps, useParams } from 'react-router-dom'
import {
  actionsServiceAcquisitionReady,
  actionsServiceActivateSystemAction,
  selectAcquisitionReady,
  selectActivationDone,
} from 'store/features/actions/slice'
import {
  alignmentSubscribeAction,
  alignmentUnsubscribeAction,
} from 'store/features/alignment/slice'
import {
  statusSubscribeAction,
  statusUnsubscribeAction,
} from 'store/features/position/slice'
import { rtkServiceResetCurrentServerConnection } from 'store/features/rtk/slice'
import { IS_TESTING } from 'utils/capabilities'
import { getSectionFromPathname } from 'utils/strings'

export interface IAcquisitionProps extends RouteComponentProps {}

/**
 * Acquisition description
 */
export const Acquisition: FC<IAcquisitionProps> = ({
  history,
}: PropsWithChildren<IAcquisitionProps>) => {
  const activated = useSelector(selectActivationDone)
  const acquisitionReady = useSelector(selectAcquisitionReady)
  const dispatch = useDispatch()
  const { diskName } = useParams<{ diskName: string }>()
  const { projectName } = useParams<{ projectName: string }>()
  const { jobName } = useParams<{ jobName: string }>()

  const displayMap = useMemo(() => {
    return acquisitionReady
  }, [acquisitionReady])

  /** browser back button and history custom handling */
  useEffect(() => {
    try {
      const unblock = history.block((newLocation: unknown) => {
        if (activated) {
          const newPath = (newLocation as Location).pathname
          const section = getSectionFromPathname(newPath)
          if (section !== 'acquisition' && newPath !== '/') {
            console.warn(
              `[ACQUISITION] change location to ${newPath} not allowed in active state`
            )
            return false
          }
        }
        console.info('[ACQUISITION] change location allowed')
        return newLocation as string
      })
      return () => {
        unblock()
      }
    } catch (error) {
      if (!IS_TESTING) {
        console.warn('HISTORY BLOCK FAILED')
        console.error(error)
      }
      return () => {}
    }
  }, [activated, history])

  /** start the activation process */
  useEffect(() => {
    dispatch(
      actionsServiceActivateSystemAction({
        job: jobName,
        project: projectName,
        disk: diskName,
        // TODO: make it translatable when PEO support any character in folder names
        scan: 'Track',
      })
    )
  }, [jobName, projectName, diskName, dispatch])

  /** connect to sockets at mount */
  useEffect(() => {
    console.info('[ACQUISITION] mounted')
    dispatch(statusSubscribeAction())
    dispatch(alignmentSubscribeAction())
    /** disconnect from sockets at unmount */
    return () => {
      console.info('[ACQUISITION] unmounted, disconnect sockets')
      dispatch(statusUnsubscribeAction())
      dispatch(alignmentUnsubscribeAction())
      dispatch(actionsServiceAcquisitionReady(false))
    }
  }, [dispatch])

  /** disable map at unmount */
  useEffect(() => {
    return () => {
      console.info('[ACQUISITION] unmounted, disable map')
      dispatch(actionsServiceAcquisitionReady(false))
    }
  }, [dispatch])

  /** disconnect rtk at unmount */
  useEffect(() => {
    return () => {
      console.info('[ACQUISITION] unmounted, reset rtk')
      dispatch(rtkServiceResetCurrentServerConnection())
    }
  }, [dispatch])

  return (
    <div className={style.container}>
      {!displayMap && <ActivationView activated={activated} />}
      {displayMap && <AcquisitionView />}
    </div>
  )
}
