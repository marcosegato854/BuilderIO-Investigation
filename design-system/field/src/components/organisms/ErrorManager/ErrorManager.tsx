import { Snackbar, Alert } from '@mui/material'
import { AxiosError } from 'axios'
import React, { FC, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  errorCloseByMessageAction,
  resetErrorsAction,
  selectErrors,
  selectVisibleErrors,
} from 'store/features/errors/slice'
import { shortError } from 'utils/errors'

export interface IErrorManagerProps {}

/**
 * ErrorManager description
 */
export const ErrorManager: FC<{}> = () => {
  const errors = useSelector(selectErrors)
  const isAdmin = useSelector(selectIsAdmin)
  const visibleErrors = useSelector(selectVisibleErrors)
  const dispatch = useDispatch()
  const handleSnackbarClose = () => dispatch(resetErrorsAction())
  const snackbarOpen: boolean = useMemo(() => {
    if (!errors.length) return false
    return errors.length > 0
  }, [errors])
  if (!snackbarOpen) return null
  return (
    <Snackbar
      // key={e}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open
      onClose={handleSnackbarClose}
      message={visibleErrors[0]?.message || ''}
      sx={{ zIndex: 1800 }}
    >
      <div>
        {visibleErrors.map((e, index) => {
          const error = shortError(e as AxiosError)
          return (
            <div key={e.message}>
              <Alert
                variant="filled"
                severity="error"
                onClose={() => dispatch(errorCloseByMessageAction(e.message))}
              >
                {error}
              </Alert>
            </div>
          )
        })}
      </div>
    </Snackbar>
  )
}
