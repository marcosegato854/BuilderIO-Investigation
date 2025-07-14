import useTheme from 'hooks/useTheme'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from 'store/configureStore'
import { withThemes } from 'storybook-addon-themes/react' // <- or your storybook framework
import MaterialUIThemeProvider from 'utils/themes/MaterialUIThemeProvider'
import { addParameters } from '@storybook/react'
import { DocsPage, DocsContainer } from '@storybook/addon-docs'

import 'bootstrap'
import { useFontByLanguage } from 'hooks/useFontByLanguage'
import '../src/styles/main.scss'

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
})

/**
 * Decorator that handles theme change in store when changed from theme compo in Storybook
 * doesn't work if I import it as a module, so I need to keep it here
 */
const StorybookThemeDecorator = (props) => {
  const {
    children,
    theme: { name = 'Dark' },
  } = props
  const [theme, setTheme] = useTheme()
  useFontByLanguage()
  /** update the theme according to Storybook plugin */
  useEffect(() => {
    const newTheme = name.toLowerCase()
    setTheme(newTheme)
    setTimeout(() => {
      const body = document.querySelector('body')
      let oldTheme
      body?.classList.forEach((cls) => {
        if (cls.includes('theme-')) {
          oldTheme = cls
        }
      })
      if (oldTheme) body?.classList.remove(oldTheme)
      body?.classList.add(`theme-${newTheme}`)
    }, 200)
  }, [name])
  return children
}

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    // matchers: {
    //   color: /(background|color)$/i,
    //   date: /Date$/,
    // },
    expanded: true,
  },
  // disable backgrounds, it confuses used along with themes
  backgrounds: {
    disable: true,
  },
  themes: {
    default: 'Dark',
    list: [
      { name: 'Light', class: 'theme-light', color: '#aaaaaa' },
      { name: 'Dark', class: 'theme-dark', color: '#222222' },
    ],
    Decorator: StorybookThemeDecorator,
  },
}

export const decorators = [
  //  make theme decorators work
  withThemes,
  // add mui themes support
  (Story) => (
    <MaterialUIThemeProvider>
      <Story />
    </MaterialUIThemeProvider>
  ),
  // add redux support
  (Story) => (
    <Provider store={store}>
      <Story />
    </Provider>
  ),
]

export const PCUApp_VIEWPORT = {
  PCUApp: {
    name: 'PCU App',
    styles: {
      width: '800px',
      height: '480px',
    },
  },
}
