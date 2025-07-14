import React, { FC, MouseEventHandler } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import { Box, Fab, Grid, Typography, styled } from '@mui/material'
import icons from 'components/atoms/Icon/icons'

export interface IPCURedButtonProps {
  icon?: keyof typeof icons
  title: string
  acquisition?: boolean
  onClick?: MouseEventHandler<HTMLElement>
}

const WhiteIcon = styled(Icon)(({ theme }) => ({
  '& path': {
    fill: theme.colors.primary_11,
  },
  height: 68,
  width: 68,
}))

const RedButton = styled(Fab)(({ theme }) => ({
  width: 120,
  height: 120,
  backgroundColor: theme.colors.secondary_5,
  '&:hover': {
    backgroundColor: '#a31315',
  },
}))

export const PCURedButton: FC<IPCURedButtonProps> = ({
  icon = 'Plus',
  title,
  acquisition = false,
  onClick,
}) => {
  const blinkingButton = '/assets/img/RecordingGif.gif'
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {acquisition ? (
        <img
          onClick={onClick}
          src={blinkingButton}
          alt="blinkind-dot"
          data-testid="blinking-dot"
        />
      ) : (
        <RedButton onClick={onClick} data-testid="mainButton">
          <WhiteIcon name={icon} data-testid="icon" />
        </RedButton>
      )}

      <Typography mt={1} fontSize={20} fontWeight={300} data-testid="title">
        {title}
      </Typography>
    </Box>
  )
}
