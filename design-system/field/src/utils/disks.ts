import { t } from 'i18n/config'
import { isNil } from 'ramda'
import { storageUnitHandler } from 'utils/numbers'

export const slotOrDisk = (
  diskName: string,
  availableDisks: IDisk[]
): string => {
  const disk = availableDisks.find((d) => d.name === diskName)
  return !isNil(disk?.slot)
    ? `${t('project_browser.slot', 'sl')} ${disk!.slot}`
    : `${t('project_browser.disk', 'dsk')} ${diskName}`
}

export const slotOrDiskShort = (
  diskName: string,
  availableDisks: IDisk[]
): string => {
  const disk = availableDisks.find((d) => d.name === diskName)
  return !isNil(disk?.slot) ? disk!.slot.toString() : diskName
}

export const diskSpaceInfo = ({
  name,
  available,
  total,
  slot,
}: IDisk): string => {
  const label = isNil(slot)
    ? name
    : `${t('project_browser.slot', 'sl')} ${slot}`
  const availableStorage = storageUnitHandler(Number(available))
  const totalStorage = storageUnitHandler(Number(total))
  return `${label} (${availableStorage}/${totalStorage})`
}
