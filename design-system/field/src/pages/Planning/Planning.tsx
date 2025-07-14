import { PlanningView } from 'components/organisms/PlanningView/PlanningView'
import React, { FC, PropsWithChildren, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { RouteComponentProps, useParams } from 'react-router-dom'
import {
  clearPlanningHistoryAction,
  planningServiceInitPlanning,
} from 'store/features/planning/slice'

import style from 'pages/Planning/Planning.module.scss'

export interface IPlanningProps extends RouteComponentProps {}

/**
 * Planning description
 */
export const Planning: FC<IPlanningProps> = ({
  history,
}: PropsWithChildren<IPlanningProps>) => {
  const { diskName } = useParams<{ diskName: string }>()
  const { projectName } = useParams<{ projectName: string }>()
  const { jobName } = useParams<{ jobName: string }>()
  const dispatch = useDispatch()

  /**
   * clear history on unmount
   */
  useEffect(() => {
    if (!projectName) return
    if (!diskName) return
    dispatch(
      planningServiceInitPlanning({
        disk: diskName,
        project: projectName,
        job: jobName,
      })
    )
    return () => {
      dispatch(clearPlanningHistoryAction())
    }
  }, [diskName, dispatch, jobName, projectName])

  return (
    <div className={style.container}>
      <PlanningView />
    </div>
  )
}
