import { Polygon } from 'store/features/planning/types'
import { defaultSettings } from 'utils/planning/polygonHelpers'

export const mockTrackGeometry: Polygon = {
  coordinates: [],
  paths: [
    {
      waypoints: [
        {
          latitude: 45.908768,
          longitude: 12.667378,
          height: 0,
          freePoint: true,
        },
        {
          latitude: 45.9016071,
          longitude: 12.6820843,
          height: 0,
          freePoint: true,
        },
        {
          latitude: 45.9012175,
          longitude: 12.6831781,
          height: 0,
          freePoint: false,
        },
        {
          latitude: 45.9007629,
          longitude: 12.6833418,
          height: 0,
          freePoint: false,
        },
      ],
      arcs: [
        {
          length: 1391.298526,
          coordinates: [
            [12.667378, 45.908768, 1],
            [12.6820843, 45.9016071, 1],
          ],
        },
        {
          length: 95.28790369,
          coordinates: [
            [12.6831781, 45.9012175, 1],
            [12.683174, 45.901215, 0],
          ],
        },
        {
          length: 42,
          coordinates: [[12.683593, 45.900979, 0]],
        },
        {
          length: 0,
          coordinates: [[12.683593, 45.900979, 0]],
        },
      ],
      settings: defaultSettings(),
    },
  ],
}
