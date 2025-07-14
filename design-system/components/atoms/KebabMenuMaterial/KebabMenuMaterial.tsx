import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Menu,
  MenuItem,
  PopoverOrigin,
  ThemeProvider,
  Zoom,
  styled,
} from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { hexToRgb, lightTheme } from 'utils/themes/mui'
import style from './KebabMenuMaterial.module.scss'

export interface IKebabMenuMaterialProps {
  /**
   * Placement of the list. Optional. By default is on the right.
   */
  placement?: 'bottom' | 'left' | 'right'
  /**
   * Placement of the list. Optional. By default is on the right.
   */
  variant?: 'White' | 'Processing'
  /**
   * Array of options
   */
  options: Array<IClickableOption>
  /**
   * Open the menu by default
   */
  defaultOpened?: Boolean
  /**
   * Callback when closing the menu
   */
  onClose?: Function
}

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    backgroundColor: `rgba(${hexToRgb(theme.colors.primary_12)}, 0.65)`,
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  '& .MuiMenu-list': {
    padding: 0,
  },
  '& .MuiMenuItem-root': {
    padding: '15px 16px',
    color: theme.colors.primary_1,
    ...theme.typography.buttonLabel,
    '& + .MuiMenuItem-root': {
      '--color': '#ffffff',
      borderTop: `1px solid rgba(${hexToRgb(theme.colors.primary_1)}, 0.1)`,
    },
  },
}))

/**
 * KebabMenuMaterial description
 */
export const KebabMenuMaterial: FC<IKebabMenuMaterialProps> = ({
  options = [],
  variant,
  placement,
  defaultOpened,
  onClose,
}: PropsWithChildren<IKebabMenuMaterialProps>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const iconButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (defaultOpened) {
      setAnchorEl(iconButton.current)
    }
  }, [defaultOpened])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    options?.length && setAnchorEl(event.currentTarget)
  }

  const handleClose = (event: React.MouseEvent<HTMLLIElement>) => {
    const { currentTarget } = event
    const index = parseInt(currentTarget.getAttribute('data-index') || '', 10)
    onClose && onClose()
    if (isNaN(index)) {
      setAnchorEl(null)
      return
    }
    const option = options[index]
    option.onClick && option.onClick(event)
    if (!option.dontCloseOnClick) setAnchorEl(null)
  }

  const placementProps = useMemo(
    () =>
      placement &&
      ({
        bottom: {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        },
        left: {
          anchorOrigin: {
            vertical: 'center',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'center',
            horizontal: 'right',
          },
        },
        right: {
          anchorOrigin: {
            vertical: 'center',
            horizontal: 'right',
          },
          transformOrigin: {
            vertical: 'center',
            horizontal: 'left',
          },
        },
      }[placement] as {
        anchorOrigin: PopoverOrigin
        transformOrigin: PopoverOrigin
      }),
    [placement]
  )

  return (
    <div
      className={classNames({
        [style[`container${variant}`]]: !!variant,
      })}
    >
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
        data-testid="dots-button"
        ref={iconButton}
        size="large"
        sx={[
          variant === 'Processing' && {
            padding: 0,
          },
        ]}
      >
        <MoreVertIcon />
      </IconButton>
      <ThemeProvider theme={lightTheme}>
        <StyledMenu
          id="long-menu"
          data-testid="kebab-menu"
          elevation={0}
          // getContentAnchorEl={null}
          anchorEl={anchorEl}
          {...placementProps}
          keepMounted
          open={open}
          onClose={handleClose}
          TransitionComponent={Zoom}
        >
          {options.map((option, index) => (
            <MenuItem
              key={option.label}
              // selected={option.value === 'Pyxis'}
              data-index={index}
              onClick={handleClose}
              disabled={option.enable === false}
              data-testid={`menu-option-${option.label}`}
            >
              {option.label}
              {option.dontCloseOnClick && (
                <Icon name="RightTriangle" className={style.rightTriangle} />
              )}
            </MenuItem>
          ))}
        </StyledMenu>
      </ThemeProvider>
    </div>
  )
}
