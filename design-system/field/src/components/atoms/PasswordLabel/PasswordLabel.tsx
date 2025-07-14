import React, { FC, useState } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { Icon } from 'components/atoms/Icon/Icon'

export interface IPasswordLabel {
  inputValue: string
}

export const PasswordLabel: FC<IPasswordLabel> = ({ inputValue }) => {
  const [isShown, setIsShown] = useState(false)

  const displayValue = !isShown ? '•'.repeat(inputValue.length) : inputValue

  function handleToggleShowPassword() {
    setIsShown(!isShown)
  }

  return (
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
        <Typography variant="body1">{displayValue}</Typography>
      </Box>
      <IconButton
        sx={{
          padding: 0,
          width: '24px',
          height: '24px',
          path: {
            fill: (theme) => theme.colors.primary_11,
          },
          ml: 1,
        }}
        onClick={handleToggleShowPassword}
      >
        {isShown ? (
          <Icon name="VisibilityOn" data-testid="VisibilityOn" />
        ) : (
          <Icon name="VisibilityOff" data-testid="VisibilityOff" />
        )}
      </IconButton>
    </Box>
  )
}
