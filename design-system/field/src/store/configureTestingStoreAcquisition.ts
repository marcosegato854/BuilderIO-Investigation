/* eslint-disable global-require */
import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'connected-react-router'
import { createMemoryHistory } from 'history'
import { isDev } from 'config'
import { wrapHistory } from 'oaf-react-router/dist'

import createRootReducer from 'store/rootReducer'
import rootSaga from 'store/rootSaga'
import { mockStore } from 'store/mock/mockStoreTests'

const getTestingStore = () => {
  const sagaMiddleware = createSagaMiddleware()

  const projectName = mockStore.dataStorageService.currentProject!.name
  const projectDisk = mockStore.dataStorageService.currentProject!.disk
  const jobName = mockStore.dataStorageService.currentJob!.name
  const history = createMemoryHistory({
    initialEntries: [`/acquisition/${projectDisk}/${projectName}/${jobName}`],
  })

  wrapHistory(history)

  const middlewares = [sagaMiddleware, routerMiddleware(history)]

  if (isDev) {
    // const { createLogger } = require('redux-logger')
    // eslint-disable-next-line import/no-extraneous-dependencies
    const ImmutableStateInvariant =
      require('redux-immutable-state-invariant').default

    middlewares.push(
      // createLogger(),
      ImmutableStateInvariant()
    )
  }

  const testingStore = createStore(
    createRootReducer(history),
    applyMiddleware(...middlewares)
  )

  sagaMiddleware.run(rootSaga)

  return testingStore
}

export { getTestingStore }
