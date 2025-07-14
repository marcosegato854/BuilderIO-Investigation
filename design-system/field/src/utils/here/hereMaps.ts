/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import {
  always,
  cond,
  equals,
  filter,
  identity,
  lensPath,
  map,
  pipe,
  split,
  T,
  view,
} from 'ramda'
import { MapsConfig, MapsCountry } from 'store/features/system/types'
import { RequestType } from 'store/services/apiClientMap'

export const tilesUrl = (
  config: MapsConfig,
  country: MapsCountry,
  mapType: 'dark' | 'light' | 'satellite'
) => {
  let prefix = ''
  let mapStyle = null
  if (config.tilePrefix) {
    const prefixArray = config.tilePrefix.split(',')
    prefix = mapType === 'satellite' ? prefixArray[2] : prefixArray[0]
  }
  if (config.tileStyle) {
    const mapStyleArray = config.tileStyle.split(',')
    mapStyle = {
      dark: mapStyleArray[0],
      light: mapStyleArray[1], 
      satellite: mapStyleArray[2],
    }
  }
  /* return 'https://nrbe.pstatic.net/styles/basic/%l/%x/%y@2x.png?mt=bg.ol.sw.ar.len' */
  // Replace placeholders in the tileServer URL
  const url = config.tileUrl
  .replace('%prefix', prefix || '')
  .replace('%mapStyle', mapStyle ? mapStyle[mapType] : '')
  .replace('%appKey', config.appKey || '')
  .replace('%appId', config.appId || '')
  .replace('%appCode', config.appCode || '')

  return url
}

// https://developer.here.com/documentation/examples/rest/map-tile/map-tile-copyrights
// https://developer.here.com/documentation/raster-tile-api/api-reference.html
export const copyrightUrl = (
  config: MapsConfig,
  country: MapsCountry,
  mapType: 'dark' | 'light' | 'satellite'
) => {
  let prefix = ''
  if (config.tilePrefix) {
    const prefixArray = config.tilePrefix.split(',')
    prefix = mapType === 'satellite' ? prefixArray[2] : prefixArray[0]
  }
  
  // Replace placeholders in the tileServer URL
  return config.copyrightUrl
    .replace('%prefix', prefix || '')
    .replace('%appKey', config.appKey || '')
    .replace('%appId', config.appId || '')
    .replace('%appCode', config.appCode || '');
}

export const getAutocompleteRequestType = (
  countryCode: MapsCountry
): RequestType => {
  return cond([
    [equals(MapsCountry.CHINA), always('geocode_china')],
    [equals(MapsCountry.SOUTH_KOREA), always('geocode_korea')],
    [T, always('autosuggest')],
  ])(countryCode) as RequestType
}

export const getSearchResults = (
  response: AxiosResponse,
  requestType: RequestType
): AutocompleteOption[] => {
  try {
    const isGeocode = requestType.includes('geocode')
    return isGeocode
      ? getSearchResultsGeocode(response)
      : getSearchResultsAutosuggest(response)
  } catch (e) {
    return []
  }
}

const getSearchResultsAutosuggest = (response: AxiosResponse) => {
  const s = split('.')
  const path = s('data.items')
  const lens = lensPath<HereMapsItem[], AxiosResponse>(path)
  const convertFunc: (i: any) => HereMapsItem | null = identity
  const results = pipe(
    view(lens),
    map(convertFunc),
    filter(withCoordinates),
    map(toAutocompleteOption)
  )(response) as AutocompleteOption[]
  return results
}

const getSearchResultsGeocode = (response: AxiosResponse) => {
  const s = split('.')
  const path = s('data.Response.View.0.Result')
  const lens = lensPath<HereMapsItem[], AxiosResponse>(path)
  const convertFunc: (i: any) => HereMapsItem | null = convertGeocodeResult
  const results = pipe(
    view(lens),
    map(convertFunc),
    filter(withCoordinates),
    map(toAutocompleteOption)
  )(response) as AutocompleteOption[]
  return results
}

const withCoordinates = (result: HereMapsItem | null) => !!result?.position?.lat

const convertGeocodeResult = (item: any): HereMapsItem | null => {
  try {
    const {
      Location: { NavigationPosition, Address, LocationId },
    } = item
    // const title = [Address.District, Address.City, Address.Street]
    const title = Address.Label
    return {
      id: LocationId,
      position: {
        lat: NavigationPosition[0].Latitude,
        lng: NavigationPosition[0].Longitude,
      },
      resultType: 'locality',
      title,
    }
  } catch (error) {
    return null
  }
}

interface AutocompleteOption {
  id: string
  name: string
  resultType: string
  latitude: number
  longitude: number
}
const toAutocompleteOption = (result: HereMapsItem) => ({
  id: result.id,
  name: result.title,
  resultType: result.resultType,
  latitude: result.position.lat,
  longitude: result.position.lng,
})
