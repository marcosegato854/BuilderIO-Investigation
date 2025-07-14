import {
  ScannerInfoResponse,
  ScannerSupportedSettingsResponse,
} from 'store/features/scanner/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  SCANNER_SUPPORTED_SETTINGS: 'SCANNER_SUPPORTED_SETTINGS',
  SCANNER_INFO: 'SCANNER_INFO',
}

/**
 * CALLS
 */
export default {
  scannerSupportedSettings: () =>
    trackProgress(
      apiClient.get<ScannerSupportedSettingsResponse>(
        '/scanner/supportedSettings'
      ),
      apiCallIds.SCANNER_SUPPORTED_SETTINGS
    ),
  scannerInfo: () =>
    trackProgress(
      apiClient.get<ScannerInfoResponse>('/scanner'),
      apiCallIds.SCANNER_SUPPORTED_SETTINGS
    ),
}
