import { useState, useEffect } from 'react'

/**
 * Custom hook for managing localStorage with TypeScript generics
 * @param key - The localStorage key
 * @param defaultValue - The default value if key doesn't exist
 * @returns [value, setValue] - Current value and setter function
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Helper function to safely get value from localStorage
  const getStoredValue = (): T => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        return JSON.parse(stored)
      }
      return defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // Initialize state with stored value or default
  const [value, setValue] = useState<T>(getStoredValue)

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue]
}