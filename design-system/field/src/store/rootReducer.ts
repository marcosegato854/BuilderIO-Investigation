import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { combineReducers } from 'redux'
import { actionsServiceReducer } from 'store/features/actions/slice'
import { alignmentServiceReducer } from 'store/features/alignment/slice'
import { authServiceReducer } from 'store/features/auth/slice'
import { cameraServiceReducer } from 'store/features/camera/slice'
import { coordsysServiceReducer } from 'store/features/coordsys/slice'
import { dataStorageServiceReducer } from 'store/features/dataStorage/slice'
import { dialogsReducer } from 'store/features/dialogs/slice'
import { errorsReducer } from 'store/features/errors/slice'
import { planningServiceReducer } from 'store/features/planning/slice'
import { pointCloudServiceReducer } from 'store/features/pointcloud/slice'
import { positionServiceReducer } from 'store/features/position/slice'
import { routingServiceReducer } from 'store/features/routing/slice'
import { rtkServiceReducer } from 'store/features/rtk/slice'
import { scannerServiceReducer } from 'store/features/scanner/slice'
import { settingsReducer } from 'store/features/settings/slice'
import { speechReducer } from 'store/features/speech/slice'
import { systemServiceReducer } from 'store/features/system/slice'
import { themeReducer } from 'store/features/theme/slice'

export default function createRootReducer(
  history: History
): typeof rootReducer {
  const rootReducer = combineReducers({
    authService: authServiceReducer,
    theme: themeReducer,
    system: systemServiceReducer,
    scanner: scannerServiceReducer,
    dialogs: dialogsReducer,
    dataStorageService: dataStorageServiceReducer,
    cameraService: cameraServiceReducer,
    actionsService: actionsServiceReducer,
    positionService: positionServiceReducer,
    alignmentService: alignmentServiceReducer,
    routingService: routingServiceReducer,
    planningService: planningServiceReducer,
    pointCloudService: pointCloudServiceReducer,
    rtkService: rtkServiceReducer,
    errors: errorsReducer,
    router: connectRouter(history),
    speech: speechReducer,
    settings: settingsReducer,
    coordinateSystemService: coordsysServiceReducer,
  })

  return (state, action) => rootReducer(state, action)
}
