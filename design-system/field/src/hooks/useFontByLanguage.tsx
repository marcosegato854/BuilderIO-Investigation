/* eslint-disable no-param-reassign */

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectFont } from 'store/features/settings/slice'
import { getFontFaceDescriptors } from 'utils/i18n'

export const useFontByLanguage = () => {
  const font = useSelector(selectFont)
  useEffect(() => {
    console.info(`[FONT] load new font ${font}`)
    const descriptors = getFontFaceDescriptors(font)
    document.fonts.clear()
    descriptors.forEach(async ({ src, ...descriptor }) => {
      const ff = new FontFace('Roboto', src, descriptor)
      document.fonts.add(ff)
      await ff.load()
    })
  }, [font])
}
