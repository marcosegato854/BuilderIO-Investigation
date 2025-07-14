import { t } from 'i18n/config'
import { prop, uniqBy } from 'ramda'
import { ScannersSettingsList } from 'store/features/scanner/types'
import { mtToFt } from 'utils/numbers'

export enum DMIType {
  No_DMI = 'none',
  Optical = 'optical',
  Mechanical = 'mechanical',
  Rail = 'rail',
}

enum CollectionMode {
  OneWay = 'oneway',
  BothWays = 'bothways',
  Other = 'other',
}

enum AntennaType {
  Single = 'single',
  Double = 'double',
}

export const plannedOptions: () => IOption[] = () => [
  {
    value: 'true',
    label: t('new_job_form.option.planning.plan_now', 'Plan now'),
  },
  {
    value: 'false',
    label: t('new_job_form.option.planning.without_plan', 'Without plan'),
  },
]
export const dmiOptions: () => IOption[] = () => [
  {
    value: DMIType.No_DMI,
    label: t('new_job_form.option.dmi.none', 'no DMI'),
  },
  {
    value: DMIType.Optical,
    label: t('new_job_form.option.dmi.optical', 'optical'),
  },
  {
    value: DMIType.Mechanical,
    label: t('new_job_form.option.dmi.mechanical', 'mechanical'),
  },
  {
    value: DMIType.Rail,
    label: t('new_job_form.option.dmi.rail', 'rail'),
  },
]
export const defaultProfileOptions: () => IOption[] = () => [
  {
    value: 0,
    label: t('new_job_form.option.job_type.p0', 'road'),
  },
  {
    value: 1,
    label: t('new_job_form.option.job_type.p1', 'rail'),
  },
  {
    value: 2,
    label: t('new_job_form.option.job_type.p2', 'marine'),
  },
]

export const collectionmodeOptions: () => IOption[] = () => [
  {
    value: CollectionMode.OneWay,
    label: t('new_job_form.option.collectionmode.oneway', 'one way'),
  },
  {
    value: CollectionMode.BothWays,
    label: t('new_job_form.option.collectionmode.bothways', 'both ways'),
  },
  // {
  //   value: CollectionMode.Other,
  //   label: t('new_job_form.option.collectionmode.other', 'Other'),
  // },
]

export const cameraEnableOptions: () => IOption[] = () => [
  {
    value: 1,
    label: t('new_job_form.option.camera.on', 'on'),
  },
  {
    value: 0,
    label: t('new_job_form.option.camera.off', 'off'),
  },
]

export const cameraEnableOptionsAdmin: () => IOption[] = () => [
  {
    value: 1,
    label: t('new_job_form.option.camera.distance', 'distance'),
  },
  {
    value: 2,
    label: t('new_job_form.option.camera.time', 'time'),
  },
  {
    value: 0,
    label: t('new_job_form.option.camera.off', 'off'),
  },
]

export const cameraOrientationOptions: () => IOption[] = () => [
  {
    value: 'portrait',
    label: t('new_job_form.option.camera_orientation.portrait', 'portrait'),
  },
  {
    value: 'landscape',
    label: t('new_job_form.option.camera_orientation.landscape', 'landscape'),
  },
]

export const cameraBlurOptions: () => IOption[] = () => [
  {
    value: 'true',
    label: t('new_job_form.option.camera_blur.on', 'On'),
  },
  {
    value: 'false',
    label: t('new_job_form.option.camera_blur.off', 'Off'),
  },
]

export const antennaTypeOptions: () => IOption[] = () => [
  {
    value: AntennaType.Single,
    label: t('new_job_form.option.antenna.single', 'Single'),
  },
  {
    value: AntennaType.Double,
    label: t('new_job_form.option.antenna.double', 'Double'),
  },
]

export const scannerRotationSpeedOptions = (
  supportedSettings: ScannersSettingsList
): IOption[] => {
  if (!supportedSettings.settings) return []
  return uniqBy(
    prop('value'),
    supportedSettings.settings.map((row) => ({
      value: row.rps,
      label: `${row.rps}Hz`,
    }))
  ).sort((a, b) => a.value - b.value)
  /* return supportedSettings.settings.map((row) => ({
    value: row.rps,
    label: `${row.rps}Hz`,
  })) */
}

