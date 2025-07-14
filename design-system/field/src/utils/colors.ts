import chroma from 'chroma-js'
import { curry, last } from 'ramda'
/* eslint-disable no-bitwise */

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
type RGB = {
  red: number
  green: number
  blue: number
}
export const hexToRgb = (hexString?: string): RGB => {
  if (!hexString)
    return {
      red: 0,
      green: 0,
      blue: 0,
    }
  const hex = hexString.replace(/[^0-9A-F]/gi, '')
  const bigint = parseInt(hex, 16)
  const red = (bigint >> 16) & 255
  const green = (bigint >> 8) & 255
  const blue = bigint & 255
  return {
    red,
    green,
    blue,
  }
}

let lastColorIndex = 0
export const availableColors = [
  '#33ABC7',
  '#FF69B4',
  '#FF7518',
  // '#708090', disable since is not visible in dark theme
  '#FA8072',
  '#008080',
  '#800080',
  '#808000',
]

export const getRandomColor = (avoid?: string[]) => {
  let colorIndex = lastColorIndex % availableColors.length
  let out
  if (avoid) {
    if (avoid.length < availableColors.length) {
      const availableFiltered = availableColors.filter(
        (c) => !avoid.includes(c)
      )
      out = availableFiltered[0]
      console.info(
        `[PLANNING] get a color but avoid [${avoid?.join(',')}]: ${out}`
      )
    } else {
      const availableFiltered = availableColors.filter((c) => c !== last(avoid))
      colorIndex = lastColorIndex % availableFiltered.length
      out = availableFiltered[colorIndex]
      lastColorIndex += 1
      console.info(
        `[PLANNING] reusing colors, there are more than ${availableColors.length} to avoid: ${out}`
      )
    }
  } else {
    lastColorIndex += 1
    out = availableColors[colorIndex]
    console.info(
      `[PLANNING] pick color based on index, no colors to avoid: ${out}`
    )
  }
  return out
}

export const resetRandomColors = () => {
  lastColorIndex = 0
}

/**
 * changes the brightness of a color
 * @param baseColor
 * @param shade
 * @returns string
 */
const getShade = curry((baseColor: string, shade: number) => {
  const MAGNITUDE = 1
  const shift = getShiftFromLightness(baseColor)
  const shiftedShade = shade + shift
  const percentage = 0 + shiftedShade * MAGNITUDE
  if (percentage === 0) return baseColor
  const colorIO = chroma(baseColor)
  const output =
    percentage > 0 ? colorIO.brighten(percentage) : colorIO.darken(-percentage)
  return output.hex()
})

/**
 * takes a color and generates a list of shades changing the brightness
 * @param color
 * @returns
 */
export const getShadesArray = (color: string): string[] => {
  const VARIANTS = 3
  const shift = getShiftFromLightness(color)
  const shades = Array(VARIANTS)
    .fill('dummy')
    .map((_, i) => {
      return i - Math.floor(VARIANTS / 2) + shift
    })
  const output = shades.map(getShade(color))
  return output
}

/**
 * checks the brightness of a color
 * @param color
 * @returns -2 for bright colors, 0 or +2 for dark colors
 */
const getShiftFromLightness = (color: string) => {
  return 0
  const c = chroma(color)
  if (c.get('hsl.l') < 0.45) return 2
  if (c.get('hsl.l') > 0.55) return -2
  return 0
}

/**
 * reorders an array of colors, starting from the one provided
 * @param colorArray
 * @param startingColor
 * @returns an array of colours reordered
 */
export const reorderColorArray = (
  colorArray: string[],
  startingColor: string
): string[] => {
  const index = colorArray.findIndex((color) => color === startingColor)
  if (index === -1) return colorArray

  return [
    colorArray[index],
    ...colorArray.slice(index + 1),
    ...colorArray.slice(0, index),
  ]
}
