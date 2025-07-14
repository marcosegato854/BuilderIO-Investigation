/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable func-names */
import { curry } from 'ramda'

/** Had to port this function from ramda source code because it's not exposed */
export const move = curry(function (from: number, to: number, list: any) {
  const { length } = list
  const result = list.slice()
  const positiveFrom = from < 0 ? length + from : from
  const positiveTo = to < 0 ? length + to : to
  const item = result.splice(positiveFrom, 1)
  return positiveFrom < 0 ||
    positiveFrom >= list.length ||
    positiveTo < 0 ||
    positiveTo >= list.length
    ? list
    : []
        .concat(result.slice(0, positiveTo))
        .concat(item)
        .concat(result.slice(positiveTo, list.length))
})
