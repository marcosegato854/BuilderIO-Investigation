export const batteryHealth = (rect: SVGRectElement, health: number): void => {
  const newWidth = (health / 100) * 14
  rect.setAttribute('width', newWidth.toString())
}
