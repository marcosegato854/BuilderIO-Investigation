import { BigTool } from 'components/atoms/BigTool/BigTool'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/molecules/PlanningBigTools/PlanningBigTools.module.scss'
import useBusyApi from 'components/organisms/PlanningView/useBusyApi'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { PlanningTools } from 'store/features/planning/types'
import { selectRoutingModule } from 'store/features/routing/slice'

export interface IPlanningBigToolsProps {
  /**
   * callback on selection
   */
  onSelect: (tool: PlanningTools) => void
  /**
   * current polygon available
   */
  currentPolygonAvailable: boolean
  /**
   * isPolygon
   */
  isPolygon?: boolean
  /**
   * item to select
   */
  selected?: PlanningTools
}

/**
 * PlanningBigTools description
 */
export const PlanningBigTools: FC<IPlanningBigToolsProps> = ({
  onSelect,
  selected,
  currentPolygonAvailable,
  isPolygon,
}: PropsWithChildren<IPlanningBigToolsProps>) => {
  const routingModule = useSelector(selectRoutingModule)
  const { t } = useTranslation()
  const busy = useBusyApi()
  // const handleUpload = () => {
  //   console.info('upload file')
  // }
  const drawTrackLabel = useMemo(() => {
    if (selected === PlanningTools.DRAW_PATH)
      return t('planning.tools.end_track', 'end tack')
    if (isPolygon) return t('planning.tools.draw_new_track', 'new track')
    return currentPolygonAvailable
      ? t('planning.tools.draw_track', 'draw tack')
      : t('planning.tools.draw_new_track', 'new track')
  }, [currentPolygonAvailable, t, selected, isPolygon])
  const drawPolygonLabel = useMemo(() => {
    return currentPolygonAvailable
      ? t('planning.tools.draw_polygon', 'Draw Polygon')
      : t('planning.tools.draw_new_polygon', 'New Polygon')
  }, [currentPolygonAvailable, t])

  const drawTrackDisabled = useMemo(() => {
    if (isPolygon) return true
    if (busy) return true
    if (selected === PlanningTools.DRAW_POLYGON) return true
    return false
  }, [isPolygon, selected, busy])

  const importShpDisabled = useMemo(() => {
    if (busy) return true
    return false
  }, [busy])

  const drawPolygonDisabled = useMemo(() => {
    if (busy) return true
    if (!selected) return false
    if (isPolygon === false) return true
    if (selected === PlanningTools.DRAW_PATH) return true
    if (
      [
        PlanningTools.SELECT_INTERNAL,
        PlanningTools.CUT_INTERNAL,
        PlanningTools.DELETE_PATH,
      ].includes(selected)
    )
      return true
    return false
  }, [isPolygon, selected, busy])
  return (
    <div className={style.container}>
      <div className={style.flexWrapper}>
        <BigTool
          icon={<Icon name="DrawTrack" />}
          description={drawTrackLabel}
          onClick={() => onSelect(PlanningTools.DRAW_PATH)}
          selected={selected === PlanningTools.DRAW_PATH}
          disabled={drawTrackDisabled}
        />
        {/* TODO restore as soon as we have polygon implementation */}
        {/* {routingModule && (
          <BigTool
            icon={<Icon name="DrawPolygon" />}
            description={drawPolygonLabel}
            onClick={() => onSelect(PlanningTools.DRAW_POLYGON)}
            selected={selected === PlanningTools.DRAW_POLYGON}
            disabled={drawPolygonDisabled}
          />
        )} */}
        <BigTool
          icon={<Icon name="Upload" />}
          description={t('planning.tools.upload_file', 'shp')}
          onClick={() => onSelect(PlanningTools.IMPORT_SHP)}
          selected={false}
          disabled={importShpDisabled}
        />
      </div>
    </div>
  )
}
