/**
 * Haptic feedback utilities for mobile devices
 * Provides tactile feedback for user interactions
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback if supported by the device
 */
export const triggerHaptic = (style: HapticStyle = 'light') => {
  // Check if running in browser
  if (typeof window === 'undefined') return;

  try {
    // iOS Haptic Feedback (Taptic Engine)
    if ('vibrate' in navigator) {
      const patterns: Record<HapticStyle, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        selection: 10,
        success: [10, 50, 10],
        warning: [15, 50, 15],
        error: [20, 50, 20, 50, 20],
      };
      
      navigator.vibrate(patterns[style]);
    }

    // Modern browsers with Haptic API
    if ('HapticFeedback' in window) {
      const haptic = (window as any).HapticFeedback;
      
      switch (style) {
        case 'light':
          haptic.impact?.({ style: 'light' });
          break;
        case 'medium':
          haptic.impact?.({ style: 'medium' });
          break;
        case 'heavy':
          haptic.impact?.({ style: 'heavy' });
          break;
        case 'selection':
          haptic.selection?.();
          break;
        case 'success':
          haptic.notification?.({ type: 'success' });
          break;
        case 'warning':
          haptic.notification?.({ type: 'warning' });
          break;
        case 'error':
          haptic.notification?.({ type: 'error' });
          break;
      }
    }
  } catch (err) {
    // Silently fail - haptic feedback is a progressive enhancement
    console.debug('Haptic feedback not supported:', err);
  }
};

/**
 * Hook for easy haptic feedback in React components
 */
export const useHaptic = () => {
  const haptic = {
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    selection: () => triggerHaptic('selection'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
  };

  return haptic;
};

/**
 * HOC to add haptic feedback to click/tap events
 */
export const withHaptic = <T extends HTMLElement>(
  element: T,
  style: HapticStyle = 'light'
): T => {
  if (!element) return element;

  const originalOnClick = element.onclick;
  
  element.onclick = (event) => {
    triggerHaptic(style);
    if (originalOnClick) {
      originalOnClick.call(element, event);
    }
  };

  return element;
};

/**
 * Button press haptic (light feedback)
 */
export const hapticButton = () => triggerHaptic('light');

/**
 * Toggle/switch haptic (selection feedback)
 */
export const hapticToggle = () => triggerHaptic('selection');

/**
 * Delete action haptic (warning feedback)
 */
export const hapticDelete = () => triggerHaptic('warning');

/**
 * Success action haptic (success feedback)
 */
export const hapticSuccess = () => triggerHaptic('success');

/**
 * Error action haptic (error feedback)
 */
export const hapticError = () => triggerHaptic('error');

/**
 * Navigation haptic (medium feedback)
 */
export const hapticNavigate = () => triggerHaptic('medium');

/**
 * Long press haptic (heavy feedback)
 */
export const hapticLongPress = () => triggerHaptic('heavy');
