/**
 * Haptic feedback utilities for mobile interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection'

/**
 * Trigger haptic feedback on supported devices
 * @param pattern - Type of haptic feedback to trigger
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  try {
    // Modern Haptic API (limited browser support)
    if ('vibrate' in navigator) {
      let vibrationPattern: number | number[]
      
      switch (pattern) {
        case 'light':
          vibrationPattern = 10
          break
        case 'medium':
          vibrationPattern = 20
          break
        case 'heavy':
          vibrationPattern = 40
          break
        case 'success':
          vibrationPattern = [10, 50, 10]
          break
        case 'error':
          vibrationPattern = [50, 100, 50]
          break
        case 'selection':
          vibrationPattern = 5
          break
        default:
          vibrationPattern = 10
      }
      
      navigator.vibrate(vibrationPattern)
    }
    
    // iOS Safari specific haptic feedback (if available)
    if (window.DeviceMotionEvent && typeof (window as any).DeviceMotionEvent.requestPermission === 'function') {
      // This is a more advanced haptic implementation for iOS
      // For now, we'll just use the vibration pattern above
    }
  } catch (error) {
    // Silently fail if haptics aren't supported
    console.debug('Haptic feedback not supported:', error)
  }
}

/**
 * Check if haptic feedback is supported on this device
 */
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator
}

/**
 * Trigger haptic feedback for button/tap interactions
 */
export function hapticTap(): void {
  triggerHaptic('light')
}

/**
 * Trigger haptic feedback for toggle switches
 */
export function hapticToggle(): void {
  triggerHaptic('selection')
}

/**
 * Trigger haptic feedback for successful actions
 */
export function hapticSuccess(): void {
  triggerHaptic('success')
}

/**
 * Trigger haptic feedback for error states
 */
export function hapticError(): void {
  triggerHaptic('error')
}