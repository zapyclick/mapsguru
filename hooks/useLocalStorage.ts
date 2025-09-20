import { useState, useEffect } from 'react';

// A custom hook to manage state with localStorage persistence.
// It synchronizes state between the component and localStorage.
export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get initial value from localStorage or use the provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }
        
      const parsedItem = JSON.parse(item);

      // For object-based state (like profiles), perform a sanitization merge.
      // This ensures the loaded data conforms to the expected shape defined by `initialValue`,
      // preventing outdated properties from causing issues. This makes the data loading
      // predictable and ensures the fields are "fixed" to the application's expected structure.
      if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
        const sanitizedState: Partial<T> = {};
        for (const stateKey in initialValue) {
          if (parsedItem && Object.prototype.hasOwnProperty.call(parsedItem, stateKey)) {
            sanitizedState[stateKey] = parsedItem[stateKey];
          } else {
            sanitizedState[stateKey] = initialValue[stateKey];
          }
        }
        return sanitizedState as T;
      }
      
      // For non-object types (like strings), just return the parsed value.
      return parsedItem;

    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // useEffect to update localStorage when the state changes
  useEffect(() => {
    try {
      // Simplification: directly stringify the current state value.
      // This is safer and avoids potential issues with complex state types.
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}