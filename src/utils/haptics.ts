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
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      // iOS doesn't support navigator.vibrate, but we can try Audio API as fallback
      // or use CSS animations to provide visual feedback
      console.debug('iOS haptic feedback requested but not directly supported')
      
      // Try to trigger a very short audio feedback (iOS specific)
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.01)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.01)
      } catch (audioError) {
        console.debug('Audio haptic fallback failed:', audioError)
      }
      
      return
    }
    
    // Android and other devices - use vibration API
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