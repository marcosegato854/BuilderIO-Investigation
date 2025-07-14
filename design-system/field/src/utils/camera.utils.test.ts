/* eslint-disable @typescript-eslint/no-explicit-any */

import { t } from 'i18n/config'
import { CameraDetails, CameraGroup } from 'store/features/camera/types'
import { translateCameraName } from 'utils/camera'

describe('Camera utils', () => {
  beforeEach(async () => {})

  afterEach(() => {})

  it('translates camera undefined Left Forward ', () => {
    const group: CameraGroup = {
      name: 'Left',
      cameras: [],
    }
    const camera: CameraDetails = {
      active: true,
      name: 'Left Forward',
    }
    const output = translateCameraName(group, camera, undefined, undefined)
    expect(output).toBe(
      t('acquisition.camera.names.Left.Left_Forward.unknown', 'wrong') as string
    )
  })

  it('translates camera undefined Rigth Forward ', () => {
    const group: CameraGroup = {
      name: 'Right',
      cameras: [],
    }
    const camera: CameraDetails = {
      active: true,
      name: 'Right Forward',
    }
    const output = translateCameraName(group, camera, undefined, undefined)
    expect(output).toBe(
      t(
        'acquisition.camera.names.Right.Right_Forward.unknown',
        'wrong'
      ) as string
    )
  })

  it('translates camera landscape Left Forward ', () => {
    const group: CameraGroup = {
      name: 'Left',
      cameras: [],
    }
    const camera: CameraDetails = {
      active: true,
      name: 'Left Forward',
    }
    const output = translateCameraName(group, camera, 'landscape', undefined)
    expect(output).toBe(
      t(
        'acquisition.camera.names.Left.Left_Forward.landscape',
        'wrong'
      ) as string
    )
  })

  it('translates camera landscape Rigth Forward ', () => {
    const group: CameraGroup = {
      name: 'Right',
      cameras: [],
    }
    const camera: CameraDetails = {
      active: true,
      name: 'Right Forward',
    }
    const output = translateCameraName(group, camera, undefined, 'landscape')
    expect(output).toBe(
      t(
        'acquisition.camera.names.Right.Right_Forward.landscape',
        'wrong'
      ) as string
    )
  })

  it('translates camera portrait Left Forward ', () => {
    const group: CameraGroup = {
      name: 'Left',
      cameras: [],
    }
    const camera: CameraDetails = {
      active: true,
      name: 'Left Forward',
    }
    const output = translateCameraName(group, camera, 'portrait', undefined)
    expect(output).toBe(
      t(
        'acquisition.camera.names.Left.Left_Forward.portrait',
        'wrong'
      ) as string
    )
  })

  it('translates camera portrait Rigth Forward ', () => {
    const group: CameraGroup = {
      name: 'Right',
      cameras: [],
    }
    const camera: CameraDetails = {
      active: true,
      name: 'Right Forward',
    }
    const output = translateCameraName(group, camera, undefined, 'portrait')
    expect(output).toBe(
      t(
        'acquisition.camera.names.Right.Right_Forward.portrait',
        'wrong'
      ) as string
    )
  })
})
