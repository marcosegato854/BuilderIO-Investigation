import createRootReducer from 'store/rootReducer'

/**
 * RootState - type representing root state-tree
 */
export type RootState = ReturnType<ReturnType<typeof createRootReducer>>
