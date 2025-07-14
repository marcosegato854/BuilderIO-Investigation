import { Box, CircularProgress, ThemeProvider, Typography } from '@mui/material'
import classNames from 'classnames'
import { FC, MouseEventHandler, PropsWithChildren, ReactNode } from 'react'
import style from './RecordingButton.module.scss'
import { darkTheme } from 'utils/themes/mui'

export interface IRecordingButtonProps {
  /**
   * Button's style changes according to its recording state
   */
  recording?: boolean
  /**
   * click handler
   */
  onClick: MouseEventHandler
  /**
   * extra info dizplayed at center
   */
  extraInfo?: ReactNode

  variant?: 'webapp' | 'pcuapp'
}

/**
 * Button for staring recording in Data Acquisition
 */
export const RecordingButton: FC<IRecordingButtonProps> = ({
  recording = false,
  extraInfo,
  onClick,
  variant = 'webapp',
}: PropsWithChildren<IRecordingButtonProps>) => {
  const adjustingSize = variant === 'webapp' ? 66 : 101

  return (
    <button
      type="button"
      className={classNames({
        [style.recordingButton]: true,
        [style.recordingButtonPCU]: variant === 'pcuapp',
        [style.recordingButtonRec]: recording,
      })}
      onClick={onClick}
      data-testid="recording-button"
    >
      {recording && (
        <div className={style.recordingProgress}>
          {/* as per MUI5 example https://mui.com/material-ui/react-progress/
              The first component acts as background, the second as moving circle */}
          <ThemeProvider theme={darkTheme}>
            <CircularProgress
              size={adjustingSize}
              thickness={4}
              variant="determinate"
              value={100}
              sx={{
                position: 'absolute',
                color: (theme) => theme.colors.primary_11,
              }}
            />
            <CircularProgress
              size={adjustingSize}
              thickness={4}
              variant="indeterminate"
              sx={{
                position: 'absolute',
                color: (theme) => theme.colors.secondary_5,
                animationDuration: '2s',
              }}
            />
          </ThemeProvider>
        </div>
      )}
      <div
        className={classNames({
          [style.innerShape]: true,
          [style.innerShapeRec]: recording,
        })}
      />
      {extraInfo && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
          data-testid="extra-info"
        >
          {extraInfo}
        </Box>
      )}
    </button>
  )
}
