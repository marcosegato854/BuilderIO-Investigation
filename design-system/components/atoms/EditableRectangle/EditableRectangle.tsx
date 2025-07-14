/* eslint-disable no-param-reassign */
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import style from 'components/atoms/EditableRectangle/EditableRectangle.module.scss'
import gsap from 'gsap'
import Draggable from 'gsap/dist/Draggable' // use dist becouse gsap/Draggable is not transpiled, at least in unit-tests

gsap.registerPlugin(Draggable)

export interface IEditableRectangleProps {
  // TODO: implement this, dispatch the values when they change
  onChange?: () => void
}

/**
 * EditableRectangle description
 */
export const EditableRectangle: FC<IEditableRectangleProps> = ({
  onChange,
}: PropsWithChildren<IEditableRectangleProps>) => {
  const points = useRef([
    { x: 300, y: 100 },
    { x: 300, y: 300 },
    { x: 100, y: 300 },
    { x: 100, y: 100 },
  ])
  const handleRef = useRef<SVGCircleElement | null>(null)
  const handlesArr = useRef<Draggable[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayer = useRef<any | null>(null)
  const container = useRef<HTMLDivElement | null>(null)
  const svg = useRef<SVGSVGElement | null>(null)
  const rect = useRef<SVGPolygonElement | null>(null)
  const pointsProp: string = points.current
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

  const createHandle = useCallback((point: DOMPoint) => {
    if (!handleRef.current) return
    if (!handleLayer.current) return
    const handle = createClone(
      handleRef.current,
      handleLayer.current,
      point
    ) as HTMLElement
    const update = function upd(this: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias
      const t: any = this
      point.x = t.x
      point.y = t.y
    }
    const draggable = new Draggable(handle, {
      onDrag: update,
      onThrowUpdate: update,
      throwProps: true,
      // liveSnap: {
      //   points: points,
      //   radius: 15,
      // },
    })
    handlesArr.current.push(draggable)
  }, [])

  function createClone(
    node: SVGCircleElement,
    parent: SVGElement,
    point: DOMPoint
  ) {
    const element = node.cloneNode(true)
    parent.appendChild(element)
    gsap.set(element, { x: point.x, y: point.y })
    return element
  }

  /** always fit the container without scaling */
  const resizeHandler = useCallback(() => {
    if (container.current && svg.current) {
      const cw = gsap.getProperty(container.current, 'width') as number
      const ch = gsap.getProperty(container.current, 'height') as number
      // gsap.set(svg.current, { viewBox: `0 0 ${cw} ${ch}` })
      svg.current.setAttribute('viewBox', `0 0 ${cw} ${ch}`)
      //
      const centerX = cw / 2
      const centerY = ch / 2
      const radius = 100
      points.current = [
        { x: centerX + radius, y: centerY - radius },
        { x: centerX + radius, y: centerY + radius },
        { x: centerX - radius, y: centerY + radius },
        { x: centerX - radius, y: centerY - radius },
      ]
      points.current.forEach((p, i) => {
        if (!rect.current) return
        const point = rect.current.points?.getItem(i)
        if (!point) return
        point.x = p.x
        point.y = p.y
        const handle = handlesArr.current[i]?.target as HTMLElement
        handle && gsap.set(handle, { x: point.x, y: point.y })
      })
    }
  }, [])

  /** create handles */
  useEffect(() => {
    points.current.forEach((p, i) => {
      if (!rect.current) return
      const point = rect.current.points?.getItem(i)
      if (!point) return
      points.current[i] = { x: point.x, y: point.y }
      createHandle(point)
    })
    return () => {}
  }, [points, createHandle])

  /** register to window resize */
  useEffect(() => {
    window.addEventListener('resize', resizeHandler)
    resizeHandler()
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [resizeHandler])

  return (
    <div className={style.container} ref={container}>
      <svg className={style.svg} viewBox="0 0 0 0" ref={svg}>
        <defs>
          <circle className={style.handle} r="20" ref={handleRef} />
          {/* <circle className="marker" r="4" /> */}
        </defs>
        <polygon className={style.rect} points={pointsProp} ref={rect} />
        <g id="marker-layer" />
        <g id="handle-layer" ref={handleLayer} />
      </svg>
    </div>
  )
}