export const ntripOptions: () => IOption[] = () => [
  {
    value: 'false',
    label: t('new_job_form.option.rtk.off', 'Off'),
  },
  {
    value: 'true',
    label: t('new_job_form.option.rtk.on', 'On'),
  },
]

export const pointsPerSecondOptions = (
  supportedSettings: ScannersSettingsList
): IOption[] => {
  if (!supportedSettings.settings) return []
  return uniqBy(
    prop('value'),
    supportedSettings.settings?.map((row) => ({
      value: row.pts,
      label: `${Math.round(row.pts / 1000)}k`,
    }))
  ).sort((a, b) => a.value - b.value)
}

export const scannerRangeOtions = (
  supportedSettings: ScannersSettingsList,
  isImperial: boolean
): IOption[] => {
  if (!supportedSettings.settings) return []
  const { settings } = supportedSettings
  // const settingsArray = isImperial ? imperial : metric
  const unit = isImperial ? 'ft' : 'm'
  if (!settings) return []
  return uniqBy(
    prop('value'),
    settings.map((row) => ({
      value: row.mr,
      label: `${
        isImperial ? Math.round(mtToFt(row.mr)) + unit : row.mr + unit
      }`,
    }))
  ).sort((a, b) => a.value - b.value)
}

export const positionAccuracyOptions: () => IOption[] = () => [
  { value: 2, label: '2' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
]

export const roadsOptions: () => IOption[] = () => [
  {
    value: 'allroad',
    label: t('planning.polygon_plan_filter.roads.allroad', 'allroad'),
  },
  {
    value: 'allcar',
    label: t('planning.polygon_plan_filter.roads.allcar', 'allcar'),
  },
  {
    value: 'motorway',
    label: t('planning.polygon_plan_filter.roads.motorway', 'motorway'),
  },
  {
    value: 'truck',
    label: t('planning.polygon_plan_filter.roads.truck', 'truck'),
  },
  {
    value: 'primary',
    label: t('planning.polygon_plan_filter.roads.primary', 'Primary'),
  },
  {
    value: 'secondary',
    label: t('planning.polygon_plan_filter.roads.secondary', 'Secondary'),
  },
  {
    value: 'tertiary',
    label: t('planning.polygon_plan_filter.roads.tertiary', 'Tertiary'),
  },
  {
    value: 'residential',
    label: t('planning.polygon_plan_filter.roads.residential', 'residential'),
  },
  {
    value: 'service',
    label: t('planning.polygon_plan_filter.roads.service', 'service'),
  },
  {
    value: 'livingstreet',
    label: t('planning.polygon_plan_filter.roads.livingstreet', 'livingstreet'),
  },
  {
    value: 'allrailway',
    label: t('planning.polygon_plan_filter.roads.allrailway', 'allrailway'),
  },
  {
    value: 'rail',
    label: t('planning.polygon_plan_filter.roads.rail', 'rail'),
  },
  {
    value: 'lightrail',
    label: t('planning.polygon_plan_filter.roads.lightrail', 'lightrail'),
  },
  {
    value: 'monorail',
    label: t('planning.polygon_plan_filter.roads.monorail', 'monorail'),
  },
  // {
  //   value: 'pedestrian',
  //   label: t('planning.polygon_plan_filter.roads.pedestrian', 'pedestrian'),
  // },
  // {
  //   value: 'cycleway',
  //   label: t('planning.polygon_plan_filter.roads.cycleway', 'cycleway'),
  // },
  // {
  //   value: 'funicular',
  //   label: t('planning.polygon_plan_filter.roads.funicular', 'funicular'),
  // },
  // {
  //   value: 'subway',
  //   label: t('planning.polygon_plan_filter.roads.subway', 'subway'),
  // },
  // {
  //   value: 'tram',
  //   label: t('planning.polygon_plan_filter.roads.tram', 'tram'),
  // },
  {
    value: 'unclassified',
    label: t('planning.polygon_plan_filter.roads.unclassified', 'Unclassified'),
  },
]

export const rampsOptions: () => IOption[] = () => [
  {
    value: 'include_ramps',
    label: t(
      'planning.polygon_plan_filter.ramps.include_ramps',
      'Include ramps'
    ),
  },
  {
    value: 'no_ramps',
    label: t('planning.polygon_plan_filter.ramps.no_ramps', 'No ramps'),
  },
  {
    value: 'only_ramps',
    label: t('planning.polygon_plan_filter.ramps.only_ramps', 'Only ramps'),
  },
]
