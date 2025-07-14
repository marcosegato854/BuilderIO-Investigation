// TODO find a better implementation for the mobile detection, even if not needed for now according to QA
export const isMobile = (): boolean => {
  return 'ontouchstart' in document.documentElement // &&
  // navigator.userAgent.match(/Mobi/)
}

export const IS_TESTING = process.env.NODE_ENV === 'test'
