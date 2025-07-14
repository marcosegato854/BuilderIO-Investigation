/* eslint-disable global-require */
import { isDev } from 'config'
import { routerMiddleware } from 'connected-react-router'
import { createMemoryHistory } from 'history'
import { wrapHistory } from 'oaf-react-router/dist'
import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'

import createRootReducer from 'store/rootReducer'
import rootSaga from 'store/rootSaga'

const getTestingStore = (route: string) => {
  const sagaMiddleware = createSagaMiddleware()

  const history = createMemoryHistory({
    initialEntries: [route],
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
