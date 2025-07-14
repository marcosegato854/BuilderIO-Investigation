import { ColorsRGB, MyVRStyle } from 'utils/myVR/types'

export const colorsRGB: ColorsRGB = {
  red: [
    1, // red
    0, // green
    0, // blue
    1, // opacity
  ],
  green: [
    0, // red
    1, // green
    0, // blue
    1, // opacity
  ],
  transparentBlue: [
    0, // red
    0, // green
    1, // blue
    0.3, // opacity
  ],
  blue: [
    0, // red
    0, // green
    1, // blue
    1, // opacity
  ],
  purple: [
    0.47, // red
    0.32, // green
    0.66, // blue
    1, // opacity
  ],
  white: [
    1, // red
    1, // green
    1, // blue
    1, // opacity
  ],
  yellow: [1, 1, 0, 1],
  ocher: [1, 0.9, 0, 1],
  transparentGrey: [0, 0, 0, 0.5],
}
export const FeatureObj = {
  // LITTLE TRICK: to save code we make navigation track accuracy match with corresponding accuracy.class
  // since we cannot put Numbers as styles.key when configuring feature objs in myVR
  // later we just need to transform the accuracy.class into a String
  // in this way we don't have to compare the accuracy class and put the right styles.key
  NAVIGATION_TRACK_GOOD_ACCURACY: '0',
  NAVIGATION_TRACK_AVERAGE_ACCURACY: '1',
  NAVIGATION_TRACK_BAD_ACCURACY: '2',
  NAVIGATION_TRACK_PLANNED: '3',
  PICTURE_PLACEHOLDER: 'Picture Placeholder',
  SCANNING_RANGE: 'Scanning Range',
  PATH: 'Path',
  PATH_VERTEX: 'Path Vertex',
  POLYGON: 'Polygon',
  POLYGON_SIDE: 'Polygon Side',
  POLYGON_TEMPORARY_VERTEX: 'Polygon Temporary Vertex',
  DISTANCE_LABEL: 'Distance Label',
  WAYPOINT: 'waypoint',
  FIRST_WAYPOINT: 'first-waypoint',
  LAST_WAYPOINT: 'last-waypoint',
  POLYGON_VERTEX_WAYPOINT: 'polygon-vertex-waypoint',
}
Object.freeze(FeatureObj)

export const defaultStyleConfig: MyVRStyle = {
  navigationTrack: {
    color: {
      goodAccuracy: colorsRGB.green,
      averageAccuracy: colorsRGB.yellow,
      badAccuracy: colorsRGB.red,
    },
    thickness: 5,
  },
  picturePlaceholder: {
    color: colorsRGB.red,
    size: 10,
  },
  scanningRange: {
    color: colorsRGB.transparentGrey,
    diameter: 200,
  },
  path: {
    color: colorsRGB.blue,
    thickness: 2,
    vertex: {
      border: {
        color: colorsRGB.yellow,
      },
      innerArea: {
        color: colorsRGB.white,
      },
      size: 10,
    },
  },
  polygon: {
    border: {
      color: colorsRGB.yellow,
      thickness: 20,
    },
    innerArea: {
      color: colorsRGB.transparentBlue,
    },
    temporaryVertex: {
      border: {
        color: colorsRGB.yellow,
      },
      innerArea: {
        color: colorsRGB.white,
      },
      size: 50,
    },
  },
  distanceLabel: {
    text: {
      color: colorsRGB.ocher,
      size: 1,
    },
  },
}
