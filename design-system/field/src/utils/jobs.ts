import { IDetail } from 'components/atoms/ItemDetails/ItemDetails'
import { cameraEnableOptionsAdmin } from 'components/dialogs/NewJobForm/options'
import { t } from 'i18n/config'
import { not } from 'mathjs'
import moment from 'moment'
import {
  always,
  compose,
  cond,
  equals,
  evolve,
  identity,
  ifElse,
  keys,
  omit,
  T,
  where,
} from 'ramda'
import {
  cmToIn,
  kmToM,
  labelWithUnit,
  mtToFt,
  projectUnitHandler,
} from 'utils/numbers'

export function isProject(obj: IProject | IJob): obj is IProject {
  return (obj as IProject).disk !== undefined
}

const df = moment.ISO_8601
export const normalizeValue = (
  item: IProject | IJob,
  key: keyof IProject | keyof IJob,
  unit: 'metric' | 'imperial'
): string =>
  cond([
    /** COMMON */
    [
      () => ['creationdate', 'updatedate'].includes(key),
      always(
        moment(item[key as 'creationdate' | 'updatedate'], df).format(
          'MMM Do YYYY'
        )
      ),
    ],
    /** PROJECT */
    [
      (i: IProject | IJob) => isProject(i),
      (i: Partial<IProject>) =>
        cond([
          [
            equals('coordinate'),
            always(
              t(`new_project_form..${i.coordinate?.unit}`, i.coordinate?.unit)
            ),
          ],
          [equals('completed'), always(`${i.completed}%`)],
          [equals('size'), always(projectUnitHandler(i.size))],
          [T, (k: keyof IProject): string => i[k]?.toString() || '--'],
        ])(key as keyof IProject),
    ],
    /** JOB */
    [
      (i: IProject | IJob) => !isProject(i),
      (i: IJob) =>
        cond([
          [
            equals('planned'),
            ifElse(
              () => !!i.planned,
              always(t('job_browser.details.values.yes')),
              always(t('job_browser.details.values.no'))
            ),
          ],
          [
            equals('ntrip'),
            ifElse(
              () => !!i.ntrip?.enable,
              always(t('job_browser.details.values.yes')),
              always(t('job_browser.details.values.no'))
            ),
          ],
          [
            equals('camera'),
            ifElse(
              () => Number(i.camera?.enable) > 0,
              ifElse(
                () => i.camera?.enable === 1,
                always(
                  t(
                    'job_browser.details.values.camera_distance_no_orientation',
                    {
                      enable: cameraEnableOptionsAdmin().find(
                        (o) => o.value === 1
                      )?.label,
                      blur: i.camera?.blur
                        ? t('job_browser.details.values.yes')
                        : t('job_browser.details.values.no'),
                      distance: labelWithUnit(
                        'M',
                        mtToFt,
                        i.camera?.distance,
                        unit
                      ),
                    }
                  )
                ),
                always(
                  t('job_browser.details.values.camera_time_no_orientation', {
                    enable: cameraEnableOptionsAdmin().find(
                      (o) => o.value === 2
                    )?.label,
                    blur: i.camera?.blur
                      ? t('job_browser.details.values.yes')
                      : t('job_browser.details.values.no'),
                    elapse: labelWithUnit(
                      'MS',
                      identity,
                      i.camera?.elapse,
                      unit
                    ),
                  })
                )
              ),
              always(t('job_browser.details.values.no'))
            ),
          ],
          [
            equals('dmi'),
            always(t(`new_job_form.option.dmi.${i.dmi?.type}`, i.dmi?.type)),
          ],
          [
            equals('profile'),
            always(t(`new_job_form.option.job_type.p${i.profile}`, '--')),
          ],
          [
            equals('antenna'),
            always(
              t(
                `new_job_form.option.antenna.${i.antenna?.type}`,
                i.antenna?.type
              )
            ),
          ],
          [
            equals('drivingspeed'),
            always(labelWithUnit('KMH', kmToM, i.drivingspeed, unit)),
          ],
          [
            equals('scanner'),
            ifElse(
              () => i.hardwareModel === 'PEGASUS TRK100' || i.hardwareModel === 'PEGASUS TRK300',
              always(
                t('job_browser.details.values.scanner100', {
                  rps: i.scanner?.rotationspeed,
                  pps: i.scanner?.pointspersecond,
                  range: labelWithUnit('M', mtToFt, i.scanner?.range, unit),
                })
              ),
              always(
                t('job_browser.details.values.scanner', {
                  spacing: labelWithUnit(
                    'CM',
                    cmToIn,
                    i.scanner?.scanlinespacing,
                    unit
                  ),
                  rps: i.scanner?.rotationspeed,
                  pps: i.scanner?.pointspersecond,
                  range: labelWithUnit('M', mtToFt, i.scanner?.range, unit),
                })
              )
            ),
          ],
          [
            equals('position'),
            always(
              i.position?.accuracy?.low
                ? labelWithUnit(
                    'CM',
                    cmToIn,
                    i.position?.accuracy?.low * 100,
                    unit
                  )
                : '--'
            ),
          ],
          [equals('size'), always(projectUnitHandler(i.size))],
          [equals('completed'), always(`${i.completed}%`)],
          [T, (k: keyof IJob): string => i[k]?.toString() || '--'],
        ])(key as keyof IJob),
    ],
    [T, () => '--'],
  ])(item) as string

export const getDetails = (
  item?: IProject | IJob | null,
  unit?: 'metric' | 'imperial'
): IDetail[] => {
  if (!unit) return []
  if (!item) return []
  const allowdKeys = [
    // 'name',
    'scans',
    'profile',
    'planned',
    'type',
    'ntrip',
    'dmi',
    // 'collectionmode',
    'drivingspeed',
    'snSensorUnit',
    'scanner',
    'position',
    'camera',
    'antenna',
    // 'disk',
    // 'jobs',
    // 'completed',
    'coordinate',
    // 'controlpoints',
    'size',
    'creationdate',
    'updatedate',
  ]
  return keys(item)
    .filter((k) => allowdKeys.includes(k))
    .filter((k) => {
      // NO TOLERANCE WITHOUT RTK
      if (isProject(item)) return true
      if (item.ntrip?.enable) return true
      return (k as keyof IJob) !== 'position'
    })
    .map((p) => ({
      primary: t(`job_browser.details.${p}`, p),
      secondary: normalizeValue(item, p, unit),
    }))
}

export const checkAntennaValues = (antennaInfo?: AntennaInfo): boolean => {
  if (!antennaInfo) return false
  if (antennaInfo.type === 'single') return true
  if (!antennaInfo.leverarm) return false
  const { x, y, z } = antennaInfo.leverarm
  if (!x && !y && !z) return false
  const notZero = (v: number | string) => Number(v) !== 0
  return notZero(x) || notZero(y!)
}

/** Removes all the properties that shouldn't be checked to make a job custom */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const relevant = (j: any) => {
  const removeProps = omit([
    'name',
    'acquired',
    'completed',
    'creationdate',
    'image',
    'planned',
    'processed',
    'scans',
    'size',
    'type',
    'updatedate',
    'ntrip',
    'leverarm',
    'drivingspeed',
    'rotationspeed',
    'blur',
    'range',
    'left',
    'right',
    'pointspersecond',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeRelevant = compose<any, any>(
    evolve({
      antenna: removeProps,
      dmi: removeProps,
      scanner: removeProps,
      camera: removeProps,
    }),
    removeProps
  ) as (j: Partial<IJob>) => Partial<IJob>
  return makeRelevant(j) as Partial<IJob>
}
