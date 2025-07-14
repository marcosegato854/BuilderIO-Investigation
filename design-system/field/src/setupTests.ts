/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import 'jest-canvas-mock'

import 'bootstrap'

// the library is not compiled and breaks the tests. It's not needed in tests so we mock it
jest.mock('easy-speech', () => {})

/** fix react router error */
document.title = 'test title'

/** mock audio player api */
window.HTMLMediaElement.prototype.load = () => {}
window.HTMLMediaElement.prototype.play = () => {
  return new Promise(() => {})
}
window.HTMLMediaElement.prototype.pause = () => {
  return new Promise(() => {})
}
window.matchMedia = () =>
  ({
    matches: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

// console.log('enable this')
console.info = jest.fn()
console.warn = jest.fn()

// console.log('disable this')
// console.error = jest.fn()

const mockConnectedSocket = jest.fn()
class MockWebSocket {
  constructor(url: string) {
    mockConnectedSocket(url)
    return this
  }

  // eslint-disable-next-line class-methods-use-this
  close() {}
}
Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: MockWebSocket,
})

/** mock FontFace */
class MockFontFace {
  constructor() {
    return this
  }

  // eslint-disable-next-line class-methods-use-this
  load() {
    return Promise.resolve()
  }
}
Object.defineProperty(window, 'FontFace', {
  writable: true,
  value: MockFontFace,
})
Object.defineProperty(document, 'fonts', {
  writable: true,
  value: {
    clear: () => Promise.resolve(),
    add: () => Promise.resolve(),
  },
})

function setupFetchStub(data: any) {
  return function fetchStub(_url: string) {
    return new Promise((resolve) => {
      resolve({
        json: () =>
          Promise.resolve({
            data,
          }),
      })
    })
  }
}
global.fetch = jest.fn().mockImplementation(setupFetchStub({}))
