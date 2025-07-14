export const forceDocumentRedraw = (): void => {
  const css = ''
  const head = document.head || document.getElementsByTagName('head')[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newStyle: any = document.createElement('style')

  head.appendChild(newStyle)

  newStyle.type = 'text/css'
  newStyle.id = 'tmpstyle'
  if (newStyle.styleSheet) {
    // This is required for IE8 and below.
    newStyle.styleSheet.cssText = css
  } else {
    newStyle.appendChild(document.createTextNode(css))
  }
  setTimeout(() => {
    head.removeChild(newStyle)
  }, 10)
}
