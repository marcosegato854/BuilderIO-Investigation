/* eslint-disable no-param-reassign */

import { RefObject, useEffect } from 'react'

export const useMousePosition = (
  element: RefObject<HTMLDivElement>,
  offset: number = 0,
  isMobile: boolean
) => {
  /** if it's not a mobile/touch device,
   *  the element should follow the mouse movement.
   *  We just check for boundaries to avoid hiding the element
   */

  useEffect(() => {
    const setNewPosition = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      if (!isMobile && element.current) {
        const maxWidth = innerWidth - element.current.offsetWidth - offset
        const maxHeight = innerHeight - element.current.offsetHeight - offset
        const coords = {
          x: e.clientX > maxWidth ? maxWidth : e.clientX,
          y: e.clientY > maxHeight ? maxHeight : e.clientY,
        }
        element.current.style.left = `${coords.x}px`
        element.current.style.top = `${coords.y}px`
      }
    }

    window.addEventListener('mousemove', setNewPosition)

    return () => {
      window.removeEventListener('mousemove', setNewPosition)
    }
  }, [element, isMobile, offset])
}
