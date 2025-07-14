import axios from 'axios'
import i18next from 'i18next'
import { MapsConfig, MapsCountry } from 'store/features/system/types'
import { IS_TESTING } from 'utils/capabilities'
import { copyrightUrl } from 'utils/here/hereMaps'

const DEFAULT_LOCATION = process.env.NX_HERE_MAPS_DEFAULT_LOCATION

export type RequestType =
  | 'geocode'
  | 'autosuggest'
  | 'discover'
  | 'geocode_china'
  | 'geocode_korea'

const URL = {
  /* https://developer.here.com/documentation/geocoding-search-api/api-reference-swagger.html */
  GEOCODE_INTERNATIONAL: 'https://geocode.search.hereapi.com/v1/geocode',
  GEOCODE_CHINA: 'https://geocoder.hereapi.cn/6.2/geocode.json',
  GEOCODE_KOREA: 'https://geocoder.cc.api.maps.kr/search/6.2/geocode.json',
  AUTOSUGGEST: 'https://autosuggest.search.hereapi.com/v1/autosuggest',
  DISCOVER: 'https://discover.search.hereapi.com/v1/discover',
}

export const apiClientMap = (
  location: string,
  limitResults: number = 5,
  type: RequestType = 'autosuggest',
  userLocation: string | undefined,
  mapsConfig: MapsConfig,
  country: MapsCountry
) => {
  const { language } = i18next
  const atLocation =
    userLocation === undefined ? DEFAULT_LOCATION : userLocation

  switch (type) {
    case 'autosuggest':
      return axios.get(URL.AUTOSUGGEST, {
        params: {
          q: location,
          at: atLocation,
          apiKey: mapsConfig.appKey,
          limit: limitResults,
          lang: language,
        },
      })
    case 'geocode':
      return axios.get(URL.GEOCODE_INTERNATIONAL, {
        params: {
          searchtext: location,
          /* qq: `city=${location}`, */
          appId: mapsConfig.appKey,
          limit: limitResults,
          lang: language,
        },
      })
    case 'geocode_china':
      return axios.get(URL.GEOCODE_CHINA, {
        params: {
          searchtext: location,
          app_id: mapsConfig.appId,
          app_code: mapsConfig.appCode,
          maxresults: limitResults,
          language,
          locationAttributes: 'addressNamesBilingual',
          strictlanguagemode: 'True',
        },
      })
    case 'geocode_korea':
      return axios.get(URL.GEOCODE_KOREA, {
        params: {
          searchtext: location,
          app_id: mapsConfig.appId,
          app_code: mapsConfig.appCode,
          maxresults: limitResults,
          language,
          locationAttributes: 'addressNamesBilingual',
          strictlanguagemode: 'True',
        },
      })
    case 'discover':
      return axios.get(URL.DISCOVER, {
        params: {
          q: location,
          /* qq: `city=${location}`, */
          at: atLocation,
          apiKey: mapsConfig.appKey,
          limit: limitResults,
          lang: language,
        },
      })

    default:
      return axios.get(URL.AUTOSUGGEST, {
        params: {
          q: location,
          at: atLocation,
          apiKey: mapsConfig.appKey,
          limit: limitResults,
          lang: language,
        },
      })
  }
}

export const getCopyright = (
  style: 'light' | 'dark' | 'satellite',
  mapsConfig: MapsConfig,
  country: MapsCountry
) => {
  if (IS_TESTING) return Promise.resolve({ data: {} })
  const url = copyrightUrl(mapsConfig, country, style)
  return axios.get(url)
}
