import React, { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import { darkTheme, lightTheme } from 'utils/themes/mui'
import { ThemeProvider } from '@mui/material'

/**
 * Return a ReactWrapper wrapped with a Provider with mockedStore
 * @param children
 * @returns {ReactWrapper}
 */
export const renderWithProvider =
  (children: ReactNode) =>
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store: Store<any, AnyAction>
  ) =>
    render(
      <Provider store={store}>
        <ThemeProvider theme={darkTheme}>
          <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
        </ThemeProvider>
      </Provider>
    )

/**
 * dummy function for API mocks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dummyFunc: any = () => Promise.resolve({})

export const mockMediaQueries = (width?: number) => {
  const currentWidth = width || lightTheme.breakpoints.values.sm - 1
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: currentWidth,
  })
  window.matchMedia = jest.fn().mockImplementation((query) => {
    return {
      matches: currentWidth >= lightTheme.breakpoints.values.sm,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }
  })
  const height = Math.round((currentWidth * 9) / 16)
  return { width, height }
}
