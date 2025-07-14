import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'

/**
 * Hook that handles back/forward browser buttons
 * @returns [IClickableOption[], number]
 */
const useBackForward = (onBack?: () => void, onForward?: () => void) => {
  const [locationKeys, setLocationKeys] = useState([])
  const history = useHistory()
  const dispatch = useDispatch()
  useEffect(() => {
    return history.listen((location) => {
      if (history.action === 'PUSH') {
        setLocationKeys([location.key as never])
      }
      if (history.action === 'POP') {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([_, ...keys]) => keys)
          onForward && onForward()
          dispatch(closeAllDialogsAction())
        } else {
          setLocationKeys((keys) => [location.key as never, ...keys])
          onBack && onBack()
          dispatch(closeAllDialogsAction())
        }
      }
    })
  }, [locationKeys, history, onBack, onForward, dispatch])
}
export default useBackForward
