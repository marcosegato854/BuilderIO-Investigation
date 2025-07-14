import { Grid } from '@mui/material'
import { EmptyList } from 'components/atoms/EmptyList/EmptyList'
import gsap from 'gsap'
import Flip from 'gsap/dist/Flip'
import useParseGridItems from 'hooks/useParseGridItems'
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { GridSettings } from 'store/features/dataStorage/slice'
import { JobGridItem } from '../JobGridItem/JobGridItem'
import { JobListItem } from '../JobListItem/JobListItem'
import { ProjectGridItem } from '../ProjectGridItem/ProjectGridItem'
import { ProjectListItem } from '../ProjectListItem/ProjectListItem'
import style from './CardsGrid.module.scss'

gsap.registerPlugin(Flip)

export enum GridVariant {
  GridView = 'Grid',
  ListView = 'List',
}

export type ItemType = {
  project?: IProject
  job?: IJob
}

export interface ICardsGridProps extends GridSettings {
  items: ItemType[]
  disableAnimations?: boolean
}

function determineIfIsProject(toBeDetermined: ItemType): boolean {
  if (toBeDetermined.project) {
    return true
  }
  return false
}

/**
 * CardsGrid description
 */
export const CardsGrid: FC<ICardsGridProps> = ({
  items = [],
  viewBy = GridVariant.GridView,
  search,
  sortField,
  sortDirection,
  children,
  disableAnimations,
}: PropsWithChildren<ICardsGridProps>) => {
  const { t } = useTranslation()
  const container = useRef<HTMLDivElement | null>(null)
  const flipState = useRef<Flip.FlipState | null>(null)
  const isProject = useMemo(() => {
    const item = items[0]
    return determineIfIsProject(item)
  }, [items])
  const xs = useMemo(() => {
    return viewBy === GridVariant.ListView ? 12 : false
  }, [viewBy])
  const parsedItemsArray = useParseGridItems(
    items,
    search,
    isProject,
    sortField,
    sortDirection
  )
  const ItemComponent: FC<ItemType> | null = useMemo(() => {
    if (isProject) {
      if (viewBy === GridVariant.GridView) return ProjectGridItem
      if (viewBy === GridVariant.ListView) return ProjectListItem
    }
    if (!isProject) {
      if (viewBy === GridVariant.GridView) return JobGridItem
      if (viewBy === GridVariant.ListView) return JobListItem
    }
    return null
  }, [viewBy, isProject])

  useEffect(() => {
    if (!container.current) return
    if (!container.current.scrollTo) return
    container.current.scrollTo(0, 0)
  }, [container, items])

  /**
   * FLIP Animation effect
   * https://greensock.com/docs/v3/Plugins/Flip
   */
  useLayoutEffect(() => {
    let timeline: gsap.core.Timeline
    if (!disableAnimations) {
      const q = gsap.utils.selector(container)
      const cardSelector = '.MuiGrid-item'
      if (flipState.current) {
        timeline = Flip.from(flipState.current, {
          ease: 'power1.inOut',
          // scale: true,
          absolute: true,
          targets: q(cardSelector),
          simple: true,
          stagger: 0.05,
          // duration: 0.5,
          onEnter: (elements) => {
            return gsap.fromTo(
              elements,
              {
                opacity: 0,
              },
              {
                opacity: 1,
                delay: 0.4,
                duration: 0.3,
              }
            )
          },
        })
        timeline.add(() => {
          flipState.current = Flip.getState(q(cardSelector))
        })
      } else {
        flipState.current = Flip.getState(q(cardSelector))
      }
    }
    return () => {
      if (timeline) {
        timeline.progress(1).pause()
        timeline.clear()
      }
    }
  }, [parsedItemsArray, sortDirection, viewBy, disableAnimations])

  return parsedItemsArray?.length ? (
    <div className={style.container} ref={container}>
      <Grid container spacing={1} justifyContent="flex-start">
        {parsedItemsArray.map((item) => {
          const name = determineIfIsProject(item)
            ? item.project?.name
            : item.job?.name
          const disk = determineIfIsProject(item) ? item.project?.disk : ''
          const key = `${name}-${disk}-${viewBy}`
          return (
            <Grid key={key} item xs={xs}>
              {ItemComponent && <ItemComponent {...item} />}
            </Grid>
          )
        })}
      </Grid>
      <div className={style.children}>{children}</div>
    </div>
  ) : (
    <EmptyList
      title={t('project_browser.search', 'search')}
      subtitle={t('project_browser.no_items', 'No items')}
      isProject={isProject}
    />
  )
}
