import {
  PointCloudStateResponse,
  PointCloudFolderResponse,
  PointCloudHspcListResponse,
} from 'store/features/pointcloud/types'
import apiClient from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  POINTCLOUD_STATE: 'POINTCLOUD_STATE',
  POINTCLOUD_ADD_FOLDER: 'POINTCLOUD_ADD_FOLDER',
  POINTCLOUD_CHECK_HSPC: 'POINTCLOUD_CHECK_HSPC',
  POINTCLOUD_HSPC_LIST: 'POINTCLOUD_HSPC_LIST',
}

/**
 * CALLS
 */
export default {
  pointCloudState: () =>
    trackProgress(
      apiClient.get<PointCloudStateResponse>('/pointcloud/state'),
      apiCallIds.POINTCLOUD_STATE
    ),
  addFolder: (projectName: string, jobName: string) =>
    trackProgress(
      apiClientNode.get<PointCloudFolderResponse>(
        `addFolder/${projectName}/${jobName}`
      ),
      apiCallIds.POINTCLOUD_ADD_FOLDER
    ),
  checkHspc: (projectName: string, jobName: string) =>
    trackProgress(
      apiClientNode.get(`/pointCloud/${projectName}/${jobName}/tree.hspc`),
      apiCallIds.POINTCLOUD_ADD_FOLDER
    ),
  hspcList: () =>
    trackProgress(
      apiClient.get<PointCloudHspcListResponse>(`pointcloud/hspc`),
      apiCallIds.POINTCLOUD_HSPC_LIST
    ),
}
