import React, { FC, useState } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { Icon } from 'components/atoms/Icon/Icon'

export interface ILanConnectedInfos {
  usernameValue: string
  passwordValue: string
  IpValue: string
}

export const LanConnectedInfos: FC<ILanConnectedInfos> = ({
  usernameValue,
  passwordValue,
  IpValue,
}) => {
  const [isShown, setIsShown] = useState(false)

  const displayPassword = !isShown
    ? '•'.repeat(passwordValue.length)
    : passwordValue

  function handleToggleShowPassword() {
    setIsShown(!isShown)
  }

  return (
    <>
      <Typography variant="body1" gutterBottom>
        Username: {usernameValue}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={(theme) => ({
            minWidth: '100px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: theme.colors.primary_11,
          })}
        >
          <Typography variant="body1" gutterBottom>
            Password: {displayPassword}
          </Typography>
        </Box>
        <IconButton
          sx={{
            path: {
              fill: (theme) => theme.colors.primary_11,
            },
            ml: 1,
          }}
          size="small"
          onClick={handleToggleShowPassword}
        >
          {isShown ? (
            <Icon name="VisibilityOn" />
          ) : (
            <Icon name="VisibilityOff" />
          )}
        </IconButton>
      </Box>
      <Typography variant="body1" gutterBottom>
        IP: {IpValue}
      </Typography>
    </>
  )
}
