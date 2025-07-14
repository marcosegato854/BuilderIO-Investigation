import React, { FC, MouseEventHandler, useState, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'
import { Icon } from 'components/atoms/Icon/Icon'
import IconButton from '@mui/material/IconButton'

export interface IWlanAccessPassword {}

export const WlanAccessPassword: FC<IWlanAccessPassword> = () => {
  const [isShown, setIsShown] = useState(false)

  function handleToggleShowPassword() {
    setIsShown((prev) => !prev)
  }

  const { t } = useTranslation()
  return (
    <Box width={'100%'}>
      <TextField
        fullWidth
        id="standard-basic"
        label={t('login.form.fields.password', 'password')}
        variant="standard"
        type={isShown ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
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
          ),
        }}
      />
    </Box>
  )
}
