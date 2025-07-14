/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import classNames from 'classnames'
import React, {
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import style from './Camera.module.scss'
import { closeWsConnection, initSocket } from './helpers'

const City = '/assets/img/City.png'

export interface ICameraProps {
  /**
   * Last part of socket's URL and it corresponds to the Camera name
   */
  socketEndpoint: string
  /**
   * object fit mode
   */
  fitMode?: 'Contain' | 'Cover'
  /**
   * align in Cover mode
   */
  align?: 'Right' | 'Left' | 'Center'
  /**
   * zoom
   */
  zoom?: number
  /**
   * first image callback
   */
  firstImageCallback?: Function
  /**
   * socket closed callback
   */
  closedCallback?: Function
  /**
   * stop updating on mouse down / touch
   */
  lockOnInteraction?: boolean
  /**
   * pass properties directly to the image tag
   */
  imageProps?: React.ImgHTMLAttributes<HTMLImageElement>
  /**
   * just return the image, without wrapper
   */
  noWrapper?: boolean
}

/**
 * Camera description
 */
export const Camera = React.memo(
  React.forwardRef<HTMLImageElement | null, ICameraProps>(
    (
      {
        socketEndpoint,
        fitMode = 'Contain',
        align = 'Center',
        zoom,
        firstImageCallback,
        closedCallback,
        lockOnInteraction,
        imageProps,
        noWrapper,
      }: ICameraProps,
      ref: Ref<HTMLImageElement | null>
    ) => {
      const ws = useRef<WebSocket | null>(null)
      const imageEl = useRef<HTMLImageElement | null>(null)
      const busy = useRef<boolean>(false)
      // need this to use the sane ref internally and externally
      useImperativeHandle(ref, () => imageEl.current)

      const closedHandler = useCallback(() => {
        closedCallback && closedCallback()
        ws.current = null
      }, [closedCallback])

      const scaleStyle = useMemo(() => {
        if (!zoom) return {}
        if (zoom <= 0) return {}
        // const scale = 1 + zoom / 10
        const scale = 100 + zoom
        // return { transform: `scale(${scale})`, transformOrigin: 'center' }
        return { width: `${scale}%`, height: `${scale}%` }
      }, [zoom])

      const busyHandler = () => {
        if (!lockOnInteraction) return
        busy.current = true
      }

      const idleHandler = () => {
        if (!lockOnInteraction) return
        busy.current = false
      }

      useEffect(() => {
        // if socketEndpoint is null / underfined / empty string show a placeholder img
        if (!socketEndpoint && imageEl.current) {
          imageEl.current.src = City
        }

        // check if ws already exist, therefore close it
        // console.info('useEffect is triggered')
        // console.info(ws.current)

        if (ws.current) {
          // NEVER GOES HERE
          console.warn('[CAMERA] Another ws connection exists')
          closeWsConnection(ws.current)
          ws.current = null
        } else {
          // console.info('No prior ws connection')
        }

        // shorter form of what's written above
        // // ws.current && closeWsConnection(ws.current)

        if (socketEndpoint && imageEl.current) {
          // create new ws connection with socketEndpoint
          console.info(`[CAMERA] init socket ${socketEndpoint}`)
          ws.current = initSocket(
            imageEl.current,
            socketEndpoint,
            firstImageCallback,
            closedHandler,
            busy
          )
          // console.info('ws.current after in useEffect after initSocket')
          // console.info(ws.current)
        }

        // close WebSocket connection when component unmounts
        return () => {
          if (ws.current) {
            closeWsConnection(ws.current)
            ws.current = null
            console.info('[CAMERA] Closing ws connection at unmount')
          } else {
            console.info('[CAMERA] No ws connection at unmount')
          }
        }
      }, [closedCallback, closedHandler, firstImageCallback, socketEndpoint])

      if (noWrapper)
        return (
          <img src={City} alt="live-camera" {...imageProps} ref={imageEl} />
        )

      return (
        <div
          className={classNames({
            [style.container]: true,
            [style[`container${fitMode}`]]: true,
          })}
          onMouseDown={busyHandler}
          onMouseUp={idleHandler}
          onMouseOut={idleHandler}
          onTouchStart={busyHandler}
          onTouchEnd={idleHandler}
        >
          <img
            src={City}
            alt="live-camera"
            {...imageProps}
            className={classNames({
              [style.camera]: true,
              [style[`align${align}`]]: true,
              [style[`camera${fitMode}`]]: true,
            })}
            ref={imageEl}
            style={scaleStyle}
          />
        </div>
      )
    }
  )
)
// Camera.whyDidYouRender = true
