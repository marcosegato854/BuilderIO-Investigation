import { equals } from 'ramda'
import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { Location, useGeoLocation } from 'use-geo-location'

/**
 * Hook that returns a geolocation ref object
 * @returns MutableRefObject<Location>, Location
 */
const useGeolocationRef = (): [MutableRefObject<Location>, Location | null] => {
  const geolocation = useGeoLocation()
  const geoLocationRef = useRef<Location>(geolocation)

  const completeGeolocation = useMemo(() => {
    if (!geolocation.loading && geolocation.latitude && geolocation.longitude) {
      if (
        geoLocationRef.current &&
        equals(geoLocationRef.current, geolocation)
      ) {
        return geoLocationRef.current
      }
      return geolocation
    }
    return null
  }, [geolocation])

  useEffect(() => {
    if (completeGeolocation) geoLocationRef.current = completeGeolocation
  }, [completeGeolocation])

  return [geoLocationRef, completeGeolocation]
}
export default useGeolocationRef
