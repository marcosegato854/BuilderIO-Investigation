import { latinDescriptors } from 'i18n/font_descriptors/latin'
import { chineseDescriptors } from 'i18n/font_descriptors/chinese'
import { LocalFonts } from 'store/features/settings/types'
import { MapsCountry } from 'store/features/system/types'

export const getLanguageFromCountryCode = (
  countryCode: MapsCountry
): string => {
  return (
    {
      international: 'en',
      jp: 'jp',
      kr: 'kr',
      cn: 'cn',
    }[countryCode.toLowerCase()] || 'en'
  )
}

export const getFontFromLanguage = (language: string): LocalFonts => {
  return (
    {
      jp: LocalFonts.LATIN,
      kr: LocalFonts.LATIN,
      cn: LocalFonts.CHINESE,
    }[language.toLowerCase()] || LocalFonts.LATIN
  )
}

export const getFontFaceDescriptors = (
  font: LocalFonts
): (FontFaceDescriptors & { src: string })[] => {
  switch (font) {
    case LocalFonts.CHINESE:
      return chineseDescriptors
    default:
      return latinDescriptors
  }
}
