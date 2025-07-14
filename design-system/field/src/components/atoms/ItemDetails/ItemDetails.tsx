import { List, ListItem, ListItemText, ListProps, styled } from '@mui/material'
import classNames from 'classnames'
import { FC, PropsWithChildren } from 'react'
import { darkTheme, lightTheme } from 'utils/themes/mui'
import style from './ItemDetails.module.scss'

export interface IDetail {
  /**
   * Upper text
   */
  primary?: string
  /**
   * lower text
   */
  secondary?: string
}

export interface IItemDetailsProps {
  /**
   * List of info to display
   */
  details: IDetail[]
  variant?: 'plainStyle' | 'bulletListStyle'
}

interface StyledListProps extends ListProps {
  variant?: 'plainStyle' | 'bulletListStyle'
}

const StyledList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledListProps>(({ variant, theme }) => ({
  ...(variant === 'plainStyle' && {
    '& .MuiTypography-displayBlock': {
      ...theme.typography.buttonLabel,
      lineHeight: '1.6em',
    },
    '& .MuiListItemText-primary': {
      color: darkTheme.colors.primary_13,
    },
    '& .MuiListItemText-secondary': {
      color: lightTheme.colors.primary_2,
    },
  }),
  ...(variant === 'bulletListStyle' && {
    '& .MuiTypography-displayBlock': {
      ...theme.typography.body1,
      lineHeight: '1.8em',
    },
    '& .MuiListItemText-primary': {
      color: theme.colors.primary_11,
    },
    '& .MuiListItemText-secondary': {
      color: theme.colors.primary_11,
      fontWeight: 600,
    },
  }),
}))

/**
 * ItemDetails description
 */
export const ItemDetails: FC<IItemDetailsProps> = ({
  details = [],
  variant = 'plainStyle',
}: PropsWithChildren<IItemDetailsProps>) => {
  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.containerPrimary]: variant === 'plainStyle',
        [style.containerSecondary]: variant === 'bulletListStyle',
      })}
    >
      <StyledList dense variant={variant}>
        {details.map(({ primary, secondary }, index) => (
          <ListItem
            key={`${primary}-${secondary}`}
            className={style.listItem}
            data-testid={`detail-${primary?.toLowerCase()}`}
          >
            {variant === 'bulletListStyle' && (
              <span className={style.dotIcon} />
            )}
            <ListItemText
              primary={primary}
              secondary={
                // eslint-disable-next-line react/no-danger
                <span dangerouslySetInnerHTML={{ __html: secondary || '' }} />
              }
            />
          </ListItem>
        ))}
      </StyledList>
    </div>
  )
}
