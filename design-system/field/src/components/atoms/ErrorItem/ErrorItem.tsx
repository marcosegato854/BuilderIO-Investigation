import React, { FC, PropsWithChildren } from 'react'
import { Grid, Typography, styled, useTheme } from '@mui/material'
import { Icon } from '../Icon/Icon'
import style from './ErrorItem.module.scss'
import classNames from 'classnames'

export interface IErrorItemProps {
  title: string
  datetime?: string
  time?: string
  type?: 'Warning' | 'Error'
}

const ButtonContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingRight: 32,
  paddingLeft: 32,
  width: '100%',
  height: 68,
  backgroundColor: theme.colors.primary_3,
  color: theme.colors.primary_11,
  borderRadius: 10,
}))

const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  width: 'fit-content',
}))

const Caption = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  width: 'fit-content',
}))

export const ErrorItem: FC<IErrorItemProps> = ({
  title,
  datetime,
  type = 'Warning',
}: PropsWithChildren<IErrorItemProps>) => {
  const theme = useTheme()

  return (
    <ButtonContainer
      container
      className={classNames({
        [style.erroritem]: type === 'Error',
        [style.warningitem]: type === 'Warning',
      })}
    >
      <Grid item xs={8} data-testid="title-error-item">
        <Title>{title}</Title>
      </Grid>
      <Grid item xs={3} data-testid="date-error-item">
        <Caption>{datetime}</Caption>
      </Grid>
      <Grid item xs={1} data-testid="icon-error-item">
        {type === 'Error' && <Icon name="Error" />}
        {type === 'Warning' && <Icon name="Warning2" />}
      </Grid>
    </ButtonContainer>
  )
}
