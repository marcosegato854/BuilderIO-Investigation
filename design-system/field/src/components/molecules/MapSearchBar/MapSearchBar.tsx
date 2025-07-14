import { TextField } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import React, { FC, PropsWithChildren, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectSystemInfo } from 'store/features/system/slice'
import { apiClientMap, RequestType } from 'store/services/apiClientMap'
import { Location } from 'use-geo-location'
import {
  getAutocompleteRequestType,
  getSearchResults,
} from 'utils/here/hereMaps'
import style from './MapSearchBar.module.scss'

export interface IMapSearchBarLocation {
  id: string
  latitude: number
  longitude: number
  name: string
  resultType: string
}

export interface IMapSearchBarProps {
  /**
   * Toggle the disabled state
   */
  disabled?: boolean
  /**
   * MapSearchBar onChange event
   */
  onChange?: Function
  /**
   * Event called when a location is clicked
   */
  onLocationClick?: Function
  /**
   * user position if known
   */
  userPosition?: Location
}

/**
 * MapSearchBar description
 */
export const MapSearchBar: FC<IMapSearchBarProps> = ({
  disabled = false,
  onChange,
  onLocationClick,
  userPosition,
}: PropsWithChildren<IMapSearchBarProps>) => {
  const [showOptionsList, setShowOptionsList] = useState(false)
  const [addressList, setAddressList] = useState<IMapSearchBarLocation[]>([])
  const { t } = useTranslation()
  const userLocation =
    userPosition && userPosition.latitude && userPosition.longitude
      ? `${userPosition.latitude},${userPosition.longitude}`
      : undefined
  const systemInfo = useSelector(selectSystemInfo)

  const handleChange = useCallback(
    (event: React.ChangeEvent<{}>, newValue: string, reason: string) => {
      /**
       * SEARCH MUST BE DONE IN THE SAME LANGUAGE SET FOR THE USER
       * OTHERWISE IT WON'T FILL THE AUTOCOMPLETE OPTIONS
       */

      // handling the press of the clear 'x' button
      if (reason === 'clear') {
        setAddressList([])
        return
      }
      if (!systemInfo) return
      // send the event to the parent component if a function is provided
      // onChange && onChange(newValue)

      setShowOptionsList(true)
      if (!systemInfo.maps)
        throw new Error('MISSING HEREMAPS CONFIGURATION IN SYSTEM INFO')
      if (!newValue) {
        setAddressList([])
        return
      }
      const requestType: RequestType = getAutocompleteRequestType(
        systemInfo.countryCode
      )
      // TODO: maybe this needs to be throttled
      apiClientMap(
        newValue,
        5,
        requestType,
        userLocation,
        systemInfo.maps,
        systemInfo.countryCode
      )
        .then((response) => {
          // sometimes the response has results with no position (like military ones..)
          const results = getSearchResults(response, requestType)
          setAddressList(results)
        })
        .catch((error) => console.error(error))
    },
    [systemInfo, userLocation]
  )

  const handleSearchLocationClicked = (
    event: React.ChangeEvent<{}>,
    location: string | IMapSearchBarLocation | null,
    reason: string
  ) => {
    // handling the press of the clear 'x' button
    if (reason === 'clear') {
      return
    }
    setShowOptionsList(false)
    onLocationClick && onLocationClick(location)
  }

  return (
    <div
      className={classNames({
        [style.mapSearchBar]: true,
        [style.mapSearchBarActive]: showOptionsList,
        [style.disabled]: disabled,
      })}
    >
      <Autocomplete
        id="mapSearch"
        autoHighlight
        blurOnSelect
        size="small"
        disabled={disabled}
        options={addressList}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return ''
          return option.name
        }}
        isOptionEqualToValue={(option, value) => {
          if (typeof option === 'string') return false
          if (typeof value === 'string') return false
          return option.id === value.id
        }}
        onInputChange={handleChange}
        onChange={handleSearchLocationClicked}
        popupIcon={<Icon name="Search" className={style.mapSearchBarIcon} />}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('header.mapSearchbarPlaceholder', 'Search Location')}
            variant="standard"
          />
        )}
        classes={{
          popupIndicatorOpen: style.popupIndicatorOpen,
          input: style.input,
        }}
      />
    </div>
  )
}
