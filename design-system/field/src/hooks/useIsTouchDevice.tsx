/**
 * Hook that checks if it's a touch device
 * @returns boolean
 */

const useIsTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export default useIsTouchDevice
