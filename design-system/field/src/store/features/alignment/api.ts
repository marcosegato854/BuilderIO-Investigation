import {
  AlignmentCommandRequest,
  AlignmentCommandResponse,
  AlignmentStatusResponse,
} from 'store/features/alignment/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  ALIGNMENT_COMMAND: 'ALIGNMENT_COMMAND',
  ALIGNMENT_STATUS: 'ALIGNMENT_STATUS',
}

/**
 * CALLS
 */
export default {
  alignmentCommand: (req: AlignmentCommandRequest) =>
    trackProgress(
      apiClient.post<AlignmentCommandResponse>('/position/alignment', req),
      apiCallIds.ALIGNMENT_COMMAND
    ),
  alignmentStatus: () =>
    trackProgress(
      apiClient.get<AlignmentStatusResponse>('/position/alignment'),
      apiCallIds.ALIGNMENT_STATUS
    ),
}
