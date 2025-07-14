import React, { FC, MouseEventHandler, PropsWithChildren } from 'react'
import {
  Box,
  Button,
  // Switch,
  Typography,
  styled,
  useTheme,
} from '@mui/material'
import { Switch } from 'components/atoms/Switch/Switch'

export interface IOptionButtonProps {
  title: string
  caption?: string
  showSwitch?: boolean
  captionHighlighted?: boolean
  onClick?: MouseEventHandler
  onSwitchChange?: React.ChangeEventHandler
}

const ButtonContainer = styled(Button)(({ theme }) => ({
  paddingRight: 32,
  paddingLeft: 32,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 68,
  backgroundColor: theme.colors.primary_3,
  color: theme.colors.primary_11,
  borderRadius: 10,
  '&:hover': {
    backgroundColor: theme.colors.primary_3,
    color: theme.colors.primary_11,
  },
}))

const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  width: 'fit-content',
}))

const Caption = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  width: 'fit-content',
}))

/**
 * OptionButton description
 */
export const OptionButton: FC<IOptionButtonProps> = ({
  title,
  caption = '',
  showSwitch = false,
  captionHighlighted = false,
  onClick,
  onSwitchChange = () => {},
}: PropsWithChildren<IOptionButtonProps>) => {
  const theme = useTheme()

  const captionColor = captionHighlighted ? theme.colors.secondary_8 : null

  return (
    <ButtonContainer onClick={onClick}>
      <Box
        display="flex"
        flexDirection="column"
        align-items="center"
        data-testid="option-left-content"
      >
        <Title>{title}</Title>
        {caption !== '' && (
          <Caption sx={{ color: captionColor }}>{caption}</Caption>
        )}
      </Box>
      {showSwitch && <Switch onChange={onSwitchChange} />}
    </ButtonContainer>
  )
}
