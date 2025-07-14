import { Polyline } from 'components/organisms/PlanningView/Polyline'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { FC, PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { selectPointCloudProjection } from 'store/features/pointcloud/slice'
import {
  selectPolyline,
  selectRoutingEnabled,
} from 'store/features/routing/slice'
import { isMobile } from 'utils/capabilities'

export interface IAcquisitionRoutingFeaturesProps {
  /**
   * myVRProvider instance
   */
  myVRProvider?: MyVRProvider
}

const TERRAIN_HEIGHT_TOLERANCE = 0.3
const mobile = isMobile()

/**
 * Wraps myVR Features without visual React components, to minimize the impact of rerenders on socket updates
 */
export const AcquisitionRoutingFeatures: FC<IAcquisitionRoutingFeaturesProps> =
  ({ myVRProvider }: PropsWithChildren<IAcquisitionRoutingFeaturesProps>) => {
    const polyline = useSelector(selectPolyline)
    const routingEnabled = useSelector(selectRoutingEnabled)
    const projection = useSelector(selectPointCloudProjection)

    return myVRProvider && routingEnabled && polyline ? (
      <Polyline
        polygon={polyline}
        myVRProvider={myVRProvider}
        id={1}
        projection={projection}
      />
    ) : null
  }
