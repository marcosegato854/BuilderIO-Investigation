import { SidePanelJobPlanningNeeded } from 'components/molecules/SidePanelJobPlanning/SidePanelJobPlanningNeeded'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import React, { FC, PropsWithChildren, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectNeeded } from 'store/features/planning/slice'
import { hasNeededInfo } from 'utils/planning/plan'
import style from './SidePanelJobPlanning.module.scss'
import { SidePanelJobPlanningPlan } from './SidePanelJobPlanningPlan'
import { SidePanelJobPlanningSetting } from './SidePanelJobPlanningSetting'

export interface ISidePanelJobPlanningProps {
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * SidePanelJobPlanning description
 */
export const SidePanelJobPlanning: FC<ISidePanelJobPlanningProps> = ({
  myVRProvider,
}: PropsWithChildren<ISidePanelJobPlanningProps>) => {
  const [settingsClosed, setSettingsClosed] = useState<boolean>(false)
  const [planClosed, setPlanClosed] = useState<boolean>(false)
  const [neededClosed, setNeededClosed] = useState<boolean>(false)
  const needed = useSelector(selectNeeded)
  const onSettingsStatusChange = (opened: boolean) => {
    setSettingsClosed(!opened)
  }
  const onPlanStatusChange = (opened: boolean) => {
    setPlanClosed(!opened)
  }
  const onNeededStatusChange = (opened: boolean) => {
    setNeededClosed(!opened)
  }
  const showNeeded = useMemo(() => hasNeededInfo(needed), [needed])

  return (
    <div className={style.container}>
      <SidePanelJobPlanningSetting onStatusChange={onSettingsStatusChange} />
      <SidePanelJobPlanningPlan
        myVRProvider={myVRProvider}
        onStatusChange={onPlanStatusChange}
      />
      {showNeeded && (
        <SidePanelJobPlanningNeeded
          myVRProvider={myVRProvider}
          onStatusChange={onNeededStatusChange}
        />
      )}
    </div>
  )
}
