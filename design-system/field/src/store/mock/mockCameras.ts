import { CameraGroup } from 'store/features/camera/types'

export const mockCameraGroups: CameraGroup[] = [
  {
    name: 'Sphere',
    cameras: [
      {
        name: 'Sphere',
        active: true,
      },
    ],
  },
  {
    name: 'Right',
    cameras: [
      {
        name: 'Right Forward',
        active: false,
      },
      {
        name: 'Right Backward',
        active: false,
      },
    ],
  },
  {
    name: 'Left',
    cameras: [
      {
        name: 'Left Forward',
        active: false,
      },
      {
        name: 'Left Backward',
        active: false,
      },
    ],
  },
  {
    name: 'Rear',
    cameras: [
      {
        name: 'Rear Left',
        active: false,
      },
      {
        name: 'Rear Right',
        active: false,
      },
    ],
  },
  {
    name: 'Front',
    cameras: [
      {
        name: 'Front Left',
        active: true,
      },
      {
        name: 'Front Right',
        active: true,
      },
    ],
  },
]
