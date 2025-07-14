import { slice } from 'ramda'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  arcs,
  defaultSettings,
  settings,
  waypoints,
  withNewArchs,
  withNewSettings,
  withNewWaypoints,
} from 'utils/planning/polygonHelpers'

describe('trackHelpers', () => {
  const originalTrack = mockStore.planningService.undoablePolygons.present[0]
  const originalPolygon = mockStore.planningService.undoablePolygons.present[1]

  test('Should return the waypoints of a path', () => {
    const extracted = waypoints(originalTrack)
    expect(extracted).toBe(originalTrack.paths[0].waypoints)
  })

  test('Should return the archs of a path', () => {
    const extracted = arcs(originalTrack)
    expect(extracted).toBe(originalTrack.paths[0].arcs)
  })

  test('Should return the settings of a path', () => {
    const extracted = settings(originalTrack)
    expect(extracted).toBe(originalTrack.paths[0].settings)
  })

  test('Should update the settings of a path', () => {
    const newSettings = defaultSettings()
    newSettings.camera.distance = 99
    const updated = withNewSettings(originalTrack, newSettings)
    expect(settings(originalTrack)).not.toBe(newSettings)
    expect(settings(updated)).toBe(newSettings)
  })

  test('Should update the waypoints of a path', () => {
    const newWaypoints = slice(0, 1, waypoints(originalTrack))
    const updated = withNewWaypoints(originalTrack, newWaypoints)
    expect(waypoints(originalTrack)).not.toBe(newWaypoints)
    expect(waypoints(updated)).toBe(newWaypoints)
  })

  test('Should update the waypoints of a polygon', () => {
    const newWaypoints = slice(0, 1, waypoints(originalPolygon))
    const updated = withNewWaypoints(originalPolygon, newWaypoints)
    expect(waypoints(originalPolygon)).not.toBe(newWaypoints)
    expect(waypoints(updated)).toStrictEqual(newWaypoints)
  })

  test('Should update the arcs of a path', () => {
    const newArcs = slice(0, 1, arcs(originalTrack))
    const updated = withNewArchs(originalTrack, newArcs)
    expect(arcs(originalTrack)).not.toBe(newArcs)
    expect(arcs(updated)).toBe(newArcs)
  })
})
