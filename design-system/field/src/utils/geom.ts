export interface Rectangle {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Returns intersecting part of two rectangles
 * @param  {object}  rect1 4 coordinates in form of {x1, y1, x2, y2} object
 * @param  {object}  rect2 4 coordinates in form of {x1, y1, x2, y2} object
 * @return {boolean}    False if there's no intersecting part
 * @return {object}     4 coordinates in form of {x1, y1, x2, y2} object
 */
export const getIntersectingRectangle = (
  rect1: Rectangle,
  rect2: Rectangle
) => {
  const [r1, r2] = [rect1, rect2].map((r) => {
    return {
      x: [r.x1, r.x2].sort((a, b) => a - b),
      y: [r.y1, r.y2].sort((a, b) => a - b),
    }
  })

  const noIntersect =
    r2.x[0] > r1.x[1] ||
    r2.x[1] < r1.x[0] ||
    r2.y[0] > r1.y[1] ||
    r2.y[1] < r1.y[0]

  return noIntersect
    ? false
    : {
        x1: Math.max(r1.x[0], r2.x[0]), // _[0] is the lesser,
        y1: Math.max(r1.y[0], r2.y[0]), // _[1] is the greater
        x2: Math.min(r1.x[1], r2.x[1]),
        y2: Math.min(r1.y[1], r2.y[1]),
      }
}

/**
 * Returns intersecting area of two rectangles
 * @param  {object}  rect1 4 coordinates in form of {x1, y1, x2, y2} object
 * @param  {object}  rect2 4 coordinates in form of {x1, y1, x2, y2} object
 * @return {boolean}    False if there's no intersecting part
 * @return {number}     area of the intersecting rectangle
 */
export const getIntersectingRectangleArea = (
  rect1: Rectangle,
  rect2: Rectangle
) => {
  const rect = getIntersectingRectangle(rect1, rect2)
  if (!rect) return 0
  return Math.abs((rect.x2 - rect.x1) * (rect.y2 - rect.y1))
}
