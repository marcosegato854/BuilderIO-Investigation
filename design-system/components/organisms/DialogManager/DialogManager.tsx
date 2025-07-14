import React, { FC, Suspense, useMemo } from 'react'
import Dialog from '@mui/material/Dialog'
import Zoom from '@mui/material/Zoom'
import { TransitionProps } from '@mui/material/transitions'
import * as DialogComponents from 'components/dialogs'
import { useSelector } from 'react-redux'
import { selectDialogs } from 'store/features/dialogs/slice'
import { createHmac } from 'crypto'

// import style from './DialogManager.module.scss'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Zoom ref={ref} {...props} />
})

const hash = (str: string): string =>
  createHmac('sha256', str || '')
    .update('I love cupcakes')
    .digest('hex')
    .toString()

/**
 * Manages global dialogs visualization
 */
export const DialogManager: FC<{}> = () => {
  const dialogs = useSelector(selectDialogs)

  /**
   * recover the dialog component dynamically
   */
  const Contents = useMemo(() => {
    return dialogs.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dialog) => (DialogComponents as any)[dialog?.component] || null
    )
  }, [dialogs])

  return (
    <>
      {dialogs.map((dialog, index) => {
        const { componentProps, dialogProps } = dialog
        const Content = Contents[index]
        return (
          <Dialog
            // eslint-disable-next-line react/no-array-index-key
            key={hash(JSON.stringify(dialog))}
            open
            TransitionComponent={Transition}
            maxWidth={false}
            scroll="body"
            {...dialogProps}
          >
            {Content && (
              <div data-test="dialog-component" data-testid="dialog-component">
                <Suspense fallback="">
                  <Content {...componentProps} />
                </Suspense>
              </div>
            )}
          </Dialog>
        )
      })}
    </>
  )
}
