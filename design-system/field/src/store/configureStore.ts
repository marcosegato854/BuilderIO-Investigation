/* eslint-disable global-require */
import { applyMiddleware, createStore } from 'redux'
import {
  createMigrate,
  persistReducer,
  persistStore,
  MigrationManifest,
  Persistor,
} from 'redux-persist'
import localForage from 'localforage'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'connected-react-router'
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction' // TODO: we could disable it in production
import { isDev } from 'config'
import history from 'utils/history'
import createRootReducer from 'store/rootReducer'
import rootSaga from 'store/rootSaga'
import { IS_TESTING } from 'utils/capabilities'

const sagaMiddleware = createSagaMiddleware()

const migrations: MigrationManifest = {
  // Add redux migrations here
}

const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 0,
    storage: localForage,
    whitelist: [
      // 'authService', // should not save isAuthenticating, try https://github.com/rt2zz/redux-persist/issues/277
      'theme',
      'scanner',
      'dataStorageService',
    ],
    debug: isDev,
    migrate: createMigrate(migrations, { debug: isDev }),
  },
  createRootReducer(history)
)

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

const store = IS_TESTING
  ? createStore(createRootReducer(history), applyMiddleware(...middlewares))
  : createStore(
      persistedReducer,
      composeWithDevTools(applyMiddleware(...middlewares))
    )

const dummy: Persistor = (() => {}) as unknown as Persistor
const persistor = IS_TESTING ? dummy : persistStore(store)

sagaMiddleware.run(rootSaga)

export { store, persistor }
