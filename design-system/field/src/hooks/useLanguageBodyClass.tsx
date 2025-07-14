/* eslint-disable no-param-reassign */

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from 'store/features/settings/slice'

export const useLanguageBodyClass = () => {
  const language = useSelector(selectLanguage)
  useEffect(() => {
    console.info(`[LANGUAGE] new language set ${language}`)
    const { body } = document
    const classNames = body.className.split(' ')
    classNames.forEach((c) => {
      if (c.includes('lang-')) body.classList.remove(c)
    })
    body.classList.add(`lang-${language}`)
  }, [language])
}
