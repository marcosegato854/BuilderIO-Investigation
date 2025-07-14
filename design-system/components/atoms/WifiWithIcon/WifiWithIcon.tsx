import React, { FC, MouseEventHandler } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon } from 'components/atoms/Icon/Icon'
import { Button } from '@mui/material'

export interface IWifiWithIcon {
  Text: string
  onClick?: MouseEventHandler<HTMLElement>
}

export const WifiWithIcon: FC<IWifiWithIcon> = ({ Text, onClick }) => {
  return (
    <Button
      variant="text"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderRadius: '10px',
        padding: '8px',
        paddingRight: '16px',
      }}
      onClick={onClick}
    >
      <Typography
        variant="body1"
        sx={(theme) => ({
          color: theme.colors.primary_11,
          paddingLeft: '16px',
        })}
      >
        {Text}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          padding: '0px',
          width: '28px',
          height: '28px',
          path: {
            fill: (theme) => theme.colors.primary_11,
          },
        }}
        data-testid="wifi-icon"
      >
        <Icon name="ConnectionIcon" />
      </Box>
    </Button>
  )
}
